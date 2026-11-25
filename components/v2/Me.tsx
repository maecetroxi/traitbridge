import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useBridge } from "../../contexts/BridgeContext";
import { useLocale } from "../../contexts/LocaleContext";
import { v2Request, errorText } from "../../lib/v2/client";
import { supabase } from "../../lib/supabase";
import { topicLabels } from "../../lib/v2/copy";
import { topics, traits, type Profile, type Topic } from "../../lib/v2/types";
import { AccessGate, AvatarEditor } from "./Shared";
import BlobAvatar from "./BlobAvatar";
import Icon from "./Icon";
import { DiscoverList } from "./DiscoverList";
import { DiscoverPersonalitySetting } from "./DiscoverPersonality";

export default function Me() {
  const { locale } = useLocale();
  const de = locale === "de";
  const { user, signOut } = useAuth();
  const { snapshot, refresh } = useBridge();
  const [draft, setDraft] = useState<Profile | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [showSaved, setShowSaved] = useState(false);
  useEffect(() => {
    if (snapshot.profile) setDraft(snapshot.profile);
  }, [snapshot.profile]);
  const run = async (action: string, data: Record<string, unknown>) => {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await v2Request(action, data);
      await refresh();
      setMessage(
        de
          ? "Gespeichert. Ganz so, wie es für dich passt."
          : "Saved. Just the way it works for you.",
      );
    } catch (e) {
      setError(errorText(e, locale));
    } finally {
      setBusy(false);
    }
  };
  const deleteAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmation !== "DELETE") return;
    setBusy(true);
    setError("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const response = await fetch("/api/v2", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({ confirmation }),
      });
      if (!response.ok) throw new Error("DELETE_FAILED");
      try {
        for (let i = sessionStorage.length - 1; i >= 0; i--) {
          const k = sessionStorage.key(i);
          if (k?.startsWith("tb-v2-")) sessionStorage.removeItem(k);
        }
      } catch {
        /* Auth deletion has already succeeded. */
      }
      await supabase.auth.signOut({ scope: "local" });
      window.location.assign("/");
    } catch (e) {
      setError(errorText(e, locale));
    } finally {
      setBusy(false);
    }
  };
  const updateTopics = (field: "interests" | "experiences", t: Topic) => {
    if (draft)
      setDraft({
        ...draft,
        [field]: draft[field].includes(t)
          ? draft[field].filter((x) => x !== t)
          : [...draft[field], t],
      });
  };
  return (
    <div className="tb-page">
      <Head>
        <title>
          {(de ? "Ein bisschen ich" : "A little about me") + " | TraitBridge"}
        </title>
      </Head>
      <div className="tb-page-heading">
        <div>
          <span className="tb-eyebrow">
            {de ? "DEIN PLATZ. DEIN TEMPO." : "YOUR SPACE. YOUR PACE."}
          </span>
          <h1>
            {de ? "Ein bisschen ich" : "A little about me"}
            <span className="tb-title-dot">.</span>
          </h1>
        </div>
        {user && (
          <button className="tb-text-button" onClick={() => void signOut().catch((err) => setError(errorText(err, locale)))}>
            {de ? "Abmelden" : "Sign out"}
          </button>
        )}
      </div>
      <div className="tb-me-grid">
        <section>
          <AccessGate>
            {draft && (
              <form
                className="tb-panel"
                onSubmit={(e) => {
                  e.preventDefault();
                  void run("preferences", { ...draft });
                }}
              >
                <div className="tb-section-line">
                  <h2>{de ? "Hallo, das bin ich." : "Hello, this is me."}</h2>
                  <Icon name="leaf" />
                </div>
                <AvatarEditor
                  value={draft.avatar}
                  onChange={(avatar) => setDraft({ ...draft, avatar })}
                />
                <label className="tb-label">
                  {de ? "Mein Pseudonym" : "My pseudonym"}
                  <input
                    minLength={2}
                    maxLength={30}
                    required
                    value={draft.pseudonym}
                    onChange={(e) =>
                      setDraft({ ...draft, pseudonym: e.target.value })
                    }
                  />
                </label>
                <label className="tb-label">
                  {de ? "Sprache für die Vermittlung" : "Language for matching"}
                  <select
                    value={draft.language}
                    onChange={(e) =>
                      setDraft({
                        ...draft,
                        language: e.target.value as "de" | "en",
                      })
                    }
                  >
                    <option value="de">Deutsch</option>
                    <option value="en">English</option>
                  </select>
                </label>
                {(["interests", "experiences"] as const).map((field) => (
                  <fieldset key={field} className="tb-interest-group">
                    <legend>
                      {field === "interests"
                        ? de
                          ? "Meine Interessen"
                          : "My interests"
                        : de
                          ? "Hier teile ich gerne Erfahrungen"
                          : "I like sharing experience here"}
                    </legend>
                    <div className="tb-chips">
                      {topics.map((t) => (
                        <button
                          type="button"
                          key={t}
                          aria-pressed={draft[field].includes(t)}
                          onClick={() => updateTopics(field, t)}
                        >
                          {topicLabels[locale][t]}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                ))}
                <div className="tb-settings">
                  <label className="tb-checkbox">
                    <input
                      type="checkbox"
                      checked={draft.available}
                      onChange={(e) =>
                        setDraft({ ...draft, available: e.target.checked })
                      }
                    />
                    <span>
                      <strong>
                        {de
                          ? "An der Vermittlung teilnehmen"
                          : "Take part in matching"}
                      </strong>
                      <small>
                        {de
                          ? "Höchstens sechs neue Angebote pro Tag. Pausieren stoppt neue Angebote und neue Vermittlungen deiner Fragen. Bestehende Nachrichten bleiben erreichbar."
                          : "At most six new offers per day. Pausing stops new offers and new matching of your questions. Existing messages stay accessible."}
                      </small>
                    </span>
                  </label>
                  <label className="tb-checkbox">
                    <input
                      type="checkbox"
                      checked={draft.notifications}
                      onChange={(e) =>
                        setDraft({ ...draft, notifications: e.target.checked })
                      }
                    />
                    <span>
                      <strong>
                        {de
                          ? "Benachrichtigungen in der App"
                          : "In-app notifications"}
                      </strong>
                      <small>
                        {de
                          ? "Für neue Antworten, echte Dankesnachrichten und vermittelte Fragen."
                          : "For new replies, real thank-you messages and matching questions."}
                      </small>
                    </span>
                  </label>
                </div>
                <button className="tb-button" disabled={busy}>
                  {busy
                    ? de
                      ? "Speichern …"
                      : "Saving …"
                    : de
                      ? "Änderungen speichern"
                      : "Save changes"}
                </button>
              </form>
            )}
          </AccessGate>
          {message && (
            <p className="tb-success" role="status">
              {message}
            </p>
          )}
          {error && (
            <p className="tb-error" role="alert">
              {error}
            </p>
          )}
        </section>
        <aside className="tb-me-aside">
          {snapshot.profile && user && (
            <DiscoverPersonalitySetting owner={user.id} shared={snapshot.profile.discover_personality_shared === true} />
          )}
          {snapshot.profile && user && (
            <section className="tb-panel tb-saved-posts">
              <h2>
                <button className="tb-text-button" type="button" aria-expanded={showSaved}
                  onClick={() => setShowSaved(!showSaved)}>
                  {de ? "Gemerkte Beiträge" : "Saved posts"}
                </button>
              </h2>
              {showSaved && <DiscoverList owner={user.id} mode="saved" />}
            </section>
          )}
          {snapshot.profile && (
            <section className="tb-panel tb-profile-panel">
              <div className="tb-section-line">
                <span className="tb-eyebrow">
                  {de ? "DEINE BIG FIVE" : "YOUR BIG FIVE"}
                </span>
                <Icon name="lock" size={16} />
              </div>
              <h2>
                {de ? "Facetten, keine Schubladen." : "Dimensions, not boxes."}
              </h2>
              <div className="tb-mini-scores">
                {traits.map((trait, i) => {
                  const value = snapshot.profile!.scores[trait];
                  return (
                    <div key={trait}>
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
                      <div className="tb-score-row">
                        <meter min={1} max={5} value={value} />
                        <small>{value.toFixed(1)} / 5</small>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="tb-fine">
                {snapshot.profile.variant === "short"
                  ? de
                    ? "Grobe Orientierung: zwei Aussagen pro Dimension. Keine Diagnose."
                    : "Rough orientation: two statements per dimension. Not a diagnosis."
                  : de
                    ? "Ausführliches Testergebnis. Keine Diagnose."
                    : "Full assessment result. Not a diagnosis."}{" "}
                {de
                  ? "Nur du siehst diese Werte."
                  : "Only you can see these scores."}
              </p>
              <Link href="/profile" className="tb-text-link">
                {de ? "Ergebnis im Detail" : "My detailed result"} →
              </Link>
              <button
                className="tb-text-button"
                disabled={busy}
                onClick={() => void run("sync_full", {})}
              >
                {de
                  ? "Gespeicherten 120-Fragen-Test für die Vermittlung verwenden"
                  : "Use my saved 120-item test for matching"}
              </button>
            </section>
          )}
          <section className="tb-panel tb-learning-links">
            <span className="tb-eyebrow">
              {de ? "NEUGIER AUF DICH" : "STAY CURIOUS ABOUT YOU"}
            </span>
            <h2>
              {de ? "Dich besser verstehen." : "Understand yourself better."}
            </h2>
            {[
              {
                href: "/test",
                title: de ? "Persönlichkeitstest" : "Personality assessment",
                text: de
                  ? "Kurz orientieren oder 120 Aussagen entdecken."
                  : "A quick orientation or a full 120-item assessment.",
              },
              {
                href: "/learn",
                title: de ? "Lernen & ausprobieren" : "Learn & explore",
                text: de
                  ? "Fünf Dimensionen, praktische Impulse."
                  : "Five dimensions, practical ideas.",
              },
              {
                href: "/learn/library?type=nonfiction",
                title: de
                  ? "Bücher & andere Perspektiven"
                  : "Books & other perspectives",
                text: de
                  ? "Redaktionelle Empfehlungen für Neugierige."
                  : "Editorial recommendations for curious minds.",
              },
              {
                href: "/background",
                title: de
                  ? "Die Wissenschaft dahinter"
                  : "The science behind it",
                text: de
                  ? "Was die Big Five können – und wo ihre Grenzen liegen."
                  : "What the Big Five can tell us, and their limits.",
              },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.text}</span>
                </div>
                <Icon name="arrow" size={19} />
              </Link>
            ))}
          </section>
          {snapshot.blocks.length > 0 && (
            <section className="tb-panel">
              <h3>{de ? "Blockierte Personen" : "Blocked people"}</h3>
              {snapshot.blocks.map((b) => (
                <div className="tb-section-line" key={b.id}>
                  <span>{b.pseudonym}</span>
                  <button
                    className="tb-text-button"
                    disabled={busy}
                    onClick={() => void run("unblock", { user_id: b.id })}
                  >
                    {de ? "Blockierung aufheben" : "Unblock"}
                  </button>
                </div>
              ))}
            </section>
          )}
          {user && (
            <section className="tb-panel tb-account-settings">
              {snapshot.moderator && (
                <Link className="tb-text-link" href="/moderation">
                  Moderation →
                </Link>
              )}
              <h3>
                {de ? "Deine Daten gehören dir." : "Your data belongs to you."}
              </h3>
              <Link href="/privacy" className="tb-text-link">
                {de ? "Datenschutz & Einwilligung" : "Privacy & consent"} →
              </Link>
              <p className="tb-fine">
                {de
                  ? "Die Einwilligung in die Vermittlung kannst du durch Pausieren oder Kontolöschung widerrufen."
                  : "Pause matching or delete your account to withdraw matching consent."}
              </p>
              <button
                className="tb-text-button danger"
                onClick={() => setDeleting(!deleting)}
                aria-expanded={deleting}
              >
                {de ? "Konto löschen" : "Delete account"}
              </button>
              {deleting && (
                <form onSubmit={deleteAccount}>
                  <p>
                    {de
                      ? "Dein Konto, deine Inhalte sowie Testergebnisse werden unwiderruflich gelöscht. Bereits gelesene Nachrichten lassen sich nicht zurückholen."
                      : "Your account, content and test results will be permanently deleted. Messages already read cannot be recalled."}
                  </p>
                  <label className="tb-label">
                    {de
                      ? "Tippe DELETE zur Bestätigung"
                      : "Type DELETE to confirm"}
                    <input
                      value={confirmation}
                      onChange={(e) => setConfirmation(e.target.value)}
                      autoComplete="off"
                    />
                  </label>
                  <button
                    className="tb-button danger"
                    disabled={busy || confirmation !== "DELETE"}
                  >
                    {de
                      ? "Konto endgültig löschen"
                      : "Permanently delete account"}
                  </button>
                </form>
              )}
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
