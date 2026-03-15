import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getChoices, getItems, type Question as PackageQuestion } from "@bigfive-org/questions";
// @ts-ignore - Package hat keine TypeScript-Definitionen
import { processAnswers } from "@bigfive-org/score/build/src";
import type { BigFiveScores } from "./PersonalityBadge";
import { useAuth } from "../contexts/AuthContext";
import { savePersonalityResult } from "../lib/supabase-queries";

type Translations = {
  step1: string;
  error: string;
  loadingQuestions: string;
  loadingQuestionsDescription: string;
  questionsLoadError: string;
  questionsLoadErrorDescription: string;
  questionsLoadErrorHint: string;
  noQuestionsFound: string;
  noQuestionsFoundDescription: string;
  testTitle: string;
  testIntroduction: string;
  progress: string;
  submitButton: string;
  submitting: string;
  answerAllQuestions: string;
};

type BigFiveTestProps = {
  language?: string;
};

const defaultTranslations: Translations = {
  step1: "Schritt 1",
  error: "Fehler",
  loadingQuestions: "Lade Fragen...",
  loadingQuestionsDescription: "Bitte warten, die Fragen werden geladen.",
  questionsLoadError: "Fragen konnten nicht geladen werden",
  questionsLoadErrorDescription: "Die vollstaendige Fragenliste konnte nicht geladen werden: {error}",
  questionsLoadErrorHint: "Bitte stelle sicher, dass die Sprache unterstuetzt wird.",
  noQuestionsFound: "Keine Fragen gefunden",
  noQuestionsFoundDescription: "Die vollstaendige Fragenliste konnte nicht geladen werden.",
  testTitle: "Big-Five-Test",
  testIntroduction: "Schaetze spontan ein, wie sehr die folgenden Aussagen auf dich zutreffen. Es gibt keine richtigen oder falschen Antworten.",
  progress: "Fortschritt",
  submitButton: "Test abschliessen und Resultate ansehen",
  submitting: "Wird ausgewertet ...",
  answerAllQuestions: "Bitte beantworte alle Fragen, bevor du fortfaehrst.",
};

const supportedLanguages = [
  "de", "en", "es", "fr", "it", "pt-br", "nl", "pl", "ru", "zh-cn", "zh-hk",
  "no", "is", "et", "hr", "fi", "id", "hi", "uk", "ar", "he", "ko", "ro",
  "ca", "ja", "th", "sv", "da", "sq", "ur", "fa",
];

const replacePlaceholders = (text: string, replacements: Record<string, string>): string => {
  let result = text;
  Object.entries(replacements).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value);
  });
  return result;
};

const BigFiveTest: React.FC<BigFiveTestProps> = ({ language = "de" }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [questions, setQuestions] = useState<PackageQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Translations>(defaultTranslations);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/data/translations.json")
      .then((res) => res.json())
      .then((data) => {
        if (data[language]) {
          setTranslations((prev) => ({ ...prev, ...data[language] }));
        }
      })
      .catch((err) => {
        console.error("Fehler beim Laden der Uebersetzungen:", err);
      });
  }, [language]);

  useEffect(() => {
    try {
      setLoading(true);
      setLoadError(null);

      const langCode = supportedLanguages.includes(language) ? language : "de";
      const allQuestions = getItems(langCode, false);

      if (!allQuestions || allQuestions.length === 0) {
        throw new Error("Keine Fragen gefunden");
      }

      setQuestions(allQuestions);
      setLoading(false);
    } catch (err) {
      console.error("Fehler beim Laden der Fragen:", err);
      setLoadError(err instanceof Error ? err.message : "Unbekannter Fehler");
      setLoading(false);
    }
  }, [language]);

  const handleChange = (questionId: string, score: number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }));
  };

  const allAnswered = questions.length > 0 && questions.every((q) => answers[q.id] !== undefined);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!allAnswered) {
      setError(translations.answerAllQuestions);
      return;
    }

    setError(null);
    setSubmitting(true);

    try {
      const answerArray = questions.map((q) => ({
        domain: q.domain,
        facet: q.facet?.toString() || "1",
        score: answers[q.id].toString(),
      }));

      const calculatedScores = processAnswers(answerArray);
      const scores: BigFiveScores = {
        O: calculatedScores.O ? calculatedScores.O.score / calculatedScores.O.count : 0,
        C: calculatedScores.C ? calculatedScores.C.score / calculatedScores.C.count : 0,
        E: calculatedScores.E ? calculatedScores.E.score / calculatedScores.E.count : 0,
        A: calculatedScores.A ? calculatedScores.A.score / calculatedScores.A.count : 0,
        N: calculatedScores.N ? calculatedScores.N.score / calculatedScores.N.count : 0,
      };

      if (user) {
        try {
          await savePersonalityResult(user.id, scores, calculatedScores, "full", language);
        } catch (supabaseError) {
          console.error("Fehler beim Speichern in Supabase:", supabaseError);
        }
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          "bigfive-results-full-v1",
          JSON.stringify({
            scores,
            calculatedScores,
            timestamp: new Date().toISOString(),
            variant: "full",
            language,
          })
        );
      }

      router.push("/profile");
    } catch (err) {
      console.error("Fehler beim Speichern der Resultate:", err);
      setError("Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
      setSubmitting(false);
    }
  };

  const progress = questions.length > 0
    ? Math.round((Object.keys(answers).length / questions.length) * 100)
    : 0;

  if (loading) {
    return (
      <div className="page-card">
        <div className="page-kicker">{translations.step1}</div>
        <h1 className="page-title">{translations.loadingQuestions}</h1>
        <p className="page-intro">{translations.loadingQuestionsDescription}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page-card">
        <div className="page-kicker">{translations.error}</div>
        <h1 className="page-title">{translations.questionsLoadError}</h1>
        <p className="page-intro">
          {replacePlaceholders(translations.questionsLoadErrorDescription, { error: loadError })}
        </p>
        <p className="section-text" style={{ marginTop: "1rem" }}>
          {replacePlaceholders(translations.questionsLoadErrorHint, { language })}
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="page-card">
        <div className="page-kicker">{translations.error}</div>
        <h1 className="page-title">{translations.noQuestionsFound}</h1>
        <p className="page-intro">{translations.noQuestionsFoundDescription}</p>
      </div>
    );
  }

  const choices = getChoices(language);
  const choiceArray = choices?.plus || [];

  return (
    <div className="page-card">
      <div className="page-kicker">{translations.step1}</div>
      <h1 className="page-title">{translations.testTitle}</h1>
      <p className="page-intro">{translations.testIntroduction}</p>

      <div style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.875rem",
            marginBottom: "0.5rem",
          }}
        >
          <span className="muted" style={{ fontWeight: 500 }}>{translations.progress}</span>
          <span className="muted" style={{ fontWeight: 500 }}>
            {progress}% ({Object.keys(answers).length} / {questions.length})
          </span>
        </div>
        <div className="progress-shell" style={{ marginTop: "0.5rem" }}>
          <div className="progress-bar" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="stack-lg">
        <ol className="questions-list">
          {questions.map((q) => {
            const questionChoices = q.choices || choiceArray;

            return (
              <li key={q.id}>
                <div className="question-item-text">
                  <strong>{q.num}.</strong>{" "}
                  <span>{q.text}</span>
                </div>
                <div className="answer-scale">
                  {questionChoices.map((choice) => {
                    const checked = answers[q.id] === choice.score;
                    return (
                      <label
                        key={choice.score}
                        className={"answer-pill" + (checked ? " answer-pill-selected" : "")}
                      >
                        <input
                          type="radio"
                          name={`q-${q.id}`}
                          value={choice.score}
                          checked={checked}
                          onChange={() => handleChange(q.id, choice.score)}
                        />
                        <span>{choice.text}</span>
                      </label>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ol>

        {error && <p className="text-danger">{error}</p>}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
          <button
            type="submit"
            disabled={!allAnswered || submitting}
            className="btn btn-primary"
          >
            {submitting ? translations.submitting : translations.submitButton}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BigFiveTest;
