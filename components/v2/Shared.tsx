import Link from "next/link";
import { useAuth } from "../../contexts/AuthContext";
import { useBridge } from "../../contexts/BridgeContext";
import { useLocale } from "../../contexts/LocaleContext";
import { errorText, v2Request } from "../../lib/v2/client";
import { generateAvatar, avatarColors } from "../../lib/v2/avatar";
import type { AvatarConfig, Question } from "../../lib/v2/types";
import BlobAvatar from "./BlobAvatar";
import { useState } from "react";

export function AccessGate({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const { snapshot, loading, error, refresh } = useBridge();
  const { locale } = useLocale();
  const de = locale === "de";
  if (authLoading || (loading && !snapshot.profile))
    return (
      <div className="tb-empty" role="status">
        {de ? "Einen Moment …" : "One moment …"}
      </div>
    );
  if (!user || user.is_anonymous)
    return (
      <div className="tb-empty">
        <BlobAvatar size={90} />
        <h2>
          {de
            ? "Hier beginnt dein Austausch."
            : "Your conversations begin here."}
        </h2>
        <p>
          {de
            ? "Melde dich an, damit deine Fragen und Antworten privat bei dir ankommen."
            : "Sign in to receive your questions and replies privately."}
        </p>
        <Link className="tb-button" href="/login?returnTo=%2Fonboarding">
          {de ? "Anmelden & kennenlernen" : "Sign in & get started"}
        </Link>
      </div>
    );
  if (error)
    return (
      <div className="tb-empty">
        <BlobAvatar size={90} />
        <h2>
          {de ? "Ein kleiner Kreis zum Start." : "A small circle to start."}
        </h2>
        <p role="status">{errorText(error, locale)}</p>
        <button className="tb-button secondary" onClick={() => void refresh()}>
          {de ? "Erneut prüfen" : "Try again"}
        </button>
        <Link className="tb-text-link" href="/test?short=1">
          {de ? "Kurztest ausprobieren" : "Try the quick test"}
        </Link>
      </div>
    );
  if (!snapshot.profile)
    return (
      <div className="tb-empty">
        <BlobAvatar size={90} />
        <h2>
          {de ? "Lernen wir dich ein wenig kennen." : "Let’s get to know you."}
        </h2>
        <p>
          {de
            ? "Zehn Aussagen, ein kleiner Avatar – und schon kannst du mitmachen."
            : "Ten statements, a little avatar, and you’re ready to join."}
        </p>
        <Link className="tb-button" href="/onboarding">
          {de ? "Los geht’s" : "Let’s go"}
        </Link>
      </div>
    );
  return <>{children}</>;
}
export function AvatarEditor({
  value,
  onChange,
}: {
  value: AvatarConfig;
  onChange: (v: AvatarConfig) => void;
}) {
  const { locale } = useLocale();
  const de = locale === "de";
  return (
    <div className="tb-avatar-editor">
      <div className="tb-avatar-stage">
        <BlobAvatar config={value} size={150} />
      </div>
      <button
        type="button"
        className="tb-button secondary"
        onClick={() => onChange(generateAvatar(crypto.randomUUID()))}
      >
        {de ? "Neu mischen" : "Shuffle"}
      </button>
      <fieldset>
        <legend>{de ? "Deine Farbe" : "Your colour"}</legend>
        <div className="tb-colors">
          {avatarColors.map((color, i) => (
            <button
              type="button"
              key={color}
              style={{ background: color }}
              aria-label={`${de ? "Farbe" : "Colour"} ${i + 1}`}
              aria-pressed={value.color === i}
              onClick={() => onChange({ ...value, color: i })}
            >
              {value.color === i ? "✓" : ""}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="tb-avatar-selects">
        {(["shape", "eyes", "mouth", "detail"] as const).map((key, i) => (
          <label key={key}>
            {
              (de
                ? ["Form", "Augen", "Mund", "Detail"]
                : ["Shape", "Eyes", "Mouth", "Detail"])[i]
            }
            <select
              value={value[key]}
              onChange={(e) =>
                onChange({ ...value, [key]: Number(e.target.value) })
              }
            >
              {Array.from({ length: key === "detail" ? 4 : 3 }, (_, n) => (
                <option value={n} key={n}>
                  {n + 1}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>
    </div>
  );
}
export function SafetyActions({
  question,
  answerId,
  userId,
}: {
  question: Question;
  answerId?: string;
  userId?: string;
}) {
  const { locale } = useLocale();
  const { refresh } = useBridge();
  const de = locale === "de";
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (action: string) => {
    setBusy(true);
    setMessage("");
    try {
      await v2Request(
        action,
        action === "report"
          ? { question_id: question.id, answer_id: answerId, reason }
          : { user_id: userId || question.author.id },
      );
      setMessage(
        de
          ? action === "report"
            ? "Deine Meldung wurde gespeichert. Das Moderationsteam kann sie prüfen."
            : "Die Person wurde blockiert."
          : action === "report"
            ? "Your report was saved for moderation."
            : "This person has been blocked.",
      );
      setOpen(false);
      await refresh();
    } catch (e) {
      setMessage(errorText(e, locale));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="tb-safety">
      <button
        type="button"
        className="tb-text-button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        {de ? "Melden / blockieren" : "Report / block"}
      </button>
      {open && (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submit("report");
          }}
        >
          <label>
            {de ? "Was ist passiert?" : "What happened?"}
            <textarea
              required
              minLength={3}
              maxLength={1000}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <div className="tb-inline">
            <button className="tb-button small" disabled={busy}>
              {de ? "Meldung absenden" : "Send report"}
            </button>
            <button
              type="button"
              className="tb-button secondary small"
              disabled={busy}
              onClick={() => void submit("block")}
            >
              {de ? "Person blockieren" : "Block person"}
            </button>
          </div>
        </form>
      )}
      {message && <p role="status">{message}</p>}
    </div>
  );
}
