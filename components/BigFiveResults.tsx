import React, { useEffect, useState } from "react";
import PersonalityBadge, { BigFiveScores } from "./PersonalityBadge";
import Link from "next/link";
// @ts-ignore - Package hat keine TypeScript-Definitionen
import getResult from "@bigfive-org/results";

const STORAGE_KEY_QUICK = "bigfive-results-v1";
const STORAGE_KEY_FULL = "bigfive-results-full-v1";

type StoredResults = {
  scores: BigFiveScores;
  calculatedScores?: any; // Scores im Format für @bigfive-org/results
  timestamp: string;
  variant?: "quick" | "full";
  language?: string;
};

const BigFiveResults: React.FC = () => {
  const [stored, setStored] = useState<StoredResults | null>(null);
  const [variant, setVariant] = useState<"quick" | "full" | null>(null);
  const [results, setResults] = useState<any[] | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      // Prüfe zuerst die vollständige Version, dann die kurze
      const fullRaw = window.localStorage.getItem(STORAGE_KEY_FULL);
      if (fullRaw) {
        const parsed = JSON.parse(fullRaw) as StoredResults;
        setStored(parsed);
        setVariant("full");
        
        // Generiere Interpretationen mit @bigfive-org/results
        if (parsed.calculatedScores) {
          try {
            const lang = parsed.language || "de";
            const interpretationResults = getResult({
              scores: parsed.calculatedScores,
              lang: lang
            });
            setResults(interpretationResults);
          } catch (err) {
            console.error("Fehler beim Generieren der Interpretationen:", err);
          }
        }
        return;
      }
      
      const quickRaw = window.localStorage.getItem(STORAGE_KEY_QUICK);
      if (quickRaw) {
        const parsed = JSON.parse(quickRaw) as StoredResults;
        setStored(parsed);
        setVariant("quick");
        
        // Generiere Interpretationen mit @bigfive-org/results
        if (parsed.calculatedScores) {
          try {
            const lang = parsed.language || "de";
            const interpretationResults = getResult({
              scores: parsed.calculatedScores,
              lang: lang
            });
            setResults(interpretationResults);
          } catch (err) {
            console.error("Fehler beim Generieren der Interpretationen:", err);
          }
        }
        return;
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
  const isFullVersion = variant === "full";

  // Domain-Namen Mapping
  const domainNames: Record<string, string> = {
    O: "Offenheit",
    C: "Gewissenhaftigkeit",
    E: "Extraversion",
    A: "Verträglichkeit",
    N: "Emotionale Stabilität"
  };

  return (
    <div className="page-card">
      <div className="page-kicker">Schritt 2</div>
      <h1 className="page-title">Dein Big-Five-Profil</h1>
      <p className="page-intro">
        Diese {isFullVersion ? "Auswertung" : "Kurz-Auswertung"} wurde am {date.toLocaleDateString()} erstellt und lokal im Browser gespeichert.
        Die Werte liegen zwischen 1 (tief) und 5 (hoch).
      </p>

      {isFullVersion && (
        <div style={{ 
          background: "var(--info-soft)", 
          border: "1.5px solid var(--info)",
          borderRadius: "1rem",
          padding: "1rem 1.25rem",
          marginTop: "1.5rem",
          marginBottom: "1.5rem",
          boxShadow: "var(--shadow-sm)"
        }}>
          <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--text)", lineHeight: "1.6" }}>
            <strong style={{ color: "var(--info)" }}>✓ Wissenschaftlich validierter Test:</strong> Diese Auswertung basiert auf dem vollständigen IPIP-NEO-PI-R Test mit 120 Fragen.
          </p>
        </div>
      )}

      {!isFullVersion && (
        <div style={{ 
          background: "var(--warning-soft)", 
          border: "1.5px solid var(--warning)",
          borderRadius: "1rem",
          padding: "1rem 1.25rem",
          marginTop: "1.5rem",
          marginBottom: "1.5rem",
          boxShadow: "var(--shadow-sm)"
        }}>
          <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--text)", lineHeight: "1.6" }}>
            <strong style={{ color: "var(--warning)" }}>⚠️ Hinweis:</strong> Diese Auswertung basiert auf der kurzen Demo-Version (10 Fragen) und ist nicht wissenschaftlich validiert. 
            Für eine zuverlässige Analyse empfehlen wir den vollständigen Test mit 120 Fragen.
          </p>
        </div>
      )}

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
                    {result.facets && result.facets.length > 0 && (
                      <div style={{ marginTop: "0.75rem" }}>
                        <h4 style={{ fontSize: "0.9375rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                          Facetten:
                        </h4>
                        <div className="stack-md">
                          {result.facets.map((facet: any) => (
                            <div key={facet.facet} style={{ paddingLeft: "0.75rem", borderLeft: "2px solid var(--border-subtle)" }}>
                              <strong style={{ fontSize: "0.875rem" }}>{facet.title}</strong>
                              <p 
                                className="section-text" 
                                style={{ fontSize: "0.8125rem", marginTop: "0.25rem" }}
                                dangerouslySetInnerHTML={{ __html: facet.text }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <h2 className="section-title">Verständnis deiner Werte</h2>
              <ul className="section-text" style={{ paddingLeft: "1.5rem", listStyleType: "disc" }}>
                <li>
                  Offenheit: <strong>{scores.O >= 4 ? "hoch" : scores.O <= 2 ? "tief" : "mittel"}</strong> – Umgang mit neuen Ideen, Kreativität und Neugier.
                </li>
                <li>
                  Gewissenhaftigkeit: <strong>{scores.C >= 4 ? "hoch" : scores.C <= 2 ? "tief" : "mittel"}</strong> – Struktur, zuverlässiges Arbeiten und Planung.
                </li>
                <li>
                  Extraversion: <strong>{scores.E >= 4 ? "hoch" : scores.E <= 2 ? "tief" : "mittel"}</strong> – Energie im Kontakt mit anderen Menschen.
                </li>
                <li>
                  Verträglichkeit: <strong>{scores.A >= 4 ? "hoch" : scores.A <= 2 ? "tief" : "mittel"}</strong> – Fokus auf Harmonie, Kooperation und Empathie.
                </li>
                <li>
                  Emotionale Stabilität: <strong>{scores.N >= 4 ? "hoch" : scores.N <= 2 ? "tief" : "mittel"}</strong> – Umgang mit Stress, Unsicherheit und Stimmungsschwankungen.
                </li>
              </ul>
            </div>
          )}
        </section>

        <section className="card-subtle">
          <h2 className="section-title">Wie geht es weiter?</h2>
          <p className="section-text">
            In der Community kannst du Fragen stellen oder beantworten und deine Erfahrungen mit anderen Menschen teilen,
            die ähnliche Themen oder Herausforderungen haben.
          </p>

          <div style={{ marginTop: "1.25rem", display: "grid", gap: "0.75rem" }}>
            <div className="pill">
              <span className="pill-dot" />
              Ergebnis bleibt nur auf diesem Gerät gespeichert.
            </div>
            <div className="pill">
              <span className="pill-dot" />
              Später kann ein Login und persönliches Profil dazukommen.
            </div>
          </div>

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/community" className="btn btn-primary">
              Zur Community
            </Link>
            <Link href="/test" className="btn btn-outline">
              Test erneut machen
            </Link>
          </div>

          <p className="muted" style={{ marginTop: "1.25rem" }}>
            {!isFullVersion && (
              <>
            Hinweis: Dies ist eine kompakte Demo-Version des Big-Five-Tests und ersetzt keine professionelle psychologische Diagnostik.
                <br />
                <br />
              </>
            )}
            {isFullVersion ? (
              <>
                Dieser Test basiert auf dem wissenschaftlich validierten IPIP-NEO-PI-R Modell. 
                Er ersetzt jedoch keine professionelle psychologische Diagnostik.
              </>
            ) : (
              <>
                Für eine wissenschaftlich fundierte Analyse empfehlen wir den vollständigen Test mit 120 Fragen.
              </>
            )}
          </p>
        </section>
      </div>
    </div>
  );
};

export default BigFiveResults;
