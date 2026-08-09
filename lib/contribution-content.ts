import type { BigFiveScores } from "../components/PersonalityBadge";
import {
  BIG_FIVE_TRAITS,
  type BigFiveTrait,
} from "./learning-content";
import type { Locale } from "./i18n";

export type LocalizedContributionText = Record<Locale, string>;
export type LocalizedContributionList = Record<Locale, string[]>;

export type ContributionBand = "low" | "middle" | "high";

export type ContributionPattern = {
  id: string;
  trait: BigFiveTrait;
  band: ContributionBand;
  title: LocalizedContributionText;
  contribution: LocalizedContributionText;
  noticedSignals: LocalizedContributionText;
  helpfulContexts: LocalizedContributionList;
  blindSpot: LocalizedContributionText;
  oppositeLesson: LocalizedContributionText;
  nextStep: LocalizedContributionText;
};

export type SelectedContributionPattern = {
  trait: BigFiveTrait;
  band: ContributionBand;
  score: number;
  distanceFromMiddle: number;
  pattern: ContributionPattern;
};

const localized = (
  en: string,
  de: string,
): LocalizedContributionText => ({ en, de });

const localizedList = (
  en: string[],
  de: string[],
): LocalizedContributionList => ({ en, de });

const pattern = (
  trait: BigFiveTrait,
  band: ContributionBand,
  content: Omit<ContributionPattern, "id" | "trait" | "band">,
): ContributionPattern => ({
  id: `${trait}-${band}`,
  trait,
  band,
  ...content,
});

export const NEUTRAL_CONTRIBUTION_PROFILE: BigFiveScores = {
  O: 3,
  C: 3,
  E: 3,
  A: 3,
  N: 3,
};

/**
 * Editorial reflection patterns, not predictions or diagnoses. Each pole is
 * deliberately phrased as a possible contribution with a corresponding limit.
 */
export const CONTRIBUTION_PATTERNS: Record<
  BigFiveTrait,
  Record<ContributionBand, ContributionPattern>
> = {
  O: {
    high: pattern("O", "high", {
      title: localized(
        "Explorer of possibilities",
        "Erforscher:in von Möglichkeiten",
      ),
      contribution: localized(
        "You may widen what a group can imagine by connecting ideas, questioning assumptions and making room for experiments.",
        "Du kannst den Möglichkeitsraum einer Gruppe erweitern, indem du Ideen verbindest, Annahmen hinterfragst und Experimente anregst.",
      ),
      noticedSignals: localized(
        "Unasked questions, emerging patterns and alternatives that have not yet been considered may catch your attention early.",
        "Ungefragte Fragen, entstehende Muster und noch nicht bedachte Alternativen können dir früh auffallen.",
      ),
      helpfulContexts: localizedList(
        ["Exploration and research", "Strategy and innovation", "Culture, learning and design"],
        ["Erkundung und Forschung", "Strategie und Innovation", "Kultur, Lernen und Gestaltung"],
      ),
      blindSpot: localized(
        "Novelty can become more attractive than finishing, and abstract possibilities can obscure practical constraints.",
        "Neues kann attraktiver werden als das Fertigstellen, und abstrakte Möglichkeiten können praktische Grenzen verdecken.",
      ),
      oppositeLesson: localized(
        "A person lower in openness can help protect continuity, test whether an idea works in everyday life and improve what already serves people.",
        "Ein Mensch mit niedrigerer Offenheit kann Kontinuität schützen, Ideen auf Alltagstauglichkeit prüfen und Bewährtes weiter verbessern.",
      ),
      nextStep: localized(
        "Choose one idea and ask a practically minded person what would make it useful this week.",
        "Wähle eine Idee und frage eine praktisch orientierte Person, was sie diese Woche nutzbar machen würde.",
      ),
    }),
    middle: pattern("O", "middle", {
      title: localized(
        "Translator between idea and practice",
        "Übersetzer:in zwischen Idee und Praxis",
      ),
      contribution: localized(
        "You may move between curiosity and familiarity, helping a group explore without losing contact with what is workable.",
        "Du kannst zwischen Neugier und Vertrautem wechseln und einer Gruppe helfen, Neues zu erkunden, ohne das Machbare aus dem Blick zu verlieren.",
      ),
      noticedSignals: localized(
        "You may notice both when routines have become too narrow and when an idea still needs grounding.",
        "Dir kann sowohl auffallen, wenn Routinen zu eng werden, als auch wenn einer Idee noch die Bodenhaftung fehlt.",
      ),
      helpfulContexts: localizedList(
        ["Cross-functional collaboration", "Gradual change", "Explaining new ideas"],
        ["Bereichsübergreifende Zusammenarbeit", "Schrittweise Veränderung", "Neue Ideen verständlich machen"],
      ),
      blindSpot: localized(
        "Flexibility can turn into waiting too long to take a clear position.",
        "Flexibilität kann dazu führen, dass du mit einer klaren Position zu lange wartest.",
      ),
      oppositeLesson: localized(
        "Strongly open and strongly practical people can show you when a situation needs bolder exploration or firmer continuity.",
        "Sehr offene und sehr praktisch orientierte Menschen können dir zeigen, wann eine Situation mutigere Erkundung oder stärkere Kontinuität braucht.",
      ),
      nextStep: localized(
        "Name whether the next conversation needs more possibilities or one concrete test.",
        "Benenne vor dem nächsten Gespräch, ob mehr Möglichkeiten oder ein konkreter Test gebraucht werden.",
      ),
    }),
    low: pattern("O", "low", {
      title: localized(
        "Steward of the workable",
        "Hüter:in des Praktikablen",
      ),
      contribution: localized(
        "You may give people continuity by turning attention toward proven methods, concrete needs and improvements that can be used now.",
        "Du kannst Menschen Kontinuität geben, indem du den Blick auf bewährte Methoden, konkrete Bedürfnisse und sofort nutzbare Verbesserungen richtest.",
      ),
      noticedSignals: localized(
        "Unnecessary complexity, impractical proposals and a loss of useful routines may stand out to you early.",
        "Unnötige Komplexität, unpraktische Vorschläge und der Verlust hilfreicher Routinen können dir früh auffallen.",
      ),
      helpfulContexts: localizedList(
        ["Operations and maintenance", "Craft and implementation", "Standards and local knowledge"],
        ["Betrieb und Instandhaltung", "Handwerk und Umsetzung", "Standards und lokales Erfahrungswissen"],
      ),
      blindSpot: localized(
        "A preference for what is known can make a useful unfamiliar idea seem less credible than it is.",
        "Die Vorliebe für Bekanntes kann eine hilfreiche, ungewohnte Idee weniger glaubwürdig erscheinen lassen, als sie ist.",
      ),
      oppositeLesson: localized(
        "A person higher in openness can reveal alternatives, long-term possibilities and assumptions that no longer fit.",
        "Ein Mensch mit höherer Offenheit kann Alternativen, langfristige Möglichkeiten und nicht mehr passende Annahmen sichtbar machen.",
      ),
      nextStep: localized(
        "Before rejecting a new idea, ask which small reversible trial could test it safely.",
        "Frage vor dem Ablehnen einer neuen Idee, mit welchem kleinen, umkehrbaren Versuch sie sicher geprüft werden könnte.",
      ),
    }),
  },
  C: {
    high: pattern("C", "high", {
      title: localized(
        "Builder of reliability",
        "Gestalter:in von Verlässlichkeit",
      ),
      contribution: localized(
        "You may turn intentions into dependable results through planning, follow-through and care for commitments others rely on.",
        "Du kannst Absichten durch Planung, Ausdauer und Sorgfalt bei Zusagen, auf die andere bauen, in verlässliche Ergebnisse verwandeln.",
      ),
      noticedSignals: localized(
        "Missing ownership, unclear sequences, quality gaps and approaching deadlines may become visible to you quickly.",
        "Fehlende Zuständigkeiten, unklare Abläufe, Qualitätslücken und nahende Fristen können für dich schnell sichtbar werden.",
      ),
      helpfulContexts: localizedList(
        ["Long-term projects", "Infrastructure and administration", "Quality and dependable care"],
        ["Langfristige Projekte", "Infrastruktur und Verwaltung", "Qualität und verlässliche Fürsorge"],
      ),
      blindSpot: localized(
        "High standards can become rigidity, perfectionism or the feeling that your worth depends on how much you accomplish.",
        "Hohe Ansprüche können in Starrheit, Perfektionismus oder das Gefühl kippen, dein Wert hänge von deiner Leistung ab.",
      ),
      oppositeLesson: localized(
        "A person lower in conscientiousness can help improvise when plans break and notice opportunities that no schedule anticipated.",
        "Ein Mensch mit niedrigerer Gewissenhaftigkeit kann improvisieren, wenn Pläne scheitern, und Chancen erkennen, die kein Ablauf vorgesehen hat.",
      ),
      nextStep: localized(
        "Choose one commitment where 'reliably good' is more helpful than perfect.",
        "Wähle eine Verpflichtung, bei der „verlässlich gut“ hilfreicher ist als perfekt.",
      ),
    }),
    middle: pattern("C", "middle", {
      title: localized(
        "Keeper of a workable pace",
        "Gestalter:in eines tragfähigen Tempos",
      ),
      contribution: localized(
        "You may combine enough structure for trust with enough flexibility to adjust when circumstances change.",
        "Du kannst genügend Struktur für Vertrauen mit genügend Flexibilität verbinden, um dich an veränderte Umstände anzupassen.",
      ),
      noticedSignals: localized(
        "You may sense when a plan needs firmer follow-through and when more planning would only slow useful action.",
        "Du kannst wahrnehmen, wann ein Plan konsequenter verfolgt werden muss und wann weitere Planung hilfreiches Handeln nur verzögert.",
      ),
      helpfulContexts: localizedList(
        ["Adaptive project work", "Shared routines", "Balancing quality and speed"],
        ["Anpassungsfähige Projektarbeit", "Gemeinsame Routinen", "Qualität und Tempo ausbalancieren"],
      ),
      blindSpot: localized(
        "Switching between structure and spontaneity can become inconsistent if expectations remain unspoken.",
        "Der Wechsel zwischen Struktur und Spontaneität kann inkonsequent wirken, wenn Erwartungen unausgesprochen bleiben.",
      ),
      oppositeLesson: localized(
        "People at both poles can clarify whether a situation chiefly needs dependable systems or room to improvise.",
        "Menschen an beiden Polen können verdeutlichen, ob eine Situation vor allem verlässliche Systeme oder Raum zum Improvisieren braucht.",
      ),
      nextStep: localized(
        "State one non-negotiable outcome and one part of the plan that may stay flexible.",
        "Benenne ein nicht verhandelbares Ergebnis und einen Teil des Plans, der flexibel bleiben darf.",
      ),
    }),
    low: pattern("C", "low", {
      title: localized(
        "Adaptive improviser",
        "Anpassungsfähige:r Improvisator:in",
      ),
      contribution: localized(
        "You may help people respond quickly, loosen unnecessary structure and use openings that appear while a situation is changing.",
        "Du kannst Menschen helfen, schnell zu reagieren, unnötige Strukturen zu lockern und Chancen in einer sich verändernden Situation zu nutzen.",
      ),
      noticedSignals: localized(
        "Changing conditions, rigid plans and shortcuts toward a workable first step may stand out to you.",
        "Veränderte Bedingungen, starre Pläne und Abkürzungen zu einem brauchbaren ersten Schritt können dir besonders auffallen.",
      ),
      helpfulContexts: localizedList(
        ["Fast-changing situations", "Early experimentation", "Live, creative and practical problem-solving"],
        ["Schnell wechselnde Situationen", "Frühes Ausprobieren", "Lebendige, kreative und praktische Problemlösung"],
      ),
      blindSpot: localized(
        "Forgotten commitments or unclear follow-through can quietly shift coordination work onto other people.",
        "Vergessene Zusagen oder unklare Nachverfolgung können Koordinationsarbeit unbemerkt auf andere verlagern.",
      ),
      oppositeLesson: localized(
        "A person higher in conscientiousness can create the simple structures that turn spontaneity into trust and lasting results.",
        "Ein Mensch mit höherer Gewissenhaftigkeit kann einfache Strukturen schaffen, die Spontaneität in Vertrauen und dauerhafte Ergebnisse übersetzen.",
      ),
      nextStep: localized(
        "Put one important promise in a visible place with a date and a clearly defined next action.",
        "Halte eine wichtige Zusage sichtbar mit Datum und einem klar bestimmten nächsten Schritt fest.",
      ),
    }),
  },
  E: {
    high: pattern("E", "high", {
      title: localized(
        "Activator of connection",
        "Impulsgeber:in für Verbindung",
      ),
      contribution: localized(
        "You may bring people into motion by sharing energy, initiating contact and making participation feel easier.",
        "Du kannst Menschen in Bewegung bringen, indem du Energie teilst, Kontakt initiierst und Beteiligung leichter machst.",
      ),
      noticedSignals: localized(
        "Falling group energy, social distance and ideas that need a visible advocate may catch your attention.",
        "Sinkende Gruppenenergie, soziale Distanz und Ideen, die eine sichtbare Stimme brauchen, können dir auffallen.",
      ),
      helpfulContexts: localizedList(
        ["Mobilising communities", "Facilitation and hospitality", "Visible advocacy and shared momentum"],
        ["Gemeinschaften mobilisieren", "Moderation und Gastfreundschaft", "Sichtbares Eintreten und gemeinsamer Schwung"],
      ),
      blindSpot: localized(
        "Speed and airtime can unintentionally crowd out quieter voices or the need to think before responding.",
        "Tempo und Redeanteil können leisere Stimmen oder das Bedürfnis nach Bedenkzeit unbeabsichtigt verdrängen.",
      ),
      oppositeLesson: localized(
        "A person lower in extraversion can deepen a conversation, listen for nuance and protect uninterrupted focus.",
        "Ein Mensch mit niedrigerer Extraversion kann ein Gespräch vertiefen, Nuancen hören und ungestörte Konzentration schützen.",
      ),
      nextStep: localized(
        "In the next group conversation, invite one contribution and leave a full pause before speaking again.",
        "Lade im nächsten Gruppengespräch gezielt zu einem Beitrag ein und lasse danach eine vollständige Pause, bevor du wieder sprichst.",
      ),
    }),
    middle: pattern("E", "middle", {
      title: localized(
        "Bridge between voice and space",
        "Brücke zwischen Stimme und Raum",
      ),
      contribution: localized(
        "You may alternate between visible participation and quiet attention, helping a group find an inclusive social rhythm.",
        "Du kannst zwischen sichtbarer Beteiligung und ruhiger Aufmerksamkeit wechseln und einer Gruppe zu einem inklusiven sozialen Rhythmus verhelfen.",
      ),
      noticedSignals: localized(
        "You may notice both when a room needs more outward energy and when it needs space for reflection.",
        "Du kannst sowohl bemerken, wenn ein Raum mehr äussere Energie braucht, als auch wenn Zeit zum Nachdenken fehlt.",
      ),
      helpfulContexts: localizedList(
        ["Small-group facilitation", "Hybrid collaboration", "Connecting public and focused work"],
        ["Moderation kleiner Gruppen", "Hybride Zusammenarbeit", "Öffentliche und konzentrierte Arbeit verbinden"],
      ),
      blindSpot: localized(
        "Adapting to the room can hide what level of contact and recovery you personally need.",
        "Die Anpassung an den Raum kann verdecken, wie viel Kontakt und Erholung du selbst brauchst.",
      ),
      oppositeLesson: localized(
        "People at both poles can model the value of decisive outward momentum and sustained inward depth.",
        "Menschen an beiden Polen können den Wert von entschlossenem äusserem Schwung und anhaltender innerer Tiefe zeigen.",
      ),
      nextStep: localized(
        "Before an event, plan one moment for active contact and one moment for quiet recovery.",
        "Plane vor einem Anlass einen Moment für aktiven Kontakt und einen Moment für ruhige Erholung.",
      ),
    }),
    low: pattern("E", "low", {
      title: localized(
        "Creator of depth and quiet",
        "Gestalter:in von Tiefe und Ruhe",
      ),
      contribution: localized(
        "You may give people depth through careful listening, sustained concentration and considered contributions.",
        "Du kannst Menschen durch sorgfältiges Zuhören, anhaltende Konzentration und durchdachte Beiträge Tiefe geben.",
      ),
      noticedSignals: localized(
        "Subtle details, interruptions, unprocessed questions and conversations that stay on the surface may stand out.",
        "Feine Details, Unterbrechungen, unverarbeitete Fragen und oberflächlich bleibende Gespräche können dir besonders auffallen.",
      ),
      helpfulContexts: localizedList(
        ["Research and focused craft", "One-to-one conversations", "Reflection and careful preparation"],
        ["Forschung und konzentriertes Handwerk", "Gespräche zu zweit", "Reflexion und sorgfältige Vorbereitung"],
      ),
      blindSpot: localized(
        "Valuable thoughts can remain invisible if you wait for the perfect opening or avoid necessary visibility.",
        "Wertvolle Gedanken können unsichtbar bleiben, wenn du auf den perfekten Moment wartest oder notwendige Sichtbarkeit vermeidest.",
      ),
      oppositeLesson: localized(
        "A person higher in extraversion can create momentum, open social doors and help an idea reach more people.",
        "Ein Mensch mit höherer Extraversion kann Schwung erzeugen, soziale Türen öffnen und einer Idee zu mehr Reichweite verhelfen.",
      ),
      nextStep: localized(
        "Prepare one sentence you want to contribute early in the next group meeting.",
        "Bereite einen Satz vor, den du im nächsten Gruppentreffen früh einbringen möchtest.",
      ),
    }),
  },
  A: {
    high: pattern("A", "high", {
      title: localized(
        "Cultivator of cooperation",
        "Gestalter:in von Kooperation",
      ),
      contribution: localized(
        "You may strengthen belonging by noticing needs, reducing unnecessary friction and helping people work with rather than past one another.",
        "Du kannst Zugehörigkeit stärken, indem du Bedürfnisse bemerkst, unnötige Reibung verringerst und Menschen hilfst, miteinander statt aneinander vorbei zu arbeiten.",
      ),
      noticedSignals: localized(
        "Discomfort, exclusion, unmet needs and relational strain may become apparent to you early.",
        "Unbehagen, Ausschluss, unerfüllte Bedürfnisse und Spannungen in Beziehungen können dir früh auffallen.",
      ),
      helpfulContexts: localizedList(
        ["Care and support", "Mediation and onboarding", "Team cohesion and mutual aid"],
        ["Fürsorge und Unterstützung", "Vermittlung und Begleitung", "Teamzusammenhalt und gegenseitige Hilfe"],
      ),
      blindSpot: localized(
        "Keeping harmony can obscure your own limits or postpone a conflict that needs honest attention.",
        "Das Bewahren von Harmonie kann deine eigenen Grenzen verdecken oder einen Konflikt aufschieben, der ehrliche Aufmerksamkeit braucht.",
      ),
      oppositeLesson: localized(
        "A person lower in agreeableness can protect boundaries, question weak consensus and name difficult truths.",
        "Ein Mensch mit niedrigerer Verträglichkeit kann Grenzen schützen, schwachen Konsens hinterfragen und schwierige Wahrheiten benennen.",
      ),
      nextStep: localized(
        "Express one honest preference before asking what would work for everyone else.",
        "Äussere einen ehrlichen eigenen Wunsch, bevor du fragst, was für alle anderen passen würde.",
      ),
    }),
    middle: pattern("A", "middle", {
      title: localized(
        "Constructive negotiator",
        "Konstruktive:r Vermittler:in",
      ),
      contribution: localized(
        "You may balance relationship and candour, helping people cooperate without treating disagreement as failure.",
        "Du kannst Beziehung und Klarheit ausbalancieren und Menschen helfen, zusammenzuarbeiten, ohne Widerspruch als Scheitern zu behandeln.",
      ),
      noticedSignals: localized(
        "You may see when a conversation needs more care and when courtesy is hiding the actual disagreement.",
        "Du kannst erkennen, wann ein Gespräch mehr Rücksicht braucht und wann Höflichkeit den eigentlichen Widerspruch verdeckt.",
      ),
      helpfulContexts: localizedList(
        ["Negotiation", "Feedback and decision-making", "Repairing everyday misunderstandings"],
        ["Verhandlungen", "Feedback und Entscheidungen", "Alltägliche Missverständnisse klären"],
      ),
      blindSpot: localized(
        "Trying to balance both sides can make your own principles or loyalties seem unclear.",
        "Der Versuch, beide Seiten auszubalancieren, kann deine eigenen Prinzipien oder Loyalitäten unklar erscheinen lassen.",
      ),
      oppositeLesson: localized(
        "People at both poles can clarify when trust needs warmth and when integrity needs firmer dissent.",
        "Menschen an beiden Polen können verdeutlichen, wann Vertrauen Wärme und wann Integrität entschiedeneren Widerspruch braucht.",
      ),
      nextStep: localized(
        "In one disagreement, name both the shared aim and the point on which you differ.",
        "Benenne in einer Meinungsverschiedenheit sowohl das gemeinsame Ziel als auch den Punkt, an dem ihr euch unterscheidet.",
      ),
    }),
    low: pattern("A", "low", {
      title: localized(
        "Guardian of candour and boundaries",
        "Hüter:in von Klarheit und Grenzen",
      ),
      contribution: localized(
        "You may protect people from groupthink by challenging weak arguments, resisting unfair demands and keeping boundaries visible.",
        "Du kannst Menschen vor Gruppendenken schützen, indem du schwache Argumente hinterfragst, unfairen Forderungen widerstehst und Grenzen sichtbar hältst.",
      ),
      noticedSignals: localized(
        "Contradictions, hidden trade-offs, manipulation and agreements made only to avoid tension may stand out.",
        "Widersprüche, verdeckte Zielkonflikte, Manipulation und Vereinbarungen, die nur Spannung vermeiden sollen, können dir auffallen.",
      ),
      helpfulContexts: localizedList(
        ["Quality review and governance", "Advocacy and negotiation", "Decisions that need independent judgement"],
        ["Qualitätsprüfung und Aufsicht", "Interessenvertretung und Verhandlung", "Entscheidungen mit unabhängigem Urteil"],
      ),
      blindSpot: localized(
        "Necessary directness can lose its effect if other people experience contempt, threat or no room to respond.",
        "Notwendige Direktheit kann ihre Wirkung verlieren, wenn andere Geringschätzung, Bedrohung oder keinen Raum für eine Antwort erleben.",
      ),
      oppositeLesson: localized(
        "A person higher in agreeableness can help truth land in a way that preserves dignity, trust and cooperation.",
        "Ein Mensch mit höherer Verträglichkeit kann helfen, Wahrheit so zu vermitteln, dass Würde, Vertrauen und Zusammenarbeit erhalten bleiben.",
      ),
      nextStep: localized(
        "Before a difficult objection, state the value or shared outcome you are trying to protect.",
        "Benenne vor einem schwierigen Einwand den Wert oder das gemeinsame Ergebnis, das du schützen möchtest.",
      ),
    }),
  },
  N: {
    high: pattern("N", "high", {
      title: localized(
        "Early sensor for strain",
        "Frühsensor:in für Belastung",
      ),
      contribution: localized(
        "You may help people respond sooner by detecting tension, risk and emotional shifts before they become obvious to everyone.",
        "Du kannst Menschen helfen, früher zu reagieren, indem du Spannungen, Risiken und emotionale Veränderungen bemerkst, bevor sie für alle offensichtlich werden.",
      ),
      noticedSignals: localized(
        "Small changes in mood, uncertainty, safety or the consequences of a decision may register strongly.",
        "Kleine Veränderungen in Stimmung, Unsicherheit, Sicherheit oder den Folgen einer Entscheidung können bei dir deutlich ankommen.",
      ),
      helpfulContexts: localizedList(
        ["Care and psychological safety", "Risk awareness and preparation", "Quality checks and early support"],
        ["Fürsorge und psychologische Sicherheit", "Risikowahrnehmung und Vorbereitung", "Qualitätsprüfung und frühe Unterstützung"],
      ),
      blindSpot: localized(
        "A strong alarm can feel like certainty; sustained vigilance can also exhaust you without improving the situation.",
        "Ein starkes Alarmsignal kann sich wie Gewissheit anfühlen; anhaltende Wachsamkeit kann dich zudem erschöpfen, ohne die Situation zu verbessern.",
      ),
      oppositeLesson: localized(
        "A person lower in emotional sensitivity can bring proportion, calm and steadiness while a concern is checked.",
        "Ein Mensch mit niedrigerer emotionaler Empfindlichkeit kann Ruhe, Verhältnismässigkeit und Stabilität einbringen, während eine Sorge geprüft wird.",
      ),
      nextStep: localized(
        "Separate one signal into: what I noticed, what I infer, and what small check is possible now.",
        "Trenne ein Signal in: Was habe ich bemerkt, was schliesse ich daraus und welche kleine Prüfung ist jetzt möglich?",
      ),
    }),
    middle: pattern("N", "middle", {
      title: localized(
        "Calibrated responder",
        "Abgewogene:r Reagierende:r",
      ),
      contribution: localized(
        "You may combine sensitivity to strain with enough distance to judge what kind of response a situation needs.",
        "Du kannst Sensibilität für Belastung mit genügend Abstand verbinden, um einzuschätzen, welche Reaktion eine Situation braucht.",
      ),
      noticedSignals: localized(
        "You may notice both early discomfort and the signs that a situation remains manageable.",
        "Du kannst sowohl frühes Unbehagen als auch Anzeichen dafür wahrnehmen, dass eine Situation handhabbar bleibt.",
      ),
      helpfulContexts: localizedList(
        ["Everyday risk decisions", "Supporting without escalating", "Recovery after demanding periods"],
        ["Alltägliche Risikoentscheidungen", "Unterstützen ohne Eskalation", "Erholung nach anspruchsvollen Phasen"],
      ),
      blindSpot: localized(
        "Appearing composed enough can make your own accumulating stress easy to overlook.",
        "Ausreichend gefasst zu wirken, kann dazu führen, dass du deine eigene zunehmende Belastung übersiehst.",
      ),
      oppositeLesson: localized(
        "People at both poles can sharpen your sense of when an early warning deserves attention and when calm continuity is most useful.",
        "Menschen an beiden Polen können dein Gespür dafür schärfen, wann ein frühes Warnsignal Aufmerksamkeit und wann eine ruhige Fortsetzung am meisten hilft.",
      ),
      nextStep: localized(
        "Rate one current concern for urgency and impact separately before choosing a response.",
        "Bewerte bei einer aktuellen Sorge Dringlichkeit und Auswirkung getrennt, bevor du eine Reaktion wählst.",
      ),
    }),
    low: pattern("N", "low", {
      title: localized(
        "Anchor under pressure",
        "Ruhepol unter Druck",
      ),
      contribution: localized(
        "You may give people steadiness by keeping perspective, regulating visible alarm and continuing to act when pressure rises.",
        "Du kannst Menschen Stabilität geben, indem du die Perspektive bewahrst, sichtbare Unruhe regulierst und auch bei steigendem Druck handlungsfähig bleibst.",
      ),
      noticedSignals: localized(
        "What remains stable, which risks are proportionate and where calm action is still possible may stand out to you.",
        "Was stabil bleibt, welche Risiken verhältnismässig sind und wo ruhiges Handeln möglich ist, kann dir besonders auffallen.",
      ),
      helpfulContexts: localizedList(
        ["Acute pressure and incidents", "Calm leadership", "Decisions amid uncertainty"],
        ["Akuter Druck und Zwischenfälle", "Ruhige Führung", "Entscheidungen unter Unsicherheit"],
      ),
      blindSpot: localized(
        "Subtle distress or an early warning may look less urgent to you than it feels to a more sensitive person.",
        "Feine Belastung oder ein frühes Warnsignal kann für dich weniger dringlich wirken, als es sich für einen sensibleren Menschen anfühlt.",
      ),
      oppositeLesson: localized(
        "A person higher in emotional sensitivity can detect weak signals, human consequences and risks before they grow.",
        "Ein Mensch mit höherer emotionaler Empfindlichkeit kann schwache Signale, menschliche Folgen und Risiken erkennen, bevor sie grösser werden.",
      ),
      nextStep: localized(
        "Ask one concerned person what they noticed before you decide how serious the situation is.",
        "Frage eine besorgte Person, was sie wahrgenommen hat, bevor du entscheidest, wie ernst die Situation ist.",
      ),
    }),
  },
};

const TRAIT_INDEX = new Map<BigFiveTrait, number>(
  BIG_FIVE_TRAITS.map((trait, index) => [trait, index]),
);

const normalizeScore = (value: number): number => {
  if (!Number.isFinite(value)) {
    return 3;
  }

  return Math.min(5, Math.max(1, Number(value.toFixed(2))));
};

export const getContributionBand = (score: number): ContributionBand => {
  const normalizedScore = normalizeScore(score);

  if (normalizedScore < 2.5) {
    return "low";
  }

  if (normalizedScore > 3.5) {
    return "high";
  }

  return "middle";
};

/**
 * Returns three to five stable suggestions. Marked poles come first. When only
 * one or two poles are marked, the most distinctive middle dimensions fill the
 * result to three. A wholly middle profile shows all five bridge perspectives.
 */
export const selectContributionPatterns = (
  scores: BigFiveScores,
): SelectedContributionPattern[] => {
  const ranked = BIG_FIVE_TRAITS.map((trait) => {
    const score = normalizeScore(scores[trait]);
    const band = getContributionBand(score);

    return {
      trait,
      band,
      score,
      distanceFromMiddle: Number(Math.abs(score - 3).toFixed(2)),
      pattern: CONTRIBUTION_PATTERNS[trait][band],
    };
  }).sort((first, second) => {
    const distanceDifference =
      second.distanceFromMiddle - first.distanceFromMiddle;

    if (distanceDifference !== 0) {
      return distanceDifference;
    }

    return (
      (TRAIT_INDEX.get(first.trait) ?? 0) -
      (TRAIT_INDEX.get(second.trait) ?? 0)
    );
  });

  const markedPatterns = ranked.filter(({ band }) => band !== "middle");

  if (markedPatterns.length === 0) {
    return ranked;
  }

  if (markedPatterns.length >= 3) {
    return markedPatterns.slice(0, 5);
  }

  const markedTraits = new Set(markedPatterns.map(({ trait }) => trait));
  const middleFillers = ranked.filter(({ trait }) => !markedTraits.has(trait));

  return [
    ...markedPatterns,
    ...middleFillers.slice(0, 3 - markedPatterns.length),
  ];
};
