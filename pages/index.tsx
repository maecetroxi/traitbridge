import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useLocale } from "../contexts/LocaleContext";
import { loadPreferredStoredResults } from "../lib/bigfive-results";
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
      setHasLocalResult(Boolean(loadPreferredStoredResults(window.localStorage)));
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
      href: "/learn",
      title: copy.home.learnTitle,
      description: copy.home.learnDescription,
      action: copy.home.learnAction,
      tone: styles.learnCard,
    },
    {
      href: "/community",
      title: copy.home.communityTitle,
      description: copy.home.communityDescription,
      action: copy.home.communityAction,
      tone: styles.communityCard,
    },
  ];

  return (
    <>
      <Head>
        <title>{`TraitBridge | ${copy.home.title}`}</title>
        <meta key="og-title" property="og:title" content={`TraitBridge | ${copy.home.title}`} />
        <meta key="og-description" property="og:description" content={copy.home.pageDescription} />
        <meta name="description" content={copy.home.pageDescription} />
      </Head>

      <div className={styles.page}>
        <section className={styles.intro}>
          <span className="page-kicker">TraitBridge</span>
          <h1>
            <span>{copy.home.titleLines[0]}</span>{" "}
            <span>{copy.home.titleLines[1]}</span>
          </h1>
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
      </div>
    </>
  );
};

export default HomePage;
