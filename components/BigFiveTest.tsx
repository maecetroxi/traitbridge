import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getChoices, getItems, type Question as PackageQuestion } from "@bigfive-org/questions";
// @ts-ignore - Package does not ship TypeScript declarations
import { processAnswers } from "@bigfive-org/score/build/src";
import type { BigFiveScores } from "./PersonalityBadge";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import { Locale, formatTranslation } from "../lib/i18n";
import { normalizeCalculatedScores, STORAGE_KEY_FULL } from "../lib/bigfive-results";
import { savePersonalityResult } from "../lib/supabase-queries";

type BigFiveTestProps = {
  language?: Locale;
  onChangeLanguage?: () => void;
};

const supportedQuestionLanguages: Locale[] = ["en", "de"];

const BigFiveTest: React.FC<BigFiveTestProps> = ({
  language = "en",
  onChangeLanguage,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { copy } = useLocale();
  const [questions, setQuestions] = useState<PackageQuestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    try {
      setIsLoading(true);
      setLoadError(null);

      const questionLanguage = supportedQuestionLanguages.includes(language) ? language : "en";
      const loadedQuestions = getItems(questionLanguage, false);

      if (!loadedQuestions || loadedQuestions.length === 0) {
        throw new Error(copy.test.noQuestionsTitle);
      }

      setQuestions(loadedQuestions);
    } catch (error) {
      console.error("Failed to load Big Five questions:", error);
      setLoadError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [copy.test.noQuestionsTitle, language]);

  const handleAnswerChange = (questionId: string, score: number) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: score,
    }));
  };

  const allQuestionsAnswered =
    questions.length > 0 && questions.every((question) => answers[question.id] !== undefined);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!allQuestionsAnswered) {
      setSubmitError(copy.test.answerAll);
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      const answerArray = questions.map((question) => ({
        domain: question.domain,
        facet: question.facet?.toString() || "1",
        score: answers[question.id],
      }));

      const calculatedScores = normalizeCalculatedScores(processAnswers(answerArray)) || {};
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
        } catch (storageError) {
          console.error("Failed to store Big Five result in Supabase:", storageError);
        }
      }

      if (typeof window !== "undefined") {
        window.localStorage.setItem(
          STORAGE_KEY_FULL,
          JSON.stringify({
            scores,
            calculatedScores,
            timestamp: new Date().toISOString(),
            variant: "full",
            language,
          }),
        );
      }

      router.push("/profile");
    } catch (error) {
      console.error("Failed to save Big Five result:", error);
      setSubmitError(copy.test.saveError);
      setIsSubmitting(false);
    }
  };

  const progress = questions.length > 0
    ? Math.round((Object.keys(answers).length / questions.length) * 100)
    : 0;

  if (isLoading) {
    return (
      <div className="page-card">
        <div className="page-kicker">{copy.test.kicker}</div>
        <h1 className="page-title">{copy.test.loadingTitle}</h1>
        <p className="page-intro">{copy.test.loadingDescription}</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page-card">
        <div className="page-kicker">{copy.test.errorKicker}</div>
        <h1 className="page-title">{copy.test.loadErrorTitle}</h1>
        <p className="page-intro">
          {formatTranslation(copy.test.loadErrorDescription, { error: loadError })}
        </p>
        <p className="section-text" style={{ marginTop: "1rem" }}>
          {copy.test.loadErrorHint}
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="page-card">
        <div className="page-kicker">{copy.test.errorKicker}</div>
        <h1 className="page-title">{copy.test.noQuestionsTitle}</h1>
        <p className="page-intro">{copy.test.noQuestionsDescription}</p>
      </div>
    );
  }

  const questionChoices = getChoices(language)?.plus || [];

  return (
    <div className="page-card">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div className="page-kicker">{copy.test.kicker}</div>
          <h1 className="page-title">{copy.test.title}</h1>
          <p className="page-intro">{copy.test.introduction}</p>
        </div>
        {onChangeLanguage && (
          <button type="button" className="btn btn-outline" onClick={onChangeLanguage}>
            {copy.test.changeLanguage}
          </button>
        )}
      </div>

      <div style={{ marginTop: "1.5rem", marginBottom: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.875rem",
            marginBottom: "0.5rem",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <span className="muted" style={{ fontWeight: 500 }}>
            {copy.test.progress}
          </span>
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
          {questions.map((question) => {
            const choices = question.choices || questionChoices;

            return (
              <li key={question.id}>
                <div className="question-item-text">
                  <strong>{question.num}.</strong>{" "}
                  <span>{question.text}</span>
                </div>
                <div className="answer-scale">
                  {choices.map((choice) => {
                    const checked = answers[question.id] === choice.score;
                    return (
                      <label
                        key={choice.score}
                        className={`answer-pill${checked ? " answer-pill-selected" : ""}`}
                      >
                        <input
                          type="radio"
                          name={`q-${question.id}`}
                          value={choice.score}
                          checked={checked}
                          onChange={() => handleAnswerChange(question.id, choice.score)}
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

        {submitError && <p className="text-danger">{submitError}</p>}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
          <button
            type="submit"
            disabled={!allQuestionsAnswered || isSubmitting}
            className="btn btn-primary"
          >
            {isSubmitting ? copy.test.submitting : copy.test.submit}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BigFiveTest;
