import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import type { BigFiveScores } from "../../components/PersonalityBadge";
import { useLocale } from "../../contexts/LocaleContext";
import {
  loadPreferredStoredResults,
} from "../../lib/bigfive-results";
import {
  CONTRIBUTION_PATTERNS,
  NEUTRAL_CONTRIBUTION_PROFILE,
  getContributionBand,
  selectContributionPatterns,
  type ContributionBand,
} from "../../lib/contribution-content";
import {
  BIG_FIVE_TRAITS,
  type BigFiveTrait,
} from "../../lib/learning-content";
import type { Locale } from "../../lib/i18n";
import styles from "../../styles/ContributionCompass.module.css";

type ProfileSource = "checking" | "saved" | "manual" | "neutral";

type PageCopy = {
  metaTitle: string;
  metaDescription: string;
  back: string;
  kicker: string;
  title: string;
  intro: string;
  valueNote: string;
  contextNote: string;
  profileKicker: string;
  profileTitle: string;
  profileDescription: Record<ProfileSource, string>;
  localPrivacy: string;
  reset: string;
  restore: string;
  scaleLabel: string;
  scaleLow: string;
  scaleHigh: string;
  bands: Record<ContributionBand, string>;
  resultsKicker: string;
  resultsTitle: string;
  resultsIntro: string;
  patternCount: (count: number) => string;
  contribution: string;
  noticedSignals: string;
  helpfulContexts: string;
  blindSpot: string;
  oppositeLesson: string;
  nextStep: string;
  reflectionKicker: string;
  reflectionTitle: string;
  reflectionQuestion: string;
  communityText: string;
  communityAction: string;
  editorialNote: string;
};

const PAGE_COPY: Record<Locale, PageCopy> = {
  en: {
    metaTitle: "Your possible contribution",
    metaDescription:
      "Explore possible ways your Big Five profile could contribute to groups, relationships and society.",
    back: "Back to Learn",
    kicker: "Contribution compass",
    title: "What might you bring to others?",
    intro:
      "Personality does not assign you a purpose. It can, however, offer language for what you notice, what you make easier for others and where a different style could complement you.",
    valueNote: "Every pole can be valuable.",
    contextNote: "Context, skills, values and experience still matter.",
    profileKicker: "Your starting point",
    profileTitle: "Adjust the five dimensions",
    profileDescription: {
      checking: "Checking this browser for a saved test result…",
      saved:
        "The sliders use the latest test result saved in this browser. You can adjust them without changing that result.",
      manual:
        "You are exploring a manually adjusted profile. This is a reflection aid, not a new test result.",
      neutral:
        "No result is being used. Neutral values provide a balanced starting point that you can adjust.",
    },
    localPrivacy:
      "This page reads only local browser storage. Your slider values are not uploaded or saved.",
    reset: "Reset to neutral",
    restore: "Restore test result",
    scaleLabel: "Value from 1 to 5",
    scaleLow: "low",
    scaleHigh: "high",
    bands: {
      low: "Low expression",
      middle: "Flexible middle",
      high: "High expression",
    },
    resultsKicker: "Possible contribution patterns",
    resultsTitle: "Your current compass",
    resultsIntro:
      "The most pronounced dimensions appear first. Middle values are described as possible flexibility between both poles.",
    patternCount: (count) => `${count} reflection patterns`,
    contribution: "Possible contribution",
    noticedSignals: "What you may notice",
    helpfulContexts: "Where this may help",
    blindSpot: "Possible blind spot",
    oppositeLesson: "What the opposite pole can teach",
    nextStep: "Small next step",
    reflectionKicker: "Continue together",
    reflectionTitle: "Where could two different styles become a bridge?",
    reflectionQuestion:
      "Think of one situation where your tendency helped—and one where somebody with the opposite tendency added what was missing.",
    communityText:
      "Compare experiences in the Community. The link opens the existing self-understanding topic.",
    communityAction: "Explore self-understanding discussions",
    editorialNote:
      "These suggestions are editorial reflection prompts, not diagnoses, predictions, limits or career assignments. A score cannot determine what you can do or what your life should mean.",
  },
  de: {
    metaTitle: "Dein möglicher Beitrag",
    metaDescription:
      "Erkunde, wie dein Big-Five-Profil möglicherweise zu Gruppen, Beziehungen und Gesellschaft beitragen kann.",
    back: "Zurück zu Lernen",
    kicker: "Beitragskompass",
    title: "Was könntest du anderen geben?",
    intro:
      "Persönlichkeit weist dir keinen Lebenssinn zu. Sie kann aber Worte dafür geben, was du bemerkst, was du anderen erleichterst und wo ein anderer Stil dich ergänzen könnte.",
    valueNote: "Jeder Pol kann wertvoll sein.",
    contextNote: "Kontext, Fähigkeiten, Werte und Erfahrung bleiben entscheidend.",
    profileKicker: "Dein Ausgangspunkt",
    profileTitle: "Passe die fünf Dimensionen an",
    profileDescription: {
      checking: "Dieses Gerät wird nach einem gespeicherten Testergebnis geprüft …",
      saved:
        "Die Regler verwenden das letzte in diesem Browser gespeicherte Testergebnis. Du kannst sie verändern, ohne dieses Ergebnis zu überschreiben.",
      manual:
        "Du erkundest ein manuell angepasstes Profil. Dies ist eine Reflexionshilfe und kein neues Testergebnis.",
      neutral:
        "Es wird kein Testergebnis verwendet. Neutrale Werte bieten einen ausgewogenen Ausgangspunkt, den du verändern kannst.",
    },
    localPrivacy:
      "Diese Seite liest nur den lokalen Browserspeicher. Deine Reglerwerte werden weder hochgeladen noch gespeichert.",
    reset: "Auf neutral zurücksetzen",
    restore: "Testergebnis wiederherstellen",
    scaleLabel: "Wert von 1 bis 5",
    scaleLow: "niedrig",
    scaleHigh: "hoch",
    bands: {
      low: "Niedrige Ausprägung",
      middle: "Flexible Mitte",
      high: "Hohe Ausprägung",
    },
    resultsKicker: "Mögliche Beitragsmuster",
    resultsTitle: "Dein aktueller Kompass",
    resultsIntro:
      "Die markantesten Dimensionen erscheinen zuerst. Mittlere Werte werden als mögliche Flexibilität zwischen beiden Polen beschrieben.",
    patternCount: (count) => `${count} Reflexionsmuster`,
    contribution: "Möglicher Beitrag",
    noticedSignals: "Was du bemerken könntest",
    helpfulContexts: "Wo dies helfen kann",
    blindSpot: "Möglicher blinder Fleck",
    oppositeLesson: "Was der Gegenpol zeigen kann",
    nextStep: "Kleiner nächster Schritt",
    reflectionKicker: "Gemeinsam weiterdenken",
    reflectionTitle: "Wo könnten zwei unterschiedliche Stile eine Brücke bilden?",
    reflectionQuestion:
      "Denke an eine Situation, in der deine Tendenz geholfen hat – und an eine, in der jemand mit der gegenteiligen Tendenz das Fehlende ergänzt hat.",
    communityText:
      "Vergleiche Erfahrungen in der Community. Der Link öffnet das bestehende Thema Selbstverständnis.",
    communityAction: "Diskussionen zu Selbstverständnis ansehen",
    editorialNote:
      "Diese Vorschläge sind redaktionelle Reflexionsimpulse – keine Diagnosen, Vorhersagen, Grenzen oder Berufszuteilungen. Ein Wert bestimmt weder, was du kannst, noch welchen Sinn dein Leben haben soll.",
  },
};

const copyScores = (scores: BigFiveScores): BigFiveScores => ({ ...scores });

const ContributionPage: React.FC = () => {
  const { locale, copy: globalCopy } = useLocale();
  const copy = PAGE_COPY[locale];
  const [scores, setScores] = useState<BigFiveScores>(() =>
    copyScores(NEUTRAL_CONTRIBUTION_PROFILE),
  );
  const [savedScores, setSavedScores] = useState<BigFiveScores | null>(null);
  const [profileSource, setProfileSource] =
    useState<ProfileSource>("checking");

  useEffect(() => {
    try {
      const storedResults = loadPreferredStoredResults(window.localStorage);

      if (storedResults) {
        const localScores = copyScores(storedResults.scores);
        setScores(localScores);
        setSavedScores(localScores);
        setProfileSource("saved");
        return;
      }
    } catch {
      // Corrupt or unavailable local storage simply falls back to neutral values.
    }

    setScores(copyScores(NEUTRAL_CONTRIBUTION_PROFILE));
    setSavedScores(null);
    setProfileSource("neutral");
  }, []);

  const selectedPatterns = useMemo(
    () => selectContributionPatterns(scores),
    [scores],
  );

  const updateScore = (trait: BigFiveTrait, value: number) => {
    setScores((currentScores) => ({
      ...currentScores,
      [trait]: value,
    }));
    setProfileSource("manual");
  };

  const resetToNeutral = () => {
    setScores(copyScores(NEUTRAL_CONTRIBUTION_PROFILE));
    setProfileSource("neutral");
  };

  const restoreSavedResult = () => {
    if (!savedScores) {
      return;
    }

    setScores(copyScores(savedScores));
    setProfileSource("saved");
  };

  return (
    <>
      <Head>
        <title>{`${copy.metaTitle} | TraitBridge`}</title>
        <meta name="description" content={copy.metaDescription} />
        <meta key="og-title" property="og:title" content={`${copy.metaTitle} | TraitBridge`} />
        <meta key="og-description" property="og:description" content={copy.metaDescription} />
      </Head>

      <div className={styles.page}>
        <Link className={styles.backLink} href="/learn">
          <span aria-hidden="true">←</span> {copy.back}
        </Link>

        <header className={styles.hero}>
          <span className="page-kicker">{copy.kicker}</span>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
          <div className={styles.principles} aria-label={copy.valueNote}>
            <span>{copy.valueNote}</span>
            <span>{copy.contextNote}</span>
          </div>
        </header>

        <section
          className={styles.profilePanel}
          aria-labelledby="contribution-profile-title"
        >
          <div className={styles.profileHeading}>
            <div>
              <span className={styles.eyebrow}>{copy.profileKicker}</span>
              <h2 id="contribution-profile-title">{copy.profileTitle}</h2>
              <p aria-live="polite">
                {copy.profileDescription[profileSource]}
              </p>
            </div>
            <div className={styles.profileActions}>
              {savedScores && profileSource !== "saved" && (
                <button type="button" onClick={restoreSavedResult}>
                  {copy.restore}
                </button>
              )}
              <button type="button" onClick={resetToNeutral}>
                {copy.reset}
              </button>
            </div>
          </div>

          <div className={styles.traitGrid}>
            {BIG_FIVE_TRAITS.map((trait) => {
              const inputId = `contribution-score-${trait}`;
              const band = getContributionBand(scores[trait]);

              return (
                <div className={styles.traitControl} key={trait}>
                  <label htmlFor={inputId}>
                    <span>
                      <strong>{globalCopy.traits[trait]}</strong>
                      <small>{copy.bands[band]}</small>
                    </span>
                    <output htmlFor={inputId}>
                      {scores[trait].toFixed(1)}
                    </output>
                  </label>
                  <input
                    id={inputId}
                    type="range"
                    min="1"
                    max="5"
                    step="0.1"
                    value={scores[trait]}
                    aria-label={`${globalCopy.traits[trait]} – ${copy.scaleLabel}`}
                    onChange={(event) =>
                      updateScore(trait, Number(event.target.value))
                    }
                  />
                  <div className={styles.scaleEnds} aria-hidden="true">
                    <span>{copy.scaleLow}</span>
                    <span>{copy.scaleHigh}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className={styles.privacyNote}>{copy.localPrivacy}</p>
        </section>

        <section
          className={styles.results}
          aria-labelledby="contribution-results-title"
        >
          <div className={styles.resultsHeading}>
            <div>
              <span className={styles.eyebrow}>{copy.resultsKicker}</span>
              <h2 id="contribution-results-title">{copy.resultsTitle}</h2>
              <p>{copy.resultsIntro}</p>
            </div>
            <span className={styles.resultCount} aria-live="polite">
              {copy.patternCount(selectedPatterns.length)}
            </span>
          </div>

          <div className={styles.patternGrid}>
            {selectedPatterns.map(({ trait, band, score, pattern }) => (
              <article
                className={styles.patternCard}
                data-band={band}
                key={trait}
              >
                <header className={styles.patternHeading}>
                  <div className={styles.patternMeta}>
                    <span>{globalCopy.traits[trait]}</span>
                    <span>{copy.bands[band]}</span>
                  </div>
                  <span className={styles.score} aria-label={copy.scaleLabel}>
                    {score.toFixed(1)}
                  </span>
                  <h3>{CONTRIBUTION_PATTERNS[trait][band].title[locale]}</h3>
                </header>

                <div className={styles.contribution}>
                  <strong>{copy.contribution}</strong>
                  <p>{pattern.contribution[locale]}</p>
                </div>

                <dl className={styles.patternDetails}>
                  <div>
                    <dt>{copy.noticedSignals}</dt>
                    <dd>{pattern.noticedSignals[locale]}</dd>
                  </div>
                  <div>
                    <dt>{copy.helpfulContexts}</dt>
                    <dd>
                      <ul>
                        {pattern.helpfulContexts[locale].map((context) => (
                          <li key={context}>{context}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                  <div>
                    <dt>{copy.blindSpot}</dt>
                    <dd>{pattern.blindSpot[locale]}</dd>
                  </div>
                  <div className={styles.bridgeDetail}>
                    <dt>{copy.oppositeLesson}</dt>
                    <dd>{pattern.oppositeLesson[locale]}</dd>
                  </div>
                  <div className={styles.nextStep}>
                    <dt>{copy.nextStep}</dt>
                    <dd>{pattern.nextStep[locale]}</dd>
                  </div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <aside className={styles.reflection}>
          <div>
            <span className={styles.eyebrow}>{copy.reflectionKicker}</span>
            <h2>{copy.reflectionTitle}</h2>
            <p>{copy.reflectionQuestion}</p>
            <small>{copy.communityText}</small>
          </div>
          <Link
            href={{
              pathname: "/community",
              query: { category: "self-understanding" },
            }}
          >
            {copy.communityAction}
            <span aria-hidden="true">→</span>
          </Link>
        </aside>

        <p className={styles.editorialNote}>{copy.editorialNote}</p>
      </div>
    </>
  );
};

export default ContributionPage;
