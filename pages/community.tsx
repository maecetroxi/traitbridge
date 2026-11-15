import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useLocale } from "../contexts/LocaleContext";
import { getQuestions, type Question } from "../lib/supabase-queries";
export default function LegacyCommunity() {
  const { locale } = useLocale();
  const de = locale === "de";
  const [questions, setQuestions] = useState<Question[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void getQuestions()
      .then(setQuestions)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);
  return (
    <div className="tb-page">
      <Head>
        <title>V1 Community | TraitBridge</title>
      </Head>
      <span className="tb-eyebrow">
        {de ? "ÖFFENTLICHES V1-ARCHIV" : "PUBLIC V1 ARCHIVE"}
      </span>
      <h1>{de ? "Bisherige Erfahrungen" : "Past experiences"}</h1>
      <p>
        {de
          ? "Diese Beiträge wurden in V1 öffentlich veröffentlicht. Sie bleiben getrennt von deinen privaten V2-Nachrichten. Neue Fragen stellst du unter Start."
          : "These posts were publicly shared in V1. They remain separate from private V2 messages. Ask new questions in Home."}
      </p>
      <Link className="tb-button" href="/?view=discover">
        {de ? "Zu TraitBridge V2" : "Go to TraitBridge V2"} →
      </Link>
      {loading && <p role="status">{de ? "Wird geladen …" : "Loading …"}</p>}
      {error && (
        <p role="alert">
          {de
            ? "Das öffentliche Archiv konnte nicht geladen werden."
            : "The public archive could not be loaded."}
        </p>
      )}
      <div className="tb-legacy-grid">
        {questions.map((q) => (
          <Link href={`/community/${q.id}`} key={q.id} className="tb-panel">
            <h2>{q.title}</h2>
            <p>{q.body.slice(0, 220)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
