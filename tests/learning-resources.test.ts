import assert from "node:assert/strict";
import test from "node:test";
import {
  filterLearningResourceIndex,
  getLearningResourceIndex,
} from "../lib/learning-resources";

test("builds one bilingual index for articles, books and films", () => {
  const english = getLearningResourceIndex("en");
  const german = getLearningResourceIndex("de");

  assert.equal(english.length, german.length);
  assert.ok(english.some(({ kind }) => kind === "article"));
  assert.ok(english.some(({ kind }) => kind === "nonfiction"));
  assert.ok(english.some(({ kind }) => kind === "fiction"));
  assert.ok(english.some(({ kind }) => kind === "film"));
  assert.ok(
    english.every(
      (resource) =>
        resource.title &&
        resource.summary &&
        resource.traitMappings.length > 0,
    ),
  );
});

test("combines kind, trait, pole and perspective filters", () => {
  const resources = getLearningResourceIndex("en");
  const results = filterLearningResourceIndex(resources, {
    kind: "film",
    trait: "N",
    pole: "low",
    perspective: "growth",
  });

  assert.ok(results.length > 0);
  assert.ok(results.every(({ kind }) => kind === "film"));
  assert.ok(
    results.every((resource) =>
      resource.traitMappings.some(
        (mapping) =>
          mapping.trait === "N" &&
          (mapping.pole === "low" || mapping.pole === "both") &&
          mapping.perspective === "growth",
      ),
    ),
  );
});
