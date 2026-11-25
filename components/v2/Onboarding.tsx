import {
  getItems,
  type Question as TestQuestion,
} from "@bigfive-org/questions";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useLocale } from "../../contexts/LocaleContext";
import { useBridge } from "../../contexts/BridgeContext";
import {
  availableAssessment,
  forgetAssessment,
} from "../../lib/assessment-draft";
import { buildLoginPath, sanitizeReturnPath } from "../../lib/return-path";
import { selectShortTestQuestions } from "../../lib/short-test";
import { generateAvatar } from "../../lib/v2/avatar";
import { errorText, v2Request } from "../../lib/v2/client";
import type { AssessmentDraft } from "../../lib/v2/assessment";
import type { AssessmentMetadata, AssessmentVariant } from "../../lib/v2/types";
import BlobAvatar from "./BlobAvatar";

export default function Onboarding() {
  const { locale } = useLocale();
  const de = locale === "de";
  const { user, loading: authLoading, signOut } = useAuth();
  const { snapshot, refresh, loading, error: accessError } = useBridge();
  const router = useRouter();
  const destination = sanitizeReturnPath(router.query.returnTo);
  const owner = user && !user.is_anonymous ? user.id : null;
  const questions = useMemo(
    () => selectShortTestQuestions(getItems(locale, false) as TestQuestion[]),
    [locale],
  );
  const key = owner ? `tb-v2-onboard:${owner}` : null;
  const eligible = Boolean(
    owner && !loading && !accessError && !snapshot.profile,
  );
  const [ready, setReady] = useState(false);
  const [candidate, setCandidate] = useState<AssessmentMetadata | null>(null);
  const [candidateError, setCandidateError] = useState(false);
  const [device, setDevice] = useState<AssessmentDraft | null>(null);
  const [choice, setChoice] = useState<"new" | "account" | "device" | null>(
    null,
  );
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [index, setIndex] = useState(0);
  const [name, setName] = useState("");
  const [adult, setAdult] = useState(false);
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const avatar = generateAvatar(owner ?? "visitor");

  useEffect(() => {
    if (!router.isReady || authLoading) return;
    if (!owner) {
      void router.replace(buildLoginPath(destination, "signup"));
    } else if (snapshot.profile && !accessError) {
      void router.replace(destination);
    }
  }, [
    router,
    router.isReady,
    authLoading,
    owner,
    snapshot.profile,
    accessError,
    destination,
  ]);

  useEffect(() => {
    if (!key) return;
    try {
      const draft = JSON.parse(sessionStorage.getItem(key) || "null");
      if (!draft) return;
      const restored = Object.fromEntries(
        questions.flatMap(({ id }) => {
          const answer = draft.answers?.[id];
          return Number.isInteger(answer) && answer >= 1 && answer <= 5
            ? [[id, answer]]
            : [];
        }),
      );
      setAnswers(restored);
      const missing = questions.findIndex(({ id }) => !restored[id]);
      setIndex(missing < 0 ? questions.length : missing);
      if (typeof draft.name === "string") setName(draft.name.slice(0, 30));
      if (draft.choice === "new" || missing === -1) setChoice("new");
    } catch {
    } finally {
      setReady(true);
    }
    // Items have stable IDs in both languages.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!ready || !key || snapshot.profile) return;
    try {
      sessionStorage.setItem(key, JSON.stringify({ answers, name, choice }));
    } catch {}
  }, [ready, key, snapshot.profile, answers, name, choice]);

  async function loadCandidate(id: string, signal?: AbortSignal) {
    try {
      const next = await v2Request<AssessmentMetadata | null>(
        "assessment_candidate",
        {},
        signal,
        id,
      );
      if (!signal?.aborted) setCandidate(next);
    } catch {
      if (!signal?.aborted) setCandidateError(true);
    }
  }

  const [checking, setChecking] = useState(true);
  useEffect(() => {
    if (!eligible || !owner) return;
    const controller = new AbortController();
    setDevice(availableAssessment(owner));
    setChecking(true);
    void loadCandidate(owner, controller.signal).finally(() => {
      if (!controller.signal.aborted) setChecking(false);
    });
    return () => controller.abort();
  }, [eligible, owner]);

  const profileStep =
    choice === "account" ||
    choice === "device" ||
    (choice === "new" && index === questions.length);
  const question = questions[index];
  const label = (variant: AssessmentVariant) =>
    variant === "full"
      ? de
        ? "Ausführlicher Big-Five-Test"
        : "Full Big Five assessment"
      : de
        ? "Big-Five-Kurztest"
        : "Big Five quick test";

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!owner || !key || !eligible || !profileStep || busy) return;
    const assessment =
      choice === "account" && candidate?.resultId
        ? { result_id: candidate.resultId }
        : choice === "device" && device
          ? { device_test: device }
          : { answers };
    setError("");
    setBusy(true);
    try {
      await v2Request(
        "onboard",
        {
          ...assessment,
          pseudonym: name,
          avatar,
          language: locale,
          interests: [],
          experiences: [],
          adult_consent: adult,
          matching_consent: consent,
        },
        undefined,
        owner,
      );
      try {
        sessionStorage.removeItem(key);
      } catch {}
      forgetAssessment(owner);
      await refresh();
      await router.replace(destination);
    } catch (err) {
      if (err instanceof Error && err.message === "ALREADY_ONBOARDED") {
        await refresh();
      } else {
        setError(errorText(err, locale));
      }
    } finally {
      setBusy(false);
    }
  }

  if (authLoading || !owner || loading || snapshot.profile)
    return (
      <div className="tb-empty" role="status">
        {de ? "Wird geladen …" : "Loading …"}
      </div>
    );
  if (accessError)
    return (
      <div className="page-card login-card">
        <h1>{de ? "Beta-Zugang" : "Beta access"}</h1>
        <p role="status">{errorText(accessError, locale)}</p>
        <div className="login-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => void refresh()}
          >
            {de ? "Erneut prüfen" : "Check again"}
          </button>
          <button
            type="button"
            className="tb-text-button"
            onClick={() =>
              void signOut().catch((err) => setError(errorText(err, locale)))
            }
          >
            {de ? "Abmelden" : "Sign out"}
          </button>
          <Link href="/test" className="tb-text-link">
            {de ? "Zum Persönlichkeitstest" : "Try the personality test"}
          </Link>
        </div>
        {error && (
          <p role="alert" className="tb-error">
            {error}
          </p>
        )}
      </div>
    );
  if (!ready || checking)
    return (
      <div className="tb-empty" role="status">
        {de ? "Testergebnisse werden geprüft …" : "Checking for test results …"}
      </div>
    );

  const chooseTest =
    choice === null && Boolean(candidate || device || candidateError);
  return (
    <div className="tb-onboarding">
      <Head>
        <title>
          {de ? "Profil einrichten" : "Set up your profile"} | TraitBridge
        </title>
      </Head>
      <header className="tb-onboarding-side">
        <h1>{de ? "Profil einrichten" : "Set up your profile"}</h1>
        <BlobAvatar config={avatar} size={150} />
      </header>
      <section className="tb-panel tb-onboarding-card">
        <div className="tb-section-line">
          <span className="tb-eyebrow">
            {profileStep
              ? de
                ? "2 von 2 · Profil"
                : "2 of 2 · Profile"
              : de
                ? "1 von 2 · Big Five"
                : "1 of 2 · Big Five"}
          </span>
          {!chooseTest && !profileStep && (
            <span>
              {index + 1} / {questions.length}
            </span>
          )}
        </div>
        {chooseTest ? (
          <>
            <h2>{de ? "Testergebnis übernehmen" : "Use a test result"}</h2>
            {candidate && (
              <p>
                <button
                  type="button"
                  className="tb-button"
                  onClick={() => setChoice("account")}
                >
                  {label(candidate.variant)}{" "}
                  {de ? "aus dem Konto verwenden" : "from your account"}
                </button>
              </p>
            )}
            {device && (
              <p>
                <button
                  type="button"
                  className="tb-button secondary"
                  onClick={() => setChoice("device")}
                >
                  {label(device.variant)}{" "}
                  {de ? "aus diesem Browser verwenden" : "from this browser"}
                </button>
              </p>
            )}
            {candidateError && (
              <p role="status">
                {de
                  ? "Kontotest konnte nicht geladen werden. Lade die Seite neu, um es erneut zu versuchen."
                  : "Your account result could not be loaded. Reload this page to try again."}
              </p>
            )}
            <button
              type="button"
              className="tb-text-button"
              onClick={() => setChoice("new")}
            >
              {de ? "Kurztest machen" : "Take the quick test"}
            </button>
          </>
        ) : profileStep ? (
          <form onSubmit={save}>
            <h2>
              {de ? "Pseudonym und Einwilligung" : "Pseudonym and consent"}
            </h2>
            <label className="tb-label">
              {de ? "Pseudonym" : "Pseudonym"}
              <input
                name="pseudonym"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
                maxLength={30}
                autoComplete="nickname"
              />
            </label>
            <p className="tb-fine">
              {de
                ? "Avatar, Interessen und Erfahrungsthemen kannst du später unter „Ich“ ändern."
                : "You can edit your avatar, interests and experience in Me."}
            </p>
            <label className="tb-checkbox">
              <input
                required
                type="checkbox"
                checked={adult}
                onChange={(e) => setAdult(e.target.checked)}
              />
              <span>
                {de
                  ? "Ich bin mindestens 18 und akzeptiere die "
                  : "I am at least 18 and accept the "}
                <Link href="/community-guidelines" target="_blank">
                  {de ? "Community-Regeln" : "community guidelines"}
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
                  ? "Ich stimme zu, dass mein privates Big-Five-Profil für das Matching verwendet wird. "
                  : "I consent to using my private Big Five profile for matching. "}
                <Link href="/privacy" target="_blank">
                  {de ? "Datenschutz" : "Privacy notice"}
                </Link>
              </span>
            </label>
            {error && (
              <p role="alert" className="tb-error">
                {error}
              </p>
            )}
            <div className="tb-section-line">
              <button
                type="button"
                className="tb-text-button"
                onClick={() => {
                  setError("");
                  if (choice === "new") setIndex(questions.length - 1);
                  else setChoice(null);
                }}
              >
                {de ? "Zurück" : "Back"}
              </button>
              <button className="tb-button" disabled={busy}>
                {busy
                  ? de
                    ? "Speichert …"
                    : "Saving …"
                  : de
                    ? "Profil speichern"
                    : "Save profile"}
              </button>
            </div>
          </form>
        ) : (
          question && (
            <>
              <h2>{de ? "Big-Five-Kurztest" : "Big Five quick test"}</h2>
              <progress
                value={Object.keys(answers).length}
                max={questions.length}
                aria-label={
                  de ? "Beantwortete Aussagen" : "Answered statements"
                }
              />
              <fieldset className="tb-test-question">
                <legend>{question.text}</legend>
                <div className="tb-test-choices">
                  {question.choices.map((option) => (
                    <label key={option.score}>
                      <input
                        type="radio"
                        name={question.id}
                        checked={answers[question.id] === option.score}
                        onChange={() =>
                          setAnswers({
                            ...answers,
                            [question.id]: option.score,
                          })
                        }
                      />
                      <span>{option.text}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="tb-section-line">
                <button
                  type="button"
                  className="tb-text-button"
                  disabled={
                    index === 0 && !candidate && !device && !candidateError
                  }
                  onClick={() =>
                    index > 0 ? setIndex(index - 1) : setChoice(null)
                  }
                >
                  {de ? "Zurück" : "Back"}
                </button>
                <button
                  type="button"
                  className="tb-button"
                  disabled={!answers[question.id]}
                  onClick={() => {
                    setChoice("new");
                    setIndex(index + 1);
                  }}
                >
                  {de ? "Weiter" : "Next"}
                </button>
              </div>
            </>
          )
        )}
      </section>
    </div>
  );
}
