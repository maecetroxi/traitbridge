import assert from "node:assert/strict";
import test from "node:test";
import {
  getOppositePole,
  getTraitBridge,
  getTraitPole,
  TRAIT_BRIDGES,
  TRAIT_DIMENSIONS,
  type BridgePole,
} from "../lib/trait-bridges";

const LOCALES = ["en", "de"] as const;
const POLES: BridgePole[] = ["low", "high"];

test("provides both equally structured poles for every Big Five dimension", () => {
  assert.deepEqual(Object.keys(TRAIT_BRIDGES), [...TRAIT_DIMENSIONS]);

  for (const trait of TRAIT_DIMENSIONS) {
    const bridge = getTraitBridge(trait);

    assert.equal(bridge.trait, trait);
    assert.deepEqual(Object.keys(bridge.poles), POLES);

    for (const pole of POLES) {
      const profile = bridge.poles[pole];

      for (const locale of LOCALES) {
        assert.ok(profile.label[locale].trim());
        assert.ok(profile.contribution[locale].trim());
        assert.ok(profile.misconception[locale].trim());
        assert.ok(profile.overextension[locale].trim());
        assert.ok(profile.oppositeValue[locale].trim());
        assert.ok(profile.strengths[locale].length >= 3);
        assert.ok(profile.strengths[locale].every((value) => value.trim()));
        assert.ok(profile.collaboration[locale].length >= 2);
        assert.ok(profile.collaboration[locale].every((value) => value.trim()));
      }
    }
  }
});

test("localizes every dimension-level bridge field in English and German", () => {
  for (const trait of TRAIT_DIMENSIONS) {
    const bridge = getTraitBridge(trait);

    for (const locale of LOCALES) {
      assert.ok(bridge.name[locale].trim());
      assert.ok(bridge.scaleEnds.low[locale].trim());
      assert.ok(bridge.scaleEnds.high[locale].trim());
      assert.ok(bridge.bridgePrinciple[locale].trim());
      assert.ok(bridge.middlePerspective[locale].trim());
      assert.ok(bridge.reflectionQuestion[locale].trim());
      assert.ok(bridge.communitySearch[locale].trim());
    }
  }
});

test("uses emotional sensitivity language for the N dimension", () => {
  const emotionalSensitivity = getTraitBridge("N");

  assert.equal(emotionalSensitivity.name.en, "Emotional sensitivity");
  assert.equal(emotionalSensitivity.name.de, "Emotionale Empfindlichkeit");
  assert.doesNotMatch(
    JSON.stringify(emotionalSensitivity),
    /neurotic|neurotisch/i,
  );
});

test("maps scores to low, middle, and high perspectives deterministically", () => {
  assert.equal(getTraitPole(1), "low");
  assert.equal(getTraitPole(2.49), "low");
  assert.equal(getTraitPole(2.5), "middle");
  assert.equal(getTraitPole(3), "middle");
  assert.equal(getTraitPole(3.5), "middle");
  assert.equal(getTraitPole(3.51), "high");
  assert.equal(getTraitPole(5), "high");

  assert.equal(getOppositePole("low"), "high");
  assert.equal(getOppositePole("high"), "low");
});
