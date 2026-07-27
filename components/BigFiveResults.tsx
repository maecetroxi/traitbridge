import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import PersonalityBadge from "./PersonalityBadge";
import ProfileInterpretation from "./ProfileInterpretation";
import { useLocale } from "../contexts/LocaleContext";
import { formatTranslation } from "../lib/i18n";
import {
  getDetailedResults,
  sanitizeStoredResults,
  STORAGE_KEY_FULL,
  type StoredResults,
} from "../lib/bigfive-results";
import { getSuggestedLearningSlug } from "../lib/profile-content";

const BigFiveResults: React.FC = () => {
  const { locale, copy } = useLocale();
  const [storedResults, setStoredResults] = useState<StoredResults | null>(null);
  const [detailedResults, setDetailedResults] =
    useState<ReturnType<typeof getDetailedResults>>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const rawResults = window.localStorage.getItem(STORAGE_KEY_FULL);
      if (!rawResults) {
        setStoredResults(null);
        setDetailedResults(null);
        return;
      }

      const parsedResults = sanitizeStoredResults(JSON.parse(rawResults));
      if (!parsedResults) {
        setStoredResults(null);
        setDetailedResults(null);
        return;
      }

      setStoredResults(parsedResults);
      setDetailedResults(
        getDetailedResults(parsedResults.calculatedScores, locale),
      );
    } catch (error) {
      console.error("Failed to load local Big Five results:", error);
      setStoredResults(null);
      setDetailedResults(null);
    }
  }, [locale]);

  if (!storedResults) {
    return (
      <>
        <Head>
          <title>{copy.results.emptyTitle} | TraitBridge</title>
          <meta name="description" content={copy.results.emptyDescription} />
        </Head>
        <div className="content-shell results-page">
          <section className="surface results-empty">
            <span className="page-kicker">{copy.results.kicker}</span>
            <h1 className="page-title">{copy.results.emptyTitle}</h1>
            <p className="page-intro">{copy.results.emptyDescription}</p>
            <Link href="/test" className="btn btn-primary">
              {copy.results.toTest}
            </Link>
          </section>
        </div>
      </>
    );
  }

  const createdAt = new Date(storedResults.timestamp);
  const dateLocale = locale === "de" ? "de-CH" : "en-GB";
  const learningSlug = getSuggestedLearningSlug(storedResults.scores);

  return (
    <>
      <Head>
        <title>{copy.results.title} | TraitBridge</title>
        <meta name="description" content={copy.results.balancedNote} />
      </Head>

      <div className="content-shell results-page">
        <header className="results-hero">
          <div>
            <span className="page-kicker">{copy.results.kicker}</span>
            <h1 className="page-title">{copy.results.title}</h1>
            <p className="page-intro">
              {formatTranslation(copy.results.createdOn, {
                date: createdAt.toLocaleDateString(dateLocale),
              })}
            </p>
          </div>
          <span className="pill">{copy.results.storageLabel}</span>
        </header>

        <aside className="trust-note results-balance-note">
          <strong>
            {storedResults.variant === "demo"
              ? copy.results.demoLabel
              : copy.results.validatedLabel}
          </strong>
          <span>
            {storedResults.variant === "demo"
              ? copy.results.demoText
              : copy.results.validatedText}
          </span>
          <p>{copy.results.balancedNote}</p>
        </aside>

        <section className="results-overview-grid">
          <div className="surface results-score-panel">
            <h2 className="section-title">{copy.results.fallbackTitle}</h2>
            <p className="muted">{copy.results.scaleInfo}</p>
            <PersonalityBadge scores={storedResults.scores} />
          </div>

          <aside className="surface results-next-panel">
            <h2 className="section-title">{copy.results.nextStepsTitle}</h2>
            <p className="section-text">{copy.results.nextStepsText}</p>
            <div className="results-actions">
              <Link
                href={`/learn/${learningSlug}`}
                className="btn btn-primary"
              >
                {copy.results.toLearning}
              </Link>
              <Link href="/tools/personality-guide" className="btn btn-outline">
                {copy.results.toCompass}
              </Link>
              <Link href="/community" className="btn btn-outline">
                {copy.results.toCommunity}
              </Link>
              <Link href="/test" className="btn btn-quiet">
                {copy.results.retakeTest}
              </Link>
            </div>
          </aside>
        </section>

        <ProfileInterpretation
          scores={storedResults.scores}
          detailedResults={detailedResults}
        />

        <p className="muted results-disclaimer">{copy.results.disclaimer}</p>
      </div>
    </>
  );
};

export default BigFiveResults;
