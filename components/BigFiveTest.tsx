import React, { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/router";
import { getChoices, getItems, type Question as PackageQuestion } from "@bigfive-org/questions";
// @ts-ignore - Package does not ship TypeScript declarations
import { processAnswers } from "@bigfive-org/score/build/src";
import type { BigFiveScores } from "./PersonalityBadge";
import TestProgress from "./test/TestProgress";
import TestQuestionStage from "./test/TestQuestionStage";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import { Locale, formatTranslation } from "../lib/i18n";
import { normalizeCalculatedScores, STORAGE_KEY_FULL } from "../lib/bigfive-results";
import {
  calculateTestProgress,
  clearTestDraft,
  loadTestDraft,
  saveTestDraft,
  splitIntoStages,
} from "../lib/test-draft";
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
  const [currentStage, setCurrentStage] = useState(0);
  const [isDraftReady, setIsDraftReady] = useState(false);
  const [draftMessage, setDraftMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const stageStartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      setIsLoading(true);
      setLoadError(null);
      setIsDraftReady(false);
      setDraftMessage(null);
      setAnswers({});
      setCurrentStage(0);

      const questionLanguage = supportedQuestionLanguages.includes(language) ? language : "en";
      const loadedQuestions = getItems(questionLanguage, false);

      if (!loadedQuestions || loadedQuestions.length === 0) {
        throw new Error(copy.test.noQuestionsTitle);
      }

      setQuestions(loadedQuestions);

      if (typeof window !== "undefined") {
        const draft = loadTestDraft(
          window.localStorage,
          language,
          loadedQuestions.map((question) => question.id),
        );

        if (draft && Object.keys(draft.answers).length > 0) {
          const stageCount = splitIntoStages(loadedQuestions).length;
          setAnswers(draft.answers);
          setCurrentStage(Math.min(draft.currentStage, Math.max(0, stageCount - 1)));
          setDraftMessage(copy.test.draftRestored);
        }
      }

      setIsDraftReady(true);
    } catch (error) {
      console.error("Failed to load Big Five questions:", error);
      setLoadError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [copy.test.draftRestored, copy.test.noQuestionsTitle, language]);

  useEffect(() => {
    if (
      !isDraftReady ||
      typeof window === "undefined" ||
      Object.keys(answers).length === 0
    ) {
      return;
    }

    saveTestDraft(window.localStorage, language, answers, currentStage);
  }, [answers, currentStage, isDraftReady, language]);

  const stages = useMemo(() => splitIntoStages(questions), [questions]);
  const questionIds = useMemo(
    () => questions.map((question) => question.id),
    [questions],
  );
  const progress = useMemo(
    () => calculateTestProgress(answers, questionIds),
    [answers, questionIds],
  );
  const currentQuestions = stages[currentStage] || [];
  const questionChoices = (getChoices(language)?.plus || []) as unknown as Array<{
    score: number;
    text: string;
  }>;

  const focusQuestion = (questionId: string) => {
    window.setTimeout(() => {
      document.getElementById(`question-${questionId}`)?.focus();
    }, 0);
  };

  const scrollToStageStart = () => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    stageStartRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  const handleAnswerChange = (questionId: string, score: number) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: score,
    }));
    setFormError(null);
    setDraftMessage(copy.test.draftSaved);
  };

  const moveToStage = (nextStage: number) => {
    setCurrentStage(nextStage);
    setFormError(null);
    window.setTimeout(scrollToStageStart, 0);
  };

  const handleNextStage = () => {
    const firstUnanswered = currentQuestions.find(
      (question) => answers[question.id] === undefined,
    );

    if (firstUnanswered) {
      setFormError(copy.test.stageIncomplete);
      focusQuestion(firstUnanswered.id);
      return;
    }

    moveToStage(Math.min(currentStage + 1, stages.length - 1));
  };

  const handleDeleteDraft = () => {
    if (
      typeof window === "undefined" ||
      !window.confirm(copy.test.deleteDraftConfirm)
    ) {
      return;
    }

    clearTestDraft(window.localStorage, language);
    setAnswers({});
    setCurrentStage(0);
    setFormError(null);
    setDraftMessage(copy.test.draftDeleted);
    window.setTimeout(scrollToStageStart, 0);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const firstUnanswered = questions.find(
      (question) => answers[question.id] === undefined,
    );

    if (firstUnanswered) {
      const unansweredStage = stages.findIndex((stage) =>
        stage.some((question) => question.id === firstUnanswered.id),
      );
      setCurrentStage(Math.max(0, unansweredStage));
      setFormError(copy.test.answerAll);
      focusQuestion(firstUnanswered.id);
      return;
    }

    setFormError(null);
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
      const permanentUser = user && !user.is_anonymous ? user : null;

      if (permanentUser) {
        try {
          await savePersonalityResult(
            permanentUser.id,
            scores,
            calculatedScores,
            "full",
            language,
          );
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
        clearTestDraft(window.localStorage, language);
      }

      await router.push(permanentUser ? "/profile" : "/results");
    } catch (error) {
      console.error("Failed to save Big Five result:", error);
      setFormError(copy.test.saveError);
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="content-shell">
        <div className="page-kicker">{copy.test.kicker}</div>
        <h1 className="page-title">{copy.test.loadingTitle}</h1>
        <p className="page-intro">{copy.test.loadingDescription}</p>
      </div>
    );
  }

  if (loadError || questions.length === 0) {
    return (
      <div className="content-shell">
        <div className="page-kicker">{copy.test.errorKicker}</div>
        <h1 className="page-title">
          {loadError ? copy.test.loadErrorTitle : copy.test.noQuestionsTitle}
        </h1>
        <p className="page-intro">
          {loadError
            ? formatTranslation(copy.test.loadErrorDescription, { error: loadError })
            : copy.test.noQuestionsDescription}
        </p>
        <p className="section-text test-load-hint">{copy.test.loadErrorHint}</p>
      </div>
    );
  }

  return (
    <div className="content-shell test-runner">
      <div className="test-runner-heading" ref={stageStartRef}>
        <div>
          <div className="page-kicker">{copy.test.kicker}</div>
          <h1 className="page-title">{copy.test.title}</h1>
          <p className="page-intro">{copy.test.introduction}</p>
        </div>
        <div className="test-runner-tools">
          {onChangeLanguage && (
            <button type="button" className="btn btn-outline" onClick={onChangeLanguage}>
              {copy.test.changeLanguage}
            </button>
          )}
          {progress.answered > 0 && (
            <button type="button" className="btn btn-quiet" onClick={handleDeleteDraft}>
              {copy.test.deleteDraft}
            </button>
          )}
        </div>
      </div>

      <div className="trust-note test-storage-note">
        <strong>{copy.test.storageTitle}</strong>
        <span>{copy.test.storageText}</span>
      </div>

      <TestProgress
        stage={currentStage}
        stageCount={stages.length}
        answered={progress.answered}
        total={progress.total}
        percentage={progress.percentage}
        stageLabel={copy.test.stageLabel}
        progressLabel={copy.test.progress}
        answeredLabel={copy.test.answeredLabel}
      />

      {draftMessage && (
        <p className="status-note" role="status" aria-live="polite">
          {draftMessage}
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <TestQuestionStage
          questions={currentQuestions}
          fallbackChoices={questionChoices}
          answers={answers}
          onAnswer={handleAnswerChange}
        />

        {formError && (
          <p className="text-danger test-form-error" role="alert" aria-live="assertive">
            {formError}
          </p>
        )}

        <div className="test-stage-actions">
          <button
            type="button"
            className="btn btn-outline"
            disabled={currentStage === 0 || isSubmitting}
            onClick={() => moveToStage(currentStage - 1)}
          >
            {copy.test.previousStage}
          </button>

          {currentStage < stages.length - 1 ? (
            <button
              type="button"
              className="btn btn-primary"
              disabled={isSubmitting}
              onClick={handleNextStage}
            >
              {copy.test.nextStage}
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="btn btn-primary">
              {isSubmitting ? copy.test.submitting : copy.test.submit}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default BigFiveTest;
