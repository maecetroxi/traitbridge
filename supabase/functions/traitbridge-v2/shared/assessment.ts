import { getItems } from "@bigfive-org/questions";
import { orientationItems, scoreOrientation } from "./orientation.ts";
import { traits, type AssessmentVariant, type Scores } from "./types.ts";

export const assessmentVersions = {
  short: "traitbridge-short-v1",
  full: "ipip-neo-120-questions-1.2.1",
} as const;

type Language = "de" | "en";
export type AssessmentDraft = {
  variant: AssessmentVariant;
  version: (typeof assessmentVersions)[AssessmentVariant];
  language: Language;
  answers: Record<string, number>;
};

export function parseAssessmentDraft(value: unknown): AssessmentDraft | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const { variant, version, language, answers } = value as Record<
    string,
    unknown
  >;
  if (
    (variant !== "short" && variant !== "full") ||
    version !== assessmentVersions[variant] ||
    (language !== "de" && language !== "en") ||
    !answers ||
    typeof answers !== "object" ||
    Array.isArray(answers)
  )
    return null;
  const items =
    variant === "short" ? orientationItems : getItems(language, false);
  const raw = answers as Record<string, number>;
  if (
    Object.keys(raw).length !== (variant === "short" ? 10 : 120) ||
    items.some(
      ({ id }) =>
        !Object.hasOwn(raw, id) ||
        !Number.isInteger(raw[id]) ||
        raw[id] < 1 ||
        raw[id] > 5,
    )
  )
    return null;
  return {
    variant,
    version: assessmentVersions[variant],
    language,
    answers: raw,
  };
}

export function scoreAssessment(draft: AssessmentDraft): Scores {
  if (draft.variant === "short") return scoreOrientation(draft.answers);
  // Both tests supply already reverse-keyed choice scores. The full score
  // equals the existing calculator's average of the 24 items in each domain.
  const items = getItems(draft.language, false);
  return Object.fromEntries(
    traits.map((trait) => {
      const domain = items.filter((item) => item.domain === trait);
      return [
        trait,
        domain.reduce((sum, item) => sum + draft.answers[item.id], 0) /
          domain.length,
      ];
    }),
  ) as Scores;
}
