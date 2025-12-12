import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import PersonalityBadge, { BigFiveScores } from "../components/PersonalityBadge";
// @ts-ignore - Package hat keine TypeScript-Definitionen
import getResult from "@bigfive-org/results";
import { getPersonalityResult } from "../lib/supabase-queries";

const STORAGE_KEY_QUICK = "bigfive-results-v1";
const STORAGE_KEY_FULL = "bigfive-results-full-v1";

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stored, setStored] = useState<StoredResults | null>(null);
  const [variant, setVariant] = useState<"quick" | "full" | null>(null);
  const [results, setResults] = useState<any[] | null>(null);

  useEffect(() => {
    if (authLoading) return;

    // Redirect to login if not authenticated
    if (!user) {
      router.push("/login");
      return;
    }

    // Load personality test results from Supabase
    const loadResults = async () => {
      try {
        const result = await getPersonalityResult(user.id);
        if (result) {
          setStored({
            scores: result.scores as BigFiveScores,
            calculatedScores: result.calculated_scores,
            timestamp: result.created_at,
            variant: result.variant || undefined,
            language: result.language || "de",
          });
          setVariant(result.variant || null);
          
          if (result.calculated_scores) {
            try {
              const lang = result.language || "de";
              const interpretationResults = getResult({
                scores: result.calculated_scores,
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
        console.error("Fehler beim Laden aus Supabase:", err);
      }

      // Fallback: Load from localStorage if not in Supabase
      if (typeof window === "undefined") return;
      try {
        const fullRaw = window.localStorage.getItem(STORAGE_KEY_FULL);
        if (fullRaw) {
          const parsed = JSON.parse(fullRaw);
          setStored(parsed);
          setVariant("full");
          
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
          const parsed = JSON.parse(quickRaw);
          setStored(parsed);
          setVariant("quick");
          
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
        }
      } catch (err) {
        console.error("Konnte Resultate nicht laden", err);
      }
    };

    loadResults();
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <div className="page-card">
        <div className="page-kicker">Profil</div>
        <h1 className="page-title">Lädt...</h1>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const date = stored ? new Date(stored.timestamp) : null;
  const isFullVersion = variant === "full";

  return (
    <div className="page-card">
      <div className="page-kicker">Profil</div>
      <h1 className="page-title">Mein Profil</h1>

      <div className="results-grid" style={{ marginTop: "2rem" }}>
        {/* Benutzerinformationen */}
        <section className="card-subtle">
          <h2 className="section-title">Kontoinformationen</h2>
          <div className="stack-md">
            <div>
              <label style={{ 
                display: "block", 
                fontSize: "0.875rem", 
                fontWeight: 500, 
                color: "var(--text-secondary)",
                marginBottom: "0.25rem"
              }}>
                E-Mail
              </label>
              <p style={{ 
                margin: 0, 
                fontSize: "1rem", 
                color: "var(--text)",
                fontWeight: 500
              }}>
                {user.email}
              </p>
            </div>
            <div>
              <label style={{ 
                display: "block", 
                fontSize: "0.875rem", 
                fontWeight: 500, 
                color: "var(--text-secondary)",
                marginBottom: "0.25rem"
              }}>
                Benutzer-ID
              </label>
              <p style={{ 
                margin: 0, 
                fontSize: "0.875rem", 
                color: "var(--text-secondary)",
                fontFamily: "monospace",
                wordBreak: "break-all"
              }}>
                {user.id}
              </p>
            </div>
            {user.created_at && (
              <div>
                <label style={{ 
                  display: "block", 
                  fontSize: "0.875rem", 
                  fontWeight: 500, 
                  color: "var(--text-secondary)",
                  marginBottom: "0.25rem"
                }}>
                  Registriert seit
                </label>
                <p style={{ 
                  margin: 0, 
                  fontSize: "0.875rem", 
                  color: "var(--text-secondary)"
                }}>
                  {new Date(user.created_at).toLocaleDateString("de-DE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Persönlichkeitsprofil */}
        {stored ? (
          <section className="stack-md">
            <div>
              <h2 className="section-title">Mein Persönlichkeitsprofil</h2>
              <p className="section-text" style={{ marginBottom: "1.5rem" }}>
                {date && (
                  <>
                    Dein Big-Five-Test wurde am{" "}
                    <strong>{date.toLocaleDateString("de-DE", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}</strong>{" "}
                    durchgeführt.
                  </>
                )}
                {isFullVersion ? (
                  <span> Dies ist eine wissenschaftlich validierte Auswertung basierend auf dem vollständigen IPIP-NEO-PI-R Test.</span>
                ) : (
                  <span> Dies ist eine Kurz-Auswertung (Demo-Version).</span>
                )}
              </p>

              {isFullVersion && (
                <div style={{ 
                  background: "var(--info-soft)", 
                  border: "1.5px solid var(--info)",
                  borderRadius: "1rem",
                  padding: "1rem 1.25rem",
                  marginBottom: "1.5rem",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--text)", lineHeight: "1.6" }}>
                    <strong style={{ color: "var(--info)" }}>✓ Wissenschaftlich validierter Test</strong>
                  </p>
                </div>
              )}

              {!isFullVersion && (
                <div style={{ 
                  background: "var(--warning-soft)", 
                  border: "1.5px solid var(--warning)",
                  borderRadius: "1rem",
                  padding: "1rem 1.25rem",
                  marginBottom: "1.5rem",
                  boxShadow: "var(--shadow-sm)"
                }}>
                  <p style={{ margin: 0, fontSize: "0.9375rem", color: "var(--text)", lineHeight: "1.6" }}>
                    <strong style={{ color: "var(--warning)" }}>⚠️ Hinweis:</strong> Für eine zuverlässige Analyse empfehlen wir den vollständigen Test mit 120 Fragen.
                  </p>
                </div>
              )}

              <PersonalityBadge scores={stored.scores} />

              {results && results.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                  <h3 className="section-title" style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
                    Detaillierte Interpretation
                  </h3>
                  <div className="stack-md">
                    {results.map((result) => (
                      <div key={result.domain} className="card-subtle">
                        <h4 className="section-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
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
                        {result.facets && result.facets.length > 0 && (
                          <div style={{ marginTop: "0.75rem" }}>
                            <h5 style={{ fontSize: "0.875rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                              Facetten:
                            </h5>
                            <div className="stack-md">
                              {result.facets.map((facet: any) => (
                                <div key={facet.facet} style={{ paddingLeft: "0.75rem", borderLeft: "2px solid var(--border-subtle)" }}>
                                  <strong style={{ fontSize: "0.8125rem" }}>{facet.title}</strong>
                                  <p 
                                    className="section-text" 
                                    style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}
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
              )}
            </div>
          </section>
        ) : (
          <section className="card-subtle">
            <h2 className="section-title">Persönlichkeitsprofil</h2>
            <p className="section-text">
              Du hast noch keinen Big-Five-Test durchgeführt. Starte jetzt einen Test, um dein Persönlichkeitsprofil zu erstellen.
            </p>
            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/test" className="btn btn-primary">
                Test starten
              </Link>
            </div>
          </section>
        )}

        {/* Schnellzugriff */}
        <section className="card-subtle">
          <h2 className="section-title">Schnellzugriff</h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <Link href="/test" className="btn btn-outline" style={{ textAlign: "center" }}>
              Test erneut machen
            </Link>
            {stored && (
              <Link href="/results" className="btn btn-outline" style={{ textAlign: "center" }}>
                Detaillierte Ergebnisse
              </Link>
            )}
            <Link href="/community" className="btn btn-outline" style={{ textAlign: "center" }}>
              Zur Community
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
};

export default ProfilePage;

