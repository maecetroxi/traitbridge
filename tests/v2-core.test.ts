import test from "node:test";
import assert from "node:assert/strict";
import { generateAvatar, validAvatar } from "../lib/v2/avatar";
import {
  rankMatches,
  classifyTopic,
  type MatchCandidate,
  type MatchReader,
} from "../lib/v2/matching";
import { validateAction } from "../lib/v2/server";
import { getItems, type Question } from "@bigfive-org/questions";
import { selectShortTestQuestions } from "../lib/short-test";
import { topicLabels, reasonLabels, noticeLabels } from "../lib/v2/copy";
import { topics } from "../lib/v2/types";
const scores = { O: 3, C: 3, E: 2, A: 3, N: 3 };
const reader: MatchReader = {
  id: "reader",
  scores,
  language: "de",
  available: true,
  interests: ["work"],
  experiences: ["habits"],
};
function candidate(
  id: string,
  overrides: Partial<MatchCandidate> = {},
): MatchCandidate {
  return {
    id,
    author_id: "other",
    scores,
    topic: "social",
    language: "de",
    available: true,
    answered: false,
    skipped: false,
    blocked: false,
    slots: 3,
    created_at: "2026-11-15T10:00:00Z",
    ...overrides,
  };
}
test("matching ranks relevant similarities before broader and interest/experience fallbacks", () => {
  const q = [
    candidate("fallback", { topic: "work", scores: { ...scores, C: 5, E: 5 } }),
    candidate("broad", { scores: { ...scores, E: 3 } }),
    candidate("close", { scores: { ...scores, O: 5, E: 2.25 } }),
    candidate("experience", { topic: "habits", scores: { ...scores, C: 5 } }),
    candidate("unrelated", { scores: { ...scores, E: 5 } }),
  ];
  assert.deepEqual(
    rankMatches(reader, q).map((r) => [r.id, r.tier]),
    [
      ["close", 1],
      ["broad", 2],
      ["experience", 3],
      ["fallback", 3],
    ],
  );
  assert.deepEqual(rankMatches(reader, q), rankMatches(reader, q.reverse()));
});
test("matching excludes self, blocks, answered, skips, full slots, different language, paused and invalid scores", () => {
  const excluded = [
    candidate("self", { author_id: "reader" }),
    candidate("blocked", { blocked: true }),
    candidate("answered", { answered: true }),
    candidate("skipped", { skipped: true }),
    candidate("full", { slots: 0 }),
    candidate("language", { language: "en" }),
    candidate("paused", { available: false }),
    candidate("invalid", { scores: { ...scores, N: NaN } }),
  ];
  assert.equal(rankMatches(reader, excluded).length, 0);
  assert.equal(
    rankMatches({ ...reader, available: false }, [candidate("valid")]).length,
    0,
  );
  assert.equal(
    rankMatches(
      reader,
      Array.from({ length: 20 }, (_, i) => candidate(String(i))),
    ).length,
    6,
  );
});
test("topic classification is deterministic in both languages and can be manually overridden", () => {
  assert.equal(
    classifyTopic("Mein Kopf hört nach der Arbeit nicht auf"),
    "work",
  );
  assert.equal(classifyTopic("At a party with strangers"), "social");
  assert.equal(classifyTopic("Ich verstehe mich selbst nicht"), "self");
  assert.equal(
    validateAction("question", {
      body: "Meine Arbeit beschäftigt mich heute sehr.",
      topic: "stress",
      discoverable: false,
    }).topic,
    "stress",
  );
});
test("avatars reproduce across sessions and reject invalid configurations", () => {
  assert.deepEqual(generateAvatar("moss"), generateAvatar("moss"));
  assert.notDeepEqual(generateAvatar("moss"), generateAvatar("fern"));
  for (let i = 0; i < 1000; i++)
    assert.ok(validAvatar(generateAvatar(String(i))));
  assert.equal(validAvatar({ ...generateAvatar("moss"), color: 6 }), false);
  assert.equal(validAvatar({ ...generateAvatar("moss"), eyes: 1.5 }), false);
});
test("server validates raw test choices, consent, private-by-default inputs and UUIDs", () => {
  const questions = selectShortTestQuestions(
    getItems("de", false) as Question[],
  );
  const answers = Object.fromEntries(questions.map((q) => [q.id, 3]));
  const profile = {
    pseudonym: "Moos",
    avatar: generateAvatar("moss"),
    language: "de",
    interests: [],
    experiences: [],
    adult_consent: true,
    matching_consent: true,
    answers,
  };
  assert.deepEqual(validateAction("onboard", profile).scores, {
    O: 3,
    C: 3,
    E: 3,
    A: 3,
    N: 3,
  });
  assert.throws(() =>
    validateAction("onboard", { ...profile, adult_consent: false }),
  );
  assert.throws(() => validateAction("onboard", { ...profile, answers: {} }));
  assert.throws(() =>
    validateAction("question", {
      body: "A long enough personal question",
      discoverable: "false",
    }),
  );
  assert.throws(() =>
    validateAction("question", { body: "too short", discoverable: false }),
  );
  assert.throws(() => validateAction("reserve", { question_id: "not-an-id" }));
  assert.throws(() => validateAction("assign", { matches: [] }));
});
test("language switch keeps item identities and supplies all topics, reasons and real notification labels", () => {
  assert.deepEqual(
    selectShortTestQuestions(getItems("de", false) as Question[]).map(
      (q) => q.id,
    ),
    selectShortTestQuestions(getItems("en", false) as Question[]).map(
      (q) => q.id,
    ),
  );
  for (const locale of ["de", "en"] as const) {
    for (const t of topics) assert.ok(topicLabels[locale][t]);
    for (const text of Object.values(reasonLabels[locale])) assert.ok(text);
    for (const text of Object.values(noticeLabels[locale])) assert.ok(text);
  }
});
