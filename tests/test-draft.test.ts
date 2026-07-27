import assert from "node:assert/strict";
import test from "node:test";
import {
  TEST_DRAFT_VERSION,
  calculateTestProgress,
  getTestDraftSummary,
  getTestDraftStorageKey,
  loadTestDraft,
  sanitizeTestDraft,
  saveTestDraft,
  splitIntoStages,
} from "../lib/test-draft";

const createStorage = () => {
  const values = new Map<string, string>();
  return {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  };
};

test("splits 120 questions into ten stages of twelve", () => {
  const stages = splitIntoStages(Array.from({ length: 120 }, (_, index) => index + 1));
  assert.equal(stages.length, 10);
  assert.equal(stages[0].length, 12);
  assert.deepEqual(stages.at(-1), Array.from({ length: 12 }, (_, index) => index + 109));
});

test("calculates progress only from valid answers for known questions", () => {
  assert.deepEqual(
    calculateTestProgress({ one: 1, two: 5, unknown: 3, invalid: 8 }, ["one", "two", "three"]),
    { answered: 2, total: 3, percentage: 67 },
  );
});

test("saves and restores a language-specific draft", () => {
  const storage = createStorage();
  saveTestDraft(storage, "de", { one: 2, two: 4 }, 1);
  const restored = loadTestDraft(storage, "de", ["one", "two", "three"]);

  assert.equal(restored?.version, TEST_DRAFT_VERSION);
  assert.deepEqual(restored?.answers, { one: 2, two: 4 });
  assert.equal(restored?.currentStage, 1);
  assert.equal(storage.getItem(getTestDraftStorageKey("en")), null);
});

test("rejects incompatible draft versions", () => {
  assert.equal(
    sanitizeTestDraft(
      {
        version: TEST_DRAFT_VERSION + 1,
        language: "en",
        answers: { one: 3 },
        currentStage: 0,
        updatedAt: new Date().toISOString(),
      },
      "en",
      ["one"],
    ),
    null,
  );
});

test("returns the most recently updated draft when both languages exist", () => {
  const storage = createStorage();
  storage.setItem(
    getTestDraftStorageKey("de"),
    JSON.stringify({
      version: TEST_DRAFT_VERSION,
      language: "de",
      answers: { one: 2 },
      currentStage: 0,
      updatedAt: "2026-01-01T10:00:00.000Z",
    }),
  );
  storage.setItem(
    getTestDraftStorageKey("en"),
    JSON.stringify({
      version: TEST_DRAFT_VERSION,
      language: "en",
      answers: { one: 4, two: 3 },
      currentStage: 1,
      updatedAt: "2026-01-02T10:00:00.000Z",
    }),
  );

  assert.deepEqual(getTestDraftSummary(storage), {
    language: "en",
    answeredCount: 2,
    currentStage: 1,
    updatedAt: "2026-01-02T10:00:00.000Z",
  });
});
