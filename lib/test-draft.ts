import type { Locale } from "./i18n";

export const TEST_DRAFT_VERSION = 1;
export const TEST_STAGE_SIZE = 12;
export const TEST_DRAFT_STORAGE_PREFIX = "traitbridge-test-draft";

export type TestDraft = {
  version: typeof TEST_DRAFT_VERSION;
  language: Locale;
  answers: Record<string, number>;
  currentStage: number;
  updatedAt: string;
};

export type TestDraftSummary = {
  language: Locale;
  answeredCount: number;
  currentStage: number;
  updatedAt: string;
};

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const isAnswerScore = (value: unknown): value is number =>
  typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= 5;

export const getTestDraftStorageKey = (language: Locale) =>
  `${TEST_DRAFT_STORAGE_PREFIX}-v${TEST_DRAFT_VERSION}-${language}`;

export const splitIntoStages = <T>(items: T[], stageSize = TEST_STAGE_SIZE): T[][] => {
  if (!Number.isInteger(stageSize) || stageSize <= 0) {
    throw new Error("stageSize must be a positive integer");
  }

  return Array.from(
    { length: Math.ceil(items.length / stageSize) },
    (_, index) => items.slice(index * stageSize, (index + 1) * stageSize),
  );
};

export const calculateTestProgress = (
  answers: Record<string, number>,
  questionIds: string[],
) => {
  const answered = questionIds.reduce(
    (count, questionId) => count + (isAnswerScore(answers[questionId]) ? 1 : 0),
    0,
  );
  const total = questionIds.length;

  return {
    answered,
    total,
    percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
  };
};

export const sanitizeTestDraft = (
  value: unknown,
  language: Locale,
  questionIds: string[],
): TestDraft | null => {
  if (!isRecord(value)) {
    return null;
  }

  if (value.version !== TEST_DRAFT_VERSION || value.language !== language) {
    return null;
  }

  if (!isRecord(value.answers)) {
    return null;
  }

  const validQuestionIds = new Set(questionIds);
  const answers = Object.fromEntries(
    Object.entries(value.answers).filter(
      ([questionId, score]) => validQuestionIds.has(questionId) && isAnswerScore(score),
    ),
  ) as Record<string, number>;

  const currentStage =
    typeof value.currentStage === "number" &&
    Number.isInteger(value.currentStage) &&
    value.currentStage >= 0
      ? value.currentStage
      : 0;
  const updatedAt =
    typeof value.updatedAt === "string" && !Number.isNaN(Date.parse(value.updatedAt))
      ? value.updatedAt
      : new Date().toISOString();

  return {
    version: TEST_DRAFT_VERSION,
    language,
    answers,
    currentStage,
    updatedAt,
  };
};

export const saveTestDraft = (
  storage: StorageLike,
  language: Locale,
  answers: Record<string, number>,
  currentStage: number,
) => {
  const draft: TestDraft = {
    version: TEST_DRAFT_VERSION,
    language,
    answers,
    currentStage,
    updatedAt: new Date().toISOString(),
  };

  storage.setItem(getTestDraftStorageKey(language), JSON.stringify(draft));
  return draft;
};

export const loadTestDraft = (
  storage: StorageLike,
  language: Locale,
  questionIds: string[],
) => {
  const storageKey = getTestDraftStorageKey(language);
  const rawDraft = storage.getItem(storageKey);

  if (!rawDraft) {
    return null;
  }

  try {
    const draft = sanitizeTestDraft(JSON.parse(rawDraft), language, questionIds);

    if (!draft) {
      storage.removeItem(storageKey);
    }

    return draft;
  } catch {
    storage.removeItem(storageKey);
    return null;
  }
};

export const clearTestDraft = (storage: StorageLike, language: Locale) => {
  storage.removeItem(getTestDraftStorageKey(language));
};

export const getTestDraftSummary = (
  storage: Pick<Storage, "getItem">,
): TestDraftSummary | null => {
  const summaries: TestDraftSummary[] = [];

  for (const language of ["de", "en"] as const) {
    const rawDraft = storage.getItem(getTestDraftStorageKey(language));

    if (!rawDraft) {
      continue;
    }

    try {
      const value = JSON.parse(rawDraft) as unknown;

      if (
        !isRecord(value) ||
        value.version !== TEST_DRAFT_VERSION ||
        value.language !== language ||
        !isRecord(value.answers)
      ) {
        continue;
      }

      const answeredCount = Object.values(value.answers).filter(isAnswerScore).length;
      if (answeredCount === 0) {
        continue;
      }

      summaries.push({
        language,
        answeredCount,
        currentStage:
          typeof value.currentStage === "number" && Number.isInteger(value.currentStage)
            ? Math.max(0, value.currentStage)
            : 0,
        updatedAt:
          typeof value.updatedAt === "string" && !Number.isNaN(Date.parse(value.updatedAt))
            ? value.updatedAt
            : new Date().toISOString(),
      });
    } catch {
      continue;
    }
  }

  return (
    summaries.sort(
      (first, second) =>
        Date.parse(second.updatedAt) - Date.parse(first.updatedAt),
    )[0] || null
  );
};
