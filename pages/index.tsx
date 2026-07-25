import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useLocale } from "../contexts/LocaleContext";
import styles from "../styles/HomePage.module.css";

const HomePage: React.FC = () => {
  const { copy } = useLocale();
  const options = [
    {
      href: "/test",
      number: "01",
      title: copy.home.testTitle,
      description: copy.home.testDescription,
      action: copy.home.testAction,
      tone: styles.testCard,
    },
    {
      href: "/community",
      number: "02",
      title: copy.home.communityTitle,
      description: copy.home.communityDescription,
      action: copy.home.communityAction,
      tone: styles.communityCard,
    },
    {
      href: "/learn",
      number: "03",
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
          <span className={styles.kicker}>TraitBridge</span>
          <h1>{copy.home.title}</h1>
          <p>{copy.home.subtitle}</p>
        </section>

        <section className={styles.optionGrid} aria-label={copy.home.optionsLabel}>
          {options.map((option) => (
            <Link
              key={option.href}
              href={option.href}
              className={`${styles.optionCard} ${option.tone}`}
            >
              <span className={styles.optionNumber}>{option.number}</span>
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
