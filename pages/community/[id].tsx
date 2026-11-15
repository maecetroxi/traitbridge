import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useLocale } from "../../contexts/LocaleContext";
import {
  getQuestion,
  getAnswers,
  type Question,
  type Answer,
} from "../../lib/supabase-queries";
export default function LegacyQuestion() {
  const router = useRouter();
  const { locale } = useLocale();
  const de = locale === "de";
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (typeof router.query.id !== "string") return;
    void Promise.all([
      getQuestion(router.query.id),
      getAnswers(router.query.id),
    ])
      .then(([q, a]) => {
        setQuestion(q);
        setAnswers(a);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [router.query.id]);
  return (
    <div className="tb-page">
      <Head>
        <title>{(question?.title || "V1 Community") + " | TraitBridge"}</title>
      </Head>
      <span className="tb-eyebrow">
        {de
          ? "ÖFFENTLICHES V1-ARCHIV · NUR LESEN"
          : "PUBLIC V1 ARCHIVE · READ ONLY"}
      </span>
      {loading ? (
        <p role="status">{de ? "Wird geladen …" : "Loading …"}</p>
      ) : error || !question ? (
        <p role="alert">
          {de
            ? "Dieser V1-Beitrag konnte nicht geladen werden."
            : "This V1 post could not be loaded."}
        </p>
      ) : (
        <>
          <h1>{question.title}</h1>
          <article className="tb-panel tb-legacy-body">
            <p>{question.body}</p>
            <small>{question.author_profile?.display_name || "V1"}</small>
          </article>
          {answers.map((a) => (
            <article className="tb-panel tb-legacy-body" key={a.id}>
              <p>{a.body}</p>
              <small>{a.author_profile?.display_name || "V1"}</small>
            </article>
          ))}
        </>
      )}
      <p>
        {de
          ? "Dieser Austausch war in V1 öffentlich. Für neue persönliche Fragen nutze V2."
          : "This conversation was public in V1. Use V2 for new personal questions."}
      </p>
      <Link className="tb-text-link" href="/community">
        ← {de ? "V1-Beiträge" : "V1 posts"}
      </Link>
    </div>
  );
}
