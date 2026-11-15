import test from "node:test";
import assert from "node:assert/strict";
import { dispatchV2 } from "../lib/v2/transport";
import { scoreOrientation, orientationItems } from "../lib/v2/orientation";
import { getItems } from "@bigfive-org/questions";
import {
  calculateShortTestScores,
  selectShortTestQuestions,
} from "../lib/short-test";

test("portable Edge scorer matches both questionnaire languages and reverse-keyed package choices", () => {
  for (const language of ["de", "en"] as const) {
    const questions = selectShortTestQuestions(getItems(language, false));
    assert.deepEqual(
      orientationItems.map((x) => x.id),
      questions.map((x) => x.id),
    );
    for (let choice = 0; choice < 5; choice++) {
      const answers = Object.fromEntries(
        questions.map((q) => [q.id, q.choices[choice].score]),
      );
      assert.deepEqual(
        scoreOrientation(answers),
        calculateShortTestScores(questions, answers),
      );
    }
  }
  assert.throws(() => scoreOrientation({}));
});

test("Edge transport forwards only the caller token and handles errors without a server secret", async (t) => {
  const before = { ...process.env };
  t.after(() => {
    process.env = before;
  });
  process.env.TRAITBRIDGE_V2_ENABLED = "true";
  process.env.NEXT_PUBLIC_SUPABASE_URL = "https://project.supabase.co";
  process.env.SUPABASE_V2_FUNCTION_URL =
    "https://project.supabase.co/functions/v1/traitbridge-v2";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = "public-test-key";
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  const request: typeof fetch = async (url, options) => {
    assert.equal(String(url), process.env.SUPABASE_V2_FUNCTION_URL);
    assert.equal(
      (options!.headers as Record<string, string>).Authorization,
      "Bearer caller-token",
    );
    assert.equal(
      (options!.headers as Record<string, string>).apikey,
      "public-test-key",
    );
    assert.equal(options!.cache, "no-store");
    return Response.json({ data: { profile: null } });
  };
  assert.deepEqual(
    await dispatchV2("POST", "caller-token", { action: "snapshot" }, request),
    { profile: null },
  );
  await assert.rejects(
    () => dispatchV2("POST", undefined, {}, request),
    /AUTH_REQUIRED/,
  );
  await assert.rejects(
    () =>
      dispatchV2("POST", "caller-token", {}, async () =>
        Response.json({ error: "BETA_REQUIRED" }, { status: 403 }),
      ),
    /BETA_REQUIRED/,
  );
  process.env.SUPABASE_V2_FUNCTION_URL =
    "https://foreign.invalid/functions/v1/traitbridge-v2";
  await assert.rejects(
    () => dispatchV2("POST", "caller-token", {}, request),
    /BETA_UNAVAILABLE/,
  );
});
