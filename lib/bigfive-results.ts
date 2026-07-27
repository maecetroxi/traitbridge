import getResult from "@bigfive-org/results";
import type { BigFiveScores } from "../components/PersonalityBadge";
import type { Locale } from "./i18n";

export const STORAGE_KEY_FULL = "bigfive-results-full-v1";

export type CalculatedDomainScore = {
  score: number;
  count: number;
  result?: string;
  facet?: Record<string, { score: number; count: number; result?: string }>;
};

export type CalculatedScores = Partial<Record<keyof BigFiveScores, CalculatedDomainScore>>;

export type StoredResults = {
  scores: BigFiveScores;
  calculatedScores?: CalculatedScores;
  timestamp: string;
  variant?: "full" | "demo";
  language?: Locale;
};

const TRAITS: Array<keyof BigFiveScores> = ["O", "C", "E", "A", "N"];

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const normalizeTraitScore = (value: unknown) => {
  if (!isFiniteNumber(value)) {
    return null;
  }

  if (value < 1 || value > 5) {
    return null;
  }

  return Number(value.toFixed(2));
};

export const calculateResultBand = (score: number, count: number) => {
  const average = score / count;

  if (average > 3.5) {
    return "high";
  }

  if (average < 2.5) {
    return "low";
  }

  return "neutral";
};

export const normalizeCalculatedScores = (value: CalculatedScores | undefined) => {
  if (!value) {
    return undefined;
  }

  const normalized: CalculatedScores = {};

  for (const trait of TRAITS) {
    const domain = value[trait];

    if (!domain || !isFiniteNumber(domain.score) || !isFiniteNumber(domain.count) || domain.count <= 0) {
      continue;
    }

    const normalizedFacetEntries = Object.entries(domain.facet || {}).flatMap(([facetId, facetValue]) => {
      if (
        !facetValue ||
        !isFiniteNumber(facetValue.score) ||
        !isFiniteNumber(facetValue.count) ||
        facetValue.count <= 0
      ) {
        return [];
      }

      return [[facetId, {
        score: facetValue.score,
        count: facetValue.count,
        result: calculateResultBand(facetValue.score, facetValue.count),
      }] as const];
    });

    normalized[trait] = {
      score: domain.score,
      count: domain.count,
      result: calculateResultBand(domain.score, domain.count),
      facet: Object.fromEntries(normalizedFacetEntries),
    };
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
};

export const isCalculatedScoresValid = (value: unknown): value is CalculatedScores => {
  if (!value || typeof value !== "object") {
    return false;
  }

  return TRAITS.some((trait) => {
    const domain = (value as Record<string, unknown>)[trait];

    if (!domain || typeof domain !== "object") {
      return false;
    }

    const score = (domain as Record<string, unknown>).score;
    const count = (domain as Record<string, unknown>).count;

    return (
      isFiniteNumber(score) &&
      isFiniteNumber(count) &&
      count > 0 &&
      score >= count &&
      score <= count * 5
    );
  });
};

export const sanitizeStoredResults = (value: unknown): StoredResults | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Record<string, unknown>;
  const rawScores = candidate.scores;

  if (!rawScores || typeof rawScores !== "object") {
    return null;
  }

  const scores = {} as BigFiveScores;

  for (const trait of TRAITS) {
    const normalized = normalizeTraitScore((rawScores as Record<string, unknown>)[trait]);

    if (normalized === null) {
      return null;
    }

    scores[trait] = normalized;
  }

  const timestamp =
    typeof candidate.timestamp === "string" &&
    candidate.timestamp &&
    !Number.isNaN(Date.parse(candidate.timestamp))
      ? candidate.timestamp
      : new Date().toISOString();

  const language =
    candidate.language === "de" || candidate.language === "en"
      ? candidate.language
      : "en";

  const variant =
    candidate.variant === "demo" || candidate.variant === "full"
      ? candidate.variant
      : "full";

  const calculatedScores = isCalculatedScoresValid(candidate.calculatedScores)
    ? normalizeCalculatedScores(candidate.calculatedScores)
    : undefined;

  return {
    scores,
    calculatedScores,
    timestamp,
    variant,
    language,
  };
};

export const getDetailedResults = (calculatedScores: CalculatedScores | undefined, locale: Locale) => {
  if (!calculatedScores) {
    return null;
  }

  try {
    return getResult({ scores: calculatedScores, lang: locale });
  } catch (error) {
    console.error("Failed to build detailed Big Five results:", error);
    return null;
  }
};

const createDomainScore = (average: number, count = 24): CalculatedDomainScore => {
  const facetCount = 4;
  const facetEntries = Array.from({ length: 6 }, (_, index) => {
    const facetScore = clamp(Math.round(average * facetCount * 100) / 100, facetCount, facetCount * 5);

    return [
      (index + 1).toString(),
      {
        score: facetScore,
        count: facetCount,
        result: calculateResultBand(facetScore, facetCount),
      },
    ];
  });

  return {
    score: clamp(Math.round(average * count * 100) / 100, count, count * 5),
    count,
    result: calculateResultBand(average * count, count),
    facet: Object.fromEntries(facetEntries),
  };
};

export const DEMO_RESULTS: StoredResults = {
  scores: {
    O: 4.4,
    C: 3.8,
    E: 3.0,
    A: 4.2,
    N: 3.5,
  },
  calculatedScores: {
    O: createDomainScore(4.4),
    C: createDomainScore(3.8),
    E: createDomainScore(3.0),
    A: createDomainScore(4.2),
    N: createDomainScore(3.5),
  },
  timestamp: new Date("2026-03-22T12:00:00.000Z").toISOString(),
  variant: "demo",
  language: "de",
};
