import { useCallback, useEffect, useState } from "react";
import Head from "next/head";
import { AccessGate } from "../components/v2/Shared";
import { useAuth } from "../contexts/AuthContext";
import { useBridge } from "../contexts/BridgeContext";
import { useLocale } from "../contexts/LocaleContext";
import { errorText, v2Request } from "../lib/v2/client";

type Kind = "question" | "answer" | "experience";
type Content = {
  id: string;
  kind: Kind;
  body: string;
  title: string | null;
  created_at: string;
};
type Report = Content & {
  reason: string;
  author_pseudonym: string;
  can_suspend: boolean;
  content_status: string;
  resolution: string | null;
  resolved_at: string | null;
};
type Dashboard = {
  open_count: number;
  reports: Report[];
  recent: Report[];
  hidden: Content[];
  accounts: { id: string; pseudonym: string }[];
};
type View = "open" | "recent" | "hidden" | "accounts";

function isReport(entry: Content): entry is Report {
  return "reason" in entry;
}

export default function Moderation() {
  const { user } = useAuth();
  const { snapshot } = useBridge();
  const { locale } = useLocale();
  const de = locale === "de";
  return (
    <div className="tb-page tb-moderation">
      <Head>
        <title>Moderation | TraitBridge</title>
      </Head>
      <h1>Moderation</h1>
      <AccessGate>
        {user && snapshot.moderator ? (
          <OperatorDashboard owner={user.id} />
        ) : (
          <p role="status">
            {de ? "Kein Moderationszugang." : "Moderator access required."}
          </p>
        )}
      </AccessGate>
    </div>
  );
}

function OperatorDashboard({ owner }: { owner: string }) {
  const { locale } = useLocale();
  const de = locale === "de";
  const [data, setData] = useState<Dashboard | null>(null);
  const [view, setView] = useState<View>("open");
  const [error, setError] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      try {
        const next = await v2Request<Dashboard>(
          "moderation_dashboard",
          {},
          signal,
          owner,
        );
        if (signal?.aborted) return;
        setData(next);
        setError(null);
      } catch (err) {
        if (signal?.aborted) return;
        setData(null);
        setError(err);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [owner],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  async function act(
    action: string,
    input: Record<string, unknown>,
    confirmation?: string,
  ) {
    if (busy || (confirmation && !window.confirm(confirmation))) return;
    setBusy(true);
    setError(null);
    setMessage("");
    try {
      await v2Request(action, input, undefined, owner);
      await load();
      setMessage(de ? "Entscheidung gespeichert." : "Decision saved.");
    } catch (err) {
      if (
        err instanceof Error &&
        ["FORBIDDEN", "AUTH_REQUIRED"].includes(err.message)
      )
        setData(null);
      setError(err);
    } finally {
      setBusy(false);
    }
  }

  const kinds = de
    ? { question: "Frage", answer: "Antwort", experience: "Erfahrung" }
    : { question: "Question", answer: "Reply", experience: "Experience" };
  const resolutions: Record<string, string> = de
    ? {
        hidden: "Inhalt ausgeblendet",
        dismissed: "Ohne Massnahme abgeschlossen",
        suspended: "Konto gesperrt",
      }
    : {
        hidden: "Content hidden",
        dismissed: "Closed without action",
        suspended: "Account suspended",
      };
  const views: Record<View, string> = de
    ? {
        open: "Offen",
        recent: "Abgeschlossen",
        hidden: "Ausgeblendet",
        accounts: "Gesperrte Konten",
      }
    : {
        open: "Open",
        recent: "Closed",
        hidden: "Hidden",
        accounts: "Suspended accounts",
      };
  const date = (value: string) =>
    new Date(value).toLocaleString(de ? "de-CH" : "en-GB", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  const entries =
    view === "open"
      ? data?.reports
      : view === "recent"
        ? data?.recent
        : data?.hidden;
  const empty =
    view === "open"
      ? de
        ? "Keine offenen Meldungen."
        : "No open reports."
      : de
        ? "Keine Einträge."
        : "No entries.";

  return (
    <>
      <div className="tb-section-line tb-moderation-toolbar">
        <p role="status">
          {loading && !data
            ? de
              ? "Wird geladen …"
              : "Loading …"
            : data &&
              (de
                ? `Offene Meldungen · ${data.open_count}`
                : `Open reports · ${data.open_count}`)}
        </p>
        <button
          type="button"
          className="tb-button secondary small"
          disabled={loading || busy}
          onClick={() => void load()}
        >
          {de ? "Aktualisieren" : "Refresh"}
        </button>
      </div>
      {Boolean(error) && (
        <p role="alert" className="tb-error">
          {errorText(error, locale)}
        </p>
      )}
      {message && (
        <p role="status" className="tb-success">
          {message}
        </p>
      )}
      {data && (
        <>
          <div
            className="tb-inline tb-moderation-tabs"
            role="group"
            aria-label={de ? "Moderationsansicht" : "Moderation view"}
          >
            {(Object.keys(views) as View[]).map((tab) => (
              <button
                key={tab}
                className="tb-button secondary small"
                type="button"
                aria-pressed={view === tab}
                onClick={() => setView(tab)}
              >
                {views[tab]}
              </button>
            ))}
          </div>
          {view === "accounts" ? (
            <div className="tb-entry-list">
              {data.accounts.map((account) => (
                <article className="tb-panel tb-entry" key={account.id}>
                  <h2>{account.pseudonym}</h2>
                  <p>
                    {de ? "Für die Beta gesperrt" : "Suspended from the beta"}
                  </p>
                  <button
                    type="button"
                    className="tb-button secondary small"
                    disabled={busy}
                    onClick={() =>
                      void act(
                        "moderation_unsuspend",
                        { id: account.id },
                        de
                          ? "Sperre aufheben und den Beta-Zugang wiederherstellen?"
                          : "Lift the suspension and restore beta access?",
                      )
                    }
                  >
                    {de ? "Sperre aufheben" : "Lift suspension"}
                  </button>
                </article>
              ))}
              {!data.accounts.length && <p>{empty}</p>}
            </div>
          ) : (
            <div className="tb-entry-list">
              {entries?.map((entry) => {
                const report = isReport(entry) ? entry : null;
                return (
                  <article
                    className="tb-panel tb-entry"
                    key={entry.kind + entry.id}
                  >
                    <div className="tb-section-line">
                      <h2>
                        {report
                          ? de
                            ? `Gemeldete ${kinds[entry.kind]}`
                            : `Reported ${kinds[entry.kind].toLowerCase()}`
                          : kinds[entry.kind]}
                      </h2>
                      <span className="tb-fine">
                        {view === "recent" && report?.resolution
                          ? resolutions[report.resolution]
                          : views[view]}
                      </span>
                    </div>
                    {report && (
                      <p className="tb-fine">
                        {de ? "Verfasst von" : "By"} {report.author_pseudonym} ·{" "}
                        {de ? "Gemeldet am" : "Reported on"}{" "}
                        <time dateTime={entry.created_at}>
                          {date(entry.created_at)}
                        </time>
                        {report.content_status === "hidden" &&
                          (de ? " · Inhalt ausgeblendet" : " · Content hidden")}
                        {report.content_status === "deleted" &&
                          (de ? " · Inhalt gelöscht" : " · Content deleted")}
                      </p>
                    )}
                    {entry.title && <h3>{entry.title}</h3>}
                    <p className="tb-entry-body">{entry.body}</p>
                    {report && (
                      <p>
                        <strong>{de ? "Grund" : "Reason"}</strong> ·{" "}
                        {report.reason}
                      </p>
                    )}
                    {view === "open" && report && (
                      <div className="tb-inline">
                        {report.content_status !== "deleted" && (
                          <>
                            <button
                              className="tb-button secondary small"
                              type="button"
                              disabled={
                                busy || report.content_status === "hidden"
                              }
                              onClick={() =>
                                void act(
                                  "moderate",
                                  {
                                    report_id: entry.id,
                                    kind: entry.kind,
                                    decision: "hide",
                                  },
                                  de
                                    ? "Diesen Inhalt für Mitglieder ausblenden?"
                                    : "Hide this content from members?",
                                )
                              }
                            >
                              {de ? "Inhalt ausblenden" : "Hide content"}
                            </button>
                            {report.can_suspend && (
                              <button
                                className="tb-button secondary small"
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  void act(
                                    "moderate",
                                    {
                                      report_id: entry.id,
                                      kind: entry.kind,
                                      decision: "ban",
                                    },
                                    de
                                      ? `„${report.author_pseudonym}“ für die Beta sperren?`
                                      : `Suspend “${report.author_pseudonym}” from the beta?`,
                                  )
                                }
                              >
                                {de ? "Konto sperren" : "Suspend account"}
                              </button>
                            )}
                          </>
                        )}
                        <button
                          className="tb-text-button"
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            void act("moderate", {
                              report_id: entry.id,
                              kind: entry.kind,
                              decision: "dismiss",
                            })
                          }
                        >
                          {de
                            ? "Ohne Massnahme abschliessen"
                            : "Close without action"}
                        </button>
                      </div>
                    )}
                    {view === "hidden" && (
                      <button
                        className="tb-button secondary small"
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          void act(
                            "moderation_restore",
                            { id: entry.id, kind: entry.kind },
                            de
                              ? "Inhalt mit seiner bisherigen Sichtbarkeit wieder freigeben?"
                              : "Restore the content with its previous visibility?",
                          )
                        }
                      >
                        {de ? "Wieder freigeben" : "Restore"}
                      </button>
                    )}
                  </article>
                );
              })}
              {!entries?.length && <p>{empty}</p>}
            </div>
          )}
        </>
      )}
    </>
  );
}
