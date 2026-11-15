import { useEffect, useState } from "react";
import Head from "next/head";
import { AccessGate } from "../components/v2/Shared";
import { useLocale } from "../contexts/LocaleContext";
import { errorText, v2Request } from "../lib/v2/client";
type Report = { id: string; body: string; reason: string; created_at: string };
export default function Moderation() {
  const { locale } = useLocale();
  const de = locale === "de";
  const [reports, setReports] = useState<Report[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = async () => {
    try {
      setReports(await v2Request<Report[]>("moderation"));
      setError("");
    } catch (e) {
      setError(errorText(e, locale));
    }
  };
  useEffect(() => {
    void load();
  }, []);
  const decide = async (id: string, decision: string) => {
    setBusy(true);
    try {
      await v2Request("moderate", { report_id: id, decision });
      await load();
    } catch (e) {
      setError(errorText(e, locale));
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="tb-page">
      <Head>
        <title>Moderation | TraitBridge</title>
      </Head>
      <h1>{de ? "Moderation" : "Moderation"}</h1>
      <AccessGate>
        <p>
          {de
            ? "Nur ausdrücklich freigeschaltete Moderationskonten können Meldungen lesen oder Entscheidungen treffen."
            : "Only explicitly authorised moderators can read reports or make decisions."}
        </p>
        {error && (
          <p role="alert" className="tb-error">
            {error}
          </p>
        )}
        {reports.map((r) => (
          <article className="tb-panel" key={r.id}>
            <h2>{de ? "Gemeldeter Inhalt" : "Reported content"}</h2>
            <p>{r.body}</p>
            <p>
              <strong>{de ? "Grund: " : "Reason: "}</strong>
              {r.reason}
            </p>
            <div className="tb-inline">
              {["hide", "ban", "dismiss"].map((d, i) => (
                <button
                  className="tb-button secondary small"
                  key={d}
                  disabled={busy}
                  onClick={() => {
                    if (
                      d !== "ban" ||
                      window.confirm(
                        de
                          ? "Dieses Konto für die Beta sperren?"
                          : "Ban this account from the beta?",
                      )
                    )
                      void decide(r.id, d);
                  }}
                >
                  {
                    (de
                      ? [
                          "Inhalt sperren",
                          "Nutzer sperren",
                          "Meldung schliessen",
                        ]
                      : ["Hide content", "Ban user", "Dismiss report"])[i]
                  }
                </button>
              ))}
            </div>
          </article>
        ))}
        {!reports.length && !error && (
          <p>{de ? "Keine offenen Meldungen." : "No open reports."}</p>
        )}
        <button className="tb-text-button" onClick={() => void load()}>
          {de ? "Aktualisieren" : "Refresh"}
        </button>
      </AccessGate>
    </div>
  );
}
