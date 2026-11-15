import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useLocale } from "../../contexts/LocaleContext";
import {
  BIG_FIVE_TRAITS,
  LEARNING_CATEGORIES,
  filterLearningTopics,
  type BigFiveTrait,
  type LearningCategory,
  type TraitLevel,
} from "../../lib/learning-content";
import { learningHubCopy } from "../../lib/learning-hub-copy";
import styles from "../../styles/LearningArticles.module.css";

type ReadingMode = "mirror" | "growth";
const PAGE_SIZE = 6;

export default function LearningArticlesPage() {
  const { locale, copy } = useLocale();
  const pageCopy = learningHubCopy[locale].articles;
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<LearningCategory | "all">("all");
  const [trait, setTrait] = useState<BigFiveTrait | "all">("all");
  const [level, setLevel] = useState<TraitLevel | "all">("all");
  const [mode, setMode] = useState<ReadingMode>("mirror");
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);

  const topics = useMemo(
    () => filterLearningTopics(category, search, trait, level),
    [category, level, search, trait],
  );
  const visibleTopics = topics.slice(0, visibleLimit);

  useEffect(() => {
    setVisibleLimit(PAGE_SIZE);
  }, [category, level, search, trait]);

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setTrait("all");
    setLevel("all");
  };

  const traitLevelLabel = (value: TraitLevel) =>
    value === "low"
      ? pageCopy.low
      : value === "high"
        ? pageCopy.high
        : pageCopy.both;

  return (
    <>
      <Head>
        <title>{`${pageCopy.metaTitle} | TraitBridge`}</title>
        <meta key="og-title" property="og:title" content={`${pageCopy.metaTitle} | TraitBridge`} />
        <meta key="og-description" property="og:description" content={pageCopy.intro} />
        <meta name="description" content={pageCopy.intro} />
      </Head>

      <div className={styles.page}>
        <Link href="/learn" className={styles.backLink}>
          ← {pageCopy.back}
        </Link>

        <header className={styles.hero}>
          <span className="page-kicker">{pageCopy.kicker}</span>
          <h1>{pageCopy.title}</h1>
          <p>{pageCopy.intro}</p>
        </header>

        <section className={styles.controls} aria-label={pageCopy.metaTitle}>
          <div className={styles.quickStarts}>
            <strong>{pageCopy.quickStart}</strong>
            <div>
              {(["decisions", "communication", "stress", "work"] as const).map(
                (value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={category === value}
                    onClick={() => setCategory(value)}
                  >
                    {copy.learn.categories[value]}
                  </button>
                ),
              )}
            </div>
          </div>

          <label className={styles.search}>
            <span>{pageCopy.searchLabel}</span>
            <input
              type="search"
              value={search}
              placeholder={pageCopy.searchPlaceholder}
              onChange={(event) => setSearch(event.target.value)}
            />
          </label>

          <details className={styles.advancedFilters}>
            <summary>{pageCopy.advancedFilters}</summary>

          <div className={styles.filterBlock}>
            <strong>{pageCopy.situationLabel}</strong>
            <div className={styles.chips} role="group" aria-label={pageCopy.situationLabel}>
              <button
                type="button"
                aria-pressed={category === "all"}
                onClick={() => setCategory("all")}
              >
                {pageCopy.allSituations}
              </button>
              {LEARNING_CATEGORIES.map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={category === value}
                  onClick={() => setCategory(value)}
                >
                  {copy.learn.categories[value]}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.filterGrid}>
            <div className={styles.filterBlock}>
              <strong>{pageCopy.traitLabel}</strong>
              <div className={styles.chips} role="group" aria-label={pageCopy.traitLabel}>
                <button
                  type="button"
                  aria-pressed={trait === "all"}
                  onClick={() => setTrait("all")}
                >
                  {pageCopy.allTraits}
                </button>
                {BIG_FIVE_TRAITS.map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={trait === value}
                    onClick={() => setTrait(value)}
                  >
                    {copy.traits[value]}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.filterBlock}>
              <strong>{pageCopy.poleLabel}</strong>
              <div className={styles.chips} role="group" aria-label={pageCopy.poleLabel}>
                {(["all", "low", "high", "both"] as const).map((value) => (
                  <button
                    key={value}
                    type="button"
                    aria-pressed={level === value}
                    onClick={() => setLevel(value)}
                  >
                    {value === "all" ? pageCopy.allPoles : traitLevelLabel(value)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.modeBlock}>
            <strong>{pageCopy.perspectiveLabel}</strong>
            <div className={styles.modeSwitch} role="group" aria-label={pageCopy.perspectiveLabel}>
              {(["mirror", "growth"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={mode === value}
                  onClick={() => setMode(value)}
                >
                  <span>{pageCopy[value]}</span>
                  <small>{pageCopy[`${value}Text`]}</small>
                </button>
              ))}
            </div>
          </div>
          </details>
        </section>

        {(search || category !== "all" || trait !== "all" || level !== "all") && (
          <div className={styles.activeFilters} aria-label={pageCopy.clear}>
            <span>{pageCopy.activeFilters}</span>
            {search && <strong>“{search}”</strong>}
            {category !== "all" && <strong>{copy.learn.categories[category]}</strong>}
            {trait !== "all" && <strong>{copy.traits[trait]}</strong>}
            {level !== "all" && <strong>{traitLevelLabel(level)}</strong>}
            <button type="button" onClick={clearFilters}>{pageCopy.clear}</button>
          </div>
        )}

        <div className={styles.resultLine} aria-live="polite">
          <span>
            {topics.length} {pageCopy.results}
          </span>
        </div>

        {topics.length === 0 ? (
          <div className={styles.empty}>
            <strong>{pageCopy.noResults}</strong>
            <p>{pageCopy.noResultsText}</p>
            <button type="button" onClick={clearFilters}>
              {pageCopy.clear}
            </button>
          </div>
        ) : (
          <section className={styles.grid} aria-label={pageCopy.results}>
            {visibleTopics.map((topic) => {
              const primaryRelevance = topic.traitRelevance[0];
              return (
                <article key={topic.slug} className={styles.card}>
                  <div className={styles.cardCategories}>
                    {topic.categories.slice(0, 2).map((value) => (
                      <span key={value}>{copy.learn.categories[value]}</span>
                    ))}
                  </div>
                  <div className={styles.traitTags}>
                    {topic.traitRelevance.map((relevance) => (
                      <span key={`${relevance.trait}-${relevance.level}`}>
                        {traitLevelLabel(relevance.level)} · {copy.traits[relevance.trait]}
                      </span>
                    ))}
                  </div>
                  <h2>{topic.title[locale]}</h2>
                  <p>{topic.summary[locale]}</p>
                  <aside>
                    <strong>
                      {mode === "mirror" ? pageCopy.mirrorReason : pageCopy.growthReason}
                    </strong>
                    <span>
                      {mode === "mirror"
                        ? primaryRelevance.description[locale]
                        : topic.actions[locale][0]}
                    </span>
                  </aside>
                  <Link href={`/learn/${topic.slug}`}>{pageCopy.open} →</Link>
                </article>
              );
            })}
          </section>
        )}

        {visibleLimit < topics.length && (
          <button
            type="button"
            className={styles.showMore}
            onClick={() => setVisibleLimit((current) => current + PAGE_SIZE)}
          >
            {pageCopy.showMore}
          </button>
        )}

        <aside className={styles.community}>
          <div>
            <span className="page-kicker">{pageCopy.communityTitle}</span>
            <p>{pageCopy.communityText}</p>
          </div>
          <Link
            href={{
              pathname: "/community",
              query: { category: "self-understanding" },
            }}
          >
            {pageCopy.communityAction} →
          </Link>
        </aside>
      </div>
    </>
  );
}
