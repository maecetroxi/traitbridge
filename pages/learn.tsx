import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useLocale } from "../contexts/LocaleContext";
import styles from "../styles/LearnPage.module.css";

const LearnPage: React.FC = () => {
  const { copy } = useLocale();

  return (
    <>
      <Head>
        <title>{copy.learn.title} | TraitBridge</title>
        <meta name="description" content={copy.learn.intro} />
      </Head>

      <main className={styles.page}>
        <header className={styles.hero}><span className={styles.kicker}>{copy.learn.kicker}</span><h1>{copy.learn.title}</h1><p>{copy.learn.intro}</p></header>
        <section className={styles.primary}><div><span className={styles.eyebrow}>{copy.learn.booksKicker}</span><h2>{copy.learn.booksTitle}</h2><p>{copy.learn.booksText}</p></div><Link href="/learn/books" className={styles.action}>{copy.learn.booksAction}</Link></section>
        <div className={styles.secondaryGrid}>
          <article className={styles.card}><span className={styles.eyebrow}>02</span><h2>{copy.learn.profileTitle}</h2><p>{copy.learn.profileText}</p><span className={styles.status}>{copy.learn.comingSoon}</span></article>
          <article className={styles.card}><span className={styles.eyebrow}>03</span><h2>{copy.learn.experimentsTitle}</h2><p>{copy.learn.experimentsText}</p><span className={styles.status}>{copy.learn.comingSoon}</span></article>
        </div>
        <section className={styles.tool}><div><span className={styles.eyebrow}>Tool</span><h2>{copy.learn.toolTitle}</h2><p>{copy.learn.toolText}</p></div><Link href="/tools/personality-guide" className={styles.toolLink}>{copy.learn.toolAction} →</Link></section>
      </main>
    </>
  );
};

export default LearnPage;
