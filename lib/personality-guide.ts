import type { BigFiveScores } from "../components/PersonalityBadge";
import type { Locale } from "./i18n";

export const PERSONALITY_TRAITS: Array<keyof BigFiveScores> = ["O", "C", "E", "A", "N"];

export const NEUTRAL_PERSONALITY_SCORES: BigFiveScores = {
  O: 3,
  C: 3,
  E: 3,
  A: 3,
  N: 3,
};

export type PersonalityAdviceRequest = {
  question: string;
  language: Locale;
  scores: BigFiveScores;
};

export type PersonalityAdviceResponse = {
  summary: string;
  insights: [string, string, string];
  disclaimer: string;
};

type ValidationResult =
  | { valid: true; data: PersonalityAdviceRequest }
  | { valid: false; code: "invalid_request" };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

export const validatePersonalityAdviceRequest = (value: unknown): ValidationResult => {
  if (!isRecord(value) || !isRecord(value.scores)) {
    return { valid: false, code: "invalid_request" };
  }

  const question = typeof value.question === "string" ? value.question.trim() : "";
  const language = value.language;

  if (question.length < 10 || question.length > 500 || (language !== "de" && language !== "en")) {
    return { valid: false, code: "invalid_request" };
  }

  const scores = {} as BigFiveScores;

  for (const trait of PERSONALITY_TRAITS) {
    const score = value.scores[trait];

    if (typeof score !== "number" || !Number.isFinite(score) || score < 1 || score > 5) {
      return { valid: false, code: "invalid_request" };
    }

    scores[trait] = Math.round(score * 10) / 10;
  }

  return {
    valid: true,
    data: { question, language, scores },
  };
};

export const isPersonalityAdviceResponse = (value: unknown): value is PersonalityAdviceResponse => {
  if (!isRecord(value) || typeof value.summary !== "string" || typeof value.disclaimer !== "string") {
    return false;
  }

  return (
    Array.isArray(value.insights) &&
    value.insights.length === 3 &&
    value.insights.every((insight) => typeof insight === "string" && insight.trim().length > 0)
  );
};

export const PERSONALITY_ADVICE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["summary", "insights", "disclaimer"],
  properties: {
    summary: { type: "string" },
    insights: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: { type: "string" },
    },
    disclaimer: { type: "string" },
  },
} as const;
