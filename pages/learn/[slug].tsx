import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLocale } from "../../contexts/LocaleContext";
import {
  getLearningSources,
  getLearningTopic,
  type EvidenceKind,
  type TraitLevel,
} from "../../lib/learning-content";
import styles from "../../styles/LearningContent.module.css";

const LearningTopicPage: React.FC = () => {
  const router = useRouter();
  const { locale, copy } = useLocale();
  const slug = typeof router.query.slug === "string" ? router.query.slug : "";
  const topic = getLearningTopic(slug);

  if (!router.isReady) {
    return (
      <div className={styles.detailPage}>
        <p role="status">{copy.learn.loadingTopic}</p>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className={styles.detailPage}>
        <Head>
          <title>{copy.learn.topicNotFoundTitle} | TraitBridge</title>
        </Head>
        <div className={styles.empty}>
          <h1>{copy.learn.topicNotFoundTitle}</h1>
          <p>{copy.learn.topicNotFoundText}</p>
          <Link href="/learn">{copy.learn.backToLearn}</Link>
        </div>
      </div>
    );
  }

  const sources = getLearningSources(topic);
  const evidenceLabels: Record<EvidenceKind, string> = {
    "meta-analysis": copy.learn.evidenceKinds.metaAnalysis,
    "systematic-review": copy.learn.evidenceKinds.systematicReview,
    "primary-study": copy.learn.evidenceKinds.primaryStudy,
    institution: copy.learn.evidenceKinds.institution,
    editorial: copy.learn.evidenceKinds.editorial,
  };
  const traitLevelLabel = (level: TraitLevel) => copy.learn.traitLevels[level];

  return (
    <>
      <Head>
        <title>{topic.title[locale]} | TraitBridge</title>
        <meta name="description" content={topic.summary[locale]} />
      </Head>

      <div className={styles.detailPage}>
        <Link href="/learn" className={styles.backLink}>
          <span aria-hidden="true">←</span>
          {copy.learn.backToLearn}
        </Link>

        <header className={styles.detailHero}>
          <div className={styles.topicMeta}>
            {topic.categories.map((category) => (
              <span key={category}>{copy.learn.categories[category]}</span>
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
                {traitLevelLabel(relevance.level)} · {copy.traits[relevance.trait]}
              </span>
            ))}
          </div>
          <h1>{topic.title[locale]}</h1>
          <p>{topic.summary[locale]}</p>
        </header>

        <div className={styles.detailLayout}>
          <article className={styles.article}>
            <section>
              <h2>{copy.learn.situationHeading}</h2>
              <p>{topic.situation[locale]}</p>
            </section>
            <section>
              <h2>{copy.learn.whyHardHeading}</h2>
              <p>{topic.whyHard[locale]}</p>
            </section>
            <section>
              <h2>{copy.learn.tendenciesHeading}</h2>
              <p>{topic.tendencies[locale]}</p>
              <div className={styles.traitExplanation}>
                <h3>{copy.learn.traitExplanationHeading}</h3>
                <p>{copy.learn.traitExplanationIntro}</p>
                <ul>
                  {topic.traitRelevance.map((relevance) => (
                    <li key={`${relevance.trait}-${relevance.level}`}>
                      <strong>
                        {traitLevelLabel(relevance.level)} ·{" "}
                        {copy.traits[relevance.trait]}
                      </strong>
                      <span>{relevance.description[locale]}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <aside className={styles.limitNote}>
                <strong>{copy.learn.limitsHeading}</strong>
                <p>{topic.limits[locale]}</p>
              </aside>
            </section>
            <section>
              <h2>{copy.learn.actionsHeading}</h2>
              <ol className={styles.actionList}>
                {topic.actions[locale].map((action) => (
                  <li key={action}>{action}</li>
                ))}
              </ol>
            </section>
            <section className={styles.experiment}>
              <h2>{copy.learn.experimentHeading}</h2>
              <p>{topic.experiment[locale]}</p>
            </section>
            <section>
              <h2>{copy.learn.reflectionHeading}</h2>
              <ul className={styles.reflectionList}>
                {topic.reflection[locale].map((question) => (
                  <li key={question}>{question}</li>
                ))}
              </ul>
            </section>
          </article>

          <aside className={styles.evidencePanel}>
            <span className="page-kicker">{copy.learn.evidenceKicker}</span>
            <h2>{copy.learn.evidenceHeading}</h2>
            <p>{topic.evidenceNote[locale]}</p>

            <ul className={styles.sourceList}>
              {sources.map((source) => (
                <li key={source.id}>
                  <span>{evidenceLabels[source.kind]}</span>
                  <a href={source.href} target="_blank" rel="noreferrer">
                    {source.authors} ({source.year})
                    <strong>{source.title}</strong>
                  </a>
                </li>
              ))}
            </ul>

            {topic.supportNote && (
              <div className={styles.supportNote}>
                <strong>{copy.learn.supportHeading}</strong>
                <p>{topic.supportNote[locale]}</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </>
  );
};

export default LearningTopicPage;
