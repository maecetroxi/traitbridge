export const COMMUNITY_CATEGORIES = [
  "decisions",
  "work",
  "relationships",
  "communication",
  "stress",
  "habits",
  "self-understanding",
  "other",
] as const;

export const COMMUNITY_POST_TYPES = ["question", "experience"] as const;

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];
export type CommunityPostType = (typeof COMMUNITY_POST_TYPES)[number];
export type CommunitySort = "newest" | "most-answers" | "unanswered";
export type CommunityQueryValue = string | string[] | undefined;

export type CommunityQuestionListItem = {
  id: string;
  title: string;
  body: string;
  category: CommunityCategory;
  post_type: CommunityPostType;
  answer_count: number;
  created_at: string;
};

export const isCommunityCategory = (value: unknown): value is CommunityCategory =>
  typeof value === "string" &&
  (COMMUNITY_CATEGORIES as readonly string[]).includes(value);

export const isCommunityPostType = (value: unknown): value is CommunityPostType =>
  typeof value === "string" &&
  (COMMUNITY_POST_TYPES as readonly string[]).includes(value);

const firstQueryValue = (value: CommunityQueryValue) =>
  Array.isArray(value) ? value[0] : value;

export const parseCommunityQuery = (query: {
  category?: CommunityQueryValue;
  search?: CommunityQueryValue;
}) => {
  const categoryValue = firstQueryValue(query.category);
  const searchValue = firstQueryValue(query.search);

  return {
    category: isCommunityCategory(categoryValue) ? categoryValue : "all",
    search: typeof searchValue === "string" ? searchValue.trim().slice(0, 160) : "",
  } satisfies {
    category: CommunityCategory | "all";
    search: string;
  };
};

const normalizeSearchText = (value: string) =>
  value.trim().toLocaleLowerCase().normalize("NFKD");

export const filterAndSortQuestions = <T extends CommunityQuestionListItem>(
  questions: T[],
  options: {
    search?: string;
    category?: CommunityCategory | "all";
    sort?: CommunitySort;
  },
) => {
  const search = normalizeSearchText(options.search || "");
  const category = options.category || "all";
  const sort = options.sort || "newest";

  const filtered = questions.filter((question) => {
    if (category !== "all" && question.category !== category) {
      return false;
    }

    if (
      search &&
      !normalizeSearchText(`${question.title} ${question.body}`).includes(search)
    ) {
      return false;
    }

    return sort !== "unanswered" || question.answer_count === 0;
  });

  return filtered.sort((firstQuestion, secondQuestion) => {
    if (sort === "most-answers") {
      const countDifference = secondQuestion.answer_count - firstQuestion.answer_count;
      if (countDifference !== 0) {
        return countDifference;
      }
    }

    return (
      new Date(secondQuestion.created_at).getTime() -
      new Date(firstQuestion.created_at).getTime()
    );
  });
};
