import React, { useEffect, useState } from "react";
import Link from "next/link";
import PersonalityBadge from "./PersonalityBadge";
import { useLocale } from "../contexts/LocaleContext";
import { formatTranslation } from "../lib/i18n";
import { getDetailedResults, sanitizeStoredResults, STORAGE_KEY_FULL, type StoredResults } from "../lib/bigfive-results";

const BigFiveResults: React.FC = () => {
  const { locale, copy } = useLocale();
  const [storedResults, setStoredResults] = useState<StoredResults | null>(null);
  const [detailedResults, setDetailedResults] = useState<any[] | null>(null);

  useEffect(() => {
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

      setStoredResults(parsedResults);
      setDetailedResults(getDetailedResults(parsedResults.calculatedScores, locale));
    } catch (error) {
      console.error("Failed to load local Big Five results:", error);
    }
  }, [locale]);

  if (!storedResults) {
    return (
      <div className="page-card">
        <div className="page-kicker">{copy.results.kicker}</div>
        <h1 className="page-title">{copy.results.emptyTitle}</h1>
        <p className="page-intro">{copy.results.emptyDescription}</p>
        <div style={{ marginTop: "2rem" }}>
          <Link href="/test" className="btn btn-primary">
            {copy.results.toTest}
          </Link>
        </div>
      </div>
    );
  }

  const createdAt = new Date(storedResults.timestamp);
  const dateLocale = locale === "de" ? "de-DE" : "en-US";
  const scoreLevel = (value: number) => (value >= 4 ? copy.traits.high : value <= 2 ? copy.traits.low : copy.traits.medium);

  return (
    <div className="page-card">
      <div className="page-kicker">{copy.results.stepKicker}</div>
      <h1 className="page-title">{copy.results.title}</h1>
      <p className="page-intro">
        {formatTranslation(copy.results.createdOn, {
          date: createdAt.toLocaleDateString(dateLocale),
        })}{" "}
        {copy.results.scaleInfo}
      </p>

      <div
        style={{
          background: "var(--info-soft)",
          border: "1.5px solid var(--info)",
          borderRadius: "1rem",
          padding: "1rem 1.25rem",
          marginTop: "1.5rem",
          marginBottom: "1.5rem",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--text)", lineHeight: "1.6" }}>
          <strong style={{ color: "var(--info)" }}>{copy.results.validatedLabel}</strong>{" "}
          {copy.results.validatedText}
        </p>
      </div>

      <div className="results-grid">
        <section className="stack-md">
          <PersonalityBadge scores={storedResults.scores} />

          {detailedResults && detailedResults.length > 0 ? (
            <div>
              <h2 className="section-title">{copy.results.interpretationTitle}</h2>
              <div className="stack-md">
                {detailedResults.map((result) => (
                  <div key={result.domain} className="card-subtle">
                    <h3 className="section-title" style={{ fontSize: "1.125rem", marginBottom: "0.5rem" }}>
                      {result.title}
                    </h3>
                    <p
                      className="section-text"
                      style={{ marginBottom: "0.75rem" }}
                      dangerouslySetInnerHTML={{ __html: result.shortDescription }}
                    />
                    <p
                      className="section-text"
                      style={{ marginBottom: "0.75rem", fontSize: "0.875rem" }}
                      dangerouslySetInnerHTML={{ __html: result.text }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="section-title">{copy.results.fallbackTitle}</h2>
              <ul className="section-text" style={{ paddingLeft: "1.5rem", listStyleType: "disc" }}>
                <li>{copy.traits.O}: <strong>{scoreLevel(storedResults.scores.O)}</strong></li>
                <li>{copy.traits.C}: <strong>{scoreLevel(storedResults.scores.C)}</strong></li>
                <li>{copy.traits.E}: <strong>{scoreLevel(storedResults.scores.E)}</strong></li>
                <li>{copy.traits.A}: <strong>{scoreLevel(storedResults.scores.A)}</strong></li>
                <li>{copy.traits.N}: <strong>{scoreLevel(storedResults.scores.N)}</strong></li>
              </ul>
            </div>
          )}
        </section>

        <section className="card-subtle">
          <h2 className="section-title">{copy.results.nextStepsTitle}</h2>
          <p className="section-text">{copy.results.nextStepsText}</p>

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/community" className="btn btn-primary">
              {copy.results.toCommunity}
            </Link>
            <Link href="/test" className="btn btn-outline">
              {copy.results.retakeTest}
            </Link>
          </div>

          <p className="muted" style={{ marginTop: "1.25rem" }}>
            {copy.results.disclaimer}
          </p>
        </section>
      </div>
    </div>
  );
};

export default BigFiveResults;
