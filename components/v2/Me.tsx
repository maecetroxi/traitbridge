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
import { ModerationLink } from "./ModerationLink";

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
      setMessage(de ? "Gespeichert." : "Saved.");
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
          {de ? "Mein Profil | TraitBridge" : "My profile | TraitBridge"}
        </title>
      </Head>
      <div className="tb-page-heading">
        <h1>{de ? "Mein Profil" : "My profile"}</h1>
        {user && (
          <button
            className="tb-text-button"
            onClick={() =>
              void signOut().catch((err) => setError(errorText(err, locale)))
            }
          >
            {de ? "Abmelden" : "Sign out"}
          </button>
        )}
      </div>
      {snapshot.moderator && user && <ModerationLink owner={user.id} />}
      <div className="tb-me-grid">
        <section className="tb-me-aside">
          <AccessGate>
            {draft && (
              <details className="tb-panel tb-me-fold">
                <summary>
                  <BlobAvatar config={snapshot.profile?.avatar} size={40} />
                  <span>{snapshot.profile?.pseudonym}</span>
                  <small>{de ? "Profil bearbeiten" : "Edit profile"}</small>
                </summary>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void run("preferences", { ...draft });
                  }}
                >
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
                    {de
                      ? "Sprache für die Vermittlung"
                      : "Language for matching"}
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
                            ? "Meine Erfahrungsthemen"
                            : "My experience topics"}
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
                          setDraft({
                            ...draft,
                            notifications: e.target.checked,
                          })
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
                            ? "Für neue Antworten, Dankesnachrichten und vermittelte Fragen."
                            : "For new replies, thank-you messages and matching questions."}
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
              </details>
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
          {snapshot.profile && (
            <section className="tb-panel tb-profile-panel">
              <h2>{de ? "Meine Persönlichkeit" : "My personality"}</h2>
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
            <h2>{de ? "Tests und Lernen" : "Tests and learning"}</h2>
            {[
              {
                href: "/test",
                title: de ? "Persönlichkeitstest" : "Personality assessment",
              },
              {
                href: "/learn",
                title: de ? "Lernen" : "Learn",
              },
              {
                href: "/learn/library?type=nonfiction",
                title: de ? "Buchempfehlungen" : "Book recommendations",
              },
              {
                href: "/background",
                title: de
                  ? "Wissenschaftlicher Hintergrund"
                  : "Scientific background",
              },
            ].map((item) => (
              <Link key={item.href} href={item.href}>
                <div>
                  <strong>{item.title}</strong>
                </div>
                <Icon name="arrow" size={19} />
              </Link>
            ))}
          </section>
        </section>
        <aside className="tb-me-aside">
          {snapshot.profile && user && (
            <DiscoverPersonalitySetting
              owner={user.id}
              shared={snapshot.profile.discover_personality_shared === true}
            />
          )}
          {snapshot.profile && user && (
            <section className="tb-panel tb-saved-posts">
              <h2>
                <button
                  className="tb-text-button"
                  type="button"
                  aria-expanded={showSaved}
                  onClick={() => setShowSaved(!showSaved)}
                >
                  {de ? "Gemerkte Beiträge" : "Saved posts"}
                </button>
              </h2>
              {showSaved && <DiscoverList owner={user.id} mode="saved" />}
              <Link className="tb-text-link" href="/discover?view=mine">
                {de ? "Meine Erfahrungen" : "My experiences"}
              </Link>
            </section>
          )}
          {snapshot.blocks.length > 0 && (
            <section className="tb-panel">
              <h2>{de ? "Blockierte Personen" : "Blocked people"}</h2>
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
              <h2>{de ? "Einstellungen" : "Settings"}</h2>
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
