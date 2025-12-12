import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import {
  createQuestion,
  getQuestions,
  getQuestion,
  createAnswer,
  getAnswers,
  type Question,
  type Answer,
} from "../lib/supabase-queries";

const CommunityPage: React.FC = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [answerBody, setAnswerBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load questions on mount
  useEffect(() => {
    if (!user) return;
    loadQuestions();
  }, [user]);

  // Load answers when question is selected
  useEffect(() => {
    if (selectedQuestion) {
      loadAnswers(selectedQuestion.id);
    }
  }, [selectedQuestion]);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQuestions();
      setQuestions(data);
    } catch (err: any) {
      console.error("Fehler beim Laden der Fragen:", err);
      setError("Fragen konnten nicht geladen werden.");
    } finally {
      setLoading(false);
    }
  };

  const loadAnswers = async (questionId: string) => {
    try {
      const data = await getAnswers(questionId);
      setAnswers(data);
    } catch (err: any) {
      console.error("Fehler beim Laden der Antworten:", err);
    }
  };

  const handleCreateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newTitle.trim() || !newBody.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const question = await createQuestion(user.id, newTitle, newBody);
      setQuestions([question, ...questions]);
      setNewTitle("");
      setNewBody("");
      setSelectedQuestion(question);
    } catch (err: any) {
      console.error("Fehler beim Erstellen der Frage:", err);
      setError("Frage konnte nicht erstellt werden.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedQuestion || !answerBody.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      const answer = await createAnswer(user.id, selectedQuestion.id, answerBody);
      setAnswers([...answers, answer]);
      setAnswerBody("");
    } catch (err: any) {
      console.error("Fehler beim Erstellen der Antwort:", err);
      setError("Antwort konnte nicht erstellt werden.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectQuestion = async (questionId: string) => {
    try {
      const question = await getQuestion(questionId);
      setSelectedQuestion(question);
    } catch (err: any) {
      console.error("Fehler beim Laden der Frage:", err);
      setError("Frage konnte nicht geladen werden.");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="page-card">
        <div className="page-kicker">Schritt 3</div>
        <h1 className="page-title">Lädt...</h1>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <div className="page-card">
      <div className="page-kicker">Schritt 3</div>
      <h1 className="page-title">Fragen & Antworten</h1>
      <p className="page-intro">
        Hier kannst du Fragen stellen und Antworten geben – rund um Themen wie Arbeit, Beziehungen, Kreativität,
        Entscheidungen oder Alltagsfragen. Die Community ist für alle angemeldeten Benutzer sichtbar.
      </p>

      {error && (
        <div
          style={{
            padding: "0.75rem",
            marginBottom: "1rem",
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "6px",
            color: "#dc2626",
            fontSize: "0.875rem",
          }}
        >
          {error}
        </div>
      )}

      <div className="community-grid">
        <section className="stack-lg">
          <div className="card-subtle">
            <h2 className="section-title">Neue Frage stellen</h2>
            <p className="section-text">
              Beschreibe kurz dein Anliegen. In späteren Versionen können Fragen nach Persönlichkeitsprofil sortiert werden.
            </p>
            <form
              onSubmit={handleCreateQuestion}
              className="stack-md"
              style={{ marginTop: "1rem" }}
            >
              <div className="field-group">
                <label htmlFor="title" className="field-label">
                  Titel
                </label>
                <input
                  id="title"
                  className="field-control"
                  type="text"
                  placeholder="Zum Beispiel: Umgang mit Entscheidungen als eher grübelnder Mensch"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="field-group">
                <label htmlFor="body" className="field-label">
                  Frage / Situation
                </label>
                <textarea
                  id="body"
                  className="field-control"
                  rows={4}
                  placeholder="Beschreibe deine Situation oder Frage so, dass andere sie gut nachvollziehen können."
                  value={newBody}
                  onChange={(e) => setNewBody(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={!newTitle.trim() || !newBody.trim() || submitting}
                className="btn btn-primary"
              >
                {submitting ? "Wird veröffentlicht..." : "Frage veröffentlichen"}
              </button>
            </form>
          </div>

          <div className="card-subtle">
            <h2 className="section-title">Alle Fragen</h2>
            {questions.length === 0 ? (
              <p className="section-text">
                Es wurden noch keine Fragen gestellt. Starte gerne mit der ersten Frage.
              </p>
            ) : (
              <ul className="question-list">
                {questions.map((q) => {
                  const isActive = selectedQuestion?.id === q.id;
                  const itemClass = "question-list-item" + (isActive ? " question-list-item-active" : "");
                  return (
                    <li key={q.id} className={itemClass}>
                      <button type="button" onClick={() => handleSelectQuestion(q.id)}>
                        <div className="question-list-title">{q.title}</div>
                        <div className="question-list-preview">{q.body}</div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="card-subtle">
          <h2 className="section-title">Details & Antworten</h2>
          {!selectedQuestion && (
            <p className="section-text">
              Wähle links eine Frage aus oder erstelle eine neue, um hier die Details und Antworten zu sehen.
            </p>
          )}

          {selectedQuestion && (
            <div className="stack-md" style={{ marginTop: "0.75rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 600, color: "var(--text)", lineHeight: "1.4" }}>{selectedQuestion.title}</h3>
                <p
                  style={{
                    marginTop: "0.75rem",
                    fontSize: "0.9375rem",
                    whiteSpace: "pre-wrap",
                    lineHeight: "1.7",
                    color: "var(--text-soft)"
                  }}
                >
                  {selectedQuestion.body}
                </p>
                <p className="muted" style={{ marginTop: "0.5rem" }}>
                  Erstellt am {new Date(selectedQuestion.created_at).toLocaleString()}
                </p>
              </div>

              <div>
                <h4 className="section-title">Antworten</h4>
                {answers.length === 0 ? (
                  <p className="section-text">
                    Noch keine Antworten. Teile gerne deine Sicht oder Erfahrungen.
                  </p>
                ) : (
                  <ul className="stack-md" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {answers.map((a) => (
                      <li key={a.id} className="answer-item">
                        <p
                          style={{
                            margin: 0,
                            fontSize: "0.9375rem",
                            whiteSpace: "pre-wrap",
                            lineHeight: "1.7",
                            color: "var(--text)"
                          }}
                        >
                          {a.body}
                        </p>
                        <p className="muted" style={{ marginTop: "0.5rem" }}>
                          Antwort vom {new Date(a.created_at).toLocaleString()}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <form onSubmit={handleCreateAnswer} className="stack-md">
                <div className="field-group">
                  <label htmlFor="answer" className="field-label">
                    Deine Antwort
                  </label>
                  <textarea
                    id="answer"
                    className="field-control"
                    rows={3}
                    placeholder="Schreibe eine hilfreiche, respektvolle Antwort."
                    value={answerBody}
                    onChange={(e) => setAnswerBody(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!answerBody.trim() || submitting}
                  className="btn btn-primary"
                >
                  {submitting ? "Wird veröffentlicht..." : "Antwort veröffentlichen"}
                </button>
              </form>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default CommunityPage;
