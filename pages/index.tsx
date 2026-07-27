import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useLocale } from "../contexts/LocaleContext";
import { sanitizeStoredResults, STORAGE_KEY_FULL } from "../lib/bigfive-results";
import { formatTranslation } from "../lib/i18n";
import { getTestDraftSummary, type TestDraftSummary } from "../lib/test-draft";
import styles from "../styles/HomePage.module.css";

const HomePage: React.FC = () => {
  const { copy } = useLocale();
  const [draft, setDraft] = useState<TestDraftSummary | null>(null);
  const [hasLocalResult, setHasLocalResult] = useState(false);

  useEffect(() => {
    try {
      setDraft(getTestDraftSummary(window.localStorage));
      const rawResult = window.localStorage.getItem(STORAGE_KEY_FULL);
      setHasLocalResult(
        Boolean(rawResult && sanitizeStoredResults(JSON.parse(rawResult))),
      );
    } catch {
      setDraft(null);
      setHasLocalResult(false);
    }
  }, []);

  const options = [
    {
      href: "/test",
      title: copy.home.testTitle,
      description: copy.home.testDescription,
      action: copy.home.testAction,
      tone: styles.testCard,
    },
    {
      href: "/community",
      title: copy.home.communityTitle,
      description: copy.home.communityDescription,
      action: copy.home.communityAction,
      tone: styles.communityCard,
    },
    {
      href: "/learn",
      title: copy.home.learnTitle,
      description: copy.home.learnDescription,
      action: copy.home.learnAction,
      tone: styles.learnCard,
    },
  ];

  return (
    <>
      <Head>
        <title>TraitBridge | {copy.home.title}</title>
        <meta name="description" content={copy.home.pageDescription} />
      </Head>

      <div className={styles.page}>
        <section className={styles.intro}>
          <span className="page-kicker">TraitBridge</span>
          <h1>{copy.home.title}</h1>
          <p>{copy.home.subtitle}</p>
        </section>

        {(draft || hasLocalResult) && (
          <section className={styles.returning} aria-label={copy.home.resumeDraftTitle}>
            {draft && (
              <div>
                <span className={styles.returningLabel}>{copy.home.resumeDraftTitle}</span>
                <p>
                  {formatTranslation(copy.home.resumeDraftText, {
                    answered: String(draft.answeredCount),
                  })}
                </p>
                <Link href={`/test/full?lang=${draft.language}`} className="btn btn-primary">
                  {copy.home.resumeDraftAction}
                </Link>
              </div>
            )}
            {hasLocalResult && (
              <div>
                <span className={styles.returningLabel}>{copy.home.existingProfileTitle}</span>
                <p>{copy.home.existingProfileText}</p>
                <Link href="/results" className="btn btn-outline">
                  {copy.home.existingProfileAction}
                </Link>
              </div>
            )}
          </section>
        )}

        <section className={styles.context} aria-label={copy.home.whatTitle}>
          <div>
            <h2>{copy.home.whatTitle}</h2>
            <p>{copy.home.whatText}</p>
          </div>
          <div>
            <h2>{copy.home.registrationTitle}</h2>
            <p>{copy.home.registrationText}</p>
          </div>
        </section>

        <section className={styles.optionGrid} aria-label={copy.home.optionsLabel}>
          {options.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className={`${styles.optionCard} ${option.tone}`}
            >
              <div>
                <h2>{option.title}</h2>
                <p>{option.description}</p>
              </div>
              <span className={styles.optionAction}>
                {option.action}
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </section>
      </div>
    </>
  );
};

export default HomePage;
