import React, { useEffect, useState } from "react";

type Question = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
};

type Answer = {
  id: string;
  questionId: string;
  body: string;
  createdAt: string;
};

type CommunityState = {
  questions: Question[];
  answers: Answer[];
};

const STORAGE_KEY = "ocean-community-v1";

const loadState = (): CommunityState => {
  if (typeof window === "undefined") {
    return { questions: [], answers: [] };
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { questions: [], answers: [] };
    return JSON.parse(raw) as CommunityState;
  } catch {
    return { questions: [], answers: [] };
  }
};

const saveState = (state: CommunityState) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const CommunityPage: React.FC = () => {
  const [state, setState] = useState<CommunityState>({ questions: [], answers: [] });
  const [loaded, setLoaded] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [answerBody, setAnswerBody] = useState("");

  useEffect(() => {
    if (typeof window === "undefined") return;
    const initial = loadState();
    setState(initial);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    saveState(state);
  }, [state, loaded]);

  const selectedQuestion =
    selectedQuestionId && state.questions.find((q) => q.id === selectedQuestionId)
      ? state.questions.find((q) => q.id === selectedQuestionId)
      : null;

  const answersForSelected = selectedQuestion
    ? state.answers.filter((a) => a.questionId === selectedQuestion.id)
    : [];

  const handleCreateQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) return;
    const id = `q_${Date.now()}`;
    const question: Question = {
      id,
      title: newTitle.trim(),
      body: newBody.trim(),
      createdAt: new Date().toISOString()
    };
    setState((prev) => ({
      ...prev,
      questions: [question, ...prev.questions]
    }));
    setNewTitle("");
    setNewBody("");
    setSelectedQuestionId(id);
  };

  const handleCreateAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion || !answerBody.trim()) return;
    const answer: Answer = {
      id: `a_${Date.now()}`,
      questionId: selectedQuestion.id,
      body: answerBody.trim(),
      createdAt: new Date().toISOString()
    };
    setState((prev) => ({
      ...prev,
      answers: [...prev.answers, answer]
    }));
    setAnswerBody("");
  };

  return (
    <div className="page-card">
      <div className="page-kicker">Schritt 3</div>
      <h1 className="page-title">Fragen & Antworten</h1>
      <p className="page-intro">
        Hier kannst du Fragen stellen und Antworten geben – rund um Themen wie Arbeit, Beziehungen, Kreativität,
        Entscheidungen oder Alltagsfragen. Alles läuft anonym und bleibt lokal in deinem Browser.
      </p>

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
                disabled={!newTitle.trim() || !newBody.trim()}
                className="btn btn-primary"
              >
                Frage veröffentlichen
              </button>
            </form>
          </div>

          <div className="card-subtle">
            <h2 className="section-title">Alle Fragen</h2>
            {state.questions.length === 0 ? (
              <p className="section-text">
                Es wurden noch keine Fragen gestellt. Starte gerne mit der ersten Frage.
              </p>
            ) : (
              <ul className="question-list">
                {state.questions.map((q) => {
                  const isActive = selectedQuestionId === q.id;
                  const itemClass = "question-list-item" + (isActive ? " question-list-item-active" : "");
                  return (
                    <li key={q.id} className={itemClass}>
                      <button type="button" onClick={() => setSelectedQuestionId(q.id)}>
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
                  Erstellt am {new Date(selectedQuestion.createdAt).toLocaleString()}
                </p>
              </div>

              <div>
                <h4 className="section-title">Antworten</h4>
                {answersForSelected.length === 0 ? (
                  <p className="section-text">
                    Noch keine Antworten. Teile gerne deine Sicht oder Erfahrungen.
                  </p>
                ) : (
                  <ul className="stack-md" style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {answersForSelected.map((a) => (
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
                          Antwort vom {new Date(a.createdAt).toLocaleString()}
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
                  disabled={!answerBody.trim()}
                  className="btn btn-primary"
                >
                  Antwort veröffentlichen
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
