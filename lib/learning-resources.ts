import type { Locale } from "./i18n";
import {
  LEARNING_TOPICS,
  type BigFiveTrait,
  type LearningCategory,
  type TraitLevel,
} from "./learning-content";
import {
  MEDIA_LIBRARY,
  MEDIA_THEME_LABELS,
  type MediaPerspective,
  type MediaResourceType,
} from "./media-library";
import type { TraitBand } from "./trait-bridges";

export type LearningResourceTraitLevel = TraitLevel | TraitBand;

export type LearningResourceKind = "article" | MediaResourceType;

export type LearningResourceTraitMapping = {
  trait: BigFiveTrait;
  pole: LearningResourceTraitLevel;
  perspective: MediaPerspective;
  reason: string;
};

export type LearningResourceIndexItem = {
  id: string;
  href: string;
  kind: LearningResourceKind;
  title: string;
  summary: string;
  creator?: string;
  year?: number;
  themes: string[];
  categories: LearningCategory[];
  traitMappings: LearningResourceTraitMapping[];
};

export type LearningResourceFilters = {
  kind?: LearningResourceKind | "all";
  trait?: BigFiveTrait | "all";
  pole?: LearningResourceTraitLevel | "all";
  perspective?: MediaPerspective | "all";
  theme?: string | "all";
  search?: string;
};

const normalize = (value: string) =>
  value.trim().toLocaleLowerCase().normalize("NFKD");

export const getLearningResourceIndex = (
  locale: Locale,
): LearningResourceIndexItem[] => {
  const articleResources: LearningResourceIndexItem[] = LEARNING_TOPICS.map(
    (topic) => ({
      id: topic.slug,
      href: `/learn/${topic.slug}`,
      kind: "article",
      title: topic.title[locale],
      summary: topic.summary[locale],
      themes: topic.categories,
      categories: topic.categories,
      traitMappings: topic.traitRelevance.flatMap((relevance) => [
        {
          trait: relevance.trait,
          pole: relevance.level,
          perspective: "mirror" as const,
          reason: relevance.description[locale],
        },
        {
          trait: relevance.trait,
          pole: relevance.level,
          perspective: "growth" as const,
          reason: topic.actions[locale][0],
        },
      ]),
    }),
  );

  const mediaResources: LearningResourceIndexItem[] = MEDIA_LIBRARY.map(
    (resource) => ({
      id: resource.id,
      href: `/learn/library?type=${resource.type}`,
      kind: resource.type,
      title: resource.title[locale],
      summary: resource.description[locale],
      creator: resource.creator,
      year: resource.year,
      themes: resource.themes.map((theme) => MEDIA_THEME_LABELS[theme][locale]),
      categories: [],
      traitMappings: resource.traitMappings.map((mapping) => ({
        trait: mapping.trait,
        pole: mapping.pole,
        perspective: mapping.perspective,
        reason: mapping.reason[locale],
      })),
    }),
  );

  return [...articleResources, ...mediaResources];
};

export const filterLearningResourceIndex = (
  resources: LearningResourceIndexItem[],
  filters: LearningResourceFilters,
) => {
  const kind = filters.kind || "all";
  const trait = filters.trait || "all";
  const pole = filters.pole || "all";
  const perspective = filters.perspective || "all";
  const theme = filters.theme || "all";
  const search = normalize(filters.search || "");

  return resources.filter((resource) => {
    if (kind !== "all" && resource.kind !== kind) {
      return false;
    }

    if (
      theme !== "all" &&
      !resource.themes.some((resourceTheme) => normalize(resourceTheme) === normalize(theme))
    ) {
      return false;
    }

    const matchingMappings = resource.traitMappings.filter((mapping) => {
      if (trait !== "all" && mapping.trait !== trait) {
        return false;
      }
      if (pole !== "all") {
        const appliesToSelectedPole =
          mapping.pole === pole ||
          ((pole === "low" || pole === "high") && mapping.pole === "both");

        if (!appliesToSelectedPole) {
          return false;
        }
      }
      return perspective === "all" || mapping.perspective === perspective;
    });

    if (
      (trait !== "all" || pole !== "all" || perspective !== "all") &&
      matchingMappings.length === 0
    ) {
      return false;
    }

    if (!search) {
      return true;
    }

    return normalize(
      [
        resource.title,
        resource.summary,
        resource.creator || "",
        ...resource.themes,
        ...resource.traitMappings.map((mapping) => mapping.reason),
      ].join(" "),
    ).includes(search);
  });
};
