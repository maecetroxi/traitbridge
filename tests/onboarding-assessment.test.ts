import assert from "node:assert/strict";
import test from "node:test";
import { getItems } from "@bigfive-org/questions";
// @ts-expect-error this package has no TypeScript declarations.
import { processAnswers } from "@bigfive-org/score/build/src";
import {
  assessmentVersions,
  parseAssessmentDraft,
  scoreAssessment,
} from "../lib/v2/assessment";
import { generateAvatar } from "../lib/v2/avatar";
import { orientationItems } from "../lib/v2/orientation";
import { validateAction } from "../lib/v2/server";
import { traits } from "../lib/v2/types";

test("guest full assessment is rescored exactly like the standard full assessment", () => {
  for (const language of ["de", "en"] as const) {
    const items = getItems(language, false);
    assert.equal(items.length, 120);
    const answers = Object.fromEntries(
      items.map((item, i) => [item.id, item.choices[i % 5].score]),
    );
    const expected = processAnswers(
      items.map((item) => ({
        domain: item.domain,
        facet: item.facet?.toString() || "1",
        score: answers[item.id],
      })),
    );
    const draft = parseAssessmentDraft({
      variant: "full",
      version: assessmentVersions.full,
      language,
      answers,
    });
    assert.ok(draft);
    assert.deepEqual(
      scoreAssessment(draft),
      Object.fromEntries(
        traits.map((trait) => [
          trait,
          expected[trait].score / expected[trait].count,
        ]),
      ),
    );
  }
});

test("onboarding ignores asserted scores and rejects incomplete or unversioned device assessments", () => {
  const answers = Object.fromEntries(orientationItems.map(({ id }) => [id, 2]));
  const base = {
    pseudonym: "Farn",
    avatar: generateAvatar("farn"),
    language: "de",
    interests: [],
    experiences: [],
    adult_consent: true,
    matching_consent: true,
  };
  const device = {
    variant: "short",
    version: assessmentVersions.short,
    language: "en",
    answers,
  };
  const calculated = validateAction("onboard", {
    ...base,
    device_test: device,
    scores: { O: 5, C: 5, E: 5, A: 5, N: 5 },
  });
  assert.deepEqual(calculated.scores, { O: 2, C: 2, E: 2, A: 2, N: 2 });
  assert.deepEqual(calculated.assessment, {
    source: "device_test",
    variant: "short",
    version: assessmentVersions.short,
    language: "en",
  });
  for (const bad of [
    { ...device, answers: {} },
    { ...device, version: "unknown" },
    { ...device, answers: { ...answers, tampered: 3 } },
    { ...device, variant: "demo" },
  ]) {
    assert.throws(
      () => validateAction("onboard", { ...base, device_test: bad }),
      /INVALID_INPUT/,
    );
  }
  assert.throws(
    () => validateAction("onboard", { ...base, answers, adult_consent: false }),
    /CONSENT_REQUIRED/,
  );
  const result_id = "43210000-0000-4000-8000-000000000004";
  const stored = validateAction("onboard", {
    ...base,
    result_id,
    scores: { O: 5 },
    variant: "full",
  });
  assert.equal(stored.result_id, result_id);
  assert.equal(stored.scores, undefined);
});
