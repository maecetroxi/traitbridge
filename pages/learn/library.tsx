import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import type { BigFiveScores } from "../../components/PersonalityBadge";
import { useLocale } from "../../contexts/LocaleContext";
import { loadPreferredStoredResults } from "../../lib/bigfive-results";
import { NEUTRAL_BOOK_PROFILE } from "../../lib/book-recommendations";
import {
  DEFAULT_MEDIA_FILTERS,
  MEDIA_PERSPECTIVES,
  MEDIA_RESOURCE_TYPES,
  MEDIA_THEMES,
  MEDIA_THEME_LABELS,
  MEDIA_TRAITS,
  rankMediaResources,
  type MediaFilters,
  type MediaPerspective,
  type MediaResourceType,
  type TraitBand,
} from "../../lib/media-library";
import type { Locale } from "../../lib/i18n";
import styles from "../../styles/MediaLibrary.module.css";

const PAGE_SIZE = 6;

const libraryCopy: Record<
  Locale,
  {
    metaTitle: string;
    metaDescription: string;
    back: string;
    kicker: string;
    title: string;
    intro: string;
    principle: string;
    entryTitle: string;
    entryText: string;
    entryMirror: string;
    entryMirrorText: string;
    entryGrowth: string;
    entryGrowthText: string;
    entryBrowse: string;
    entryBrowseText: string;
    profileTitle: string;
    profileFromTest: string;
    profileManual: string;
    resetProfile: string;
    filtersTitle: string;
    searchLabel: string;
    searchPlaceholder: string;
    typeLabel: string;
    allTypes: string;
    types: Record<MediaResourceType, string>;
    traitLabel: string;
    automaticFocus: string;
    bands: Record<TraitBand, string>;
    perspectiveLabel: string;
    allPerspectives: string;
    perspectives: Record<MediaPerspective, string>;
    perspectiveHelp: Record<MediaPerspective, string>;
    themeLabel: string;
    allThemes: string;
    clearFilters: string;
    resultsTitle: string;
    resultSingular: string;
    resultPlural: string;
    profileSorted: string;
    why: string;
    source: string;
    showMore: string;
    emptyTitle: string;
    emptyText: string;
    notice: string;
    traitEnds: Record<keyof BigFiveScores, [string, string]>;
  }
> = {
  en: {
    metaTitle: "Books & films for different perspectives",
    metaDescription:
      "Explore curated books and films through your Big Five profile, themes, and mirror or growth perspectives.",
    back: "Learning hub",
    kicker: "Books & films",
    title: "Stories and ideas that build bridges.",
    intro:
      "Find a perspective that may feel familiar—or meet a way of seeing the world that complements your own.",
    principle:
      "Every trait pole can contribute something. These suggestions are invitations to reflect, not predictions about what you will like.",
    entryTitle: "How would you like to browse?",
    entryText: "Choose a simple starting point. Detailed profile and theme filters remain available below.",
    entryMirror: "Match my profile",
    entryMirrorText: "Prioritize perspectives that may feel familiar.",
    entryGrowth: "Show me a new perspective",
    entryGrowthText: "Prioritize complementary styles and experiences.",
    entryBrowse: "Just browse",
    entryBrowseText: "Show the complete library without a perspective filter.",
    profileTitle: "Your perspective",
    profileFromTest:
      "Your locally saved test result is shaping the order. It stays on this device.",
    profileManual:
      "No valid result was found. Start from the middle or adjust the sliders yourself.",
    resetProfile: "Neutral profile",
    filtersTitle: "Narrow the library",
    searchLabel: "Search",
    searchPlaceholder: "Title, creator, theme, or reason",
    typeLabel: "Format",
    allTypes: "All formats",
    types: {
      nonfiction: "Nonfiction",
      fiction: "Novels",
      film: "Films",
    },
    traitLabel: "Profile focus",
    automaticFocus: "Automatic from my profile",
    bands: {
      low: "Low",
      middle: "Middle",
      high: "High",
    },
    perspectiveLabel: "Perspective",
    allPerspectives: "Both perspectives",
    perspectives: {
      mirror: "Mirror",
      growth: "New perspective",
    },
    perspectiveHelp: {
      mirror: "May echo parts of your usual experience.",
      growth: "May illuminate a complementary style.",
    },
    themeLabel: "Everyday theme",
    allThemes: "All themes",
    clearFilters: "Clear filters",
    resultsTitle: "Curated suggestions",
    resultSingular: "result",
    resultPlural: "results",
    profileSorted: "Matched transparently to your sliders",
    why: "Why this lens",
    source: "Check metadata at",
    showMore: "Show more",
    emptyTitle: "No exact match yet",
    emptyText:
      "Try removing one filter or searching for a broader theme. No personality range is excluded from the full library.",
    notice:
      "The Big Five links are editorial interpretations of themes and characters, not psychological assessments of authors, filmmakers, or fictional people. The order is deterministic and only uses the sliders shown above. No covers, excerpts, or external tracking are loaded.",
    traitEnds: {
      O: ["familiar", "exploratory"],
      C: ["spontaneous", "structured"],
      E: ["reserved", "outgoing"],
      A: ["direct", "cooperative"],
      N: ["steady", "sensitive"],
    },
  },
  de: {
    metaTitle: "Bücher & Filme für verschiedene Perspektiven",
    metaDescription:
      "Entdecke kuratierte Bücher und Filme nach Big Five, Ausprägung, Thema sowie Spiegel- oder Entwicklungsperspektive.",
    back: "Lernübersicht",
    kicker: "Bücher & Filme",
    title: "Geschichten und Ideen, die Brücken bauen.",
    intro:
      "Finde eine Perspektive, die sich vertraut anfühlen könnte – oder begegne einer Sichtweise, die deine eigene ergänzt.",
    principle:
      "Jeder Pol kann etwas beitragen. Diese Vorschläge sind Einladungen zur Reflexion und keine Vorhersagen darüber, was dir gefallen wird.",
    entryTitle: "Wie möchtest du stöbern?",
    entryText: "Wähle einen einfachen Einstieg. Detaillierte Profil- und Themenfilter bleiben darunter verfügbar.",
    entryMirror: "Passend zu meinem Profil",
    entryMirrorText: "Zeigt zuerst Perspektiven, die sich vertraut anfühlen könnten.",
    entryGrowth: "Bewusst eine andere Perspektive",
    entryGrowthText: "Zeigt zuerst ergänzende Stile und Erfahrungen.",
    entryBrowse: "Einfach stöbern",
    entryBrowseText: "Zeigt die ganze Bibliothek ohne Perspektivfilter.",
    profileTitle: "Deine Perspektive",
    profileFromTest:
      "Dein lokal gespeichertes Testergebnis bestimmt die Reihenfolge mit. Es bleibt auf diesem Gerät.",
    profileManual:
      "Kein gültiges Ergebnis gefunden. Starte in der Mitte oder passe die Regler selbst an.",
    resetProfile: "Neutrales Profil",
    filtersTitle: "Bibliothek eingrenzen",
    searchLabel: "Suchen",
    searchPlaceholder: "Titel, Person, Thema oder Begründung",
    typeLabel: "Format",
    allTypes: "Alle Formate",
    types: {
      nonfiction: "Sachbücher",
      fiction: "Romane",
      film: "Filme",
    },
    traitLabel: "Schwerpunkt",
    automaticFocus: "Automatisch nach meinem Profil",
    bands: {
      low: "Niedrig",
      middle: "Mittel",
      high: "Hoch",
    },
    perspectiveLabel: "Perspektive",
    allPerspectives: "Beide Perspektiven",
    perspectives: {
      mirror: "Spiegel",
      growth: "Neuer Blick",
    },
    perspectiveHelp: {
      mirror: "Könnte Teile deiner gewohnten Erfahrung spiegeln.",
      growth: "Könnte einen ergänzenden Stil sichtbar machen.",
    },
    themeLabel: "Alltagsthema",
    allThemes: "Alle Themen",
    clearFilters: "Filter löschen",
    resultsTitle: "Kuratierte Vorschläge",
    resultSingular: "Ergebnis",
    resultPlural: "Ergebnisse",
    profileSorted: "Transparent nach deinen Reglern sortiert",
    why: "Warum diese Perspektive",
    source: "Metadaten prüfen bei",
    showMore: "Mehr anzeigen",
    emptyTitle: "Noch keine genaue Übereinstimmung",
    emptyText:
      "Entferne einen Filter oder suche nach einem breiteren Thema. In der gesamten Bibliothek wird keine Persönlichkeitsausprägung ausgeschlossen.",
    notice:
      "Die Big-Five-Zuordnungen sind redaktionelle Deutungen von Themen und Figuren – keine psychologischen Einschätzungen von Autor:innen, Filmschaffenden oder fiktiven Personen. Die Reihenfolge ist deterministisch und verwendet nur die oben sichtbaren Regler. Es werden keine Cover, Auszüge oder externen Tracker geladen.",
    traitEnds: {
      O: ["vertraut", "entdeckend"],
      C: ["spontan", "strukturiert"],
      E: ["zurückhaltend", "kontaktfreudig"],
      A: ["direkt", "kooperativ"],
      N: ["stabil", "sensibel"],
    },
  },
};

export default function MediaLibraryPage() {
  const router = useRouter();
  const { locale, copy: globalCopy } = useLocale();
  const copy = libraryCopy[locale];
  const [scores, setScores] = useState<BigFiveScores>({
    ...NEUTRAL_BOOK_PROFILE,
  });
  const [hasTestProfile, setHasTestProfile] = useState(false);
  const [filters, setFilters] = useState<MediaFilters>({
    ...DEFAULT_MEDIA_FILTERS,
  });
  const [visibleLimit, setVisibleLimit] = useState(PAGE_SIZE);

  useEffect(() => {
    try {
      const result = loadPreferredStoredResults(window.localStorage);

      if (result) {
        setScores(result.scores);
        setHasTestProfile(true);
      }
    } catch {
      setScores({ ...NEUTRAL_BOOK_PROFILE });
      setHasTestProfile(false);
    }
  }, []);

  useEffect(() => {
    if (!router.isReady) {
      return;
    }

    const requestedType =
      typeof router.query.type === "string" ? router.query.type : "";

    if (
      MEDIA_RESOURCE_TYPES.includes(requestedType as MediaResourceType)
    ) {
      setFilters((current) => ({
        ...current,
        type: requestedType as MediaResourceType,
      }));
    }
  }, [router.isReady, router.query.type]);

  useEffect(() => {
    setVisibleLimit(PAGE_SIZE);
  }, [filters, scores]);

  const rankedResources = useMemo(
    () => rankMediaResources(scores, filters, locale),
    [filters, locale, scores],
  );
  const visibleResources = rankedResources.slice(0, visibleLimit);
  const hasFilters =
    filters.type !== "all" ||
    filters.traitFocus !== "auto" ||
    filters.perspective !== "all" ||
    filters.theme !== "all" ||
    Boolean(filters.search.trim());

  const updateFilter = <Key extends keyof MediaFilters>(
    key: Key,
    value: MediaFilters[Key],
  ) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resultLabel =
    rankedResources.length === 1 ? copy.resultSingular : copy.resultPlural;

  return (
    <>
      <Head>
        <title>{`${copy.metaTitle} | TraitBridge`}</title>
        <meta key="og-title" property="og:title" content={`${copy.metaTitle} | TraitBridge`} />
        <meta key="og-description" property="og:description" content={copy.metaDescription} />
        <meta name="description" content={copy.metaDescription} />
      </Head>

      <div className={styles.page}>
        <Link href="/learn" className={styles.backLink}>
          <span aria-hidden="true">←</span> {copy.back}
        </Link>

        <header className={styles.hero}>
          <span className="page-kicker">{copy.kicker}</span>
          <h1>{copy.title}</h1>
          <p>{copy.intro}</p>
          <aside>{copy.principle}</aside>
        </header>

        <section className={styles.entryPanel} aria-labelledby="library-entry-title">
          <header>
            <h2 id="library-entry-title">{copy.entryTitle}</h2>
            <p>{copy.entryText}</p>
          </header>
          <div className={styles.entryGrid}>
            <button
              type="button"
              aria-pressed={filters.perspective === "mirror"}
              onClick={() => updateFilter("perspective", "mirror")}
            >
              <strong>{copy.entryMirror}</strong>
              <span>{copy.entryMirrorText}</span>
            </button>
            <button
              type="button"
              aria-pressed={filters.perspective === "growth"}
              onClick={() => updateFilter("perspective", "growth")}
            >
              <strong>{copy.entryGrowth}</strong>
              <span>{copy.entryGrowthText}</span>
            </button>
            <button
              type="button"
              aria-pressed={!hasFilters}
              onClick={() => setFilters({ ...DEFAULT_MEDIA_FILTERS })}
            >
              <strong>{copy.entryBrowse}</strong>
              <span>{copy.entryBrowseText}</span>
            </button>
          </div>
        </section>

        <details
          className={styles.profilePanel}
        >
          <summary className={styles.panelSummary}>
            <div>
              <h2 id="library-profile-title">{copy.profileTitle}</h2>
              <p>
                {hasTestProfile ? copy.profileFromTest : copy.profileManual}
              </p>
            </div>
          </summary>
          <div className={styles.panelContent}>
            <button
              type="button"
              className={styles.clearButton}
              onClick={() => {
                setScores({ ...NEUTRAL_BOOK_PROFILE });
                setHasTestProfile(false);
              }}
            >
              {copy.resetProfile}
            </button>
            <div className={styles.traitGrid}>
            {MEDIA_TRAITS.map((trait) => (
              <label key={trait} className={styles.traitControl} htmlFor={`library-trait-${trait}`}>
                <span className={styles.traitHeading}>
                  <strong>{globalCopy.traits[trait]}</strong>
                  <output>{scores[trait].toFixed(1)}</output>
                </span>
                <input
                  id={`library-trait-${trait}`}
                  type="range"
                  min="1"
                  max="5"
                  step="0.1"
                  value={scores[trait]}
                  aria-valuetext={`${scores[trait].toFixed(1)} / 5`}
                  onChange={(event) => {
                    setScores((current) => ({
                      ...current,
                      [trait]: Number(event.target.value),
                    }));
                    setHasTestProfile(false);
                  }}
                />
                <span className={styles.traitEnds}>
                  <span>{copy.traitEnds[trait][0]}</span>
                  <span>{copy.traitEnds[trait][1]}</span>
                </span>
              </label>
            ))}
            </div>
          </div>
        </details>

        <details
          className={styles.filterPanel}
        >
          <summary className={styles.panelSummary}>
            <div>
              <h2 id="library-filters-title">{copy.filtersTitle}</h2>
            </div>
          </summary>
          <div className={styles.panelContent}>
            <button
              type="button"
              className={styles.clearButton}
              disabled={!hasFilters}
              onClick={() => setFilters({ ...DEFAULT_MEDIA_FILTERS })}
            >
              {copy.clearFilters}
            </button>
          <label className={styles.searchControl}>
            <span>{copy.searchLabel}</span>
            <input
              type="search"
              value={filters.search}
              placeholder={copy.searchPlaceholder}
              onChange={(event) => updateFilter("search", event.target.value)}
            />
          </label>

          <div className={styles.filterGrid}>
            <FilterGroup label={copy.typeLabel}>
              <FilterButton
                active={filters.type === "all"}
                onClick={() => updateFilter("type", "all")}
              >
                {copy.allTypes}
              </FilterButton>
              {MEDIA_RESOURCE_TYPES.map((type) => (
                <FilterButton
                  key={type}
                  active={filters.type === type}
                  onClick={() => updateFilter("type", type)}
                >
                  {copy.types[type]}
                </FilterButton>
              ))}
            </FilterGroup>

            <FilterGroup label={copy.perspectiveLabel}>
              <FilterButton
                active={filters.perspective === "all"}
                onClick={() => updateFilter("perspective", "all")}
              >
                {copy.allPerspectives}
              </FilterButton>
              {MEDIA_PERSPECTIVES.map((perspective) => (
                <FilterButton
                  key={perspective}
                  active={filters.perspective === perspective}
                  onClick={() => updateFilter("perspective", perspective)}
                  title={copy.perspectiveHelp[perspective]}
                >
                  {copy.perspectives[perspective]}
                </FilterButton>
              ))}
            </FilterGroup>

            <FilterGroup label={copy.traitLabel}>
              <FilterButton
                active={filters.traitFocus === "auto"}
                onClick={() => updateFilter("traitFocus", "auto")}
              >
                {copy.automaticFocus}
              </FilterButton>
              {MEDIA_TRAITS.map((trait) => (
                <FilterButton
                  key={trait}
                  active={filters.traitFocus === trait}
                  onClick={() => updateFilter("traitFocus", trait)}
                >
                  {globalCopy.traits[trait]}
                </FilterButton>
              ))}
            </FilterGroup>
          </div>

          <label className={styles.themeControl}>
            <span>{copy.themeLabel}</span>
            <select
              value={filters.theme}
              onChange={(event) =>
                updateFilter(
                  "theme",
                  event.target.value as MediaFilters["theme"],
                )
              }
            >
              <option value="all">{copy.allThemes}</option>
              {MEDIA_THEMES.map((theme) => (
                <option key={theme} value={theme}>
                  {MEDIA_THEME_LABELS[theme][locale]}
                </option>
              ))}
            </select>
          </label>
          </div>
        </details>

        <section
          className={styles.results}
          aria-labelledby="library-results-title"
        >
          <div className={styles.resultsHeading}>
            <div>
              <span>{copy.profileSorted}</span>
              <h2 id="library-results-title">{copy.resultsTitle}</h2>
            </div>
            <p aria-live="polite" aria-atomic="true">
              <strong>{rankedResources.length}</strong> {resultLabel}
            </p>
          </div>

          {rankedResources.length === 0 ? (
            <div className={styles.emptyState}>
              <h3>{copy.emptyTitle}</h3>
              <p>{copy.emptyText}</p>
              <button
                type="button"
                onClick={() => setFilters({ ...DEFAULT_MEDIA_FILTERS })}
              >
                {copy.clearFilters}
              </button>
            </div>
          ) : (
            <>
              <div className={styles.resourceGrid}>
                {visibleResources.map(({ resource, mapping }, index) => (
                  <article
                    key={resource.id}
                    className={styles.resourceCard}
                    data-type={resource.type}
                  >
                    <div className={styles.cardTopline}>
                      <span>{copy.types[resource.type]}</span>
                      <span>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </div>

                    <h3>{resource.title[locale]}</h3>
                    <p className={styles.creator}>
                      {resource.creator} · {resource.year}
                    </p>
                    <p className={styles.description}>
                      {resource.description[locale]}
                    </p>

                    <div
                      className={styles.themeList}
                      aria-label={copy.themeLabel}
                    >
                      {resource.themes.map((theme) => (
                        <span key={theme}>
                          {MEDIA_THEME_LABELS[theme][locale]}
                        </span>
                      ))}
                    </div>

                    {mapping && (
                      <div className={styles.lens}>
                        <div className={styles.lensMeta}>
                          <span data-perspective={mapping.perspective}>
                            {copy.perspectives[mapping.perspective]}
                          </span>
                          <span>
                            {copy.bands[mapping.pole]} ·{" "}
                            {globalCopy.traits[mapping.trait]}
                          </span>
                        </div>
                        <strong>{copy.why}</strong>
                        <p>{mapping.reason[locale]}</p>
                      </div>
                    )}

                    {resource.source && (
                      <a
                        className={styles.sourceLink}
                        href={resource.source.href}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {copy.source} {resource.source.label}
                        <span aria-hidden="true"> ↗</span>
                      </a>
                    )}
                  </article>
                ))}
              </div>

              {visibleLimit < rankedResources.length && (
                <button
                  type="button"
                  className={styles.moreButton}
                  onClick={() =>
                    setVisibleLimit((current) => current + PAGE_SIZE)
                  }
                >
                  {copy.showMore}
                </button>
              )}
            </>
          )}
        </section>

        <aside className={styles.notice}>{copy.notice}</aside>
      </div>
    </>
  );
}

type FilterGroupProps = {
  label: string;
  children: React.ReactNode;
};

function FilterGroup({ label, children }: FilterGroupProps) {
  return (
    <div className={styles.filterGroup}>
      <strong>{label}</strong>
      <div className={styles.filterButtons} role="group" aria-label={label}>
        {children}
      </div>
    </div>
  );
}

type FilterButtonProps = {
  active: boolean;
  onClick: () => void;
  title?: string;
  children: React.ReactNode;
};

function FilterButton({
  active,
  onClick,
  title,
  children,
}: FilterButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={active ? styles.activeFilter : undefined}
      onClick={onClick}
      title={title}
    >
      {children}
    </button>
  );
}
