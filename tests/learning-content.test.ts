import assert from "node:assert/strict";
import test from "node:test";
import {
  LEARNING_TOPICS,
  filterLearningTopics,
  getLearningSources,
  getLearningTopic,
} from "../lib/learning-content";

test("provides at least twenty-one bilingual practical learning topics", () => {
  assert.ok(LEARNING_TOPICS.length >= 21);

  for (const topic of LEARNING_TOPICS) {
    assert.ok(topic.title.en && topic.title.de);
    assert.ok(topic.actions.en.length >= 2 && topic.actions.de.length >= 2);
    assert.ok(topic.reflection.en.length >= 2 && topic.reflection.de.length >= 2);
    assert.ok(topic.traitRelevance.length >= 1);
    assert.ok(
      topic.traitRelevance.every(
        ({ description, level }) =>
          description.en &&
          description.de &&
          ["low", "high", "both"].includes(level),
      ),
    );
  }
});

test("covers the lower and higher pole of every Big Five dimension", () => {
  for (const trait of ["O", "C", "E", "A", "N"] as const) {
    const levels = LEARNING_TOPICS.flatMap((topic) =>
      topic.traitRelevance
        .filter((relevance) => relevance.trait === trait)
        .map((relevance) => relevance.level),
    );
    assert.ok(levels.includes("low") || levels.includes("both"), `${trait} low missing`);
    assert.ok(levels.includes("high") || levels.includes("both"), `${trait} high missing`);
  }
});

test("filters learning topics by category, text and Big Five trait", () => {
  assert.ok(filterLearningTopics("communication").length >= 3);
  assert.deepEqual(
    filterLearningTopics("all", "procrastination").map(({ slug }) => slug),
    ["procrastination-and-structure"],
  );
  assert.ok(
    filterLearningTopics("relationships", "", "E").every((topic) =>
      topic.traitRelevance.some(({ trait }) => trait === "E"),
    ),
  );
  assert.deepEqual(
    filterLearningTopics("habits", "", "N").map(({ slug }) => slug),
    ["procrastination-and-structure"],
  );
  assert.ok(
    filterLearningTopics("all", "", "A", "low").some(
      ({ slug }) => slug === "challenging-ideas-with-respect",
    ),
  );
  assert.ok(
    filterLearningTopics("all", "", "O", "low").every((topic) =>
      topic.traitRelevance.some(
        (relevance) =>
          relevance.trait === "O" &&
          (relevance.level === "low" || relevance.level === "both"),
      ),
    ),
  );
});

test("resolves topic sources without invented references", () => {
  const topic = getLearningTopic("personality-friendly-habits");
  assert.ok(topic);
  assert.ok(getLearningSources(topic).every((source) => source.href.startsWith("https://")));
});
