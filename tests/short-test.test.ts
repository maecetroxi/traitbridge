import assert from "node:assert/strict";
import test from "node:test";
import { getItems } from "@bigfive-org/questions";
import {
  getScoreBand,
  loadPreferredStoredResults,
  STORAGE_KEY_FULL,
  STORAGE_KEY_SHORT,
} from "../lib/bigfive-results";
import {
  calculateShortTestScores,
  selectShortTestQuestions,
  SHORT_TEST_ITEM_IDS,
} from "../lib/short-test";

test("selects the same ten short-test items in both languages", () => {
  for (const locale of ["de", "en"] as const) {
    const selected = selectShortTestQuestions(getItems(locale, false));
    assert.deepEqual(
      selected.map(({ id }) => id),
      [...SHORT_TEST_ITEM_IDS],
    );
    assert.deepEqual(
      Object.fromEntries(
        ["O", "C", "E", "A", "N"].map((trait) => [
          trait,
          selected.filter((question) => question.domain === trait).length,
        ]),
      ),
      { O: 2, C: 2, E: 2, A: 2, N: 2 },
    );
  }
});

test("uses the package's reverse-scored choices and averages two items per trait", () => {
  const questions = selectShortTestQuestions(getItems("en", false));
  const positiveOpenness = questions.find((question) => question.keyed === "plus" && question.domain === "O");
  const negativeOpenness = questions.find((question) => question.keyed === "minus" && question.domain === "O");

  assert.equal(positiveOpenness?.choices[0].score, 1);
  assert.equal(negativeOpenness?.choices[0].score, 5);

  const answers = Object.fromEntries(
    questions.map((question, index) => [question.id, index % 2 === 0 ? 5 : 3]),
  );
  const scores = calculateShortTestScores(questions, answers);

  for (const score of Object.values(scores)) {
    assert.equal(score, 4);
  }
});

test("uses low, middle, and high bands at the agreed thresholds", () => {
  assert.equal(getScoreBand(2.49), "low");
  assert.equal(getScoreBand(2.5), "middle");
  assert.equal(getScoreBand(3.5), "middle");
  assert.equal(getScoreBand(3.51), "high");
});

test("prefers a full local result over a newer short result", () => {
  const values = new Map<string, string>([
    [
      STORAGE_KEY_FULL,
      JSON.stringify({
        scores: { O: 4, C: 4, E: 4, A: 4, N: 4 },
        timestamp: "2026-01-01T00:00:00.000Z",
        variant: "full",
        language: "en",
      }),
    ],
    [
      STORAGE_KEY_SHORT,
      JSON.stringify({
        scores: { O: 2, C: 2, E: 2, A: 2, N: 2 },
        timestamp: "2026-07-01T00:00:00.000Z",
        variant: "short",
        language: "de",
      }),
    ],
  ]);

  const result = loadPreferredStoredResults({
    getItem: (key) => values.get(key) ?? null,
  });

  assert.equal(result?.variant, "full");
  assert.equal(result?.scores.O, 4);
});
