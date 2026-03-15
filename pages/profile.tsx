import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/router";
import Link from "next/link";
import PersonalityBadge, { BigFiveScores } from "../components/PersonalityBadge";
// @ts-ignore - Package hat keine TypeScript-Definitionen
import getResult from "@bigfive-org/results";
import { getPersonalityResult } from "../lib/supabase-queries";

const STORAGE_KEY_FULL = "bigfive-results-full-v1";

type StoredResults = {
  scores: BigFiveScores;
  calculatedScores?: any;
  timestamp: string;
  variant?: "full";
  language?: string;
};

const domainNames: Record<keyof BigFiveScores, string> = {
  O: "Offenheit",
  C: "Gewissenhaftigkeit",
  E: "Extraversion",
  A: "Vertraeglichkeit",
  N: "Emotionale Stabilitaet",
};

const ProfilePage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stored, setStored] = useState<StoredResults | null>(null);
  const [results, setResults] = useState<any[] | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    if (authLoading) {
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
          const nextStored = {
            scores: result.scores as BigFiveScores,
            calculatedScores: result.calculated_scores,
            timestamp: result.created_at,
            variant: "full" as const,
            language: result.language || "de",
          };
          setStored(nextStored);

          if (result.calculated_scores) {
            const lang = result.language || "de";
            setResults(getResult({ scores: result.calculated_scores, lang }));
          }
          return;
        }
      } catch (err) {
        console.error("Fehler beim Laden aus Supabase:", err);
      }

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
    };

    loadResults();
  }, [user, authLoading, router]);

  useEffect(() => {
    if (router.query.view === "details") {
      setShowDetails(true);
    }
  }, [router.query.view]);

  const topTraits = useMemo(() => {
    if (!stored) {
      return [] as Array<{ key: keyof BigFiveScores; value: number }>;
    }

    return (Object.entries(stored.scores) as Array<[keyof BigFiveScores, number]>)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([key, value]) => ({ key, value }));
  }, [stored]);

  if (authLoading) {
    return (
      <div className="page-card">
        <div className="page-kicker">Profil</div>
        <h1 className="page-title">Laedt...</h1>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const date = stored ? new Date(stored.timestamp) : null;

  return (
    <div className="page-card">
      <div className="page-kicker">Profil</div>
      <h1 className="page-title">Mein Profil</h1>

      <div className="results-grid" style={{ marginTop: "2rem" }}>
        <section className="card-subtle">
          <h2 className="section-title">Kontoinformationen</h2>
          <div className="stack-md">
            <div>
              <label
                className="muted"
                style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}
              >
                E-Mail
              </label>
              <p style={{ margin: 0, fontWeight: 500 }}>{user.email}</p>
            </div>
            {user.created_at && (
              <div>
                <label
                  className="muted"
                  style={{ display: "block", fontSize: "0.875rem", marginBottom: "0.25rem" }}
                >
                  Registriert seit
                </label>
                <p className="muted" style={{ margin: 0 }}>
                  {new Date(user.created_at).toLocaleDateString("de-DE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            )}
          </div>
        </section>

        {stored ? (
          <section className="stack-md">
            <div>
              <h2 className="section-title">Uebersicht deiner Ergebnisse</h2>
              <p className="section-text" style={{ marginBottom: "1rem" }}>
                {date ? `Testdatum: ${date.toLocaleDateString("de-DE")}. ` : ""}
                Du hast den vollstaendigen, wissenschaftlich validierten Test abgeschlossen.
              </p>

              <PersonalityBadge scores={stored.scores} />

              <div className="card-subtle" style={{ marginTop: "1rem" }}>
                <h3 className="section-title" style={{ fontSize: "1rem" }}>
                  Staerkste Auspraegungen
                </h3>
                <ul className="section-text" style={{ marginTop: "0.5rem", paddingLeft: "1.25rem" }}>
                  {topTraits.map((trait) => (
                    <li key={trait.key}>
                      <strong>{domainNames[trait.key]}:</strong> {trait.value.toFixed(2)} / 5
                    </li>
                  ))}
                </ul>
              </div>

              {results && results.length > 0 && (
                <div style={{ marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setShowDetails((prev) => !prev)}
                  >
                    {showDetails ? "Detaillierte Auswertung ausblenden" : "Detaillierte Auswertung anzeigen"}
                  </button>

                  {showDetails && (
                    <div style={{ marginTop: "1.5rem" }}>
                      <div className="card-subtle" style={{ marginBottom: "1rem" }}>
                        <h3 className="section-title" style={{ fontSize: "1rem", marginBottom: "0.5rem" }}>
                          Was bedeuten die Resultate?
                        </h3>
                        <p className="section-text" style={{ margin: 0 }}>
                          Die fuenf Dimensionen zeigen, wie stark bestimmte Persoenlichkeitstendenzen bei dir
                          ausgepraegt sind. Es geht nicht um gut oder schlecht, sondern um Praeferenzen.
                        </p>
                      </div>

                      <h3 className="section-title" style={{ fontSize: "1.125rem", marginBottom: "1rem" }}>
                        Detaillierte Interpretation
                      </h3>
                      <div className="stack-md">
                        {results.map((result) => (
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
            <h2 className="section-title">Persoenlichkeitsprofil</h2>
            <p className="section-text">
              Du hast noch keinen Big-Five-Test durchgefuehrt. Starte jetzt den Test, um dein
              Persoenlichkeitsprofil zu erstellen.
            </p>
            <div style={{ marginTop: "1.5rem" }}>
              <Link href="/test" className="btn btn-primary">Test starten</Link>
            </div>
          </section>
        )}

        <section className="card-subtle">
          <h2 className="section-title">Schnellzugriff</h2>
          <div style={{ display: "grid", gap: "0.75rem" }}>
            <Link href="/test" className="btn btn-outline" style={{ textAlign: "center" }}>
              Test erneut machen
            </Link>
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
