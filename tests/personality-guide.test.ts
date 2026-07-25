import test from "node:test";
import assert from "node:assert/strict";
import { sanitizeStoredResults } from "../lib/bigfive-results";
import { personalityGuideCopy } from "../lib/personality-guide-copy";
import {
  isPersonalityAdviceResponse,
  validatePersonalityAdviceRequest,
} from "../lib/personality-guide";

const validRequest = {
  question: "Wie kann ich Entscheidungen klarer treffen?",
  language: "de",
  scores: { O: 4.24, C: 3.8, E: 2.7, A: 4.1, N: 3.6 },
};

test("accepts and normalizes a valid personality advice request", () => {
  const result = validatePersonalityAdviceRequest(validRequest);

  assert.equal(result.valid, true);
  if (result.valid) {
    assert.equal(result.data.question, validRequest.question);
    assert.equal(result.data.scores.O, 4.2);
    assert.equal(result.data.scores.N, 3.6);
  }
});

test("rejects short questions and scores outside the 1-5 range", () => {
  assert.equal(validatePersonalityAdviceRequest({ ...validRequest, question: "Zu kurz" }).valid, false);
  assert.equal(
    validatePersonalityAdviceRequest({
      ...validRequest,
      scores: { ...validRequest.scores, N: 5.1 },
    }).valid,
    false,
  );
});

test("accepts only an answer with exactly three insights", () => {
  assert.equal(
    isPersonalityAdviceResponse({
      summary: "Ein klares Fazit.",
      insights: ["Erster Hinweis", "Zweiter Hinweis", "Dritter Hinweis"],
      disclaimer: "Keine Diagnose.",
    }),
    true,
  );
  assert.equal(
    isPersonalityAdviceResponse({
      summary: "Ein klares Fazit.",
      insights: ["Nur ein Hinweis"],
      disclaimer: "Keine Diagnose.",
    }),
    false,
  );
});

test("keeps stored N scores unchanged and rejects corrupted profiles", () => {
  const stored = sanitizeStoredResults({
    scores: { O: 4, C: 3, E: 2, A: 4.5, N: 4.2 },
    timestamp: "2026-07-19T12:00:00.000Z",
    variant: "full",
    language: "de",
  });

  assert.equal(stored?.scores.N, 4.2);
  assert.equal(
    sanitizeStoredResults({
      scores: { O: 4, C: 3, E: 2, A: 4.5, N: 42 },
      timestamp: "2026-07-19T12:00:00.000Z",
    }),
    null,
  );
});

test("labels raw N as emotional sensitivity in both languages", () => {
  assert.equal(personalityGuideCopy.de.traits.N.label, "Emotionale Empfindlichkeit");
  assert.equal(personalityGuideCopy.en.traits.N.label, "Emotional Sensitivity");
});
