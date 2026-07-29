import React, { useMemo, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useLocale } from "../contexts/LocaleContext";
import {
  BIG_FIVE_TRAITS,
  LEARNING_CATEGORIES,
  filterLearningTopics,
  type BigFiveTrait,
  type LearningCategory,
  type TraitLevel,
} from "../lib/learning-content";
import styles from "../styles/LearningContent.module.css";

const LearnPage: React.FC = () => {
  const { locale, copy } = useLocale();
  const [category, setCategory] = useState<LearningCategory | "all">("all");
  const [trait, setTrait] = useState<BigFiveTrait | "all">("all");
  const [search, setSearch] = useState("");
  const visibleTopics = useMemo(
    () => filterLearningTopics(category, search, trait),
    [category, search, trait],
  );
  const traitLevelLabel = (level: TraitLevel) => copy.learn.traitLevels[level];

  return (
    <>
      <Head>
        <title>{copy.learn.title} | TraitBridge</title>
        <meta name="description" content={copy.learn.intro} />
      </Head>

      <div className={styles.page}>
        <header className={styles.hero}>
          <span className="page-kicker">{copy.learn.kicker}</span>
          <h1>{copy.learn.title}</h1>
          <p>{copy.learn.intro}</p>
          <div className={styles.trustLine}>
            <span>{copy.learn.trustEvidence}</span>
            <span>{copy.learn.trustEditorial}</span>
            <span>{copy.learn.trustNoDiagnosis}</span>
          </div>
        </header>

        <section className={styles.topicSection} aria-labelledby="learning-topics-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className="page-kicker">{copy.learn.situationsKicker}</span>
              <h2 id="learning-topics-title">{copy.learn.situationsTitle}</h2>
              <p>{copy.learn.situationsText}</p>
            </div>
            <label className={styles.search}>
              <span>{copy.learn.searchLabel}</span>
              <input
                type="search"
                value={search}
                placeholder={copy.learn.searchPlaceholder}
                onChange={(event) => setSearch(event.target.value)}
              />
            </label>
          </div>

          <div className={styles.filterArea}>
            <div className={styles.filterGroup}>
              <strong>{copy.learn.categoryFilterHeading}</strong>
              <div
                className={styles.filters}
                role="group"
                aria-label={copy.learn.categoryFilterLabel}
              >
                <button
                  type="button"
                  aria-pressed={category === "all"}
                  className={category === "all" ? styles.activeFilter : ""}
                  onClick={() => setCategory("all")}
                >
                  {copy.learn.allCategories}
                </button>
                {LEARNING_CATEGORIES.map((categoryValue) => (
                  <button
                    key={categoryValue}
                    type="button"
                    aria-pressed={category === categoryValue}
                    className={category === categoryValue ? styles.activeFilter : ""}
                    onClick={() => setCategory(categoryValue)}
                  >
                    {copy.learn.categories[categoryValue]}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterGroup}>
              <strong>{copy.learn.traitFilterHeading}</strong>
              <div
                className={styles.filters}
                role="group"
                aria-label={copy.learn.traitFilterLabel}
              >
                <button
                  type="button"
                  aria-pressed={trait === "all"}
                  className={trait === "all" ? styles.activeFilter : ""}
                  onClick={() => setTrait("all")}
                >
                  {copy.learn.allTraits}
                </button>
                {BIG_FIVE_TRAITS.map((traitValue) => (
                  <button
                    key={traitValue}
                    type="button"
                    aria-pressed={trait === traitValue}
                    className={trait === traitValue ? styles.activeFilter : ""}
                    onClick={() => setTrait(traitValue)}
                  >
                    {copy.traits[traitValue]}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.resultLine} aria-live="polite">
            {visibleTopics.length} {copy.learn.topicCountLabel}
          </div>

          {visibleTopics.length === 0 ? (
            <div className={styles.empty}>
              <strong>{copy.learn.noTopicsTitle}</strong>
              <p>{copy.learn.noTopicsText}</p>
            </div>
          ) : (
            <div className={styles.topicGrid}>
              {visibleTopics.map((topic) => (
                <article key={topic.slug} className={styles.topicCard}>
                  <div className={styles.topicMeta}>
                    {topic.categories.slice(0, 2).map((categoryValue) => (
                      <span key={categoryValue}>
                        {copy.learn.categories[categoryValue]}
                      </span>
                    ))}
                  </div>
                  <div
                    className={styles.traitMeta}
                    aria-label={copy.learn.traitRelevanceLabel}
                  >
                    {topic.traitRelevance.map((relevance) => (
                      <span
                        key={`${relevance.trait}-${relevance.level}`}
                        data-level={relevance.level}
                      >
                        {traitLevelLabel(relevance.level)} ·{" "}
                        {copy.traits[relevance.trait]}
                      </span>
                    ))}
                  </div>
                  <h3>{topic.title[locale]}</h3>
                  <p>{topic.summary[locale]}</p>
                  <Link href={`/learn/${topic.slug}`}>
                    {copy.learn.openTopic}
                    <span aria-hidden="true">→</span>
                  </Link>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className={styles.supporting} aria-labelledby="learning-more-title">
          <div className={styles.sectionHeading}>
            <div>
              <span className="page-kicker">{copy.learn.moreKicker}</span>
              <h2 id="learning-more-title">{copy.learn.moreTitle}</h2>
              <p>{copy.learn.moreText}</p>
            </div>
          </div>

          <div className={styles.supportingGrid}>
            <article className={styles.supportCard}>
              <span>{copy.learn.toolLabel}</span>
              <h3>{copy.learn.toolTitle}</h3>
              <p>{copy.learn.toolText}</p>
              <Link href="/tools/personality-guide">{copy.learn.toolAction} →</Link>
              <small>{copy.learn.toolTransparency}</small>
            </article>
            <article className={styles.supportCard}>
              <span>{copy.learn.booksLabel}</span>
              <h3>{copy.learn.booksTitle}</h3>
              <p>{copy.learn.booksText}</p>
              <Link href="/learn/books">{copy.learn.booksAction} →</Link>
              <small>{copy.learn.booksTransparency}</small>
            </article>
          </div>
        </section>
      </div>
    </>
  );
};

export default LearnPage;
