import Head from "next/head";
import Link from "next/link";
import React from "react";
import { useLocale } from "../contexts/LocaleContext";
import { learningHubCopy } from "../lib/learning-hub-copy";
import styles from "../styles/LearningHub.module.css";

export default function LearnPage() {
  const { locale } = useLocale();
  const pageCopy = learningHubCopy[locale].hub;

  return (
    <>
      <Head>
        <title>{`${pageCopy.metaTitle} | TraitBridge`}</title>
        <meta key="og-title" property="og:title" content={`${pageCopy.metaTitle} | TraitBridge`} />
        <meta key="og-description" property="og:description" content={pageCopy.intro} />
        <meta name="description" content={pageCopy.intro} />
      </Head>

      <div className={styles.page}>
        <header className={styles.hero}>
          <span className="page-kicker">{pageCopy.kicker}</span>
          <h1>
            <span>{pageCopy.titleLines[0]}</span>{" "}
            <span>{pageCopy.titleLines[1]}</span>
          </h1>
          <p>{pageCopy.intro}</p>
        </header>

        <section className={styles.start} aria-labelledby="learning-start-title">
          <header>
            <h2 id="learning-start-title">{pageCopy.startTitle}</h2>
            <p>{pageCopy.startText}</p>
          </header>
          <nav className={styles.areaGrid} aria-label={pageCopy.navigationLabel}>
            {pageCopy.sections.map((section) => (
              <Link
                key={section.id}
                href={section.href}
                className={styles.areaCard}
                data-area={section.id}
              >
                <div className={styles.areaMeta}>
                  <span>{section.number}</span>
                  <span className={styles.areaIcon} aria-hidden="true">
                    <AreaIcon area={section.id} />
                  </span>
                </div>
                <small className={styles.areaLabel}>{section.label}</small>
                <h2>{section.title}</h2>
                <p>{section.text}</p>
                <span className={styles.areaOutcome}>
                  <span aria-hidden="true">✓</span>
                  {section.outcome}
                </span>
                <strong>{section.action} →</strong>
              </Link>
            ))}
          </nav>
        </section>

        <details className={styles.bridge}>
          <summary>
            <span className="page-kicker">{pageCopy.bridgeKicker}</span>
            <strong>{pageCopy.bridgeTitle}</strong>
          </summary>
          <div className={styles.bridgeContent}>
            <div className={styles.bridgeIntro}>
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
          </div>
        </details>

      </div>
    </>
  );
}

function AreaIcon({ area }: { area: "contribution" | "opposites" | "articles" | "library" }) {
  if (area === "articles") {
    return <svg viewBox="0 0 28 28"><path d="M6 7h16M6 13h10M6 19h16" /><path d="m18 12 2 2 4-5" /></svg>;
  }

  if (area === "library") {
    return <svg viewBox="0 0 28 28"><path d="M3 6c4.5-.8 8 .2 11 2.8v14c-3-2.3-6.5-3.2-11-2.4zM25 6c-4.5-.8-8 .2-11 2.8v14c3-2.3 6.5-3.2 11-2.4z" /></svg>;
  }

  if (area === "opposites") {
    return <svg viewBox="0 0 28 28"><path d="M4 9h18m0 0-4-4m4 4-4 4M24 19H6m0 0 4-4m-4 4 4 4" /></svg>;
  }

  return <svg viewBox="0 0 28 28"><circle cx="14" cy="12" r="4" /><path d="M6 23c1.5-4.2 4.2-6.3 8-6.3s6.5 2.1 8 6.3M14 3v3M5 11H2m24 0h-3" /></svg>;
}
