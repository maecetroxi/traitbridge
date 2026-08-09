import Head from "next/head";
import Link from "next/link";
import React from "react";
import { useLocale } from "../contexts/LocaleContext";
import { learningHubCopy } from "../lib/learning-hub-copy";
import { LEARNING_TOPICS } from "../lib/learning-content";
import { getLearningResourceIndex } from "../lib/learning-resources";
import styles from "../styles/LearningHub.module.css";

const FEATURED_SLUGS = [
  "using-early-warning-sensitivity",
  "working-across-personality-differences",
  "making-quiet-influence-visible",
] as const;

export default function LearnPage() {
  const { locale, copy } = useLocale();
  const pageCopy = learningHubCopy[locale].hub;
  const resources = getLearningResourceIndex(locale);
  const articleCount = resources.filter(({ kind }) => kind === "article").length;
  const mediaCount = resources.length - articleCount;
  const featuredTopics = FEATURED_SLUGS.map((slug) =>
    LEARNING_TOPICS.find((topic) => topic.slug === slug),
  ).filter((topic): topic is (typeof LEARNING_TOPICS)[number] => Boolean(topic));

  return (
    <>
      <Head>
        <title>{pageCopy.metaTitle} | TraitBridge</title>
        <meta name="description" content={pageCopy.intro} />
      </Head>

      <div className={styles.page}>
        <header className={styles.hero}>
          <span className="page-kicker">{pageCopy.kicker}</span>
          <h1>{pageCopy.title}</h1>
          <p>{pageCopy.intro}</p>
          <aside>{pageCopy.promise}</aside>
        </header>

        <nav className={styles.areaGrid} aria-label={pageCopy.navigationLabel}>
          {pageCopy.sections.map((section) => (
            <Link key={section.id} href={section.href} className={styles.areaCard}>
              <div className={styles.areaMeta}>
                <span>{section.number}</span>
                {section.id === "articles" && (
                  <small>
                    {articleCount} {pageCopy.articleCountLabel}
                  </small>
                )}
                {section.id === "library" && (
                  <small>
                    {mediaCount} {pageCopy.mediaCountLabel}
                  </small>
                )}
              </div>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
              <strong>{section.action} →</strong>
            </Link>
          ))}
        </nav>

        <section className={styles.bridge} aria-labelledby="bridge-title">
          <div className={styles.bridgeIntro}>
            <span className="page-kicker">{pageCopy.bridgeKicker}</span>
            <h2 id="bridge-title">{pageCopy.bridgeTitle}</h2>
            <p>{pageCopy.bridgeText}</p>
            <Link href="/learn/opposites">{pageCopy.bridgeAction} →</Link>
          </div>
          <div className={styles.bridgeExample}>
            <strong>{pageCopy.bridgeTrait}</strong>
            <article>
              <span>{pageCopy.bridgeLow}</span>
              <p>{pageCopy.bridgeLowText}</p>
            </article>
            <div aria-hidden="true">
              <span />
              <strong>TraitBridge</strong>
              <span />
            </div>
            <article>
              <span>{pageCopy.bridgeHigh}</span>
              <p>{pageCopy.bridgeHighText}</p>
            </article>
          </div>
        </section>

        <section className={styles.featured} aria-labelledby="featured-title">
          <header>
            <div>
              <span className="page-kicker">{pageCopy.featuredKicker}</span>
              <h2 id="featured-title">{pageCopy.featuredTitle}</h2>
              <p>{pageCopy.featuredText}</p>
            </div>
            <Link href="/learn/articles">{pageCopy.allArticles} →</Link>
          </header>
          <div className={styles.featuredGrid}>
            {featuredTopics.map((topic) => (
              <article key={topic.slug}>
                <div>
                  {topic.traitRelevance.map((relevance) => (
                    <span key={`${relevance.trait}-${relevance.level}`}>
                      {copy.learn.traitLevels[relevance.level]} ·{" "}
                      {copy.traits[relevance.trait]}
                    </span>
                  ))}
                </div>
                <h3>{topic.title[locale]}</h3>
                <p>{topic.summary[locale]}</p>
                <Link href={`/learn/${topic.slug}`}>{copy.learn.openTopic} →</Link>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.nextGrid}>
          <article className={styles.communityCard}>
            <span className="page-kicker">{pageCopy.communityKicker}</span>
            <h2>{pageCopy.communityTitle}</h2>
            <p>{pageCopy.communityText}</p>
            <Link
              href={{
                pathname: "/community",
                query: { category: "self-understanding" },
              }}
            >
              {pageCopy.communityAction} →
            </Link>
          </article>
          <article className={styles.toolCard}>
            <span className="page-kicker">{pageCopy.toolKicker}</span>
            <h2>{pageCopy.toolTitle}</h2>
            <p>{pageCopy.toolText}</p>
            <Link href="/tools/personality-guide">{pageCopy.toolAction} →</Link>
          </article>
        </section>
      </div>
    </>
  );
}
