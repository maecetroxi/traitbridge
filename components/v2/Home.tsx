import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { useBridge } from "../../contexts/BridgeContext";
import { errorText, v2Request } from "../../lib/v2/client";
import { topicLabels } from "../../lib/v2/copy";
import { topics, type Question, type Topic } from "../../lib/v2/types";
import Icon from "./Icon";
import HelpCard from "./HelpCard";
import SensitiveHint from "./SensitiveHint";
import {
  buildLoginPath,
  buildOnboardingPath,
  participationPaths,
} from "../../lib/return-path";

export default function Home() {
  const { locale } = useLocale();
  const de = locale === "de";
  const { user, loading: authLoading } = useAuth();
  const {
    snapshot,
    refresh,
    loading: bridgeLoading,
    error: bridgeError,
  } = useBridge();
  const router = useRouter();
  const [body, setBody] = useState("");
  const [topic, setTopic] = useState<Topic | "">("");
  const [discoverable, setDiscoverable] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [feedError, setFeedError] = useState("");
  const [feedVersion, setFeedVersion] = useState(0);
  const owner = user && !user.is_anonymous ? user.id : null;
  const ready = Boolean(owner && snapshot.profile && !bridgeError);
  const draftKey = owner ? `tb-v2-question:${owner}` : null;
  const actionPath = (action: keyof typeof participationPaths) =>
    owner
      ? buildOnboardingPath(participationPaths[action])
      : buildLoginPath(participationPaths[action], "signup");
  useEffect(() => {
    if (!draftKey) return;
    try {
      setBody(sessionStorage.getItem(draftKey) || "");
    } catch {}
  }, [draftKey]);
  useEffect(() => {
    if (router.query.view === "discover") void router.replace("/discover");
  }, [router.query.view, router]);
  useEffect(() => {
    if (!ready) return;
    if (router.query.action === "ask") {
      document.getElementById("question-body")?.focus();
    } else if (router.query.action === "help") {
      document.getElementById("help-title")?.focus();
    }
  }, [ready, router.query.action]);
  useEffect(() => {
    if (!ready || !owner) {
      setQuestions([]);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setFeedError("");
    void v2Request<Question[]>("help", {}, undefined, owner)
      .then((data) => {
        if (active) setQuestions(data);
      })
      .catch((err) => {
        if (active) setFeedError(errorText(err, locale));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [
    snapshot.profile?.id,
    snapshot.profile?.available,
    feedVersion,
    locale,
    ready,
    owner,
  ]);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!ready || !owner || !draftKey) return;
    setBusy(true);
    try {
      await v2Request(
        "question",
        {
          body,
          topic: topic || undefined,
          discoverable,
        },
        undefined,
        owner,
      );
      setSent(true);
      setBody("");
      setDiscoverable(false);
      try {
        sessionStorage.removeItem(draftKey);
      } catch {
        /* A saved question does not depend on browser storage. */
      }
      await refresh();
    } catch (err) {
      setError(errorText(err, locale));
    } finally {
      setBusy(false);
    }
  };
  const next = () => {
    setFeedVersion((n) => n + 1);
  };
  return (
    <div className="tb-home">
      <Head>
        <title>TraitBridge</title>
      </Head>
      <h1 className="sr-only">{de ? "Start" : "Home"}</h1>
      <div className="tb-home-grid">
        <section className="tb-composer tb-panel" aria-labelledby="ask-title">
          <h2 id="ask-title">{de ? "Frage stellen" : "Ask a question"}</h2>
          {sent ? (
            <div className="tb-sent" role="status">
              <p>
                {de ? "Deine Frage wurde gesendet." : "Your question was sent."}
              </p>
              <Link href="/messages" className="tb-button">
                {de ? "Zu meinen Nachrichten" : "My messages"}
                <Icon name="arrow" size={18} />
              </Link>
              <button
                className="tb-text-button"
                onClick={() => {
                  setSent(false);
                }}
              >
                {de ? "Weitere Frage stellen" : "Ask another question"}
              </button>
            </div>
          ) : !ready ? (
            <>
              <p className="tb-muted">
                {de
                  ? "Erhalte bis zu drei Antworten von echten Menschen."
                  : "Get up to three replies from real people."}
              </p>
              {authLoading || bridgeLoading ? (
                <p role="status">{de ? "Wird geladen …" : "Loading …"}</p>
              ) : (
                <Link
                  href={actionPath("ask")}
                  className="tb-button tb-ask-button"
                >
                  {de ? "Frage stellen" : "Ask a question"}
                </Link>
              )}
              <Link href="/test" className="tb-text-link">
                {de
                  ? "Persönlichkeitstest ausprobieren"
                  : "Try the personality test"}
              </Link>
            </>
          ) : (
            <>
              <form onSubmit={submit}>
                <label className="sr-only" htmlFor="question-body">
                  {de ? "Deine persönliche Frage" : "Your personal question"}
                </label>
                <textarea
                  id="question-body"
                  value={body}
                  minLength={20}
                  maxLength={2000}
                  required
                  rows={4}
                  onChange={(e) => {
                    setBody(e.target.value);
                    try {
                      if (draftKey)
                        sessionStorage.setItem(draftKey, e.target.value);
                    } catch {}
                  }}
                  placeholder={de ? "Deine Frage" : "Your question"}
                />
                <SensitiveHint text={body} />
                <div className="tb-composer-meta">
                  <label className="tb-topic-select">
                    <span>{de ? "Thema" : "Topic"}</span>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value as Topic | "")}
                    >
                      <option value="">
                        {de ? "Passend zuordnen" : "Suggest a topic"}
                      </option>
                      {topics.map((t) => (
                        <option key={t} value={t}>
                          {topicLabels[locale][t]}
                        </option>
                      ))}
                    </select>
                  </label>
                  <span>{body.length}/2000</span>
                </div>
                <label className="tb-checkbox">
                  <input
                    type="checkbox"
                    checked={discoverable}
                    onChange={(e) => setDiscoverable(e.target.checked)}
                  />
                  <span>
                    {de
                      ? "Meine Frage darf auch unter „Entdecken“ erscheinen."
                      : "Also allow my question to appear in Discover."}
                  </span>
                </label>
                <p className="tb-fine tb-privacy-note">
                  <Icon name="lock" size={14} />
                  {de
                    ? "Sonst sehen sie nur passend vermittelte Personen. Deine genauen Big-Five-Werte bleiben privat."
                    : "Otherwise, only matched people can see it. Your exact Big Five scores stay private."}
                </p>
                {error && (
                  <p className="tb-error" role="alert">
                    {error}
                  </p>
                )}
                <button
                  type="submit"
                  className="tb-button tb-ask-button"
                  disabled={busy}
                >
                  {busy
                    ? de
                      ? "Wird versendet …"
                      : "Sending …"
                    : de
                      ? "Frage senden"
                      : "Send question"}
                  <Icon name="send" size={19} />
                </button>
                <p className="tb-fine tb-answer-promise">
                  {de
                    ? "Bis zu drei Antworten von anderen Mitgliedern. Antworten sind freiwillig."
                    : "Up to three replies from other members. Replies are voluntary."}
                </p>
              </form>
            </>
          )}
        </section>
        <section
          id="help-section"
          className="tb-panel tb-help-panel"
          aria-labelledby="help-title"
        >
          <h2 id="help-title" tabIndex={-1}>
            {de ? "Jemandem helfen" : "Help someone"}
          </h2>
          {ready ? (
            <div className="tb-help-content">
              {loading ? (
                <p role="status">
                  {de
                    ? "Passende Fragen werden geladen …"
                    : "Looking for questions …"}
                </p>
              ) : feedError ? (
                <p role="alert">{feedError}</p>
              ) : questions[0] ? (
                <HelpCard
                  key={questions[0].id}
                  question={questions[0]}
                  onNext={next}
                />
              ) : (
                <div className="tb-no-question">
                  <p>
                    {snapshot.profile?.available === false
                      ? de
                        ? "Teilnahme pausiert. Du kannst sie unter „Ich“ aktivieren."
                        : "Participation paused. You can resume in Me."
                      : de
                        ? "Zurzeit keine passende Frage."
                        : "No matching question right now."}
                  </p>
                  <button className="tb-text-button" onClick={next}>
                    {de ? "Erneut nachsehen" : "Check again"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="tb-help-content">
              {authLoading || bridgeLoading ? (
                <p role="status">{de ? "Wird geladen …" : "Loading …"}</p>
              ) : (
                <>
                  <p>
                    {de
                      ? "Beantworte Fragen, die zu deinem Profil passen."
                      : "Reply to questions related to your profile."}
                  </p>
                  <Link
                    href={actionPath("help")}
                    className="tb-button secondary"
                  >
                    {de ? "Jemandem helfen" : "Help someone"}
                  </Link>
                </>
              )}
              {Boolean(bridgeError) && (
                <p role="status">{errorText(bridgeError, locale)}</p>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
