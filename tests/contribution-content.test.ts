import assert from "node:assert/strict";
import test from "node:test";
import type { BigFiveScores } from "../components/PersonalityBadge";
import {
  CONTRIBUTION_PATTERNS,
  NEUTRAL_CONTRIBUTION_PROFILE,
  getContributionBand,
  selectContributionPatterns,
} from "../lib/contribution-content";
import { BIG_FIVE_TRAITS } from "../lib/learning-content";

test("provides complete bilingual patterns for every trait and band", () => {
  for (const trait of BIG_FIVE_TRAITS) {
    for (const band of ["low", "middle", "high"] as const) {
      const pattern = CONTRIBUTION_PATTERNS[trait][band];

      assert.equal(pattern.trait, trait);
      assert.equal(pattern.band, band);
      assert.ok(pattern.id);

      for (const locale of ["en", "de"] as const) {
        assert.ok(pattern.title[locale]);
        assert.ok(pattern.contribution[locale]);
        assert.ok(pattern.noticedSignals[locale]);
        assert.ok(pattern.helpfulContexts[locale].length >= 2);
        assert.ok(pattern.helpfulContexts[locale].every(Boolean));
        assert.ok(pattern.blindSpot[locale]);
        assert.ok(pattern.oppositeLesson[locale]);
        assert.ok(pattern.nextStep[locale]);
      }
    }
  }
});

test("uses the same middle band boundaries as the stored Big Five result", () => {
  assert.equal(getContributionBand(1), "low");
  assert.equal(getContributionBand(2.49), "low");
  assert.equal(getContributionBand(2.5), "middle");
  assert.equal(getContributionBand(3.5), "middle");
  assert.equal(getContributionBand(3.51), "high");
  assert.equal(getContributionBand(5), "high");
});

test("ranks marked deviations first and keeps stable trait order for ties", () => {
  const scores: BigFiveScores = {
    O: 5,
    C: 1,
    E: 4,
    A: 3,
    N: 2,
  };

  assert.deepEqual(
    selectContributionPatterns(scores).map(({ trait, band, score }) => ({
      trait,
      band,
      score,
    })),
    [
      { trait: "O", band: "high", score: 5 },
      { trait: "C", band: "low", score: 1 },
      { trait: "E", band: "high", score: 4 },
      { trait: "N", band: "low", score: 2 },
    ],
  );
});

test("fills one or two marked dimensions with middle bridge patterns", () => {
  const oneMarked: BigFiveScores = {
    O: 5,
    C: 3.4,
    E: 3,
    A: 3,
    N: 3,
  };
  const twoMarked: BigFiveScores = {
    O: 4.5,
    C: 1.5,
    E: 3,
    A: 3.3,
    N: 3,
  };

  assert.deepEqual(
    selectContributionPatterns(oneMarked).map(({ trait, band }) => [
      trait,
      band,
    ]),
    [
      ["O", "high"],
      ["C", "middle"],
      ["E", "middle"],
    ],
  );
  assert.deepEqual(
    selectContributionPatterns(twoMarked).map(({ trait, band }) => [
      trait,
      band,
    ]),
    [
      ["O", "high"],
      ["C", "low"],
      ["A", "middle"],
    ],
  );
});

test("shows all five balanced perspectives for a neutral profile", () => {
  const selections = selectContributionPatterns(
    NEUTRAL_CONTRIBUTION_PROFILE,
  );

  assert.equal(selections.length, 5);
  assert.deepEqual(
    selections.map(({ trait }) => trait),
    BIG_FIVE_TRAITS,
  );
  assert.ok(selections.every(({ band }) => band === "middle"));
});

test("returns deterministic recommendations for identical profiles", () => {
  const scores: BigFiveScores = {
    O: 4.2,
    C: 2.1,
    E: 3.2,
    A: 3.8,
    N: 2.7,
  };

  assert.deepEqual(
    selectContributionPatterns(scores),
    selectContributionPatterns({ ...scores }),
  );
});

test("always returns between three and five distinct trait patterns", () => {
  const profiles: BigFiveScores[] = [
    { O: 1, C: 1, E: 1, A: 1, N: 1 },
    { O: 5, C: 3, E: 3, A: 3, N: 3 },
    { O: 5, C: 1, E: 3, A: 3, N: 3 },
    { O: 5, C: 1, E: 5, A: 3, N: 3 },
    { O: 5, C: 1, E: 5, A: 1, N: 3 },
  ];

  for (const profile of profiles) {
    const selections = selectContributionPatterns(profile);
    const traits = new Set(selections.map(({ trait }) => trait));

    assert.ok(selections.length >= 3 && selections.length <= 5);
    assert.equal(traits.size, selections.length);
  }
});
