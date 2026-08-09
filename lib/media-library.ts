import type { BigFiveScores } from "../components/PersonalityBadge";
import {
  CURATED_BOOKS,
  type RecommendationMode,
} from "./book-recommendations";
import type { Locale } from "./i18n";
import type { TraitBand } from "./trait-bridges";

export type TraitKey = keyof BigFiveScores;
export type { TraitBand } from "./trait-bridges";
export type TraitFocus = TraitKey | "auto";
export type MediaResourceType = "nonfiction" | "fiction" | "film";
export type MediaPerspective = RecommendationMode;
export type MediaTheme =
  | "identity"
  | "relationships"
  | "work"
  | "emotion"
  | "change"
  | "meaning"
  | "creativity"
  | "community";

export type LocalizedMediaText = Record<Locale, string>;

export type MediaTraitMapping = {
  trait: TraitKey;
  pole: TraitBand;
  perspective: MediaPerspective;
  reason: LocalizedMediaText;
};

export type MediaSource = {
  label: string;
  href: string;
};

export type MediaResource = {
  id: string;
  type: MediaResourceType;
  title: LocalizedMediaText;
  originalTitle?: string;
  creator: string;
  year: number;
  description: LocalizedMediaText;
  themes: MediaTheme[];
  traitMappings: MediaTraitMapping[];
  source?: MediaSource;
};

export type MediaFilters = {
  type: MediaResourceType | "all";
  traitFocus: TraitFocus;
  perspective: MediaPerspective | "all";
  theme: MediaTheme | "all";
  search: string;
};

export const MEDIA_TRAITS: TraitKey[] = ["O", "C", "E", "A", "N"];
export const MEDIA_RESOURCE_TYPES: MediaResourceType[] = [
  "nonfiction",
  "fiction",
  "film",
];
export const MEDIA_PERSPECTIVES: MediaPerspective[] = ["mirror", "growth"];
export const MEDIA_THEMES: MediaTheme[] = [
  "identity",
  "relationships",
  "work",
  "emotion",
  "change",
  "meaning",
  "creativity",
  "community",
];

export const DEFAULT_MEDIA_FILTERS: MediaFilters = {
  type: "all",
  traitFocus: "auto",
  perspective: "all",
  theme: "all",
  search: "",
};

export const MEDIA_THEME_LABELS: Record<MediaTheme, LocalizedMediaText> = {
  identity: { en: "Self-understanding", de: "Selbstverständnis" },
  relationships: { en: "Relationships", de: "Beziehungen" },
  work: { en: "Work & craft", de: "Arbeit & Können" },
  emotion: { en: "Emotions", de: "Gefühle" },
  change: { en: "Change", de: "Veränderung" },
  meaning: { en: "Meaning", de: "Sinn" },
  creativity: { en: "Creativity", de: "Kreativität" },
  community: { en: "Community", de: "Gemeinschaft" },
};

const localized = (en: string, de: string): LocalizedMediaText => ({ en, de });

const ORIGINAL_BOOK_YEARS: Record<string, number> = {
  quiet: 2012,
  "atomic-habits": 2018,
  mindset: 2006,
  "four-thousand-weeks": 2021,
  "nonviolent-communication": 1999,
  "thinking-fast-slow": 2011,
  "highly-sensitive-person": 1996,
  essentialism: 2014,
  "daring-greatly": 2012,
  flow: 1990,
  "art-of-loving": 1956,
  "digital-minimalism": 2019,
  stoner: 1965,
  stranger: 1942,
  "jane-eyre": 1847,
  gatsby: 1925,
  "pride-prejudice": 1813,
  "remains-day": 1989,
  "convenience-store-woman": 2016,
  "little-prince": 1943,
  circe: 2018,
  "man-called-ove": 2012,
  "eleanor-oliphant": 2017,
  "midnight-library": 2020,
};

const themeRules: Array<[MediaTheme, RegExp]> = [
  [
    "identity",
    /strength|maturity|independence|integrity|norm|belong|value|dignity|difference/i,
  ],
  [
    "relationships",
    /relationship|communication|conflict|connection|lov|trust|care|vulnerab/i,
  ],
  [
    "work",
    /habit|structure|time|priorit|focus|attention|technology|duty|ambition|reliab|teamwork|endurance/i,
  ],
  ["emotion", /sensitiv|emotion|grief|regret|isolation|vulnerab/i],
  ["change", /development|change|choice|transformation|learning|exploration/i],
  ["meaning", /meaning|purpose|quiet life|dignity|maturity/i],
  ["creativity", /wonder|imagination|curiosity|exploration|learning/i],
  ["community", /community|belong|connection|teamwork|morality|difference/i],
];

const inferBookThemes = (
  themes: Array<LocalizedMediaText>,
): MediaTheme[] => {
  const searchable = themes.map((item) => item.en).join(" ");
  const matches = themeRules.flatMap(([theme, pattern]) =>
    pattern.test(searchable) ? [theme] : [],
  );

  return matches.length > 0 ? Array.from(new Set(matches)) : ["meaning"];
};

const scoreToPole = (score: number): TraitBand => {
  if (score <= 2.5) {
    return "low";
  }

  if (score >= 3.5) {
    return "high";
  }

  return "middle";
};

const bookMappings = (
  profile: Partial<BigFiveScores>,
  perspective: MediaPerspective,
  reason: LocalizedMediaText,
): MediaTraitMapping[] =>
  (Object.entries(profile) as Array<[TraitKey, number]>).map(
    ([trait, score]) => ({
      trait,
      pole: scoreToPole(score),
      perspective,
      reason,
    }),
  );

const BOOK_RESOURCES: MediaResource[] = CURATED_BOOKS.map((book) => ({
  id: `book-${book.id}`,
  type: book.kind,
  title: book.title,
  originalTitle: book.originalTitle,
  creator: book.author,
  year: book.year ?? ORIGINAL_BOOK_YEARS[book.id] ?? 0,
  description: book.description,
  themes: inferBookThemes(book.themes),
  traitMappings: [
    ...bookMappings(book.mirrorProfile, "mirror", book.mirrorReason),
    ...bookMappings(book.growthProfile, "growth", book.growthReason),
  ],
  source: book.sourceUrl
    ? { label: book.sourceLabel ?? "Publisher", href: book.sourceUrl }
    : undefined,
}));

export const CURATED_FILMS: MediaResource[] = [
  {
    id: "film-everything-everywhere",
    type: "film",
    title: localized(
      "Everything Everywhere All at Once",
      "Everything Everywhere All at Once",
    ),
    creator: "Daniel Kwan & Daniel Scheinert",
    year: 2022,
    description: localized(
      "A formally playful family story that moves through radically different possibilities without losing its emotional centre.",
      "Eine formal verspielte Familiengeschichte, die radikal verschiedene Möglichkeiten durchläuft, ohne ihr emotionales Zentrum zu verlieren.",
    ),
    themes: ["creativity", "relationships", "meaning"],
    traitMappings: [
      {
        trait: "O",
        pole: "high",
        perspective: "mirror",
        reason: localized(
          "Its delight in unlikely connections may mirror a mind that enjoys novelty, ambiguity, and imaginative leaps.",
          "Die Freude an unerwarteten Verbindungen kann einen Geist spiegeln, der Neuheit, Mehrdeutigkeit und imaginative Sprünge mag.",
        ),
      },
      {
        trait: "O",
        pole: "low",
        perspective: "growth",
        reason: localized(
          "Its family through-line offers a familiar anchor while the film experiments with form and possibility.",
          "Die Familiengeschichte bietet einen vertrauten Anker, während der Film mit Form und Möglichkeiten experimentiert.",
        ),
      },
    ],
    source: {
      label: "BFI",
      href: "https://www.bfi.org.uk/sight-and-sound/reviews/everything-everywhere-all-once-shows-life-fathomless-multiverse",
    },
  },
  {
    id: "film-paterson",
    type: "film",
    title: localized("Paterson", "Paterson"),
    creator: "Jim Jarmusch",
    year: 2016,
    description: localized(
      "A quiet portrait of routine, observation, and creativity in an ordinary working week.",
      "Ein ruhiges Porträt von Routine, Beobachtung und Kreativität in einer gewöhnlichen Arbeitswoche.",
    ),
    themes: ["work", "creativity", "meaning"],
    traitMappings: [
      {
        trait: "O",
        pole: "low",
        perspective: "mirror",
        reason: localized(
          "Its attention to familiar rhythms can mirror the value of consistency and close observation.",
          "Die Aufmerksamkeit für vertraute Rhythmen kann den Wert von Beständigkeit und genauer Beobachtung spiegeln.",
        ),
      },
      {
        trait: "O",
        pole: "high",
        perspective: "growth",
        reason: localized(
          "It suggests that imagination can deepen through repetition rather than requiring constant novelty.",
          "Der Film zeigt, dass Fantasie durch Wiederholung tiefer werden kann und nicht ständig Neuheit braucht.",
        ),
      },
    ],
    source: {
      label: "BFI",
      href: "https://www.bfi.org.uk/sight-and-sound/reviews/paterson-first-look",
    },
  },
  {
    id: "film-hidden-figures",
    type: "film",
    title: localized(
      "Hidden Figures",
      "Hidden Figures – Unerkannte Heldinnen",
    ),
    creator: "Theodore Melfi",
    year: 2016,
    description: localized(
      "A team-centred drama about mathematical craft, persistence, and making essential work visible.",
      "Ein teamorientiertes Drama über mathematisches Können, Ausdauer und das Sichtbarmachen unverzichtbarer Arbeit.",
    ),
    themes: ["work", "community", "change"],
    traitMappings: [
      {
        trait: "C",
        pole: "high",
        perspective: "mirror",
        reason: localized(
          "Preparation, precision, and persistent follow-through are shown as forms of shared contribution.",
          "Vorbereitung, Präzision und ausdauernde Umsetzung werden als Formen gemeinsamen Beitragens gezeigt.",
        ),
      },
      {
        trait: "C",
        pole: "low",
        perspective: "growth",
        reason: localized(
          "The story makes structure concrete through meaningful stakes and collaboration rather than abstract self-discipline.",
          "Die Geschichte macht Struktur durch bedeutsame Ziele und Zusammenarbeit konkret statt durch abstrakte Selbstdisziplin.",
        ),
      },
    ],
    source: {
      label: "BFI",
      href: "https://www.bfi.org.uk/lists/five-reasons-watch-space-race-drama-hidden-figures",
    },
  },
  {
    id: "film-frances-ha",
    type: "film",
    title: localized("Frances Ha", "Frances Ha"),
    creator: "Noah Baumbach",
    year: 2012,
    description: localized(
      "A lively portrait of friendship, uncertain plans, and gradually turning diffuse ambition into a path.",
      "Ein lebendiges Porträt von Freundschaft, unsicheren Plänen und dem allmählichen Formen diffuser Ambitionen zu einem Weg.",
    ),
    themes: ["identity", "relationships", "change"],
    traitMappings: [
      {
        trait: "C",
        pole: "low",
        perspective: "mirror",
        reason: localized(
          "Its improvised momentum may echo a flexible style that discovers direction while moving.",
          "Die improvisierte Dynamik kann einen flexiblen Stil spiegeln, der seine Richtung im Gehen entdeckt.",
        ),
      },
      {
        trait: "C",
        pole: "high",
        perspective: "growth",
        reason: localized(
          "It offers a humane view of unfinished plans and identity that is not defined by perfect progress.",
          "Der Film bietet einen menschlichen Blick auf unfertige Pläne und eine Identität, die nicht durch perfekten Fortschritt bestimmt wird.",
        ),
      },
    ],
    source: {
      label: "BFI",
      href: "https://www.bfi.org.uk/film/efe9b379-7dd1-5991-a8eb-d79f01296026/frances-ha",
    },
  },
  {
    id: "film-school-of-rock",
    type: "film",
    title: localized("School of Rock", "School of Rock"),
    creator: "Richard Linklater",
    year: 2003,
    description: localized(
      "An energetic comedy about drawing out different talents and turning a room into an ensemble.",
      "Eine energiegeladene Komödie darüber, unterschiedliche Talente hervorzuholen und einen Raum in ein Ensemble zu verwandeln.",
    ),
    themes: ["creativity", "community", "work"],
    traitMappings: [
      {
        trait: "E",
        pole: "high",
        perspective: "mirror",
        reason: localized(
          "Visible enthusiasm and social momentum become ways to mobilise a group around a shared project.",
          "Sichtbare Begeisterung und soziale Dynamik werden zu Wegen, eine Gruppe für ein gemeinsames Projekt zu mobilisieren.",
        ),
      },
      {
        trait: "E",
        pole: "low",
        perspective: "growth",
        reason: localized(
          "The ensemble shows that participation can take many forms, including focused craft away from the spotlight.",
          "Das Ensemble zeigt, dass Beteiligung viele Formen hat – auch konzentriertes Können abseits des Rampenlichts.",
        ),
      },
    ],
    source: {
      label: "BFI",
      href: "https://www.bfi.org.uk/film/623eb0c7-3e8f-533f-b861-6d40806dfbbb/the-school-of-rock",
    },
  },
  {
    id: "film-perfect-days",
    type: "film",
    title: localized("Perfect Days", "Perfect Days"),
    creator: "Wim Wenders",
    year: 2023,
    description: localized(
      "A meditative film about solitary routine, care in ordinary work, and small moments of contact.",
      "Ein meditativer Film über stille Routine, Sorgfalt in alltäglicher Arbeit und kleine Momente des Kontakts.",
    ),
    themes: ["meaning", "work", "relationships"],
    traitMappings: [
      {
        trait: "E",
        pole: "low",
        perspective: "mirror",
        reason: localized(
          "Its quiet attention may mirror an inward style that restores energy through solitude and depth.",
          "Die ruhige Aufmerksamkeit kann einen nach innen gerichteten Stil spiegeln, der durch Alleinsein und Tiefe Energie gewinnt.",
        ),
      },
      {
        trait: "E",
        pole: "high",
        perspective: "growth",
        reason: localized(
          "It makes room for connection that is brief and understated rather than continuously stimulating.",
          "Der Film schafft Raum für Verbindung, die kurz und zurückhaltend statt dauerhaft anregend ist.",
        ),
      },
    ],
    source: {
      label: "BFI",
      href: "https://www.bfi.org.uk/sight-and-sound/reviews/perfect-days-wim-wenders-captures-beauty-everyday-his-best-fiction-film-since-wings-desire",
    },
  },
  {
    id: "film-paddington-2",
    type: "film",
    title: localized("Paddington 2", "Paddington 2"),
    creator: "Paul King",
    year: 2017,
    description: localized(
      "A warm comedy about kindness, reciprocity, and changing a difficult social environment through consistent care.",
      "Eine warme Komödie über Freundlichkeit, Gegenseitigkeit und darüber, ein schwieriges soziales Umfeld durch beständige Fürsorge zu verändern.",
    ),
    themes: ["community", "relationships", "meaning"],
    traitMappings: [
      {
        trait: "A",
        pole: "high",
        perspective: "mirror",
        reason: localized(
          "Cooperation and everyday consideration are presented as active forces rather than passive niceness.",
          "Kooperation und alltägliche Rücksicht werden als aktive Kräfte gezeigt und nicht als passive Nettigkeit.",
        ),
      },
      {
        trait: "A",
        pole: "low",
        perspective: "growth",
        reason: localized(
          "Its kindness remains practical and persistent, offering connection without requiring the loss of judgment.",
          "Die Freundlichkeit bleibt praktisch und beharrlich und bietet Verbindung, ohne Urteilsvermögen aufzugeben.",
        ),
      },
    ],
    source: {
      label: "BFI",
      href: "https://www.bfi.org.uk/film/f1868b7b-ebd2-5223-ab90-1dbf449fc3c0/paddington-2",
    },
  },
  {
    id: "film-12-angry-men",
    type: "film",
    title: localized("12 Angry Men", "Die zwölf Geschworenen"),
    creator: "Sidney Lumet",
    year: 1957,
    description: localized(
      "A jury-room drama about principled dissent, careful questions, and the slow revision of confident judgments.",
      "Ein Geschworenendrama über begründeten Widerspruch, sorgfältige Fragen und die langsame Revision sicher geglaubter Urteile.",
    ),
    themes: ["community", "relationships", "identity"],
    traitMappings: [
      {
        trait: "A",
        pole: "low",
        perspective: "mirror",
        reason: localized(
          "Scepticism and willingness to challenge consensus protect the group from an easy but consequential decision.",
          "Skepsis und die Bereitschaft, Konsens herauszufordern, schützen die Gruppe vor einer einfachen, aber folgenreichen Entscheidung.",
        ),
      },
      {
        trait: "A",
        pole: "high",
        perspective: "growth",
        reason: localized(
          "The central dissent remains patient and evidence-focused, modelling disagreement without contempt.",
          "Der zentrale Widerspruch bleibt geduldig und evidenzorientiert und zeigt Meinungsverschiedenheit ohne Verachtung.",
        ),
      },
    ],
    source: {
      label: "BFI",
      href: "https://www.bfi.org.uk/features/sidney-lumets-first-last-films-12-angry-men-before-devil-knows-youre-dead",
    },
  },
  {
    id: "film-inside-out",
    type: "film",
    title: localized("Inside Out", "Alles steht Kopf"),
    creator: "Pete Docter",
    year: 2015,
    description: localized(
      "An animated story that treats difficult feelings as information and part of connection rather than defects.",
      "Eine Animationsgeschichte, die schwierige Gefühle als Information und Teil von Verbindung statt als Fehler behandelt.",
    ),
    themes: ["emotion", "relationships", "change"],
    traitMappings: [
      {
        trait: "N",
        pole: "high",
        perspective: "mirror",
        reason: localized(
          "Its respect for fear and sadness can validate the early signals noticed by an emotionally sensitive style.",
          "Der Respekt vor Angst und Traurigkeit kann die frühen Signale würdigen, die ein emotional sensibler Stil wahrnimmt.",
        ),
      },
      {
        trait: "N",
        pole: "low",
        perspective: "growth",
        reason: localized(
          "It offers an accessible way to consider feelings as useful social information, even when they are not overwhelming.",
          "Der Film bietet einen zugänglichen Weg, Gefühle als nützliche soziale Information zu betrachten, auch wenn sie nicht überwältigend sind.",
        ),
      },
    ],
    source: {
      label: "BFI",
      href: "https://www.bfi.org.uk/film/dadc2231-ddff-53af-8d9b-15125462c7d9/inside-out",
    },
  },
  {
    id: "film-apollo-13",
    type: "film",
    title: localized("Apollo 13", "Apollo 13"),
    creator: "Ron Howard",
    year: 1995,
    description: localized(
      "A crisis drama about composure, procedural thinking, and coordinated adaptation under severe pressure.",
      "Ein Krisendrama über Ruhe, prozedurales Denken und koordinierte Anpassung unter starkem Druck.",
    ),
    themes: ["work", "community", "emotion"],
    traitMappings: [
      {
        trait: "N",
        pole: "low",
        perspective: "mirror",
        reason: localized(
          "Composure under pressure becomes a contribution that gives a team room to think and coordinate.",
          "Ruhe unter Druck wird zu einem Beitrag, der dem Team Raum zum Denken und Koordinieren gibt.",
        ),
      },
      {
        trait: "N",
        pole: "high",
        perspective: "growth",
        reason: localized(
          "The film shows how alarm can be channelled into small shared procedures instead of requiring fearlessness.",
          "Der Film zeigt, wie Alarm in kleine gemeinsame Abläufe gelenkt werden kann, ohne Angstfreiheit zu verlangen.",
        ),
      },
    ],
    source: {
      label: "BFI",
      href: "https://www.bfi.org.uk/film/57a2f610-8be4-5e7d-baed-397680a4ad1c/apollo-13",
    },
  },
];

export const MEDIA_LIBRARY: MediaResource[] = [
  ...BOOK_RESOURCES,
  ...CURATED_FILMS,
];

const mappingMatchesFilters = (
  mapping: MediaTraitMapping,
  filters: MediaFilters,
) =>
  (filters.perspective === "all" ||
    mapping.perspective === filters.perspective);

const normalizeSearch = (value: string, locale: Locale) =>
  value.trim().toLocaleLowerCase(locale);

export const filterMediaResources = (
  resources: readonly MediaResource[],
  filters: MediaFilters,
  locale: Locale,
) => {
  const search = normalizeSearch(filters.search, locale);
  const hasMappingFilter = filters.perspective !== "all";

  return resources.filter((resource) => {
    if (filters.type !== "all" && resource.type !== filters.type) {
      return false;
    }

    if (filters.theme !== "all" && !resource.themes.includes(filters.theme)) {
      return false;
    }

    if (
      hasMappingFilter &&
      !resource.traitMappings.some((mapping) =>
        mappingMatchesFilters(mapping, filters),
      )
    ) {
      return false;
    }

    if (!search) {
      return true;
    }

    const searchable = [
      resource.title[locale],
      resource.title[locale === "de" ? "en" : "de"],
      resource.originalTitle,
      resource.creator,
      resource.description[locale],
      ...resource.themes.map((theme) => MEDIA_THEME_LABELS[theme][locale]),
      ...resource.traitMappings.map((mapping) => mapping.reason[locale]),
    ]
      .filter(Boolean)
      .join(" ");

    return normalizeSearch(searchable, locale).includes(search);
  });
};

const poleTarget = (pole: TraitBand) => {
  if (pole === "low") {
    return 1;
  }

  if (pole === "high") {
    return 5;
  }

  return 3;
};

const mappingAffinity = (
  scores: BigFiveScores,
  mapping: MediaTraitMapping,
) => 1 - Math.abs(scores[mapping.trait] - poleTarget(mapping.pole)) / 4;

export const getMediaTraitWeight = (
  scores: BigFiveScores,
  trait: TraitKey,
  focus: TraitFocus,
) =>
  focus === "auto"
    ? 1 + Math.abs(scores[trait] - 3) / 2
    : focus === trait
      ? 2
      : 1;

export const getMediaMappingScore = (
  scores: BigFiveScores,
  mapping: MediaTraitMapping,
  focus: TraitFocus = "auto",
) => mappingAffinity(scores, mapping) * getMediaTraitWeight(scores, mapping.trait, focus);

const eligibleMappings = (
  resource: MediaResource,
  filters: MediaFilters,
) => {
  const matching = resource.traitMappings.filter((mapping) =>
    mappingMatchesFilters(mapping, filters),
  );

  return matching.length > 0 ? matching : resource.traitMappings;
};

export const getBestMediaMapping = (
  resource: MediaResource,
  scores: BigFiveScores,
  filters: MediaFilters = DEFAULT_MEDIA_FILTERS,
) =>
  [...eligibleMappings(resource, filters)].sort((left, right) => {
    const scoreDifference =
      getMediaMappingScore(scores, right, filters.traitFocus) -
      getMediaMappingScore(scores, left, filters.traitFocus);

    if (scoreDifference !== 0) {
      return scoreDifference;
    }

    return `${left.trait}-${left.pole}-${left.perspective}`.localeCompare(
      `${right.trait}-${right.pole}-${right.perspective}`,
    );
  })[0] ?? null;

export const rankMediaResources = (
  scores: BigFiveScores,
  filters: MediaFilters,
  locale: Locale,
  resources: readonly MediaResource[] = MEDIA_LIBRARY,
) =>
  filterMediaResources(resources, filters, locale)
    .map((resource) => {
      const mapping = getBestMediaMapping(resource, scores, filters);
      return {
        resource,
        mapping,
        score: mapping
          ? getMediaMappingScore(scores, mapping, filters.traitFocus)
          : 0,
      };
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.resource.id.localeCompare(right.resource.id),
    );
