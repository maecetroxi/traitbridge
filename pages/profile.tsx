import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import PersonalityBadge, {
  type BigFiveScores,
} from "../components/PersonalityBadge";
import ProfileInterpretation from "../components/ProfileInterpretation";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import {
  getDetailedResults,
  sanitizeStoredResults,
  STORAGE_KEY_FULL,
  type StoredResults,
} from "../lib/bigfive-results";
import { getSuggestedLearningSlug } from "../lib/profile-content";
import { getPersonalityResult } from "../lib/supabase-queries";

const ProfilePage: React.FC = () => {
  const { user, loading: isAuthLoading } = useAuth();
  const { locale, copy } = useLocale();
  const router = useRouter();
  const [storedResults, setStoredResults] = useState<StoredResults | null>(null);
  const [detailedResults, setDetailedResults] =
    useState<ReturnType<typeof getDetailedResults>>(null);
  const [showDetails, setShowDetails] = useState(
    router.query.view === "details",
  );
  const isRegisteredUser = Boolean(user && !user.is_anonymous);

  const applyResults = (nextResults: StoredResults | null) => {
    setStoredResults(nextResults);
    setDetailedResults(
      nextResults
        ? getDetailedResults(nextResults.calculatedScores, locale)
        : null,
    );
  };

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!isRegisteredUser || !user) {
      void router.replace("/login");
      return;
    }

    const loadResults = async () => {
      try {
        const result = await getPersonalityResult(user.id);
        if (result) {
          const nextResults = sanitizeStoredResults({
            scores: result.scores as BigFiveScores,
            calculatedScores: result.calculated_scores,
            timestamp: result.created_at,
            variant: "full",
            language: (result.language as "en" | "de") || "en",
          });

          if (nextResults) {
            applyResults(nextResults);
            return;
          }

          console.warn(
            "Ignoring invalid Supabase result and falling back to local storage.",
          );
        }
      } catch (error) {
        console.error("Failed to load profile data from Supabase:", error);
      }

      if (typeof window === "undefined") {
        return;
      }

      try {
        const rawResults = window.localStorage.getItem(STORAGE_KEY_FULL);
        const parsedResults = rawResults
          ? sanitizeStoredResults(JSON.parse(rawResults))
          : null;
        applyResults(parsedResults);
      } catch (error) {
        console.error("Failed to load local Big Five results:", error);
        applyResults(null);
      }
    };

    void loadResults();
  }, [user, isAuthLoading, isRegisteredUser, router, locale]);

  useEffect(() => {
    if (router.query.view === "details") {
      setShowDetails(true);
    }
  }, [router.query.view]);

  if (isAuthLoading) {
    return (
      <div className="content-shell">
        <div className="surface profile-loading" role="status">
          <span className="page-kicker">{copy.profile.kicker}</span>
          <h1 className="page-title">{copy.profile.loadingTitle}</h1>
        </div>
      </div>
    );
  }

  if (!isRegisteredUser || !user) {
    return null;
  }

  const dateLocale = locale === "de" ? "de-CH" : "en-GB";
  const testDate = storedResults ? new Date(storedResults.timestamp) : null;
  const learningSlug = storedResults
    ? getSuggestedLearningSlug(storedResults.scores)
    : "decisions-with-overthinking";

  return (
    <>
      <Head>
        <title>{copy.profile.title} | TraitBridge</title>
        <meta name="description" content={copy.profile.whatResultsMeanText} />
      </Head>

      <div className="content-shell profile-page">
        <header className="profile-hero">
          <span className="page-kicker">{copy.profile.kicker}</span>
          <h1 className="page-title">{copy.profile.title}</h1>
        </header>

        <section className="surface profile-account">
          <div>
            <span className="muted">{copy.profile.email}</span>
            <strong>{user.email}</strong>
          </div>
          {user.created_at && (
            <div>
              <span className="muted">{copy.profile.registeredSince}</span>
              <strong>
                {new Date(user.created_at).toLocaleDateString(dateLocale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </strong>
            </div>
          )}
        </section>

        {storedResults ? (
          <>
            <section className="results-overview-grid">
              <div className="surface results-score-panel">
                <h2 className="section-title">
                  {copy.profile.resultOverview}
                </h2>
                <p className="section-text">
                  {testDate
                    ? `${copy.profile.testDatePrefix}: ${testDate.toLocaleDateString(dateLocale)}. `
                    : ""}
                  {storedResults.variant === "demo"
                    ? copy.profile.demoDescription
                    : copy.profile.completedDescription}
                </p>
                <PersonalityBadge scores={storedResults.scores} />
              </div>

              <aside className="surface results-next-panel">
                <h2 className="section-title">{copy.profile.quickAccess}</h2>
                <div className="results-actions">
                  <Link
                    href={`/learn/${learningSlug}`}
                    className="btn btn-primary"
                  >
                    {copy.profile.toLearning}
                  </Link>
                  <Link
                    href="/tools/personality-guide"
                    className="btn btn-outline"
                  >
                    {copy.profile.toCompass}
                  </Link>
                  <Link href="/community" className="btn btn-outline">
                    {copy.profile.toCommunity}
                  </Link>
                  <Link href="/test" className="btn btn-quiet">
                    {copy.profile.retakeTest}
                  </Link>
                </div>
              </aside>
            </section>

            <section className="profile-details-section">
              <div className="profile-details-heading">
                <div>
                  <h2 className="section-title">
                    {copy.profile.profileValuesTitle}
                  </h2>
                  <p className="section-text">
                    {copy.profile.profileValuesText}
                  </p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline"
                  aria-expanded={showDetails}
                  aria-controls="profile-interpretation"
                  onClick={() =>
                    setShowDetails((currentValue) => !currentValue)
                  }
                >
                  {showDetails
                    ? copy.profile.hideDetails
                    : copy.profile.showDetails}
                </button>
              </div>

              {showDetails && (
                <div id="profile-interpretation">
                  <ProfileInterpretation
                    scores={storedResults.scores}
                    detailedResults={detailedResults}
                  />
                </div>
              )}
            </section>
          </>
        ) : (
          <section className="surface profile-empty">
            <h2 className="section-title">{copy.profile.noProfileTitle}</h2>
            <p className="section-text">{copy.profile.noProfileText}</p>
            <Link href="/test" className="btn btn-primary">
              {copy.profile.startTest}
            </Link>
          </section>
        )}
      </div>
    </>
  );
};

export default ProfilePage;
