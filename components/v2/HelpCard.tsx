import { useEffect, useState, useRef } from "react";
import { useLocale } from "../../contexts/LocaleContext";
import { useAuth } from "../../contexts/AuthContext";
import { useBridge } from "../../contexts/BridgeContext";
import { errorText, v2Request } from "../../lib/v2/client";
import { topicLabels, reasonLabels } from "../../lib/v2/copy";
import type { Question } from "../../lib/v2/types";
import BlobAvatar from "./BlobAvatar";
import Icon from "./Icon";
import SensitiveHint from "./SensitiveHint";
import { SafetyActions } from "./Shared";
export default function HelpCard({
  question,
  onNext,
  onBlocked,
}: {
  question: Pick<Question, "id" | "author" | "body" | "topic" | "reason">;
  onNext: () => void;
  onBlocked?: () => void;
}) {
  const { locale } = useLocale();
  const { user } = useAuth();
  const { refresh } = useBridge();
  const de = locale === "de";
  const [body, setBody] = useState("");
  const [reservation, setReservation] = useState<{
    id: string;
    expires_at: string;
  } | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [editing, setEditing] = useState(false);
  const active = useRef(true);
  const reservationRef = useRef(reservation);
  reservationRef.current = reservation;
  const key = `tb-v2-draft:${user?.id}:${question.id}`;
  useEffect(() => {
    active.current = true;
    try {
      setBody(sessionStorage.getItem(key) || "");
    } catch {}
    return () => {
      active.current = false;
      const r = reservationRef.current;
      if (r)
        void v2Request("release", { question_id: question.id }).catch(() => {});
    };
  }, [key, question.id]);
  useEffect(() => {
    if (!reservation) return;
    const timer = setInterval(() => {
      void v2Request<{ id: string; expires_at: string }>("renew", {
        question_id: question.id,
        reservation_id: reservation.id,
      })
        .then((r) => {
          if (active.current) setReservation(r);
        })
        .catch((e) => {
          if (active.current) {
            setError(errorText(e, locale));
            setReservation(null);
          }
        });
    }, 60000);
    return () => clearInterval(timer);
  }, [reservation?.id, question.id, locale]);
  const reserve = async () => {
    setEditing(true);
    setBusy(true);
    setError("");
    try {
      const r = await v2Request<{ id: string; expires_at: string }>("reserve", {
        question_id: question.id,
      });
      if (active.current) setReservation(r);
    } catch (e) {
      setError(errorText(e, locale));
    } finally {
      if (active.current) setBusy(false);
    }
  };
  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reservation) return;
    setBusy(true);
    setError("");
    try {
      await v2Request("answer", {
        question_id: question.id,
        reservation_id: reservation.id,
        body,
      });
      setReservation(null);
      try {
        sessionStorage.removeItem(key);
      } catch {
        /* The server has already saved this reply. */
      }
      setSent(true);
      await refresh();
    } catch (err) {
      setError(errorText(err, locale));
    } finally {
      setBusy(false);
    }
  };
  const skip = async () => {
    setBusy(true);
    try {
      await v2Request("skip", { question_id: question.id });
      setReservation(null);
      onNext();
    } catch (e) {
      setError(errorText(e, locale));
    } finally {
      setBusy(false);
    }
  };
  if (sent)
    return (
      <div className="tb-help-success" role="status">
        <h3>{de ? "Antwort gesendet" : "Reply sent"}</h3>
        <button className="tb-button" onClick={onNext}>
          {de ? "Nächste Frage ansehen" : "See the next question"}
          <Icon name="arrow" size={18} />
        </button>
      </div>
    );
  return (
    <>
      <div className="tb-person">
        <BlobAvatar config={question.author.avatar} size={58} />
        <div>
          <strong>{question.author.pseudonym}</strong>
          <span>{topicLabels[locale][question.topic]}</span>
        </div>
      </div>
      <blockquote className="tb-help-question">{question.body}</blockquote>
      {question.reason && (
        <p className="tb-match-reason">
          <Icon name="leaf" size={16} />
          {
            reasonLabels[locale][
              question.reason as keyof typeof reasonLabels.de
            ]
          }
        </p>
      )}
      {!editing ? (
        <div className="tb-inline">
          <button className="tb-button" onClick={() => void reserve()}>
            {de ? "Antworten" : "Reply"}
            <Icon name="arrow" size={18} />
          </button>
          <button
            className="tb-text-button"
            disabled={busy}
            onClick={() => void skip()}
          >
            {de ? "Überspringen" : "Skip"}
          </button>
        </div>
      ) : (
        <form onSubmit={send}>
          <label className="tb-label">
            {de ? "Deine Antwort" : "Your reply"}
            <textarea
              aria-label={de ? "Deine Antwort" : "Your reply"}
              autoFocus
              rows={5}
              required
              minLength={20}
              maxLength={4000}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                try {
                  sessionStorage.setItem(key, e.target.value);
                } catch {}
              }}
            />
          </label>
          <SensitiveHint text={body} />
          <p className="tb-fine">
            {de
              ? "Dein Entwurf bleibt in diesem Tab. Nur die fragende Person sieht deine Antwort."
              : "Your draft stays in this tab. Only the person asking sees your reply."}
          </p>
          <div className="tb-inline">
            <button className="tb-button" disabled={busy || !reservation}>
              {busy
                ? de
                  ? "Einen Moment …"
                  : "One moment …"
                : de
                  ? "Antwort senden"
                  : "Send reply"}
              <Icon name="send" size={17} />
            </button>
            {!reservation && !busy && (
              <button
                type="button"
                className="tb-text-button"
                onClick={() => void reserve()}
              >
                {de ? "Antwortplatz reservieren" : "Reserve a reply slot"}
              </button>
            )}
            <button
              type="button"
              className="tb-text-button"
              disabled={busy}
              onClick={() => void skip()}
            >
              {de ? "Überspringen" : "Skip"}
            </button>
          </div>
        </form>
      )}
      {error && (
        <p className="tb-error" role="alert">
          {error}
        </p>
      )}
      <SafetyActions question={question} onBlocked={onBlocked} />
    </>
  );
}
