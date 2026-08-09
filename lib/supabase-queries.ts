import type { BigFiveScores } from "../components/PersonalityBadge";
import type { PersonalityResultVariant } from "./bigfive-results";
import {
  isCommunityCategory,
  isCommunityPostType,
  type CommunityCategory,
  type CommunityPostType,
} from "./community";
import { supabase } from "./supabase";
import type { Json } from "./database.types";
import type { TraitBand } from "./trait-bridges";

export type AssessmentVariant = Exclude<PersonalityResultVariant, "demo">;
export type CommunityBands = Record<keyof BigFiveScores, TraitBand>;

export type PersonalityResult = {
  id: string;
  user_id: string;
  scores: BigFiveScores;
  calculated_scores?: unknown;
  variant?: AssessmentVariant | null;
  language?: string;
  created_at: string;
  updated_at: string;
};

export type CommunityProfile = {
  user_id: string;
  display_name: string;
  bands: CommunityBands;
  test_variant: AssessmentVariant;
  created_at: string;
  updated_at: string;
};

export type Question = {
  id: string;
  user_id: string;
  title: string;
  body: string;
  category: CommunityCategory;
  post_type: CommunityPostType;
  answer_count: number;
  author_profile: CommunityProfile | null;
  created_at: string;
  updated_at: string;
};

export type Answer = {
  id: string;
  question_id: string;
  user_id: string;
  body: string;
  author_profile: CommunityProfile | null;
  created_at: string;
  updated_at: string;
};

const TRAITS: Array<keyof BigFiveScores> = ["O", "C", "E", "A", "N"];

const isTraitBand = (value: unknown): value is TraitBand =>
  value === "low" || value === "middle" || value === "high";

const normalizeBands = (value: unknown): CommunityBands | null => {
  if (!value || typeof value !== "object") {
    return null;
  }

  const bands = {} as CommunityBands;

  for (const trait of TRAITS) {
    const band = (value as Record<string, unknown>)[trait];
    if (!isTraitBand(band)) {
      return null;
    }
    bands[trait] = band;
  }

  return bands;
};

const normalizeCommunityProfile = (
  value: Record<string, unknown> | null | undefined,
): CommunityProfile | null => {
  if (!value) {
    return null;
  }

  const bands = normalizeBands(value.bands);
  const testVariant = value.test_variant;

  if (
    !bands ||
    typeof value.user_id !== "string" ||
    typeof value.display_name !== "string" ||
    (testVariant !== "full" && testVariant !== "short")
  ) {
    return null;
  }

  return {
    user_id: value.user_id,
    display_name: value.display_name,
    bands,
    test_variant: testVariant,
    created_at: String(value.created_at || ""),
    updated_at: String(value.updated_at || ""),
  };
};

export const savePersonalityResult = async (
  userId: string,
  scores: BigFiveScores,
  calculatedScores?: unknown,
  variant: AssessmentVariant = "full",
  language = "en",
) => {
  const { data, error } = await supabase
    .from("personality_results")
    .insert({
      user_id: userId,
      scores: scores as Json,
      calculated_scores: calculatedScores as Json | undefined,
      variant,
      language,
    })
    .select()
    .single();

  if (error) throw error;
  return data as PersonalityResult;
};

export const getPersonalityResult = async (userId: string) => {
  const { data, error } = await supabase
    .from("personality_results")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  const results = (data || []) as PersonalityResult[];
  return (
    results.find((result) => !result.variant || result.variant === "full") ||
    results.find((result) => result.variant === "short") ||
    null
  );
};

export const updatePersonalityResult = async (
  resultId: string,
  scores: BigFiveScores,
  calculatedScores?: unknown,
  variant: AssessmentVariant = "full",
) => {
  const { data, error } = await supabase
    .from("personality_results")
    .update({
      scores: scores as Json,
      calculated_scores: calculatedScores as Json | undefined,
      variant,
      updated_at: new Date().toISOString(),
    })
    .eq("id", resultId)
    .select()
    .single();

  if (error) throw error;
  return data as PersonalityResult;
};

export const getCommunityProfile = async (userId: string) => {
  const { data, error } = await supabase
    .from("community_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;

  return normalizeCommunityProfile(data);
};

export const upsertCommunityProfile = async (
  userId: string,
  displayName: string,
  bands: CommunityBands,
  testVariant: AssessmentVariant,
) => {
  const { data, error } = await supabase
    .from("community_profiles")
    .upsert(
      {
        user_id: userId,
        display_name: displayName.trim(),
        bands: bands as Json,
        test_variant: testVariant,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    )
    .select()
    .single();

  if (error) throw error;

  const profile = normalizeCommunityProfile(data);
  if (!profile) throw new Error("Invalid Community profile returned from Supabase.");
  return profile;
};

export const deleteCommunityProfile = async (userId: string) => {
  const { error } = await supabase
    .from("community_profiles")
    .delete()
    .eq("user_id", userId);

  if (error) throw error;
};

const getCommunityProfiles = async (userIds: string[]) => {
  const uniqueUserIds = Array.from(new Set(userIds.filter(Boolean)));
  const profiles = new Map<string, CommunityProfile>();

  if (uniqueUserIds.length === 0) {
    return profiles;
  }

  const { data, error } = await supabase
    .from("community_profiles")
    .select("*")
    .in("user_id", uniqueUserIds);

  if (error) throw error;

  for (const value of data || []) {
    const profile = normalizeCommunityProfile(value);
    if (profile) profiles.set(profile.user_id, profile);
  }

  return profiles;
};

const normalizeQuestion = (value: Record<string, unknown>): Question => ({
  id: String(value.id),
  user_id: String(value.user_id),
  title: String(value.title),
  body: String(value.body),
  category: isCommunityCategory(value.category) ? value.category : "other",
  post_type: isCommunityPostType(value.post_type) ? value.post_type : "question",
  answer_count:
    typeof value.answer_count === "number"
      ? value.answer_count
      : Array.isArray(value.answers) &&
          typeof (value.answers[0] as { count?: unknown } | undefined)?.count === "number"
        ? ((value.answers[0] as { count: number }).count)
        : 0,
  author_profile: normalizeCommunityProfile(
    value.author_profile as Record<string, unknown> | null | undefined,
  ),
  created_at: String(value.created_at),
  updated_at: String(value.updated_at),
});

const normalizeAnswer = (value: Record<string, unknown>): Answer => ({
  id: String(value.id),
  question_id: String(value.question_id),
  user_id: String(value.user_id),
  body: String(value.body),
  author_profile: normalizeCommunityProfile(
    value.author_profile as Record<string, unknown> | null | undefined,
  ),
  created_at: String(value.created_at),
  updated_at: String(value.updated_at),
});

const attachQuestionProfiles = async (questions: Question[]) => {
  const profiles = await getCommunityProfiles(questions.map(({ user_id }) => user_id));
  return questions.map((question) => ({
    ...question,
    author_profile: profiles.get(question.user_id) || null,
  }));
};

const attachAnswerProfiles = async (answers: Answer[]) => {
  const profiles = await getCommunityProfiles(answers.map(({ user_id }) => user_id));
  return answers.map((answer) => ({
    ...answer,
    author_profile: profiles.get(answer.user_id) || null,
  }));
};

export const createQuestion = async (
  userId: string,
  title: string,
  body: string,
  category: CommunityCategory,
  postType: CommunityPostType,
) => {
  const { data, error } = await supabase
    .from("questions")
    .insert({
      user_id: userId,
      title: title.trim(),
      body: body.trim(),
      category,
      post_type: postType,
    })
    .select()
    .single();

  if (error) throw error;
  return (await attachQuestionProfiles([normalizeQuestion(data)]))[0];
};

export const getQuestions = async () => {
  const { data, error } = await supabase
    .from("questions")
    .select(
      "id, user_id, title, body, category, post_type, created_at, updated_at, answers(count)",
    )
    .order("created_at", { ascending: false });

  if (error) throw error;

  return attachQuestionProfiles(
    (data || []).map((question) =>
      normalizeQuestion(question as unknown as Record<string, unknown>),
    ),
  );
};

export const getQuestion = async (questionId: string) => {
  const { data, error } = await supabase
    .from("questions")
    .select("*")
    .eq("id", questionId)
    .single();

  if (error) throw error;
  return (await attachQuestionProfiles([normalizeQuestion(data)]))[0];
};

export const updateQuestion = async (questionId: string, title: string, body: string) => {
  const { data, error } = await supabase
    .from("questions")
    .update({ title: title.trim(), body: body.trim() })
    .eq("id", questionId)
    .select()
    .single();

  if (error) throw error;
  return (await attachQuestionProfiles([normalizeQuestion(data)]))[0];
};

export const deleteQuestion = async (questionId: string) => {
  const { error } = await supabase.from("questions").delete().eq("id", questionId);
  if (error) throw error;
};

export const createAnswer = async (userId: string, questionId: string, body: string) => {
  const { data, error } = await supabase
    .from("answers")
    .insert({ user_id: userId, question_id: questionId, body: body.trim() })
    .select()
    .single();

  if (error) throw error;
  return (await attachAnswerProfiles([normalizeAnswer(data)]))[0];
};

export const getAnswers = async (questionId: string) => {
  const { data, error } = await supabase
    .from("answers")
    .select("*")
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return attachAnswerProfiles((data || []).map((answer) => normalizeAnswer(answer)));
};

export const updateAnswer = async (answerId: string, body: string) => {
  const { data, error } = await supabase
    .from("answers")
    .update({ body: body.trim() })
    .eq("id", answerId)
    .select()
    .single();

  if (error) throw error;
  return (await attachAnswerProfiles([normalizeAnswer(data)]))[0];
};

export const deleteAnswer = async (answerId: string) => {
  const { error } = await supabase.from("answers").delete().eq("id", answerId);
  if (error) throw error;
};
