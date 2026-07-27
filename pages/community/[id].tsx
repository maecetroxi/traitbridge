import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { formatTranslation } from "../../lib/i18n";
import {
  createAnswer,
  getAnswers,
  getQuestion,
  type Answer,
  type Question,
} from "../../lib/supabase-queries";

const CommunityQuestionPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: isAuthLoading } = useAuth();
  const { locale, copy } = useLocale();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [answerBody, setAnswerBody] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const registeredUser = user && !user.is_anonymous ? user : null;
  const questionId = typeof router.query.id === "string" ? router.query.id : null;

  useEffect(() => {
    if (!router.isReady || !questionId) {
      return;
    }

    const loadQuestion = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const [loadedQuestion, loadedAnswers] = await Promise.all([
          getQuestion(questionId),
          getAnswers(questionId),
        ]);
        setQuestion(loadedQuestion);
        setAnswers(loadedAnswers);
      } catch (loadError) {
        console.error("Failed to load Community question:", loadError);
        setError(copy.community.detailLoadError);
      } finally {
        setIsLoading(false);
      }
    };

    void loadQuestion();
  }, [copy.community.detailLoadError, questionId, router.isReady]);

  const handleAnswerSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!registeredUser || !question || !answerBody.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      const createdAnswer = await createAnswer(
        registeredUser.id,
        question.id,
        answerBody,
      );
      setAnswers((currentAnswers) => [...currentAnswers, createdAnswer]);
      setAnswerBody("");
    } catch (answerError) {
      console.error("Failed to create answer:", answerError);
      setError(copy.community.createAnswerError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const dateLocale = locale === "de" ? "de-CH" : "en-GB";
  const dateFormatter = new Intl.DateTimeFormat(dateLocale, {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <Head>
        <title>
          {question?.title || copy.community.detailTitle} | TraitBridge
        </title>
        <meta
          name="description"
          content={question?.body.slice(0, 155) || copy.community.intro}
        />
      </Head>

      <div className="community-detail-page">
        <Link href="/community" className="back-link">
          <span aria-hidden="true">←</span>
          {copy.community.backToOverview}
        </Link>

        {isLoading ? (
          <div className="surface community-empty" role="status">
            <strong>{copy.community.loadingTitle}</strong>
            <p>{copy.community.loadingDescription}</p>
          </div>
        ) : error && !question ? (
          <div className="community-status community-status-error" role="alert">
            <div>
              <strong>{error}</strong>
              <p>{copy.community.serviceUnavailable}</p>
            </div>
            <button type="button" className="btn btn-outline" onClick={() => router.reload()}>
              {copy.community.retry}
            </button>
          </div>
        ) : question ? (
          <>
            <article className="surface community-detail-question">
              <div className="community-question-meta">
                <span className="category-label">
                  {copy.community.categories[question.category]}
                </span>
                <time dateTime={question.created_at}>
                  {dateFormatter.format(new Date(question.created_at))}
                </time>
              </div>
              <h1>{question.title}</h1>
              <p>{question.body}</p>
            </article>

            <section className="community-answers" aria-labelledby="community-answers-title">
              <div className="community-feed-heading">
                <div>
                  <span className="page-kicker">{copy.community.perspectivesKicker}</span>
                  <h2 id="community-answers-title">{copy.community.answersTitle}</h2>
                </div>
                <span className="muted">
                  {formatTranslation(copy.community.answerCount, {
                    count: String(answers.length),
                  })}
                </span>
              </div>

              {answers.length === 0 ? (
                <div className="surface community-empty">
                  <strong>{copy.community.noAnswers}</strong>
                  <p>{copy.community.noAnswersDescription}</p>
                </div>
              ) : (
                <ol className="community-answer-list">
                  {answers.map((answer, index) => (
                    <li key={answer.id} className="surface community-answer-card">
                      <div className="community-answer-index">
                        {formatTranslation(copy.community.perspectiveNumber, {
                          number: String(index + 1),
                        })}
                      </div>
                      <p>{answer.body}</p>
                      <time dateTime={answer.created_at}>
                        {dateFormatter.format(new Date(answer.created_at))}
                      </time>
                    </li>
                  ))}
                </ol>
              )}
            </section>

            <section className="surface community-answer-composer">
              <h2>{copy.community.yourAnswerLabel}</h2>
              <p>{copy.community.answerGuidance}</p>

              {!isAuthLoading && !registeredUser ? (
                <div className="community-auth-prompt">
                  <div>
                    <h3>{copy.community.signInTitle}</h3>
                    <p>{copy.community.signInDescription}</p>
                  </div>
                  <Link
                    href={{
                      pathname: "/login",
                      query: { returnTo: `/community/${question.id}` },
                    }}
                    className="btn btn-primary"
                  >
                    {copy.community.signInAction}
                  </Link>
                </div>
              ) : registeredUser ? (
                <form onSubmit={handleAnswerSubmit} className="stack-md">
                  <div className="field-group">
                    <label htmlFor="community-answer" className="field-label">
                      {copy.community.yourAnswerLabel}
                    </label>
                    <textarea
                      id="community-answer"
                      rows={5}
                      maxLength={5000}
                      required
                      value={answerBody}
                      placeholder={copy.community.yourAnswerPlaceholder}
                      onChange={(event) => setAnswerBody(event.target.value)}
                    />
                  </div>
                  {error && (
                    <p className="text-danger" role="alert">
                      {error}
                    </p>
                  )}
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!answerBody.trim() || isSubmitting}
                  >
                    {isSubmitting
                      ? copy.community.publishing
                      : copy.community.publishAnswer}
                  </button>
                </form>
              ) : (
                <p className="muted" role="status">
                  {copy.community.checkingSession}
                </p>
              )}
            </section>
          </>
        ) : null}
      </div>
    </>
  );
};

export default CommunityQuestionPage;
