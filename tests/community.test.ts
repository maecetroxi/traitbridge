import assert from "node:assert/strict";
import test from "node:test";
import {
  filterAndSortQuestions,
  parseCommunityQuery,
  type CommunityQuestionListItem,
} from "../lib/community";

const questions: CommunityQuestionListItem[] = [
  {
    id: "one",
    title: "A difficult decision",
    body: "I keep overthinking my options",
    category: "decisions",
    post_type: "question",
    answer_count: 1,
    created_at: "2026-01-01T12:00:00.000Z",
  },
  {
    id: "two",
    title: "Team communication",
    body: "How can we address conflict directly?",
    category: "communication",
    post_type: "experience",
    answer_count: 4,
    created_at: "2026-01-03T12:00:00.000Z",
  },
  {
    id: "three",
    title: "Starting a habit",
    body: "I need a smaller first step",
    category: "habits",
    post_type: "question",
    answer_count: 0,
    created_at: "2026-01-02T12:00:00.000Z",
  },
];

test("filters questions across title and body", () => {
  assert.deepEqual(
    filterAndSortQuestions(questions, { search: "overthinking" }).map(({ id }) => id),
    ["one"],
  );
});

test("filters by a fixed category", () => {
  assert.deepEqual(
    filterAndSortQuestions(questions, { category: "communication" }).map(({ id }) => id),
    ["two"],
  );
});

test("sorts by answer count and isolates unanswered questions", () => {
  assert.deepEqual(
    filterAndSortQuestions(questions, { sort: "most-answers" }).map(({ id }) => id),
    ["two", "one", "three"],
  );
  assert.deepEqual(
    filterAndSortQuestions(questions, { sort: "unanswered" }).map(({ id }) => id),
    ["three"],
  );
});

test("accepts safe Community filters from learning links", () => {
  assert.deepEqual(
    parseCommunityQuery({
      category: "self-understanding",
      search: "  different perspectives  ",
    }),
    {
      category: "self-understanding",
      search: "different perspectives",
    },
  );
  assert.deepEqual(
    parseCommunityQuery({
      category: "not-a-category",
      search: ["first", "second"],
    }),
    {
      category: "all",
      search: "first",
    },
  );
});

test("keeps questions and experiences together in the Community feed", () => {
  assert.deepEqual(
    filterAndSortQuestions(questions, {}).map(({ post_type }) => post_type),
    ["experience", "question", "question"],
  );
});
