import React, { useEffect, useState } from "react";
import Link from "next/link";
// @ts-ignore - Package hat keine TypeScript-Definitionen
import getResult from "@bigfive-org/results";
import PersonalityBadge, { BigFiveScores } from "./PersonalityBadge";

const STORAGE_KEY_FULL = "bigfive-results-full-v1";

type StoredResults = {
  scores: BigFiveScores;
  calculatedScores?: any;
  timestamp: string;
  variant?: "full";
  language?: string;
};

const BigFiveResults: React.FC = () => {
  const [stored, setStored] = useState<StoredResults | null>(null);
  const [results, setResults] = useState<any[] | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const fullRaw = window.localStorage.getItem(STORAGE_KEY_FULL);
      if (!fullRaw) {
        return;
      }

      const parsed = JSON.parse(fullRaw) as StoredResults;
      setStored(parsed);

      if (parsed.calculatedScores) {
        const lang = parsed.language || "de";
        setResults(getResult({ scores: parsed.calculatedScores, lang }));
      }
    } catch (err) {
      console.error("Konnte Resultate nicht laden", err);
    }
  }, []);

  if (!stored) {
    return (
      <div className="page-card">
        <div className="page-kicker">Resultate</div>
        <h1 className="page-title">Noch keine Resultate vorhanden</h1>
        <p className="page-intro">
          Es wurden noch keine Big-Five-Resultate im Browser gefunden. Bitte mache zuerst den Test.
        </p>
        <div style={{ marginTop: "2rem" }}>
          <Link href="/test" className="btn btn-primary">
            Zum Test
          </Link>
        </div>
      </div>
    );
  }

  const { scores, timestamp } = stored;
  const date = new Date(timestamp);

  return (
    <div className="page-card">
      <div className="page-kicker">Schritt 2</div>
      <h1 className="page-title">Dein Big-Five-Profil</h1>
      <p className="page-intro">
        Diese Auswertung wurde am {date.toLocaleDateString()} erstellt und lokal im Browser gespeichert.
        Die Werte liegen zwischen 1 (tief) und 5 (hoch).
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
          <strong style={{ color: "var(--info)" }}>Validierter Test:</strong> Diese Auswertung basiert
          auf dem vollstaendigen IPIP-NEO-PI-R Test mit 120 Fragen.
        </p>
      </div>

      <div className="results-grid">
        <section className="stack-md">
          <PersonalityBadge scores={scores} />

          {results && results.length > 0 ? (
            <div>
              <h2 className="section-title">Detaillierte Interpretation</h2>
              <div className="stack-md">
                {results.map((result) => (
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
              <h2 className="section-title">Verstaendnis deiner Werte</h2>
              <ul className="section-text" style={{ paddingLeft: "1.5rem", listStyleType: "disc" }}>
                <li>Offenheit: <strong>{scores.O >= 4 ? "hoch" : scores.O <= 2 ? "tief" : "mittel"}</strong></li>
                <li>Gewissenhaftigkeit: <strong>{scores.C >= 4 ? "hoch" : scores.C <= 2 ? "tief" : "mittel"}</strong></li>
                <li>Extraversion: <strong>{scores.E >= 4 ? "hoch" : scores.E <= 2 ? "tief" : "mittel"}</strong></li>
                <li>Vertraeglichkeit: <strong>{scores.A >= 4 ? "hoch" : scores.A <= 2 ? "tief" : "mittel"}</strong></li>
                <li>Emotionale Stabilitaet: <strong>{scores.N >= 4 ? "hoch" : scores.N <= 2 ? "tief" : "mittel"}</strong></li>
              </ul>
            </div>
          )}
        </section>

        <section className="card-subtle">
          <h2 className="section-title">Wie geht es weiter?</h2>
          <p className="section-text">
            In der Community kannst du Fragen stellen oder beantworten und deine Erfahrungen mit anderen
            Menschen teilen, die aehnliche Themen oder Herausforderungen haben.
          </p>

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/community" className="btn btn-primary">
              Zur Community
            </Link>
            <Link href="/test" className="btn btn-outline">
              Test erneut machen
            </Link>
          </div>

          <p className="muted" style={{ marginTop: "1.25rem" }}>
            Dieser Test basiert auf dem wissenschaftlich validierten IPIP-NEO-PI-R Modell.
            Er ersetzt jedoch keine professionelle psychologische Diagnostik.
          </p>
        </section>
      </div>
    </div>
  );
};

export default BigFiveResults;
