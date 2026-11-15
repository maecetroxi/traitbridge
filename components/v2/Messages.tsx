import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useLocale } from "../../contexts/LocaleContext";
import { useAuth } from "../../contexts/AuthContext";
import { useBridge } from "../../contexts/BridgeContext";
import { v2Request, errorText } from "../../lib/v2/client";
import { noticeLabels, topicLabels } from "../../lib/v2/copy";
import { AccessGate, SafetyActions } from "./Shared";
import BlobAvatar from "./BlobAvatar";
import { generateAvatar } from "../../lib/v2/avatar";
import Icon from "./Icon";
import Link from "next/link";

export default function Messages() {
  const { locale } = useLocale();
  const de = locale === "de";
  const { user } = useAuth();
  const { snapshot, refresh } = useBridge();
  const router = useRouter();
  const [id, setId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "mine" | "helped">("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [thanksId, setThanksId] = useState<string | null>(null);
  const [thanks, setThanks] = useState("");
  useEffect(() => {
    if (typeof router.query.id === "string") setId(router.query.id);
  }, [router.query.id]);
  const visible = snapshot.questions.filter(
    (q) =>
      filter === "all" ||
      (filter === "mine" ? q.author.id === user?.id : q.author.id !== user?.id),
  );
  const selected = snapshot.questions.find((q) => q.id === id);
  const answers = snapshot.answers.filter(
    (a) => a.question_id === selected?.id,
  );
  const run = async (action: string, data: Record<string, unknown>) => {
    setBusy(true);
    setError("");
    try {
      await v2Request(action, data);
      await refresh();
      setThanksId(null);
      setThanks("");
    } catch (e) {
      setError(errorText(e, locale));
    } finally {
      setBusy(false);
    }
  };
  const date = (value: string) =>
    new Date(value).toLocaleString(de ? "de-CH" : "en-GB", {
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  return (
    <div className="tb-page">
      <Head>
        <title>{(de ? "Nachrichten" : "Messages") + " | TraitBridge"}</title>
      </Head>
      <div className="tb-page-heading">
        <div>
          <span className="tb-eyebrow">
            {de ? "DEINE KLEINEN VERBINDUNGEN" : "YOUR LITTLE CONNECTIONS"}
          </span>
          <h1>
            {de ? "Nachrichten" : "Messages"}
            <span className="tb-title-dot">.</span>
          </h1>
        </div>
        <button
          className="tb-button secondary small"
          disabled={busy}
          onClick={() => void refresh()}
        >
          {de ? "Aktualisieren" : "Refresh"}
        </button>
      </div>
      <AccessGate>
        {snapshot.notifications.some((n) => !n.read_at) && (
          <details className="tb-notices">
            <summary>
              <Icon name="bell" size={18} />
              {snapshot.notifications.filter((n) => !n.read_at).length}{" "}
              {de ? "neue Benachrichtigungen" : "new notifications"}
            </summary>
            {snapshot.notifications
              .filter((n) => !n.read_at)
              .map((n) => (
                <button
                  key={n.id}
                  className="tb-notice"
                  onClick={() => {
                    if (n.question_id) setId(n.question_id);
                  }}
                >
                  {noticeLabels[locale][n.kind]}
                  <small>{date(n.created_at)}</small>
                </button>
              ))}
            <button
              className="tb-text-button"
              onClick={() => void run("read", {})}
            >
              {de ? "Als gelesen markieren" : "Mark as read"}
            </button>
          </details>
        )}
        <div className={`tb-inbox ${selected ? "has-selection" : ""}`}>
          <aside className="tb-conversations">
            <div className="tb-inbox-tabs">
              {(["all", "mine", "helped"] as const).map((f, i) => (
                <button
                  key={f}
                  aria-pressed={filter === f}
                  onClick={() => setFilter(f)}
                >
                  {
                    (de
                      ? ["Alle", "Meine Fragen", "Geholfen"]
                      : ["All", "My questions", "Helped"])[i]
                  }
                </button>
              ))}
            </div>
            {visible.length ? (
              visible.map((q) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setId(q.id);
                    setError("");
                  }}
                  className={`tb-conversation ${q.id === selected?.id ? "selected" : ""}`}
                >
                  <BlobAvatar
                    config={
                      q.author.id === user?.id
                        ? snapshot.answers.find((a) => a.question_id === q.id)
                            ?.author.avatar || q.author.avatar
                        : q.author.avatar
                    }
                    size={53}
                  />
                  <div>
                    <div>
                      <strong>
                        {q.author.id === user?.id
                          ? de
                            ? "Deine Frage"
                            : "Your question"
                          : q.author.pseudonym}
                      </strong>
                      <small>
                        {new Date(q.created_at).toLocaleDateString(
                          de ? "de-CH" : "en-GB",
                          { day: "numeric", month: "short" },
                        )}
                      </small>
                    </div>
                    <p>{q.body}</p>
                    <span>
                      {
                        snapshot.answers.filter((a) => a.question_id === q.id)
                          .length
                      }{" "}
                      {de ? "Antworten" : "replies"}
                      {q.status === "closed"
                        ? de
                          ? " · geschlossen"
                          : " · closed"
                        : ""}
                    </span>
                  </div>
                </button>
              ))
            ) : (
              <div className="tb-empty compact">
                <BlobAvatar size={85} />
                <h3>
                  {de
                    ? "Noch ganz viel Platz."
                    : "Room for your first conversation."}
                </h3>
                <p>
                  {de
                    ? "Deine Fragen und geteilten Erfahrungen findest du bald hier."
                    : "Your questions and shared experiences will appear here."}
                </p>
                <Link href="/" className="tb-text-link">
                  {de ? "Eine Frage stellen" : "Ask a question"} →
                </Link>
              </div>
            )}
          </aside>
          <section
            className="tb-conversation-view"
            aria-label={de ? "Nachrichtenaustausch" : "Conversation"}
          >
            {selected ? (
              <>
                <header className="tb-chat-header">
                  <button
                    className="tb-mobile-back tb-text-button"
                    onClick={() => setId(null)}
                  >
                    ← {de ? "Zurück" : "Back"}
                  </button>
                  <div className="tb-person">
                    <BlobAvatar config={selected.author.avatar} size={45} />
                    <div>
                      <strong>
                        {selected.author.id === user?.id
                          ? de
                            ? "Deine Frage"
                            : "Your question"
                          : selected.author.pseudonym}
                      </strong>
                      <span>
                        {topicLabels[locale][selected.topic]} ·{" "}
                        {de ? "Privater Austausch" : "Private conversation"}
                      </span>
                    </div>
                  </div>
                  {selected.author.id === user?.id && (
                    <details className="tb-chat-options">
                      <summary>{de ? "Verwalten" : "Manage"}</summary>
                      {selected.status === "open" && (
                        <button
                          disabled={busy}
                          onClick={() =>
                            void run("close", { question_id: selected.id })
                          }
                        >
                          {de ? "Frage schliessen" : "Close question"}
                        </button>
                      )}
                      <button
                        disabled={busy}
                        onClick={() => {
                          if (
                            window.confirm(
                              de
                                ? "Diese Frage und alle zugehörigen Antworten unwiderruflich löschen?"
                                : "Permanently delete this question and all its replies?",
                            )
                          )
                            void run("delete_question", {
                              question_id: selected.id,
                            });
                        }}
                      >
                        {de ? "Frage löschen" : "Delete question"}
                      </button>
                    </details>
                  )}
                </header>
                <div className="tb-chat-body">
                  <p className="tb-chat-info">
                    <Icon name="lock" size={14} />
                    {de
                      ? "Jede Erfahrung wird einzeln zugestellt. Nur du und die jeweils andere Person lesen die Antwort."
                      : "Each experience is delivered separately. Only you and the other person can read that reply."}
                  </p>
                  <article
                    className={`tb-bubble ${selected.author.id === user?.id ? "outgoing" : "incoming"}`}
                  >
                    <span>
                      {selected.author.id === user?.id
                        ? de
                          ? "Du"
                          : "You"
                        : selected.author.pseudonym}
                    </span>
                    <p>{selected.body}</p>
                    <time dateTime={selected.created_at}>
                      {date(selected.created_at)}
                    </time>
                  </article>
                  {answers.map((a) => (
                    <div
                      key={a.id}
                      className={`tb-reply ${a.author.id === user?.id ? "own-reply" : ""}`}
                    >
                      <div className="tb-person">
                        <BlobAvatar config={a.author.avatar} size={40} />
                        <strong>
                          {a.author.id === user?.id
                            ? de
                              ? "Du"
                              : "You"
                            : a.author.pseudonym}
                        </strong>
                      </div>
                      <article
                        className={`tb-bubble ${a.author.id === user?.id ? "outgoing" : "incoming"}`}
                      >
                        <p>{a.body}</p>
                        <time dateTime={a.created_at}>
                          {date(a.created_at)}
                        </time>
                      </article>
                      {a.thanks !== null ? (
                        <div className="tb-thanks">
                          <Icon name="heart" size={16} />
                          <span>
                            {de
                              ? "Ein persönliches Danke"
                              : "A personal thank you"}
                            {a.thanks && `: ${a.thanks}`}
                          </span>
                        </div>
                      ) : selected.author.id === user?.id ? (
                        <div className="tb-thanks-action">
                          {thanksId === a.id ? (
                            <form
                              onSubmit={(e) => {
                                e.preventDefault();
                                void run("thanks", {
                                  answer_id: a.id,
                                  body: thanks,
                                });
                              }}
                            >
                              <label>
                                {de
                                  ? "Dein Danke (optional mit Nachricht)"
                                  : "Your thanks (optional message)"}
                                <input
                                  maxLength={500}
                                  value={thanks}
                                  onChange={(e) => setThanks(e.target.value)}
                                />
                              </label>
                              <button
                                className="tb-button small"
                                disabled={busy}
                              >
                                {de ? "Danke senden" : "Send thanks"}
                              </button>
                              <button
                                type="button"
                                className="tb-text-button"
                                onClick={() => setThanksId(null)}
                              >
                                {de ? "Abbrechen" : "Cancel"}
                              </button>
                            </form>
                          ) : (
                            <button
                              className="tb-text-button"
                              onClick={() => setThanksId(a.id)}
                            >
                              <Icon name="heart" size={16} />
                              {de ? "Danke sagen" : "Say thanks"}
                            </button>
                          )}
                        </div>
                      ) : null}
                      {a.author.id !== user?.id ? (
                        <SafetyActions
                          question={selected}
                          answerId={a.id}
                          userId={a.author.id}
                        />
                      ) : (
                        <button
                          className="tb-text-button"
                          disabled={busy}
                          onClick={() => {
                            if (
                              window.confirm(
                                de
                                  ? "Deine Antwort unwiderruflich löschen?"
                                  : "Permanently delete your reply?",
                              )
                            )
                              void run("delete_answer", { answer_id: a.id });
                          }}
                        >
                          {de ? "Eigene Antwort löschen" : "Delete my reply"}
                        </button>
                      )}
                    </div>
                  ))}
                  {!answers.length && (
                    <div className="tb-waiting">
                      <BlobAvatar size={82} />
                      <h3>
                        {de
                          ? "Manche Verbindungen brauchen etwas Zeit."
                          : "Some connections take a little time."}
                      </h3>
                      <p>
                        {de
                          ? "Noch hat niemand geantwortet. Wir zeigen dir hier, sobald eine echte Antwort eingeht. Es gibt keine garantierte Antwortzeit."
                          : "No one has replied yet. You’ll see a real reply here when it arrives. There is no guaranteed response time."}
                      </p>
                      <Link href="/" className="tb-text-link">
                        {de
                          ? "Inzwischen jemandem helfen"
                          : "Help someone in the meantime"}{" "}
                        →
                      </Link>
                    </div>
                  )}
                  {selected.author.id !== user?.id && (
                    <SafetyActions question={selected} />
                  )}
                </div>
              </>
            ) : (
              <div className="tb-empty tb-chat-placeholder">
                <div className="tb-two-blobs">
                  <BlobAvatar size={110} />
                  <BlobAvatar
                    config={{
                      ...(snapshot.profile?.avatar ||
                        generateAvatar("messages")),
                      color: 0,
                    }}
                    size={125}
                  />
                </div>
                <h2>
                  {de
                    ? "Ein offenes Ohr, ganz ohne Eile."
                    : "A listening ear, without the rush."}
                </h2>
                <p>
                  {de
                    ? "Wähle links eine Frage. Hier findest du deine persönlichen Antworten und kleine Dankesnachrichten."
                    : "Choose a question on the left to read personal replies and thank-you messages."}
                </p>
              </div>
            )}
          </section>
        </div>
        {error && (
          <p className="tb-error" role="alert">
            {error}
          </p>
        )}
      </AccessGate>
    </div>
  );
}
