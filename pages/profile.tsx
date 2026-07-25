import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import PersonalityBadge, { BigFiveScores } from "../components/PersonalityBadge";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import { DEMO_RESULTS, getDetailedResults, sanitizeStoredResults, STORAGE_KEY_FULL, type StoredResults } from "../lib/bigfive-results";
import { getPersonalityResult } from "../lib/supabase-queries";

const ProfilePage: React.FC = () => {
  const { user, loading: isAuthLoading } = useAuth();
  const { locale, copy } = useLocale();
  const router = useRouter();
  const [storedResults, setStoredResults] = useState<StoredResults | null>(null);
  const [detailedResults, setDetailedResults] = useState<any[] | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const applyResults = (nextResults: StoredResults | null) => {
    setStoredResults(nextResults);
    setDetailedResults(nextResults ? getDetailedResults(nextResults.calculatedScores, locale) : null);
  };

  useEffect(() => {
    if (isAuthLoading) {
      return;
    }

    if (!user) {
      router.push("/login");
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

          console.warn("Ignoring invalid Supabase result and falling back to local storage.");
        }
      } catch (error) {
        console.error("Failed to load profile data from Supabase:", error);
      }

      if (typeof window === "undefined") {
        return;
      }

      try {
        const rawResults = window.localStorage.getItem(STORAGE_KEY_FULL);
        if (!rawResults) {
          return;
        }

        const parsedResults = sanitizeStoredResults(JSON.parse(rawResults));
        if (!parsedResults) {
          return;
        }

        applyResults(parsedResults);
      } catch (error) {
        console.error("Failed to load local Big Five results:", error);
      }
    };

    loadResults();
  }, [user, isAuthLoading, router, locale]);

  useEffect(() => {
    if (router.query.view === "details") {
      setShowDetails(true);
    }
  }, [router.query.view]);

  const topTraits = useMemo(() => {
    if (!storedResults) {
      return [] as Array<{ key: keyof BigFiveScores; value: number }>;
    }

    return (Object.entries(storedResults.scores) as Array<[keyof BigFiveScores, number]>)
      .sort((firstTrait, secondTrait) => secondTrait[1] - firstTrait[1])
      .slice(0, 2)
      .map(([key, value]) => ({ key, value }));
  }, [storedResults]);

  if (isAuthLoading) {
    return (
      <div className="page-card">
        <div className="page-kicker">{copy.profile.kicker}</div>
        <h1 className="page-title">{copy.profile.loadingTitle}</h1>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const dateLocale = locale === "de" ? "de-DE" : "en-US";
  const testDate = storedResults ? new Date(storedResults.timestamp) : null;

  return (
    <div className="page-card">
      <div className="page-kicker">{copy.profile.kicker}</div>
      <h1 className="page-title">{copy.profile.title}</h1>

      <div className="results-grid" style={{ marginTop: "2rem" }}>
        <section className="card-subtle">
          <h2 className="section-title">{copy.profile.accountInfo}</h2>
          <div className="stack-md">
            <div>
              <label
                className="muted"
                style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}
              >
                {copy.profile.email}
              </label>
              <p style={{ margin: 0, fontWeight: 500 }}>{user.email}</p>
            </div>
            {user.created_at && (
              <div>
                <label
                  className="muted"
                  style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}
                >
                  {copy.profile.registeredSince}
                </label>
                <p className="muted" style={{ margin: 0 }}>
                  {new Date(user.created_at).toLocaleDateString(dateLocale, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </section>

        {storedResults ? (
          <section className="stack-md">
            <div>
              <h2 className="section-title">{copy.profile.resultOverview}</h2>
              <p className="section-text" style={{ marginBottom: "1rem" }}>
                {testDate ? `${copy.profile.testDatePrefix}: ${testDate.toLocaleDateString(dateLocale)}. ` : ""}
                {copy.profile.completedDescription}
                {storedResults.variant === "demo" ? " Demo-Profil zum schnellen Prüfen." : ""}
              </p>

              <PersonalityBadge scores={storedResults.scores} />

              <div className="card-subtle" style={{ marginTop: "1rem" }}>
                <h3 className="section-title" style={{ fontSize: "1rem" }}>
                  {copy.profile.strongestTraits}
                </h3>
                <ul className="section-text" style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
                  {topTraits.map((trait) => (
                    <li key={trait.key}>
                      <strong>{copy.traits[trait.key]}:</strong> {trait.value.toFixed(2)} / 5
                    </li>
                  ))}
                </ul>
              </div>

              {detailedResults && detailedResults.length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowDetails((currentValue) => !currentValue)}
                  >
                    {showDetails ? copy.profile.hideDetails : copy.profile.showDetails}
                  </button>

                  {showDetails && (
                    <div style={{ marginTop: "1.5rem" }}>
                      <div className="card-subtle" style={{ marginBottom: "1rem" }}>
                        <h3 className="section-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                          {copy.profile.whatResultsMean}
                        </h3>
                        <p className="section-text" style={{ margin: 0 }}>
                          {copy.profile.whatResultsMeanText}
                        </p>
                      </div>

                      <h3 className="section-title" style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
                        {copy.profile.interpretationTitle}
                      </h3>
                      <div className="stack-md">
                        {detailedResults.map((result) => (
                          <div key={result.domain} className="card-subtle">
                            <h4
                              className="section-title"
                              style={{ fontSize: "1rem", marginBottom: "0.5rem" }}
                            >
                              {result.title}
                            </h4>
                            <p
                              className="section-text"
                              style={{ marginBottom: "0.75rem", fontSize: "0.875rem" }}
                              dangerouslySetInnerHTML={{ __html: result.shortDescription }}
                            />
                            <p
                              className="section-text"
                              style={{ marginBottom: "0.75rem", fontSize: "0.8125rem" }}
                              dangerouslySetInnerHTML={{ __html: result.text }}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        ) : (
          <section className="card-subtle">
            <h2 className="section-title">{copy.profile.noProfileTitle}</h2>
            <p className="section-text">{copy.profile.noProfileText}</p>
            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/test" className="btn btn-primary">
                {copy.profile.startTest}
              </Link>
            </div>
          </section>
        )}

        <section className="card-subtle">
          <h2 className="section-title">{copy.profile.quickAccess}</h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <Link href="/test" className="btn btn-outline" style={{ textAlign: "center" }}>
              {copy.profile.retakeTest}
            </Link>
            <button
              type="button"
              className="btn btn-outline"
              style={{ textAlign: "center" }}
              onClick={() => {
                if (typeof window === "undefined") {
                  return;
                }

                const demoResults = {
                  ...DEMO_RESULTS,
                  timestamp: new Date().toISOString(),
                  language: locale,
                };

                window.localStorage.setItem(STORAGE_KEY_FULL, JSON.stringify(demoResults));
                applyResults(demoResults);
              }}
            >
              {copy.profile.loadDemo}
            </button>
            <Link href="/community" className="btn btn-outline" style={{ textAlign: "center" }}>
              {copy.profile.toCommunity}
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;
