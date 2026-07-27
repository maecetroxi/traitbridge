import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useLocale } from "../../contexts/LocaleContext";
import { sanitizeStoredResults, STORAGE_KEY_FULL } from "../../lib/bigfive-results";
import {
  NEUTRAL_PERSONALITY_SCORES,
  PERSONALITY_TRAITS,
  type PersonalityAdviceResponse,
} from "../../lib/personality-guide";
import { personalityGuideCopy } from "../../lib/personality-guide-copy";
import type { BigFiveScores } from "../../components/PersonalityBadge";
import styles from "../../styles/PersonalityGuide.module.css";

const PersonalityGuidePage: React.FC = () => {
  const { locale } = useLocale();
  const copy = personalityGuideCopy[locale];
  const [scores, setScores] = useState<BigFiveScores>({ ...NEUTRAL_PERSONALITY_SCORES });
  const [hasTestProfile, setHasTestProfile] = useState(false);
  const [question, setQuestion] = useState("");
  const [advice, setAdvice] = useState<PersonalityAdviceResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    try {
      const rawResults = window.localStorage.getItem(STORAGE_KEY_FULL);
      const storedResults = rawResults ? sanitizeStoredResults(JSON.parse(rawResults)) : null;

      if (storedResults) {
        setScores(storedResults.scores);
        setHasTestProfile(true);
      }
    } catch {
      setScores({ ...NEUTRAL_PERSONALITY_SCORES });
      setHasTestProfile(false);
    }
  }, []);

  const handleScoreChange = (trait: keyof BigFiveScores, value: number) => {
    setScores((currentScores) => ({ ...currentScores, [trait]: value }));
    setAdvice(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();

    if (trimmedQuestion.length < 10 || trimmedQuestion.length > 500) {
      setError(copy.errors.invalid_request);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setAdvice(null);

    try {
      const response = await fetch("/api/personality-advice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: trimmedQuestion, language: locale, scores }),
      });
      const responseBody = await response.json();

      if (!response.ok) {
        const code = typeof responseBody?.code === "string" ? responseBody.code : "generic";
        setError(copy.errors[code as keyof typeof copy.errors] || copy.errors.generic);
        return;
      }

      setAdvice(responseBody as PersonalityAdviceResponse);
    } catch {
      setError(copy.errors.generic);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Head>
        <title>{copy.metaTitle} | TraitBridge</title>
        <meta name="description" content={copy.intro} />
      </Head>

      <div className={styles.page}>
        <header className={styles.hero}>
          <span className={styles.kicker}>{copy.kicker}</span>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
        </header>

        <section className={styles.profilePanel}>
          <div className={styles.profileHeading}>
            <div>
              <h2>{copy.profileTitle}</h2>
              <p>{hasTestProfile ? copy.profileFromTest : copy.profileManual}</p>
            </div>
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => {
                setScores({ ...NEUTRAL_PERSONALITY_SCORES });
                setHasTestProfile(false);
                setAdvice(null);
              }}
            >
              {copy.resetProfile}
            </button>
          </div>

          <div className={styles.traitGrid}>
            {PERSONALITY_TRAITS.map((trait) => {
              const traitCopy = copy.traits[trait];
              return (
                <label key={trait} className={styles.traitControl}>
                  <span className={styles.traitHeader}>
                    <strong>{traitCopy.label}</strong>
                    <output>{scores[trait].toFixed(1)}</output>
                  </span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={scores[trait]}
                    onChange={(event) => handleScoreChange(trait, Number(event.target.value))}
                  />
                  <span className={styles.traitEnds}>
                    <span>{traitCopy.low}</span>
                    <span>{traitCopy.high}</span>
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <form className={styles.searchPanel} onSubmit={handleSubmit}>
          <label htmlFor="personality-question">{copy.questionLabel}</label>
          <div className={styles.searchBox}>
            <textarea
              id="personality-question"
              rows={2}
              maxLength={500}
              value={question}
              placeholder={copy.questionPlaceholder}
              onChange={(event) => {
                setQuestion(event.target.value);
                setAdvice(null);
                setError(null);
              }}
            />
            <button type="submit" disabled={isSubmitting || question.trim().length < 10}>
              {isSubmitting ? copy.submitting : copy.submit}
            </button>
          </div>
          <div className={styles.questionMeta}>
            <span>{copy.questionHint}</span>
            <span>{question.length}/500</span>
          </div>

          <div className={styles.suggestions}>
            <span>{copy.suggestionsLabel}</span>
            <div>
              {copy.suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => {
                    setQuestion(suggestion);
                    setAdvice(null);
                    setError(null);
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </form>

        {error && <div className={styles.errorBox}>{error}</div>}

        {advice && (
          <section className={styles.answerPanel} aria-live="polite">
            <span className={styles.answerKicker}>{copy.answerKicker}</span>
            <h2>{copy.answerTitle}</h2>
            <p className={styles.summary}>{advice.summary}</p>
            <h3>{copy.insightsTitle}</h3>
            <ol>
              {advice.insights.map((insight) => <li key={insight}>{insight}</li>)}
            </ol>
            <p className={styles.disclaimer}>{advice.disclaimer}</p>
          </section>
        )}

        <p className={styles.privacyNote}>
          {copy.scope}{" "}
          {copy.privacy}{" "}
          <a
            href="https://platform.openai.com/docs/models/default-usage-policies-by-endpoint"
            target="_blank"
            rel="noreferrer"
          >
            {copy.privacyLink}
          </a>
        </p>
      </div>
    </>
  );
};

export default PersonalityGuidePage;
