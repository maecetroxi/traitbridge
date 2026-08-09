import test from "node:test";
import assert from "node:assert/strict";
import { CURATED_BOOKS, localizeBook, recommendBooks } from "../lib/book-recommendations";

test("keeps the original shelves and adds five verified titles to each", () => {
  assert.equal(CURATED_BOOKS.filter((book) => book.kind === "nonfiction").length, 17);
  assert.equal(CURATED_BOOKS.filter((book) => book.kind === "fiction").length, 17);

  const originalIds = [
    "quiet",
    "atomic-habits",
    "mindset",
    "four-thousand-weeks",
    "nonviolent-communication",
    "thinking-fast-slow",
    "highly-sensitive-person",
    "essentialism",
    "daring-greatly",
    "flow",
    "art-of-loving",
    "digital-minimalism",
    "stoner",
    "stranger",
    "jane-eyre",
    "gatsby",
    "pride-prejudice",
    "remains-day",
    "convenience-store-woman",
    "little-prince",
    "circe",
    "man-called-ove",
    "eleanor-oliphant",
    "midnight-library",
  ];

  assert.ok(
    originalIds.every((id) => CURATED_BOOKS.some((book) => book.id === id)),
  );
});

test("new titles expose publication metadata without changing the legacy shape", () => {
  const additions = CURATED_BOOKS.filter((book) => book.year);

  assert.equal(additions.length, 10);
  assert.ok(additions.every((book) => Number.isInteger(book.year)));
  assert.ok(
    additions.every((book) => book.sourceUrl?.startsWith("https://")),
  );
});

test("returns six deterministic recommendations of the selected kind", () => {
  const scores = { O: 3, C: 3, E: 3, A: 3, N: 3 };
  const first = recommendBooks(scores, "nonfiction", "mirror");
  const second = recommendBooks(scores, "nonfiction", "mirror");
  assert.equal(first.length, 6);
  assert.ok(first.every(({ book }) => book.kind === "nonfiction"));
  assert.deepEqual(first.map(({ book }) => book.id), second.map(({ book }) => book.id));
});

test("profile and mode changes affect recommendations", () => {
  const reserved = { O: 3.8, C: 3.8, E: 1.2, A: 3.4, N: 3.6 };
  const outgoing = { O: 3.8, C: 3.8, E: 4.8, A: 3.4, N: 3.6 };
  const reservedMirror = recommendBooks(reserved, "nonfiction", "mirror").map(({ book }) => book.id);
  const outgoingMirror = recommendBooks(outgoing, "nonfiction", "mirror").map(({ book }) => book.id);
  const reservedGrowth = recommendBooks(reserved, "nonfiction", "growth").map(({ book }) => book.id);
  assert.notDeepEqual(reservedMirror, outgoingMirror);
  assert.notDeepEqual(reservedMirror, reservedGrowth);
});

test("localizes titles and editorial reasons", () => {
  const quiet = CURATED_BOOKS.find((book) => book.id === "quiet");
  assert.ok(quiet);
  assert.equal(localizeBook(quiet, "de", "mirror").title, "Still");
  assert.equal(localizeBook(quiet, "en", "mirror").title, "Quiet");
  assert.notEqual(localizeBook(quiet, "de", "mirror").reason, localizeBook(quiet, "de", "growth").reason);
});
