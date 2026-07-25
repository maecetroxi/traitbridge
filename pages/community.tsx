import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import {
  createAnswer,
  createQuestion,
  getAnswers,
  getQuestions,
  type Answer,
  type Question,
} from "../lib/supabase-queries";

const CommunityPage: React.FC = () => {
  const { user, loading: isAuthLoading } = useAuth();
  const { locale, copy } = useLocale();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnswersLoading, setIsAnswersLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [interactionError, setInteractionError] = useState<string | null>(null);
  const [newQuestionTitle, setNewQuestionTitle] = useState("");
  const [newQuestionBody, setNewQuestionBody] = useState("");
  const [newAnswerBody, setNewAnswerBody] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const registeredUser = user && !user.is_anonymous ? user : null;

  const loadQuestions = useCallback(async () => {
    try {
      setIsLoading(true);
      setLoadError(null);
      const data = await getQuestions();
      setQuestions(data);
    } catch (loadQuestionsError) {
      console.error("Failed to load community questions:", loadQuestionsError);
      setLoadError(copy.community.loadError);
    } finally {
      setIsLoading(false);
    }
  }, [copy.community.loadError]);

  useEffect(() => {
    void loadQuestions();
  }, [loadQuestions]);

  useEffect(() => {
    if (!selectedQuestion) {
      setAnswers([]);
      return;
    }

    const loadSelectedAnswers = async () => {
      try {
        setIsAnswersLoading(true);
        setInteractionError(null);
        const data = await getAnswers(selectedQuestion.id);
        setAnswers(data);
      } catch (loadAnswersError) {
        console.error("Failed to load answers:", loadAnswersError);
        setInteractionError(copy.community.answersLoadError);
      } finally {
        setIsAnswersLoading(false);
      }
    };

    void loadSelectedAnswers();
  }, [selectedQuestion, copy.community.answersLoadError]);

  const handleCreateQuestion = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!registeredUser || !newQuestionTitle.trim() || !newQuestionBody.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setInteractionError(null);
      const createdQuestion = await createQuestion(
        registeredUser.id,
        newQuestionTitle,
        newQuestionBody,
      );
      setQuestions((currentQuestions) => [createdQuestion, ...currentQuestions]);
      setNewQuestionTitle("");
      setNewQuestionBody("");
      setSelectedQuestion(createdQuestion);
    } catch (createQuestionError) {
      console.error("Failed to create question:", createQuestionError);
      setInteractionError(copy.community.createQuestionError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateAnswer = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!registeredUser || !selectedQuestion || !newAnswerBody.trim()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setInteractionError(null);
      const createdAnswer = await createAnswer(
        registeredUser.id,
        selectedQuestion.id,
        newAnswerBody,
      );
      setAnswers((currentAnswers) => [...currentAnswers, createdAnswer]);
      setNewAnswerBody("");
    } catch (createAnswerError) {
      console.error("Failed to create answer:", createAnswerError);
      setInteractionError(copy.community.createAnswerError);
    } finally {
      setIsSubmitting(false);
    }
  };

  const signInPrompt = (
    <div className="community-auth-prompt">
      <div>
        <h3>{copy.community.signInTitle}</h3>
        <p>{copy.community.signInDescription}</p>
      </div>
      <Link
        href={{ pathname: "/login", query: { returnTo: "/community" } }}
        className="btn btn-primary"
      >
        {copy.community.signInAction}
      </Link>
    </div>
  );

  const dateLocale = locale === "de" ? "de-DE" : "en-US";

  return (
    <div className="page-card">
      <div className="page-kicker">{copy.community.kicker}</div>
      <h1 className="page-title">{copy.community.title}</h1>
      <p className="page-intro">{copy.community.intro}</p>

      {loadError && (
        <div className="community-status community-status-error" role="alert">
          <div>
            <strong>{loadError}</strong>
            <p>{copy.community.serviceUnavailable}</p>
          </div>
          <button type="button" className="btn btn-outline" onClick={() => void loadQuestions()}>
            {copy.community.retry}
          </button>
        </div>
      )}

      {interactionError && (
        <div className="community-status community-status-error" role="alert">
          <p>{interactionError}</p>
        </div>
      )}

      <div className="community-grid">
        <section className="stack-lg">
          <div className="card-subtle">
            <h2 className="section-title">{copy.community.newQuestionTitle}</h2>
            <p className="section-text">{copy.community.newQuestionDescription}</p>

            {!isAuthLoading && !registeredUser ? (
              signInPrompt
            ) : (
              <form onSubmit={handleCreateQuestion} className="stack-md" style={{ marginTop: "1rem" }}>
                <div className="field-group">
                  <label htmlFor="title" className="field-label">
                    {copy.community.titleLabel}
                  </label>
                  <input
                    id="title"
                    className="field-control"
                    type="text"
                    maxLength={160}
                    required
                    placeholder={copy.community.titlePlaceholder}
                    value={newQuestionTitle}
                    onChange={(event) => setNewQuestionTitle(event.target.value)}
                  />
                </div>
                <div className="field-group">
                  <label htmlFor="body" className="field-label">
                    {copy.community.questionLabel}
                  </label>
                  <textarea
                    id="body"
                    className="field-control"
                    rows={4}
                    maxLength={5000}
                    required
                    placeholder={copy.community.questionPlaceholder}
                    value={newQuestionBody}
                    onChange={(event) => setNewQuestionBody(event.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={
                    !registeredUser ||
                    !newQuestionTitle.trim() ||
                    !newQuestionBody.trim() ||
                    isSubmitting
                  }
                  className="btn btn-primary"
                >
                  {isSubmitting ? copy.community.publishing : copy.community.publishQuestion}
                </button>
              </form>
            )}
          </div>

          <div className="card-subtle">
            <h2 className="section-title">{copy.community.allQuestionsTitle}</h2>
            {isLoading ? (
              <p className="section-text">{copy.community.loadingTitle}</p>
            ) : questions.length === 0 && !loadError ? (
              <p className="section-text">{copy.community.noQuestions}</p>
            ) : (
              <ul className="question-list">
                {questions.map((question) => {
                  const isActive = selectedQuestion?.id === question.id;
                  const itemClass = `question-list-item${isActive ? " question-list-item-active" : ""}`;

                  return (
                    <li key={question.id} className={itemClass}>
                      <button
                        type="button"
                        onClick={() => {
                          setInteractionError(null);
                          setSelectedQuestion(question);
                        }}
                      >
                        <div className="question-list-title">{question.title}</div>
                        <div className="question-list-preview">{question.body}</div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="card-subtle">
          <h2 className="section-title">{copy.community.detailsTitle}</h2>
          {!selectedQuestion && (
            <p className="section-text">{copy.community.detailsPlaceholder}</p>
          )}

          {selectedQuestion && (
            <div className="stack-md" style={{ marginTop: "0.75rem" }}>
              <div>
                <h3 className="community-question-title">{selectedQuestion.title}</h3>
                <p className="community-question-body">{selectedQuestion.body}</p>
                <p className="muted" style={{ marginTop: "0.5rem" }}>
                  {copy.community.createdAt}{" "}
                  {new Date(selectedQuestion.created_at).toLocaleString(dateLocale)}
                </p>
              </div>

              <div>
                <h4 className="section-title">{copy.community.answersTitle}</h4>
                {isAnswersLoading ? (
                  <p className="section-text">{copy.community.loadingTitle}</p>
                ) : answers.length === 0 ? (
                  <p className="section-text">{copy.community.noAnswers}</p>
                ) : (
                  <ul className="stack-md community-answer-list">
                    {answers.map((answer) => (
                      <li key={answer.id} className="answer-item">
                        <p className="community-answer-body">{answer.body}</p>
                        <p className="muted" style={{ marginTop: "0.5rem" }}>
                          {copy.community.answerPostedAt}{" "}
                          {new Date(answer.created_at).toLocaleString(dateLocale)}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {!isAuthLoading && !registeredUser ? (
                signInPrompt
              ) : (
                <form onSubmit={handleCreateAnswer} className="stack-md">
                  <div className="field-group">
                    <label htmlFor="answer" className="field-label">
                      {copy.community.yourAnswerLabel}
                    </label>
                    <textarea
                      id="answer"
                      className="field-control"
                      rows={3}
                      maxLength={5000}
                      required
                      placeholder={copy.community.yourAnswerPlaceholder}
                      value={newAnswerBody}
                      onChange={(event) => setNewAnswerBody(event.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!registeredUser || !newAnswerBody.trim() || isSubmitting}
                    className="btn btn-primary"
                  >
                    {isSubmitting ? copy.community.publishing : copy.community.publishAnswer}
                  </button>
                </form>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CommunityPage;
