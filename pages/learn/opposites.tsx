import Head from "next/head";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { useLocale } from "../../contexts/LocaleContext";
import { loadPreferredStoredResults } from "../../lib/bigfive-results";
import {
  getTraitBridge,
  getTraitPole,
  localizeTraitText,
  TRAIT_DIMENSIONS,
  type BridgePole,
  type TraitDimension,
} from "../../lib/trait-bridges";
import styles from "../../styles/TraitOpposites.module.css";

const NEUTRAL_SCORES: Record<TraitDimension, number> = {
  O: 3,
  C: 3,
  E: 3,
  A: 3,
  N: 3,
};

const POLES: BridgePole[] = ["low", "high"];

const pageCopy = {
  en: {
    metaTitle: "Understand personality opposites",
    metaDescription:
      "Compare both poles of every Big Five dimension and discover how different styles can contribute and collaborate.",
    back: "Learning hub",
    kicker: "TraitBridge · understand opposites",
    title: "Different styles notice different parts of reality.",
    intro:
      "Neither side is the better person. Compare what each pole can contribute, where it may be misunderstood, and how both can work as a bridge.",
    principleTitle: "The idea behind the bridge",
    principle:
      "A Big Five score describes a broad tendency, not a role, diagnosis, or limit. Context, individual facets, skills, values, and experience still matter.",
    controlsKicker: "Perspective switch",
    controlsTitle: "Choose a dimension and place your starting point",
    controlsText:
      "If a completed result exists in this browser, it is loaded locally. Move the slider at any time to explore another perspective.",
    dimensionLabel: "Choose a Big Five dimension",
    scoreLabel: "Position on the scale",
    low: "Low",
    high: "High",
    score: "Score",
    profileFromTest: "Your latest test result was loaded from this browser.",
    profileManual: "You are exploring a manually adjusted perspective.",
    profileNeutral:
      "No result is needed. The neutral starting point keeps both perspectives open.",
    privacy: "Nothing on this page is sent anywhere.",
    reset: "Reset to the middle",
    likelyStart: "Your likely starting side",
    counterPerspective: "Counter-perspective",
    flexibleAccess: "Possible access from the middle",
    middleTitle: "Movement between both poles",
    contribution: "Possible contribution",
    strengths: "Strengths that may show up",
    misconception: "A common misreading",
    overextension: "When this style is overextended",
    oppositeValue: "What the opposite pole adds",
    collaboration: "Try this in collaboration",
    bridgeTitle: "The bridge between both",
    reflectionKicker: "Reflect with others",
    reflectionTitle: "A question worth carrying into a real situation",
    communityText:
      "Compare lived experiences in the Community. Reading is public; signing in is only needed to contribute.",
    communityAction: "Open related Community discussions",
    disclaimer:
      "Use these descriptions as hypotheses. People are more varied than a single score, and lower, middle, and higher scores can all be helpful or difficult depending on context.",
  },
  de: {
    metaTitle: "Persönliche Gegensätze verstehen",
    metaDescription:
      "Vergleiche beide Pole jeder Big-Five-Dimension und entdecke, wie unterschiedliche Stile beitragen und zusammenarbeiten können.",
    back: "Lernübersicht",
    kicker: "TraitBridge · Gegensätze verstehen",
    title:
      "Unterschiedliche Stile sehen unterschiedliche Teile der Wirklichkeit.",
    intro:
      "Keine Seite ist der bessere Mensch. Vergleiche, was jeder Pol beitragen kann, wo er missverstanden wird und wie aus beiden eine Brücke entstehen kann.",
    principleTitle: "Die Idee hinter der Brücke",
    principle:
      "Ein Big-Five-Wert beschreibt eine breite Tendenz – keine Rolle, Diagnose oder Grenze. Kontext, einzelne Facetten, Fähigkeiten, Werte und Erfahrungen bleiben wichtig.",
    controlsKicker: "Perspektivwechsel",
    controlsTitle: "Wähle eine Dimension und setze deinen Ausgangspunkt",
    controlsText:
      "Wenn in diesem Browser ein abgeschlossenes Ergebnis liegt, wird es lokal geladen. Verschiebe den Regler jederzeit, um eine andere Perspektive zu erkunden.",
    dimensionLabel: "Big-Five-Dimension wählen",
    scoreLabel: "Position auf der Skala",
    low: "Niedrig",
    high: "Hoch",
    score: "Wert",
    profileFromTest:
      "Dein jüngstes Testergebnis wurde aus diesem Browser geladen.",
    profileManual: "Du erkundest eine manuell eingestellte Perspektive.",
    profileNeutral:
      "Du brauchst kein Ergebnis. Der neutrale Startpunkt hält beide Perspektiven offen.",
    privacy: "Nichts auf dieser Seite wird versendet.",
    reset: "Auf die Mitte zurücksetzen",
    likelyStart: "Dein wahrscheinlicher Ausgangspol",
    counterPerspective: "Gegenperspektive",
    flexibleAccess: "Möglicher Zugang aus der Mitte",
    middleTitle: "Beweglichkeit zwischen beiden Polen",
    contribution: "Möglicher Beitrag",
    strengths: "Stärken, die sich zeigen können",
    misconception: "Eine typische Fehlinterpretation",
    overextension: "Wenn dieser Stil überzogen wird",
    oppositeValue: "Was der Gegenpol ergänzt",
    collaboration: "Das könnt ihr in der Zusammenarbeit versuchen",
    bridgeTitle: "Die Brücke zwischen beiden",
    reflectionKicker: "Mit anderen reflektieren",
    reflectionTitle: "Eine Frage für eine konkrete Situation",
    communityText:
      "Vergleiche gelebte Erfahrungen in der Community. Lesen ist öffentlich; nur zum Beitragen ist eine Anmeldung nötig.",
    communityAction: "Passende Community-Diskussionen öffnen",
    disclaimer:
      "Nutze diese Beschreibungen als Hypothesen. Menschen sind vielfältiger als ein einzelner Wert; niedrige, mittlere und hohe Werte können je nach Kontext hilfreich oder schwierig sein.",
  },
} as const;

type ProfileSource = "neutral" | "test" | "manual";

export default function TraitOppositesPage() {
  const { locale } = useLocale();
  const copy = pageCopy[locale];
  const [selectedTrait, setSelectedTrait] = useState<TraitDimension>("O");
  const [scores, setScores] =
    useState<Record<TraitDimension, number>>(NEUTRAL_SCORES);
  const [profileSource, setProfileSource] = useState<ProfileSource>("neutral");

  useEffect(() => {
    try {
      const storedResult = loadPreferredStoredResults(window.localStorage);

      if (storedResult) {
        setScores(storedResult.scores);
        setProfileSource("test");
      }
    } catch {
      setScores({ ...NEUTRAL_SCORES });
      setProfileSource("neutral");
    }
  }, []);

  const bridge = useMemo(() => getTraitBridge(selectedTrait), [selectedTrait]);
  const score = scores[selectedTrait];
  const currentPole = getTraitPole(score);
  const rangeId = `trait-opposites-${selectedTrait.toLowerCase()}-score`;
  const localized = <T,>(value: Record<"en" | "de", T>) =>
    localizeTraitText(value, locale);

  const profileStatus =
    profileSource === "test"
      ? copy.profileFromTest
      : profileSource === "manual"
        ? copy.profileManual
        : copy.profileNeutral;

  return (
    <>
      <Head>
        <title>{`${copy.metaTitle} | TraitBridge`}</title>
        <meta name="description" content={copy.metaDescription} />
        <meta
          key="og-title"
          property="og:title"
          content={`${copy.metaTitle} | TraitBridge`}
        />
        <meta
          key="og-description"
          property="og:description"
          content={copy.metaDescription}
        />
      </Head>

      <div className={styles.page}>
        <Link href="/learn" className={styles.backLink}>
          <span aria-hidden="true">←</span>
          {copy.back}
        </Link>

        <header className={styles.hero}>
          <span className="page-kicker">{copy.kicker}</span>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
        </header>

        <aside className={styles.principle}>
          <span aria-hidden="true">↔</span>
          <div>
            <strong>{copy.principleTitle}</strong>
            <p>{copy.principle}</p>
          </div>
        </aside>

        <section
          className={styles.controls}
          aria-labelledby="opposites-controls-title"
        >
          <div className={styles.controlsHeading}>
            <div>
              <span className="page-kicker">{copy.controlsKicker}</span>
              <h2 id="opposites-controls-title">{copy.controlsTitle}</h2>
              <p>{copy.controlsText}</p>
            </div>
            <button
              type="button"
              className={styles.resetButton}
              onClick={() => {
                setScores({ ...NEUTRAL_SCORES });
                setProfileSource("neutral");
              }}
            >
              {copy.reset}
            </button>
          </div>

          <div
            className={styles.dimensionTabs}
            role="group"
            aria-label={copy.dimensionLabel}
          >
            {TRAIT_DIMENSIONS.map((trait) => (
              <button
                type="button"
                key={trait}
                aria-pressed={selectedTrait === trait}
                className={
                  selectedTrait === trait ? styles.activeDimension : ""
                }
                onClick={() => setSelectedTrait(trait)}
              >
                <span aria-hidden="true">{trait}</span>
                {localized(getTraitBridge(trait).name)}
              </button>
            ))}
          </div>

          <div className={styles.scorePanel}>
            <div className={styles.scoreHeading}>
              <label htmlFor={rangeId}>
                <span>{copy.scoreLabel}</span>
                <strong>{localized(bridge.name)}</strong>
              </label>
              <output htmlFor={rangeId}>
                {copy.score}: {score.toFixed(1)} / 5
              </output>
            </div>
            <input
              id={rangeId}
              type="range"
              min="1"
              max="5"
              step="0.1"
              value={score}
              aria-valuetext={`${score.toFixed(1)} / 5`}
              onChange={(event) => {
                const nextScore = Number(event.target.value);
                setScores((currentScores) => ({
                  ...currentScores,
                  [selectedTrait]: nextScore,
                }));
                setProfileSource("manual");
              }}
            />
            <div className={styles.scaleEnds} aria-hidden="true">
              <span>
                {copy.low}: {localized(bridge.scaleEnds.low)}
              </span>
              <span>
                {copy.high}: {localized(bridge.scaleEnds.high)}
              </span>
            </div>
            <p className={styles.profileStatus} role="status">
              {profileStatus} <span>{copy.privacy}</span>
            </p>
          </div>
        </section>

        {currentPole === "middle" && (
          <aside className={styles.middleNote}>
            <strong>{copy.middleTitle}</strong>
            <p>{localized(bridge.middlePerspective)}</p>
          </aside>
        )}

        <section
          className={styles.comparison}
          aria-label={`${localized(bridge.name)}: ${copy.bridgeTitle}`}
        >
          {POLES.map((pole) => {
            const profile = bridge.poles[pole];
            const isCurrent = currentPole === "middle" || currentPole === pole;
            const positionLabel =
              currentPole === "middle"
                ? copy.flexibleAccess
                : isCurrent
                  ? copy.likelyStart
                  : copy.counterPerspective;

            return (
              <article
                key={pole}
                className={styles.poleCard}
                data-current={isCurrent ? "true" : "false"}
              >
                <header className={styles.poleHeader}>
                  <div>
                    <span className={styles.poleScale}>
                      {pole === "low" ? copy.low : copy.high} ·{" "}
                      {localized(bridge.name)}
                    </span>
                    <h2>{localized(profile.label)}</h2>
                  </div>
                  <span className={styles.positionBadge}>{positionLabel}</span>
                </header>

                <section className={styles.contribution}>
                  <h3>{copy.contribution}</h3>
                  <p>{localized(profile.contribution)}</p>
                </section>

                <div className={styles.profileDetails}>
                  <section>
                    <h3>{copy.strengths}</h3>
                    <ul>
                      {localized(profile.strengths).map((strength) => (
                        <li key={strength}>{strength}</li>
                      ))}
                    </ul>
                  </section>
                  <section>
                    <h3>{copy.misconception}</h3>
                    <p>{localized(profile.misconception)}</p>
                  </section>
                  <section>
                    <h3>{copy.overextension}</h3>
                    <p>{localized(profile.overextension)}</p>
                  </section>
                  <section>
                    <h3>{copy.oppositeValue}</h3>
                    <p>{localized(profile.oppositeValue)}</p>
                  </section>
                  <section className={styles.collaboration}>
                    <h3>{copy.collaboration}</h3>
                    <ul>
                      {localized(profile.collaboration).map((tip) => (
                        <li key={tip}>{tip}</li>
                      ))}
                    </ul>
                  </section>
                </div>
              </article>
            );
          })}
        </section>

        <section className={styles.bridgeStatement}>
          <span aria-hidden="true">↔</span>
          <div>
            <h2>{copy.bridgeTitle}</h2>
            <p>{localized(bridge.bridgePrinciple)}</p>
          </div>
        </section>

        <section className={styles.communityBridge}>
          <div>
            <span className="page-kicker">{copy.reflectionKicker}</span>
            <h2>{copy.reflectionTitle}</h2>
            <blockquote>{localized(bridge.reflectionQuestion)}</blockquote>
            <p>{copy.communityText}</p>
          </div>
          <Link href="/?view=discover" className={styles.communityLink}>
            {copy.communityAction}
            <span aria-hidden="true">→</span>
          </Link>
        </section>

        <p className={styles.disclaimer}>{copy.disclaimer}</p>
      </div>
    </>
  );
}
