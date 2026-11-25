import { useEffect, useRef, useState, type FormEvent } from "react";
import { useBridge } from "../../contexts/BridgeContext";
import { useLocale } from "../../contexts/LocaleContext";
import { errorText, v2Request } from "../../lib/v2/client";
import { topicLabels } from "../../lib/v2/copy";
import type {
  DiscoverCursor,
  DiscoverItem,
  DiscoverKind,
  DiscoverPage,
  DiscoverPerspective,
  Topic,
} from "../../lib/v2/types";
import BlobAvatar from "./BlobAvatar";
import ExperienceForm from "./ExperienceForm";
import HelpCard from "./HelpCard";
import { DiscoverPersonality } from "./DiscoverPersonality";

type Mode = "feed" | "saved" | "own";
const actions = {
  feed: "discover_feed",
  saved: "discover_saved",
  own: "discover_own",
};

export function DiscoverList({
  owner,
  mode,
  kind,
  topic,
  perspective,
  showAllPersonalities,
}: {
  owner: string;
  mode: Mode;
  kind?: DiscoverKind;
  topic?: Topic;
  perspective?: DiscoverPerspective;
  showAllPersonalities?: () => void;
}) {
  const { locale } = useLocale();
  const { refresh } = useBridge();
  const de = locale === "de";
  const [items, setItems] = useState<DiscoverItem[]>([]);
  const [next, setNext] = useState<DiscoverCursor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);
  const request = useRef<AbortController | null>(null);
  const pagesLoaded = useRef(1);

  async function load(cursor?: DiscoverCursor, revalidate = false) {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setError(null);
    setLoading(true);
    if (!cursor && !revalidate) {
      setItems([]);
      setNext(null);
    }
    try {
      const collected: DiscoverItem[] = [];
      let after = cursor;
      let pageCount = 0;
      const target = revalidate ? pagesLoaded.current : 1;
      do {
        const result = await v2Request<DiscoverPage>(
          actions[mode],
          { kind, topic, perspective, cursor: after },
          controller.signal,
          owner,
        );
        collected.push(...result.items);
        after = result.next ?? undefined;
        pageCount++;
      } while (after && pageCount < target && !controller.signal.aborted);
      if (controller.signal.aborted) return;
      setItems((current) => (cursor ? [...current, ...collected] : collected));
      setNext(after ?? null);
      pagesLoaded.current = cursor
        ? pagesLoaded.current + pageCount
        : pageCount;
    } catch (err) {
      if (controller.signal.aborted) return;
      setItems([]);
      setNext(null);
      setError(err);
    } finally {
      if (request.current === controller) {
        request.current = null;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
  }

  useEffect(() => {
    void load();
    const recheck = () => {
      if (!request.current && document.visibilityState === "visible")
        void load(undefined, true);
    };
    document.addEventListener("visibilitychange", recheck);
    const timer = window.setInterval(recheck, 60_000);
    return () => {
      request.current?.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", recheck);
    };
    // The list mounts for a single owner, mode and filter combination.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [owner, mode, kind, topic, perspective]);

  if (error)
    return (
      <div className="tb-panel">
        <p role="alert">{errorText(error, locale)}</p>
        <button
          type="button"
          className="tb-text-button"
          onClick={() => void load()}
        >
          {de ? "Erneut laden" : "Try again"}
        </button>
      </div>
    );

  return (
    <>
      <div className="tb-entry-list" aria-busy={loading}>
        {items.map((item) => (
          <DiscoverCard
            key={item.kind + item.id}
            item={item}
            owner={owner}
            refresh={() => void load()}
            change={(patch) =>
              setItems((current) =>
                mode === "saved" && patch.bookmarked === false
                  ? current.filter(
                      (entry) =>
                        entry.kind !== item.kind || entry.id !== item.id,
                    )
                  : current.map((entry) =>
                      entry.kind === item.kind && entry.id === item.id
                        ? { ...entry, ...patch }
                        : entry,
                    ),
              )
            }
            remove={() =>
              setItems((current) =>
                current.filter(
                  (entry) => entry.kind !== item.kind || entry.id !== item.id,
                ),
              )
            }
            block={() => {
              void load();
              void refresh();
            }}
          />
        ))}
      </div>
      {!items.length && (
        <p role="status" className="tb-muted">
          {loading
            ? de
              ? "Wird geladen …"
              : "Loading …"
            : mode === "saved"
              ? de
                ? "Noch keine gemerkten Beiträge."
                : "No saved posts yet."
              : mode === "own"
                ? de
                  ? "Noch keine eigenen Erfahrungen."
                  : "You haven’t shared any experiences yet."
                : de
                  ? "Keine Beiträge für diese Auswahl."
                  : "No posts match these filters."}
        </p>
      )}
      {!items.length && !loading && perspective && showAllPersonalities && (
        <button
          type="button"
          className="tb-text-button"
          onClick={showAllPersonalities}
        >
          {de ? "Alle Persönlichkeiten anzeigen" : "Show all personalities"}
        </button>
      )}
      {next && (
        <button
          type="button"
          className="tb-button secondary small"
          disabled={loading}
          onClick={() => void load(next)}
        >
          {de ? "Weitere Beiträge" : "More posts"}
        </button>
      )}
    </>
  );
}

function DiscoverCard({
  item,
  owner,
  refresh,
  change,
  remove,
  block,
}: {
  item: DiscoverItem;
  owner: string;
  refresh: () => void;
  change: (patch: Partial<DiscoverItem>) => void;
  remove: () => void;
  block: () => void;
}) {
  const { locale } = useLocale();
  const de = locale === "de";
  const own = item.author.id === owner;
  const experience = item.kind === "experience";
  const visible = item.status !== "hidden";
  const [editing, setEditing] = useState(false);
  const [answering, setAnswering] = useState(false);
  const [safety, setSafety] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function act(
    action: string,
    data: Record<string, unknown>,
    finished: () => void,
  ) {
    if (busy) return;
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await v2Request(
        action,
        { id: item.id, kind: item.kind, ...data },
        undefined,
        owner,
      );
      finished();
    } catch (err) {
      if (
        err instanceof Error &&
        [
          "NOT_FOUND",
          "AUTH_REQUIRED",
          "BETA_REQUIRED",
          "ONBOARDING_REQUIRED",
        ].includes(err.message)
      )
        refresh();
      else setError(errorText(err, locale));
    } finally {
      setBusy(false);
    }
  }

  function report(event: FormEvent) {
    event.preventDefault();
    void act(
      experience ? "experience_report" : "report",
      { reason, question_id: item.id },
      () => {
        setSafety(false);
        setReason("");
        setNotice(de ? "Meldung gespeichert." : "Report submitted.");
      },
    );
  }

  if (editing) {
    return (
      <ExperienceForm
        owner={owner}
        item={item}
        close={() => setEditing(false)}
        saved={refresh}
      />
    );
  }

  if (answering) {
    return (
      <article className="tb-panel tb-entry">
        <button
          className="tb-text-button"
          type="button"
          onClick={() => setAnswering(false)}
        >
          {de ? "Zurück zur Frage" : "Back to question"}
        </button>
        <HelpCard question={item} onNext={refresh} onBlocked={block} />
      </article>
    );
  }

  return (
    <article className="tb-panel tb-entry">
      <div className="tb-person">
        <BlobAvatar config={item.author.avatar} size={42} />
        <div>
          <strong>{item.author.pseudonym}</strong>
          <span>
            {experience
              ? de
                ? "Erfahrung"
                : "Experience"
              : de
                ? "Frage"
                : "Question"}{" "}
            · {topicLabels[locale][item.topic]}
          </span>
        </div>
      </div>
      {item.title && <h3>{item.title}</h3>}
      <p className="tb-entry-body">{item.body}</p>
      {item.personality && (
        <DiscoverPersonality personality={item.personality} />
      )}
      {!visible && <p className="tb-fine">{de ? "Ausgeblendet" : "Hidden"}</p>}
      <div className="tb-inline tb-entry-actions">
        {item.can_answer && (
          <button
            type="button"
            className="tb-button secondary small"
            onClick={() => setAnswering(true)}
          >
            {de ? "Auf die Frage antworten" : "Reply to question"}
          </button>
        )}
        {visible && (
          <button
            type="button"
            className="tb-button secondary small"
            disabled={busy}
            aria-pressed={item.bookmarked}
            onClick={() =>
              void act("discover_bookmark", { enabled: !item.bookmarked }, () =>
                change({ bookmarked: !item.bookmarked }),
              )
            }
          >
            {item.bookmarked
              ? de
                ? "Gemerkt"
                : "Saved"
              : de
                ? "Merken"
                : "Save"}
          </button>
        )}
        {!own && experience && (
          <button
            type="button"
            className="tb-button secondary small"
            disabled={busy}
            aria-pressed={item.helpful}
            onClick={() =>
              void act("experience_helpful", { enabled: !item.helpful }, () =>
                change({ helpful: !item.helpful }),
              )
            }
          >
            {de ? "Hat mir geholfen" : "This helped me"}
          </button>
        )}
        {!own && (
          <button
            type="button"
            className="tb-text-button"
            aria-expanded={safety}
            onClick={() => setSafety(!safety)}
          >
            {de ? "Melden / blockieren" : "Report / block"}
          </button>
        )}
        {own && !experience && (
          <button
            type="button"
            className="tb-text-button"
            disabled={busy}
            onClick={() => void act("discover_unshare", {}, remove)}
          >
            {de ? "Freigabe zurückziehen" : "Unshare question"}
          </button>
        )}
        {own && experience && (
          <>
            {visible && (
              <button
                type="button"
                className="tb-text-button"
                onClick={() => setEditing(true)}
              >
                {de ? "Bearbeiten" : "Edit"}
              </button>
            )}
            <button
              type="button"
              className="tb-text-button"
              disabled={busy}
              onClick={() => {
                if (
                  window.confirm(
                    de ? "Diesen Beitrag löschen?" : "Delete this post?",
                  )
                )
                  void act("experience_delete", {}, remove);
              }}
            >
              {de ? "Löschen" : "Delete"}
            </button>
          </>
        )}
      </div>
      {safety && (
        <form className="tb-entry-report" onSubmit={report}>
          <label className="tb-label">
            {de ? "Grund der Meldung" : "Reason for reporting"}
            <textarea
              name="reason"
              required
              minLength={3}
              maxLength={1000}
              rows={2}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
            />
          </label>
          <div className="tb-inline">
            <button className="tb-button small" disabled={busy}>
              {de ? "Meldung senden" : "Send report"}
            </button>
            <button
              type="button"
              className="tb-button secondary small"
              disabled={busy}
              onClick={() => void act("discover_block", {}, block)}
            >
              {de ? "Person blockieren" : "Block person"}
            </button>
          </div>
        </form>
      )}
      {notice && (
        <p role="status" className="tb-fine">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="tb-error">
          {error}
        </p>
      )}
    </article>
  );
}
