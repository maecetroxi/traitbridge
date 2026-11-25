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
import { generateAvatar } from "../../lib/v2/avatar";
import BlobAvatar from "./BlobAvatar";
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
        <title>
          {(de
            ? "Deine Fragen. Menschliche Antworten."
            : "Your questions. Human replies.") + " | TraitBridge"}
        </title>
      </Head>
      <div className="tb-welcome">
        <span className="tb-eyebrow">
          <span className="tb-dot" />
          {de
            ? "EIN KLEINER ORT FÜR ECHTE VERBINDUNG"
            : "A LITTLE SPACE FOR REAL CONNECTION"}
        </span>
        <span className="tb-private">
          <Icon name="lock" size={14} />
          {de
            ? "Persönlich. Menschlich. Ohne Druck."
            : "Personal. Human. At your pace."}
        </span>
      </div>
      <section className="tb-intro">
        <div>
          <h1>
            {snapshot.profile ? (
              de ? (
                `Schön, dass du da bist, ${snapshot.profile.pseudonym}.`
              ) : (
                `Good to see you, ${snapshot.profile.pseudonym}.`
              )
            ) : de ? (
              <>
                Manchmal hilft ein Mensch,
                <br />
                der <em>ähnlich tickt.</em>
              </>
            ) : (
              <>
                Sometimes it takes someone
                <br />
                who <em>gets you.</em>
              </>
            )}
          </h1>
          <p>
            {de
              ? "Du bist mit deinen Fragen nicht allein. Teile, was dich beschäftigt – und höre, was anderen persönlich geholfen hat."
              : "You’re not alone with your questions. Share what’s on your mind and hear what has helped someone else."}
          </p>
        </div>
        <div className="tb-intro-art" aria-hidden="true">
          <span className="tb-art-spark">✳</span>
          <BlobAvatar config={generateAvatar("sage friend")} size={110} />
          <BlobAvatar
            config={{ ...generateAvatar("lilac friend"), color: 0, detail: 0 }}
            size={135}
          />
          <span className="tb-art-note">
            {de ? "Ach, dir geht’s auch so?" : "Oh, you feel that too?"}
          </span>
        </div>
      </section>
      <div className="tb-home-grid">
        <section className="tb-composer tb-panel" aria-labelledby="ask-title">
          <div className="tb-card-heading">
            <span className="tb-round-icon">
              <Icon name="messages" />
            </span>
            <span className="tb-eyebrow">
              {de ? "RAUM FÜR DEINE FRAGE" : "SPACE FOR YOUR QUESTION"}
            </span>
            <span className="tb-tiny-star" aria-hidden="true">
              ✳
            </span>
          </div>
          {sent ? (
            <div className="tb-sent" role="status">
              <BlobAvatar size={100} />
              <h2>
                {de
                  ? "Deine Frage ist unterwegs."
                  : "Your question is on its way."}
              </h2>
              <p>
                {de
                  ? "Wir informieren dich hier in der App, sobald jemand antwortet. Vielleicht kannst du inzwischen jemand anderem helfen?"
                  : "We’ll let you know here in the app when someone replies. In the meantime, perhaps you can help someone else?"}
              </p>
              <Link href="/messages" className="tb-button">
                {de ? "Zu meinen Nachrichten" : "My messages"}
                <Icon name="arrow" size={18} />
              </Link>
              <button
                className="tb-text-button"
                onClick={() => {
                  setSent(false);
                  document
                    .getElementById("help-section")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                {de ? "Jemand anderem helfen" : "Help someone else"}
              </button>
            </div>
          ) : !ready ? (
            <>
              <h2 id="ask-title">{de ? "Frage stellen" : "Ask a question"}</h2>
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
              <h2 id="ask-title">
                {de ? "Was beschäftigt dich gerade?" : "What’s on your mind?"}
              </h2>
              <p className="tb-muted">
                {de
                  ? "Manches wird leichter, wenn man es teilt."
                  : "Some things feel lighter when you share them."}
              </p>
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
                  rows={5}
                  onChange={(e) => {
                    setBody(e.target.value);
                    try {
                      if (draftKey)
                        sessionStorage.setItem(draftKey, e.target.value);
                    } catch {}
                  }}
                  placeholder={
                    de
                      ? "Zum Beispiel: Ich sage oft Ja, obwohl ich Nein meine. Wie schafft ihr es, Grenzen zu setzen?"
                      : "For example: I often say yes when I mean no. How do you set boundaries?"
                  }
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
                      ? "Meine Frage losschicken"
                      : "Send my question"}
                  <Icon name="send" size={19} />
                </button>
                <p className="tb-fine tb-answer-promise">
                  {de
                    ? "Bis zu 3 Antworten von echten Menschen. Das kann dauern; eine Antwort ist nicht garantiert."
                    : "Up to 3 replies from real people. This may take time; a reply is not guaranteed."}
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
          <div className="tb-section-line">
            <span className="tb-eyebrow">
              {de ? "DEINE ERFAHRUNG ZÄHLT" : "YOUR EXPERIENCE MATTERS"}
            </span>
            <Icon name="heart" size={21} />
          </div>
          <h2 id="help-title" tabIndex={-1}>
            {de ? "Jemandem helfen" : "Help someone"}
          </h2>
          <p className="tb-muted">
            {de
              ? "Du musst keine perfekte Antwort haben. Manchmal hilft schon ein „Bei mir war das so …“"
              : "You don’t need the perfect answer. Sometimes “Here’s how it was for me …” is enough."}
          </p>
          <Link href="/discover" className="tb-button secondary small">
            {de ? "Entdecken" : "Discover"}
            <Icon name="leaf" size={15} />
          </Link>
          {snapshot.profile ? (
            <div className="tb-help-content">
              {loading ? (
                <p role="status">
                  {de
                    ? "Wir schauen nach passenden Fragen …"
                    : "Looking for questions …"}
                </p>
              ) : feedError ? (
                <p role="alert">{feedError}</p>
              ) : questions[0] ? (
                <HelpCard key={questions[0].id} question={questions[0]} onNext={next} />
              ) : (
                <div className="tb-empty compact">
                  <BlobAvatar size={100} />
                  <h3>
                    {de
                      ? "Gerade ist es ruhig hier."
                      : "It’s quiet here right now."}
                  </h3>
                  <p>
                    {!snapshot.profile.available
                      ? de
                        ? "Du hast das Helfen pausiert. Unter „Ich“ kannst du es wieder aktivieren."
                        : "You paused helping. You can resume in Me."
                      : de
                        ? "Im Moment gibt es keine weitere passende Frage. Schau später wieder vorbei – ohne Verpflichtung."
                        : "No more matching questions right now. Come back later, whenever you like."}
                  </p>
                  <button className="tb-text-button" onClick={next}>
                    {de ? "Erneut nachsehen" : "Check again"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="tb-example">
              <div className="tb-example-label">
                {de
                  ? "SO KÖNNTE EINE FRAGE AUSSEHEN · BEISPIEL"
                  : "AN EXAMPLE OF A QUESTION · DEMO"}
              </div>
              <div className="tb-person">
                <BlobAvatar
                  config={{ ...generateAvatar("example"), color: 0, detail: 0 }}
                  size={70}
                />
                <div>
                  <strong>
                    {de ? "Ein Mensch wie du" : "Someone like you"}
                  </strong>
                  <span>{de ? "Stress & Ruhe" : "Stress & calm"}</span>
                </div>
              </div>
              <blockquote className="tb-help-question">
                {de
                  ? "Wie schafft ihr es, nach der Arbeit wirklich abzuschalten? Mein Kopf macht irgendwie immer weiter."
                  : "How do you really switch off after work? My mind just keeps going."}
              </blockquote>
              <div className="tb-match-reason">
                <Icon name="leaf" size={16} />
                {de
                  ? "Eine Erfahrung kann einen Unterschied machen."
                  : "One experience can make a difference."}
              </div>
              <Link href={actionPath("help")} className="tb-button secondary">
                {de ? "Jemandem helfen" : "Help someone"}
                <Icon name="arrow" size={18} />
              </Link>
              {Boolean(bridgeError) && (
                <p className="tb-fine">{errorText(bridgeError, locale)}</p>
              )}
            </div>
          )}
        </section>
      </div>
      <section className="tb-how">
        <div>
          <span className="tb-step">01</span>
          <div>
            <h3>{de ? "Ein bisschen du." : "A little about you."}</h3>
            <p>
              {de
                ? "Ein kurzer Test hilft uns, ähnliche Perspektiven zu finden."
                : "A quick test helps us find related perspectives."}
            </p>
          </div>
        </div>
        <div>
          <span className="tb-step">02</span>
          <div>
            <h3>{de ? "Eine echte Verbindung." : "A real connection."}</h3>
            <p>
              {de
                ? "Deine Frage erreicht Menschen, die bei diesem Thema ähnlich ticken."
                : "Your question reaches people who share relevant traits."}
            </p>
          </div>
        </div>
        <div>
          <span className="tb-step">03</span>
          <div>
            <h3>{de ? "In deinem Tempo." : "At your pace."}</h3>
            <p>
              {de
                ? "Antworten lesen. Erfahrungen teilen. Nichts müssen."
                : "Read replies. Share experiences. No pressure."}
            </p>
          </div>
        </div>
      </section>
      <div className="tb-bottom-note">
        <Icon name="leaf" size={20} />
        <p>
          {de
            ? "Unsere Brücke: die Big Five. Fünf Dimensionen, keine Schubladen."
            : "Our bridge: the Big Five. Five dimensions, no boxes."}{" "}
          <Link href="/background">
            {de ? "Mehr über die Grundlage" : "About the science"}{" "}
            <span aria-hidden="true">↗</span>
          </Link>
        </p>
      </div>
    </div>
  );
}
