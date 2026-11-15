import {
  getItems,
  type Question as TestQuestion,
} from "@bigfive-org/questions";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { useBridge } from "../../contexts/BridgeContext";
import {
  calculateShortTestScores,
  selectShortTestQuestions,
} from "../../lib/short-test";
import { generateAvatar, validAvatar } from "../../lib/v2/avatar";
import { STORAGE_KEY_SHORT } from "../../lib/bigfive-results";
import { topicLabels } from "../../lib/v2/copy";
import { errorText, v2Request } from "../../lib/v2/client";
import {
  topics,
  traits,
  type AvatarConfig,
  type Topic,
} from "../../lib/v2/types";
import { AvatarEditor } from "./Shared";
import BlobAvatar from "./BlobAvatar";
import Icon from "./Icon";

export default function Onboarding() {
  const { locale } = useLocale();
  const de = locale === "de";
  const { user } = useAuth();
  const { snapshot, refresh } = useBridge();
  const router = useRouter();
  const [stage, setStage] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [avatar, setAvatar] = useState<AvatarConfig>(
    generateAvatar("first-bridge"),
  );
  const [name, setName] = useState("");
  const [interests, setInterests] = useState<Topic[]>([]);
  const [experiences, setExperiences] = useState<Topic[]>([]);
  const [adult, setAdult] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [loadedKey, setLoadedKey] = useState("");
  const questions = useMemo(
    () => selectShortTestQuestions(getItems(locale, false) as TestQuestion[]),
    [locale],
  );
  const key = `tb-v2-onboard:${user?.id || "visitor"}`;
  useEffect(() => {
    try {
      const raw = JSON.parse(
        sessionStorage.getItem(key) ||
          sessionStorage.getItem("tb-v2-onboard:visitor") ||
          "null",
      );
      if (raw && typeof raw === "object") {
        const restored = Object.fromEntries(
          questions.flatMap((q) =>
            Number.isInteger(raw.answers?.[q.id]) &&
            raw.answers[q.id] >= 1 &&
            raw.answers[q.id] <= 5
              ? [[q.id, raw.answers[q.id]]]
              : [],
          ),
        );
        setAnswers(restored);
        const firstMissing = questions.findIndex((q) => !restored[q.id]);
        if (Number.isInteger(raw.stage) && raw.stage >= -1 && raw.stage <= 10)
          setStage(
            Math.min(raw.stage, firstMissing === -1 ? 10 : firstMissing),
          );
        if (typeof raw.name === "string") setName(raw.name);
        if (validAvatar(raw.avatar)) setAvatar(raw.avatar);
        if (Array.isArray(raw.interests))
          setInterests(raw.interests.filter((t: Topic) => topics.includes(t)));
        if (Array.isArray(raw.experiences))
          setExperiences(
            raw.experiences.filter((t: Topic) => topics.includes(t)),
          );
      }
    } catch {}
    setLoadedKey(key);
    try {
      if (
        !sessionStorage.getItem(key) &&
        !sessionStorage.getItem("tb-v2-onboard:visitor")
      )
        setAvatar(generateAvatar(user?.id || crypto.randomUUID()));
    } catch {}
    setReady(true);
  }, [key, user?.id]);
  useEffect(() => {
    if (ready && loadedKey === key)
      try {
        sessionStorage.setItem(
          key,
          JSON.stringify({
            answers,
            stage,
            name,
            avatar,
            interests,
            experiences,
          }),
        );
      } catch {}
  }, [
    answers,
    stage,
    name,
    key,
    ready,
    loadedKey,
    avatar,
    interests,
    experiences,
  ]);
  const scores = questions.every(
    (q) =>
      Number.isInteger(answers[q.id]) &&
      answers[q.id] >= 1 &&
      answers[q.id] <= 5,
  )
    ? calculateShortTestScores(questions, answers)
    : null;
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      await router.push("/login?returnTo=%2Fonboarding");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await v2Request("onboard", {
        pseudonym: name,
        avatar,
        answers,
        language: locale,
        interests,
        experiences,
        adult_consent: adult,
        matching_consent: consent,
      });
      try {
        sessionStorage.removeItem(key);
        sessionStorage.removeItem("tb-v2-onboard:visitor");
        if (scores)
          localStorage.setItem(
            STORAGE_KEY_SHORT,
            JSON.stringify({
              scores,
              timestamp: new Date().toISOString(),
              variant: "short",
              language: locale,
            }),
          );
        const draft = sessionStorage.getItem("tb-v2-question:visitor");
        if (draft) {
          sessionStorage.setItem(`tb-v2-question:${user.id}`, draft);
          sessionStorage.removeItem("tb-v2-question:visitor");
        }
      } catch {
        /* Optional local copies must not turn a successful save into an error. */
      }
      await refresh();
      await router.push("/");
    } catch (err) {
      setError(errorText(err, locale));
    } finally {
      setBusy(false);
    }
  };
  if (snapshot.profile)
    return (
      <div className="tb-empty">
        <BlobAvatar config={snapshot.profile.avatar} size={130} />
        <h1>{de ? "Du bist bereit." : "You’re ready."}</h1>
        <Link href="/" className="tb-button">
          {de ? "Zu den Fragen" : "Explore questions"}
        </Link>
      </div>
    );
  return (
    <div className="tb-onboarding">
      <Head>
        <title>
          {(de ? "Lernen wir uns kennen" : "Let’s get acquainted") +
            " | TraitBridge"}
        </title>
      </Head>
      <div className="tb-onboarding-side">
        <span className="tb-eyebrow">
          {de ? "DEINE BRÜCKE ZU ANDEREN" : "YOUR BRIDGE TO OTHERS"}
        </span>
        <h1>
          {de ? (
            <>
              Ein bisschen du.
              <br />
              <em>Ein guter Anfang.</em>
            </>
          ) : (
            <>
              A little about you.
              <br />
              <em>A good beginning.</em>
            </>
          )}
        </h1>
        <BlobAvatar config={avatar} size={175} />
        <p>
          {de
            ? "Die Big Five beschreiben fünf fliessende Dimensionen. Sie machen dich weder zu einem Typ noch sagen sie voraus, was du erleben wirst."
            : "The Big Five describe five continuous dimensions. They don’t put you in a type or predict your experiences."}
        </p>
        <Link className="tb-text-link" href="/test/full">
          {de
            ? "Lieber den ausführlichen Test machen?"
            : "Prefer the full assessment?"}
        </Link>
      </div>
      <section className="tb-panel tb-onboarding-card">
        {stage === -1 ? (
          <>
            <span className="tb-eyebrow">
              {de ? "WILLKOMMEN BEI TRAITBRIDGE" : "WELCOME TO TRAITBRIDGE"}
            </span>
            <h2>
              {de
                ? "Menschen verstehen Menschen."
                : "People understand people."}
            </h2>
            <p>
              {de
                ? "Stelle eine persönliche Frage oder teile, was du selbst erlebt hast. Wir bieten deine Frage Menschen an, die bei diesem Thema ähnlich ticken."
                : "Ask a personal question or share your experience. We offer your question to people with similar traits relevant to the topic."}
            </p>
            <div className="tb-note">
              <Icon name="lock" />
              <p>
                {de
                  ? "Deine genauen Werte bleiben privat. Antworten stammen ausschliesslich von Menschen."
                  : "Your exact scores stay private. Replies come exclusively from people."}
              </p>
            </div>
            <h3>
              {de
                ? "Zuerst: zehn kleine Aussagen."
                : "First: ten short statements."}
            </h3>
            <p>
              {de
                ? "Der bisherige Kurztest ist eine grobe Orientierung mit nur zwei Aussagen pro Dimension, keine validierte eigenständige Kurzskala. Du kannst ihn später durch den vollständigen Test ergänzen."
                : "The existing quick test is a rough orientation with only two items per dimension, not a validated standalone short scale. You can add the full test later."}
            </p>
            <button className="tb-button" onClick={() => setStage(0)}>
              {de ? "Mich kennenlernen" : "Get to know myself"}
              <Icon name="arrow" size={18} />
            </button>
            <p className="tb-fine">
              {de
                ? "Geschlossene Beta · ab 18 Jahren · ohne Zeitdruck"
                : "Closed beta · adults 18+ · no time pressure"}
            </p>
          </>
        ) : stage < 10 ? (
          <>
            <div className="tb-section-line">
              <span className="tb-eyebrow">
                {de ? "KURZE ORIENTIERUNG" : "QUICK ORIENTATION"}
              </span>
              <span>{stage + 1} / 10</span>
            </div>
            <progress
              value={Object.keys(answers).length}
              max={10}
              aria-label={de ? "Beantwortete Aussagen" : "Answered statements"}
            />
            <fieldset className="tb-test-question">
              <legend>{questions[stage].text}</legend>
              <p className="tb-muted">
                {de
                  ? "Wie gut passt das zu dir?"
                  : "How well does this describe you?"}
              </p>
              <div className="tb-test-choices">
                {questions[stage].choices.map((choice) => (
                  <label key={choice.score}>
                    <input
                      type="radio"
                      name={questions[stage].id}
                      checked={answers[questions[stage].id] === choice.score}
                      onChange={() =>
                        setAnswers({
                          ...answers,
                          [questions[stage].id]: choice.score,
                        })
                      }
                    />
                    <span>{choice.text}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="tb-section-line">
              <button
                className="tb-text-button"
                onClick={() => setStage((n) => n - 1)}
              >
                {de ? "Zurück" : "Back"}
              </button>
              <button
                className="tb-button"
                disabled={!answers[questions[stage].id]}
                onClick={() => setStage((n) => n + 1)}
              >
                {stage === 9
                  ? de
                    ? "Meine Orientierung"
                    : "My orientation"
                  : de
                    ? "Weiter"
                    : "Continue"}
                <Icon name="arrow" size={18} />
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={save}>
            <span className="tb-eyebrow">
              {de ? "DAS BIST DU. VIELLEICHT." : "THIS MIGHT BE YOU."}
            </span>
            <h2>
              {de
                ? "Viel mehr als fünf Zahlen."
                : "Much more than five numbers."}
            </h2>
            <p>
              {de
                ? "Deine grobe Orientierung hilft bei der Vermittlung. Sie ist keine Diagnose und kann sich verändern."
                : "Your rough orientation helps with matching. It is not a diagnosis and may change."}
            </p>
            {scores && (
              <div className="tb-mini-scores">
                {traits.map((t, i) => {
                  const value = scores[t];
                  return (
                    <div key={t}>
                      <span>
                        {
                          (de
                            ? [
                                "Offenheit",
                                "Gewissenhaftigkeit",
                                "Extraversion",
                                "Verträglichkeit",
                                "Emotionale Empfindlichkeit",
                              ]
                            : [
                                "Openness",
                                "Conscientiousness",
                                "Extraversion",
                                "Agreeableness",
                                "Emotional sensitivity",
                              ])[i]
                        }
                      </span>
                      <meter min={1} max={5} value={value} />
                    </div>
                  );
                })}
              </div>
            )}
            <h3>
              {de
                ? "Gib deiner Perspektive ein Gesicht."
                : "Give your perspective a face."}
            </h3>
            <AvatarEditor value={avatar} onChange={setAvatar} />
            <label className="tb-label">
              {de ? "Dein Pseudonym" : "Your pseudonym"}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={30}
                autoComplete="nickname"
                placeholder={
                  de ? "Zum Beispiel: Moosfreund" : "For example: Mossfriend"
                }
              />
            </label>
            <fieldset className="tb-interest-group">
              <legend>
                {de
                  ? "Was interessiert dich? (optional)"
                  : "What interests you? (optional)"}
              </legend>
              <div className="tb-chips">
                {topics.map((t) => (
                  <button
                    type="button"
                    key={t}
                    aria-pressed={interests.includes(t)}
                    onClick={() =>
                      setInterests(
                        interests.includes(t)
                          ? interests.filter((x) => x !== t)
                          : [...interests, t],
                      )
                    }
                  >
                    {topicLabels[locale][t]}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="tb-interest-group">
              <legend>
                {de
                  ? "Wo möchtest du Erfahrungen teilen? (optional)"
                  : "Where would you like to share experience? (optional)"}
              </legend>
              <div className="tb-chips">
                {topics.map((t) => (
                  <button
                    type="button"
                    key={t}
                    aria-pressed={experiences.includes(t)}
                    onClick={() =>
                      setExperiences(
                        experiences.includes(t)
                          ? experiences.filter((x) => x !== t)
                          : [...experiences, t],
                      )
                    }
                  >
                    {topicLabels[locale][t]}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="tb-checkbox">
              <input
                required
                type="checkbox"
                checked={adult}
                onChange={(e) => setAdult(e.target.checked)}
              />
              <span>
                {de
                  ? "Ich bin mindestens 18 Jahre alt und akzeptiere die "
                  : "I am at least 18 and accept the "}
                <Link href="/community-guidelines">
                  {de ? "Regeln für unser Miteinander" : "community guidelines"}
                </Link>
                .
              </span>
            </label>
            <label className="tb-checkbox">
              <input
                required
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
              />
              <span>
                {de
                  ? "Ich willige ein, dass mein privates Persönlichkeitsprofil zur Vermittlung verwendet wird. "
                  : "I consent to using my private personality profile for matching. "}
                <Link href="/privacy">
                  {de ? "Datenschutz ansehen" : "Read the privacy notice"}
                </Link>
              </span>
            </label>
            {error && (
              <p role="alert" className="tb-error">
                {error}
              </p>
            )}
            <button className="tb-button" disabled={busy}>
              {busy
                ? de
                  ? "Wird gespeichert …"
                  : "Saving …"
                : user
                  ? de
                    ? "Meine Brücke bauen"
                    : "Build my bridge"
                  : de
                    ? "Anmelden & abschliessen"
                    : "Sign in & finish"}
              <Icon name="arrow" size={18} />
            </button>
            <p className="tb-fine">
              {de
                ? "Du kannst die Vermittlung jederzeit unter „Ich“ pausieren und dein Konto löschen."
                : "You can pause matching or delete your account in Me at any time."}
            </p>
          </form>
        )}
      </section>
    </div>
  );
}
