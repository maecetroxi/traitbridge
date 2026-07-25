import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import type { BigFiveScores } from "../../components/PersonalityBadge";
import { useLocale } from "../../contexts/LocaleContext";
import { sanitizeStoredResults, STORAGE_KEY_FULL } from "../../lib/bigfive-results";
import { localizeBook, NEUTRAL_BOOK_PROFILE, recommendBooks, type BookKind, type RecommendationMode } from "../../lib/book-recommendations";
import { bookRecommendationsCopy } from "../../lib/book-recommendations-copy";
import styles from "../../styles/BookRecommendations.module.css";

const TRAITS: Array<keyof BigFiveScores> = ["O", "C", "E", "A", "N"];

export default function BookRecommendationsPage() {
  const { locale } = useLocale();
  const copy = bookRecommendationsCopy[locale];
  const [scores, setScores] = useState<BigFiveScores>({ ...NEUTRAL_BOOK_PROFILE });
  const [hasTestProfile, setHasTestProfile] = useState(false);
  const [mode, setMode] = useState<RecommendationMode>("mirror");
  const [kind, setKind] = useState<BookKind>("nonfiction");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY_FULL);
      const result = raw ? sanitizeStoredResults(JSON.parse(raw)) : null;
      if (result) { setScores(result.scores); setHasTestProfile(true); }
    } catch { setScores({ ...NEUTRAL_BOOK_PROFILE }); setHasTestProfile(false); }
  }, []);

  return <>
    <Head><title>{copy.metaTitle} | TraitBridge</title><meta name="description" content={copy.intro} /></Head>
    <main className={styles.page}>
      <header className={styles.hero}><span>{copy.kicker}</span><h1>{copy.title}</h1><p>{copy.intro}</p></header>
      <section className={styles.profilePanel}>
        <div className={styles.panelHeading}><div><h2>{copy.profileTitle}</h2><p>{hasTestProfile ? copy.profileFromTest : copy.profileManual}</p></div><button type="button" onClick={() => { setScores({ ...NEUTRAL_BOOK_PROFILE }); setHasTestProfile(false); }}>{copy.reset}</button></div>
        <div className={styles.traitGrid}>{TRAITS.map((trait) => {
          const [label, low, high] = copy.traits[trait];
          return <label key={trait} className={styles.trait}><span className={styles.traitTitle}><strong>{label}</strong><output>{scores[trait].toFixed(1)}</output></span><input type="range" min="1" max="5" step="0.1" value={scores[trait]} onChange={(event) => { setScores((current) => ({ ...current, [trait]: Number(event.target.value) })); setHasTestProfile(false); }} /><span className={styles.traitEnds}><span>{low}</span><span>{high}</span></span></label>;
        })}</div>
      </section>
      <section className={styles.controls} aria-label={copy.modeTitle}>
        <div><span className={styles.controlLabel}>{copy.modeTitle}</span><div className={styles.modeGrid}>{(["mirror", "growth"] as RecommendationMode[]).map((value) => <button key={value} type="button" className={mode === value ? styles.activeChoice : ""} onClick={() => setMode(value)} aria-pressed={mode === value}><strong>{copy[value]}</strong><small>{copy[`${value}Text`]}</small></button>)}</div></div>
        <div><span className={styles.controlLabel}>{copy.kindTitle}</span><div className={styles.kindSwitch}>{(["nonfiction", "fiction"] as BookKind[]).map((value) => <button key={value} type="button" className={kind === value ? styles.activeKind : ""} onClick={() => setKind(value)} aria-pressed={kind === value}>{copy[value]}</button>)}</div></div>
      </section>
      <section className={styles.results} aria-live="polite">
        <div className={styles.resultsHeading}><div><span>01 / 06</span><h2>{copy.recommendations}</h2></div><span>{copy.editorial}</span></div>
        <div className={styles.bookGrid}>{recommendBooks(scores, kind, mode).map(({ book }, index) => {
          const item = localizeBook(book, locale, mode);
          return <article className={styles.bookCard} key={book.id}><div className={styles.bookNumber}>{String(index + 1).padStart(2, "0")}</div><div className={styles.tags}>{item.themes.map((tag) => <span key={tag}>{tag}</span>)}</div><h3>{item.title}</h3><p className={styles.author}>{item.author}</p><p className={styles.description}>{item.description}</p><div className={styles.reason}><strong>{copy.why}</strong><p>{item.reason}</p></div></article>;
        })}</div>
      </section>
      <aside className={styles.notice}>{copy.notice}</aside><Link className={styles.backLink} href="/learn">← {copy.back}</Link>
    </main>
  </>;
}
