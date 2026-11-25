import type { BigFiveScores } from "../components/PersonalityBadge";
import type { PersonalityResultVariant } from "./bigfive-results";
import { supabase } from "./supabase";
import type { Json } from "./database.types";
import { assessmentVersions } from "./v2/assessment";
export type AssessmentVariant = Exclude<PersonalityResultVariant, "demo">;
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
      calculated_scores: {
        ...(calculatedScores && typeof calculatedScores === "object" ? calculatedScores : {}),
        assessment_version: assessmentVersions[variant],
      } as Json,
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
