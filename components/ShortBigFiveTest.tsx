import { getItems, type Question as PackageQuestion } from "@bigfive-org/questions";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import {
  getScoreBands,
  STORAGE_KEY_SHORT,
  resultStorageKey,
  type StoredResults,
} from "../lib/bigfive-results";
import type { Locale } from "../lib/i18n";
import {
  calculateShortTestScores,
  selectShortTestQuestions,
} from "../lib/short-test";
import { savePersonalityResult } from "../lib/supabase-queries";
import { rememberAssessment } from "../lib/assessment-draft";
import PersonalityBadge, { type BigFiveScores } from "./PersonalityBadge";

type ShortBigFiveTestProps = {
  open: boolean;
  onClose: () => void;
  returnTo?: string;
};

const shortTestCopy: Record<Locale, {
  kicker: string;
  title: string;
  intro: string;
  close: string;
  progress: (current: number, total: number) => string;
  previous: string;
  next: string;
  finish: string;
  incomplete: string;
  saving: string;
  resultTitle: string;
  resultText: string;
  useProfile: string;
  closeResult: string;
  fullTest: string;
  loadError: string;
}> = {
  en: {
    kicker: "Quick orientation",
    title: "Your Big Five in ten statements",
    intro:
      "This two-minute check offers a rough starting point. It is not equivalent to the full 120-item assessment.",
    close: "Close quick test",
    progress: (current, total) => `Statement ${current} of ${total}`,
    previous: "Back",
    next: "Next",
    finish: "View orientation",
    incomplete: "Choose an answer before continuing.",
    saving: "Saving…",
    resultTitle: "Your rough orientation",
    resultText:
      "These broad estimates use only two statements per dimension. Use them as a starting point, not a diagnosis or final description.",
    useProfile: "Use this profile",
    closeResult: "Done",
    fullTest: "Take the full test",
    loadError: "The quick-test statements could not be loaded.",
  },
  de: {
    kicker: "Kurze Orientierung",
    title: "Deine Big Five in zehn Aussagen",
    intro:
      "Dieser Zwei-Minuten-Check bietet einen groben Ausgangspunkt. Er ist nicht mit dem vollständigen Test mit 120 Aussagen gleichwertig.",
    close: "Kurztest schliessen",
    progress: (current, total) => `Aussage ${current} von ${total}`,
    previous: "Zurück",
    next: "Weiter",
    finish: "Orientierung anzeigen",
    incomplete: "Wähle eine Antwort aus, bevor du weitergehst.",
    saving: "Wird gespeichert…",
    resultTitle: "Deine grobe Orientierung",
    resultText:
      "Diese breiten Schätzwerte beruhen auf nur zwei Aussagen pro Dimension. Nutze sie als Ausgangspunkt, nicht als Diagnose oder abschliessende Beschreibung.",
    useProfile: "Dieses Profil verwenden",
    closeResult: "Fertig",
    fullTest: "Vollständigen Test machen",
    loadError: "Die Aussagen für den Kurztest konnten nicht geladen werden.",
  },
};

const focusableSelector = [
  "button:not([disabled])",
  "a[href]",
  "input:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

const ShortBigFiveTest: React.FC<ShortBigFiveTestProps> = ({
  open,
  onClose,
  returnTo,
}) => {
  const router = useRouter();
  const { user } = useAuth();
  const { locale } = useLocale();
  const copy = shortTestCopy[locale];
  const dialogRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [scores, setScores] = useState<BigFiveScores | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const questions = useMemo(() => {
    try {
      return selectShortTestQuestions(
        getItems(locale, false) as PackageQuestion[],
      );
    } catch {
      return [];
    }
  }, [locale]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousActiveElement = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setAnswers({});
    setStep(0);
    setError(null);
    setScores(null);
    setIsSaving(false);
    window.setTimeout(() => closeButtonRef.current?.focus(), 0);

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab" || !dialogRef.current) {
        return;
      }

      const focusable = Array.from(
        dialogRef.current.querySelectorAll<HTMLElement>(focusableSelector),
      );

      if (focusable.length === 0) {
        event.preventDefault();
        dialogRef.current.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previousActiveElement?.focus();
    };
  }, [onClose, open]);

  if (!open) {
    return null;
  }

  const currentQuestion = questions[step];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const resultBands = scores ? getScoreBands(scores) : null;

  const handleNext = async () => {
    if (!currentQuestion || currentAnswer === undefined) {
      setError(copy.incomplete);
      return;
    }

    if (step < questions.length - 1) {
      setStep((currentStep) => currentStep + 1);
      setError(null);
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      const nextScores = calculateShortTestScores(questions, answers);
      const result: StoredResults = {
        scores: nextScores,
        timestamp: new Date().toISOString(),
        variant: "short",
        language: locale,
      };

      const owner = user && !user.is_anonymous ? user.id : null;
      window.localStorage.setItem(resultStorageKey(STORAGE_KEY_SHORT, owner), JSON.stringify(result));
      rememberAssessment(owner, "short", locale, answers);

      if (user && !user.is_anonymous) {
        try {
          await savePersonalityResult(
            user.id,
            nextScores,
            undefined,
            "short",
            locale,
          );
        } catch (storageError) {
          console.error("Failed to store the short Big Five result:", storageError);
        }
      }

      setScores(nextScores);
    } catch {
      setError(copy.loadError);
    } finally {
      setIsSaving(false);
    }
  };

  const handleUseProfile = async () => {
    onClose();
    if (returnTo) {
      await router.push(returnTo);
    }
  };

  return (
    <div className="short-test-backdrop" role="presentation" onMouseDown={(event) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    }}>
      <div
        ref={dialogRef}
        className="short-test-dialog surface"
        role="dialog"
        aria-modal="true"
        aria-labelledby="short-test-title"
        aria-describedby="short-test-description"
        tabIndex={-1}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="short-test-close"
          aria-label={copy.close}
          onClick={onClose}
        >
          <span aria-hidden="true">×</span>
        </button>

        <span className="page-kicker">{copy.kicker}</span>
        <h2 id="short-test-title">{scores ? copy.resultTitle : copy.title}</h2>
        <p id="short-test-description" className="short-test-intro">
          {scores ? copy.resultText : copy.intro}
        </p>

        {questions.length === 0 ? (
          <p className="text-danger" role="alert">{copy.loadError}</p>
        ) : scores && resultBands ? (
          <div className="short-test-result">
            <PersonalityBadge scores={scores} compact />
            <div className="short-test-actions">
              <button type="button" className="btn btn-primary" onClick={handleUseProfile}>
                {returnTo ? copy.useProfile : copy.closeResult}
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={async () => {
                  onClose();
                  await router.push("/test/full");
                }}
              >
                {copy.fullTest}
              </button>
            </div>
          </div>
        ) : currentQuestion ? (
          <div className="short-test-question-stage">
            <div className="short-test-progress-copy">
              <strong>{copy.progress(step + 1, questions.length)}</strong>
              <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="progress-shell" aria-hidden="true">
              <div
                className="progress-bar"
                style={{ width: `${((step + 1) / questions.length) * 100}%` }}
              />
            </div>

            <fieldset>
              <legend>{currentQuestion.text}</legend>
              <div className="short-test-choices">
                {currentQuestion.choices.map((choice) => (
                  <label key={`${currentQuestion.id}-${choice.color}`}>
                    <input
                      type="radio"
                      name={`short-test-${currentQuestion.id}`}
                      value={choice.score}
                      checked={currentAnswer === choice.score}
                      onChange={() => {
                        setAnswers((currentAnswers) => ({
                          ...currentAnswers,
                          [currentQuestion.id]: choice.score,
                        }));
                        setError(null);
                      }}
                    />
                    <span>{choice.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {error && <p className="text-danger" role="alert">{error}</p>}

            <div className="short-test-actions">
              <button
                type="button"
                className="btn btn-outline"
                disabled={step === 0 || isSaving}
                onClick={() => {
                  setStep((currentStep) => Math.max(0, currentStep - 1));
                  setError(null);
                }}
              >
                {copy.previous}
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isSaving}
                onClick={() => void handleNext()}
              >
                {isSaving
                  ? copy.saving
                  : step === questions.length - 1
                    ? copy.finish
                    : copy.next}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default ShortBigFiveTest;
