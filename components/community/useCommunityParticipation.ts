import type { User } from "@supabase/supabase-js";
import { useCallback, useEffect, useState } from "react";
import type { BigFiveScores } from "../PersonalityBadge";
import {
  choosePreferredStoredResults,
  getScoreBands,
  loadPreferredStoredResults,
  sanitizeStoredResults,
  type StoredResults,
} from "../../lib/bigfive-results";
import {
  getCommunityProfile,
  getPersonalityResult,
  savePersonalityResult,
  upsertCommunityProfile,
  type CommunityProfile,
} from "../../lib/supabase-queries";

export const useCommunityParticipation = (user: User | null) => {
  const permanentUser = user && !user.is_anonymous ? user : null;
  const [result, setResult] = useState<StoredResults | null>(null);
  const [profile, setProfile] = useState<CommunityProfile | null>(null);
  const [needsResultSave, setNeedsResultSave] = useState(false);
  const [isLoading, setIsLoading] = useState(Boolean(permanentUser));
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!permanentUser) {
      setResult(null);
      setProfile(null);
      setNeedsResultSave(false);
      setIsLoading(false);
      setError(null);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [databaseResult, communityProfile] = await Promise.all([
        getPersonalityResult(permanentUser.id),
        getCommunityProfile(permanentUser.id),
      ]);
      const storedDatabaseResult = databaseResult
        ? sanitizeStoredResults({
            scores: databaseResult.scores as BigFiveScores,
            calculatedScores: databaseResult.calculated_scores,
            timestamp: databaseResult.created_at,
            variant: databaseResult.variant || "full",
            language: databaseResult.language || "en",
          })
        : null;
      const localResult =
        typeof window !== "undefined"
          ? loadPreferredStoredResults(window.localStorage)
          : null;
      const eligibleLocalResult = localResult?.variant === "demo" ? null : localResult;
      const preferred = choosePreferredStoredResults([
        storedDatabaseResult,
        eligibleLocalResult,
      ]);

      setResult(preferred);
      setProfile(communityProfile);
      setNeedsResultSave(Boolean(preferred && preferred === eligibleLocalResult && preferred !== storedDatabaseResult));
    } catch (loadError) {
      console.error("Failed to prepare Community participation:", loadError);
      setError("load");
    } finally {
      setIsLoading(false);
    }
  }, [permanentUser]);

  useEffect(() => {
    void load();
  }, [load]);

  const persistPreferredResult = async () => {
    if (!permanentUser || !result || result.variant === "demo") {
      throw new Error("A completed assessment is required.");
    }

    if (needsResultSave) {
      await savePersonalityResult(
        permanentUser.id,
        result.scores,
        result.calculatedScores,
        result.variant || "full",
        result.language || "en",
      );
      setNeedsResultSave(false);
    }
  };

  const createProfile = async (displayName: string) => {
    if (!permanentUser || !result || result.variant === "demo") {
      throw new Error("A completed assessment is required.");
    }

    await persistPreferredResult();
    const nextProfile = await upsertCommunityProfile(
      permanentUser.id,
      displayName,
      getScoreBands(result.scores),
      result.variant || "full",
    );
    setProfile(nextProfile);
    return nextProfile;
  };

  const syncProfile = async () => {
    if (!profile || !result || result.variant === "demo") {
      throw new Error("A public Community profile is required.");
    }

    await persistPreferredResult();
    const nextProfile = await upsertCommunityProfile(
      profile.user_id,
      profile.display_name,
      getScoreBands(result.scores),
      result.variant || "full",
    );
    setProfile(nextProfile);
    return nextProfile;
  };

  return {
    permanentUser,
    result,
    profile,
    isLoading,
    error,
    reload: load,
    createProfile,
    syncProfile,
  };
};

export type CommunityParticipation = ReturnType<typeof useCommunityParticipation>;
