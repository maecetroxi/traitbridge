import type { BigFiveScores } from "../components/PersonalityBadge";
import type { Locale } from "./i18n";

export type BookKind = "nonfiction" | "fiction";
export type RecommendationMode = "mirror" | "growth";
export type TraitProfile = Partial<BigFiveScores>;

type LocalizedText = Record<Locale, string>;

export type CuratedBook = {
  id: string;
  title: LocalizedText;
  originalTitle?: string;
  author: string;
  kind: BookKind;
  themes: LocalizedText[];
  description: LocalizedText;
  mirrorProfile: TraitProfile;
  growthProfile: TraitProfile;
  mirrorReason: LocalizedText;
  growthReason: LocalizedText;
};

const text = (en: string, de: string): LocalizedText => ({ en, de });
const theme = text;

export const NEUTRAL_BOOK_PROFILE: BigFiveScores = { O: 3, C: 3, E: 3, A: 3, N: 3 };

export const CURATED_BOOKS: CuratedBook[] = [
  {
    id: "quiet", title: text("Quiet", "Still"), originalTitle: "Quiet", author: "Susan Cain", kind: "nonfiction",
    themes: [theme("Introversion", "Introversion"), theme("Strengths", "Stärken")],
    description: text("A nuanced look at introversion and the value of quiet strengths.", "Ein differenzierter Blick auf Introversion und den Wert leiser Stärken."),
    mirrorProfile: { E: 1.7, O: 3.7 }, growthProfile: { E: 1.8, N: 3.8 },
    mirrorReason: text("It can give language to a quieter way of gathering energy and making an impact.", "Das Buch kann einer ruhigeren Art, Energie zu sammeln und Wirkung zu entfalten, eine Sprache geben."),
    growthReason: text("It offers ways to use quiet strengths without forcing yourself into an extroverted ideal.", "Es zeigt Wege, leise Stärken zu nutzen, ohne sich in ein extravertiertes Ideal zu zwingen."),
  },
  {
    id: "atomic-habits", title: text("Atomic Habits", "Die 1%-Methode"), originalTitle: "Atomic Habits", author: "James Clear", kind: "nonfiction",
    themes: [theme("Habits", "Gewohnheiten"), theme("Structure", "Struktur")],
    description: text("Practical systems for making small, durable changes in everyday life.", "Praktische Systeme für kleine, dauerhafte Veränderungen im Alltag."),
    mirrorProfile: { C: 4.2, O: 3.1 }, growthProfile: { C: 1.8 },
    mirrorReason: text("Its systematic approach may fit your preference for clarity and steady progress.", "Der systematische Ansatz kann zu deiner Vorliebe für Klarheit und stetigen Fortschritt passen."),
    growthReason: text("Small environmental changes can create structure without demanding constant willpower.", "Kleine Veränderungen der Umgebung können Struktur schaffen, ohne ständig Willenskraft zu verlangen."),
  },
  {
    id: "mindset", title: text("Mindset", "Selbstbild"), originalTitle: "Mindset", author: "Carol S. Dweck", kind: "nonfiction",
    themes: [theme("Learning", "Lernen"), theme("Development", "Entwicklung")],
    description: text("How beliefs about ability shape learning, effort, and development.", "Wie Überzeugungen über Fähigkeiten Lernen, Anstrengung und Entwicklung prägen."),
    mirrorProfile: { O: 4.1, C: 3.5 }, growthProfile: { O: 2.0, N: 3.8 },
    mirrorReason: text("Its emphasis on curiosity and learning may resonate with an exploratory outlook.", "Der Schwerpunkt auf Neugier und Lernen kann mit einer entdeckenden Haltung harmonieren."),
    growthReason: text("It can help treat uncertainty and mistakes as information rather than verdicts.", "Es kann helfen, Unsicherheit und Fehler als Information statt als Urteil zu betrachten."),
  },
  {
    id: "four-thousand-weeks", title: text("Four Thousand Weeks", "4000 Wochen"), originalTitle: "Four Thousand Weeks", author: "Oliver Burkeman", kind: "nonfiction",
    themes: [theme("Time", "Zeit"), theme("Priorities", "Prioritäten")],
    description: text("A humane counterpoint to optimization and endless productivity.", "Ein menschlicher Gegenentwurf zu Optimierung und endloser Produktivität."),
    mirrorProfile: { O: 4.0, C: 3.7, N: 3.4 }, growthProfile: { C: 4.3, N: 4.0 },
    mirrorReason: text("Its reflective approach connects structure with deeper questions about a finite life.", "Der reflektierte Ansatz verbindet Struktur mit tieferen Fragen über ein endliches Leben."),
    growthReason: text("It may loosen perfectionistic pressure and clarify what deserves your limited attention.", "Es kann perfektionistischen Druck lockern und klären, was deine begrenzte Aufmerksamkeit verdient."),
  },
  {
    id: "nonviolent-communication", title: text("Nonviolent Communication", "Gewaltfreie Kommunikation"), originalTitle: "Nonviolent Communication", author: "Marshall B. Rosenberg", kind: "nonfiction",
    themes: [theme("Communication", "Kommunikation"), theme("Conflict", "Konflikte")],
    description: text("A framework for expressing needs and hearing others in difficult conversations.", "Ein Modell, um Bedürfnisse auszudrücken und andere in schwierigen Gesprächen zu hören."),
    mirrorProfile: { A: 4.2, N: 3.4 }, growthProfile: { A: 2.0, E: 2.3 },
    mirrorReason: text("Its empathic language may fit a strong concern for cooperation and understanding.", "Die empathische Sprache kann zu einem starken Wunsch nach Kooperation und Verständnis passen."),
    growthReason: text("Its concrete steps can support directness without giving up respect or connection.", "Die konkreten Schritte können Direktheit fördern, ohne Respekt oder Verbindung aufzugeben."),
  },
  {
    id: "thinking-fast-slow", title: text("Thinking, Fast and Slow", "Schnelles Denken, langsames Denken"), originalTitle: "Thinking, Fast and Slow", author: "Daniel Kahneman", kind: "nonfiction",
    themes: [theme("Decisions", "Entscheidungen"), theme("Biases", "Denkfehler")],
    description: text("An introduction to intuitive and deliberate judgment and their blind spots.", "Eine Einführung in intuitives und bewusstes Urteilen und ihre blinden Flecken."),
    mirrorProfile: { O: 4.2, C: 3.6 }, growthProfile: { C: 2.1, O: 3.8 },
    mirrorReason: text("The detailed exploration of thought may appeal to analytical curiosity.", "Die genaue Erkundung des Denkens kann analytische Neugier ansprechen."),
    growthReason: text("It provides useful pauses and checks for choices made under uncertainty.", "Es liefert hilfreiche Denkpausen und Prüfungen für Entscheidungen unter Unsicherheit."),
  },
  {
    id: "highly-sensitive-person", title: text("The Highly Sensitive Person", "Sind Sie hochsensibel?"), originalTitle: "The Highly Sensitive Person", author: "Elaine N. Aron", kind: "nonfiction",
    themes: [theme("Sensitivity", "Sensibilität"), theme("Boundaries", "Grenzen")],
    description: text("A popular framework for understanding sensitivity to stimulation and emotion.", "Ein populäres Modell zum Verständnis von Reiz- und Gefühlssensibilität."),
    mirrorProfile: { N: 4.3, E: 2.1 }, growthProfile: { N: 4.2 },
    mirrorReason: text("Some descriptions may feel familiar if you process stress and stimulation intensely.", "Manche Beschreibungen können vertraut wirken, wenn du Stress und Reize intensiv verarbeitest."),
    growthReason: text("It may encourage practical boundaries and recovery instead of judging sensitivity.", "Es kann zu praktischen Grenzen und Erholung ermutigen, statt Sensibilität zu bewerten."),
  },
  {
    id: "essentialism", title: text("Essentialism", "Essentialismus"), originalTitle: "Essentialism", author: "Greg McKeown", kind: "nonfiction",
    themes: [theme("Focus", "Fokus"), theme("Boundaries", "Grenzen")],
    description: text("A case for choosing fewer commitments with greater intention.", "Ein Plädoyer dafür, weniger Verpflichtungen bewusster auszuwählen."),
    mirrorProfile: { C: 4.0, E: 2.7 }, growthProfile: { A: 4.2, C: 2.2 },
    mirrorReason: text("Its deliberate focus may suit a preference for order and meaningful priorities.", "Der bewusste Fokus kann zu einer Vorliebe für Ordnung und sinnvolle Prioritäten passen."),
    growthReason: text("It can help protect attention when spontaneity or helpfulness creates too many commitments.", "Es kann Aufmerksamkeit schützen, wenn Spontaneität oder Hilfsbereitschaft zu viele Verpflichtungen erzeugt."),
  },
  {
    id: "daring-greatly", title: text("Daring Greatly", "Verletzlichkeit macht stark"), originalTitle: "Daring Greatly", author: "Brené Brown", kind: "nonfiction",
    themes: [theme("Vulnerability", "Verletzlichkeit"), theme("Connection", "Verbindung")],
    description: text("Reflections on courage, shame, and showing up without a perfect façade.", "Gedanken über Mut, Scham und ein Auftreten ohne perfekte Fassade."),
    mirrorProfile: { A: 4.1, N: 3.8 }, growthProfile: { E: 2.0, N: 4.1 },
    mirrorReason: text("Its concern with empathy and emotional honesty may feel personally relevant.", "Der Fokus auf Empathie und emotionale Ehrlichkeit kann sich persönlich relevant anfühlen."),
    growthReason: text("It offers a perspective on taking social risks without demanding fearlessness.", "Es bietet eine Perspektive auf soziale Risiken, ohne Angstfreiheit zu verlangen."),
  },
  {
    id: "flow", title: text("Flow", "Flow"), author: "Mihaly Csikszentmihalyi", kind: "nonfiction",
    themes: [theme("Focus", "Vertiefung"), theme("Motivation", "Motivation")],
    description: text("Why demanding, absorbing activities can create deep satisfaction.", "Warum anspruchsvolle, vertiefende Tätigkeiten tiefe Zufriedenheit erzeugen können."),
    mirrorProfile: { O: 4.0, C: 4.0, E: 2.8 }, growthProfile: { C: 2.2, N: 3.8 },
    mirrorReason: text("Deep engagement may match a curious, persistent way of working.", "Tiefe Vertiefung kann zu einer neugierigen, ausdauernden Arbeitsweise passen."),
    growthReason: text("Clear challenges and feedback can turn diffuse energy into absorbing practice.", "Klare Herausforderungen und Rückmeldung können diffuse Energie in vertiefte Praxis verwandeln."),
  },
  {
    id: "art-of-loving", title: text("The Art of Loving", "Die Kunst des Liebens"), originalTitle: "The Art of Loving", author: "Erich Fromm", kind: "nonfiction",
    themes: [theme("Relationships", "Beziehungen"), theme("Maturity", "Reife")],
    description: text("A philosophical view of love as attention, practice, and responsibility.", "Eine philosophische Sicht auf Liebe als Aufmerksamkeit, Praxis und Verantwortung."),
    mirrorProfile: { O: 4.0, A: 4.0 }, growthProfile: { A: 2.2, N: 3.7 },
    mirrorReason: text("Its reflective, relational approach may suit openness and interpersonal concern.", "Der reflektierte, beziehungsorientierte Ansatz kann zu Offenheit und sozialer Aufmerksamkeit passen."),
    growthReason: text("It invites a shift from expectation toward active care and relational skill.", "Es lädt dazu ein, Erwartungen durch aktive Fürsorge und Beziehungskompetenz zu ergänzen."),
  },
  {
    id: "digital-minimalism", title: text("Digital Minimalism", "Digitaler Minimalismus"), originalTitle: "Digital Minimalism", author: "Cal Newport", kind: "nonfiction",
    themes: [theme("Attention", "Aufmerksamkeit"), theme("Technology", "Technologie")],
    description: text("A structured approach to using technology with greater intention.", "Ein strukturierter Ansatz für einen bewussteren Umgang mit Technologie."),
    mirrorProfile: { C: 4.1, E: 2.5 }, growthProfile: { C: 2.0, N: 3.9 },
    mirrorReason: text("The deliberate rules may appeal to a structured and independent style.", "Die bewussten Regeln können eine strukturierte und unabhängige Art ansprechen."),
    growthReason: text("Reducing digital noise can support attention and recovery when distractions pile up.", "Weniger digitales Rauschen kann Aufmerksamkeit und Erholung unterstützen, wenn Ablenkungen sich häufen."),
  },
  {
    id: "stoner", title: text("Stoner", "Stoner"), author: "John Williams", kind: "fiction",
    themes: [theme("Quiet life", "Stilles Leben"), theme("Duty", "Pflicht")],
    description: text("A restrained novel about vocation, endurance, and an inward life.", "Ein zurückhaltender Roman über Berufung, Ausdauer und ein nach innen gerichtetes Leben."),
    mirrorProfile: { E: 1.6, C: 4.0, N: 3.3 }, growthProfile: { E: 2.0, A: 3.8 },
    mirrorReason: text("Stoner's inwardness and persistence can provide a quiet, imperfect mirror.", "Stoners Innerlichkeit und Ausdauer können einen stillen, unvollkommenen Spiegel bieten."),
    growthReason: text("His restraint also invites reflection on where endurance becomes passivity.", "Seine Zurückhaltung lädt auch dazu ein, darüber nachzudenken, wann Ausdauer zu Passivität wird."),
  },
  {
    id: "stranger", title: text("The Stranger", "Der Fremde"), originalTitle: "L'Étranger", author: "Albert Camus", kind: "fiction",
    themes: [theme("Alienation", "Fremdheit"), theme("Meaning", "Sinn")],
    description: text("A stark novel about distance, convention, and the search for meaning.", "Ein karger Roman über Distanz, Konventionen und die Frage nach Sinn."),
    mirrorProfile: { E: 1.5, A: 1.8, O: 3.8 }, growthProfile: { A: 2.0, O: 4.0 },
    mirrorReason: text("The protagonist's distance may echo feelings of standing outside social convention.", "Die Distanz der Hauptfigur kann Gefühle spiegeln, außerhalb gesellschaftlicher Konventionen zu stehen."),
    growthReason: text("The novel can challenge assumptions about emotional distance, responsibility, and meaning.", "Der Roman kann Annahmen über emotionale Distanz, Verantwortung und Sinn herausfordern."),
  },
  {
    id: "jane-eyre", title: text("Jane Eyre", "Jane Eyre"), author: "Charlotte Brontë", kind: "fiction",
    themes: [theme("Independence", "Unabhängigkeit"), theme("Integrity", "Integrität")],
    description: text("A story of moral independence, attachment, and self-respect.", "Eine Geschichte über moralische Unabhängigkeit, Bindung und Selbstachtung."),
    mirrorProfile: { C: 4.1, A: 3.7, E: 2.3 }, growthProfile: { A: 4.2, E: 2.0 },
    mirrorReason: text("Jane's quiet resolve may resonate with conscientiousness and firm inner standards.", "Janes stille Entschlossenheit kann Gewissenhaftigkeit und feste innere Maßstäbe spiegeln."),
    growthReason: text("Her story explores how kindness and self-assertion can coexist.", "Ihre Geschichte erkundet, wie Freundlichkeit und Selbstbehauptung zusammengehen können."),
  },
  {
    id: "gatsby", title: text("The Great Gatsby", "Der große Gatsby"), author: "F. Scott Fitzgerald", kind: "fiction",
    themes: [theme("Ambition", "Ambition"), theme("Appearance", "Fassade")],
    description: text("A compact story about reinvention, longing, and social performance.", "Eine dichte Geschichte über Neuerfindung, Sehnsucht und soziale Inszenierung."),
    mirrorProfile: { E: 4.2, O: 3.8, N: 3.3 }, growthProfile: { E: 4.2, C: 3.7 },
    mirrorReason: text("Its social energy and longing may reflect an expressive, possibility-seeking side.", "Die soziale Energie und Sehnsucht können eine expressive, nach Möglichkeiten suchende Seite spiegeln."),
    growthReason: text("It offers a counterpoint on when charisma and ambition lose contact with reality.", "Es bietet einen Gegenblick darauf, wann Charisma und Ehrgeiz den Kontakt zur Wirklichkeit verlieren."),
  },
  {
    id: "pride-prejudice", title: text("Pride and Prejudice", "Stolz und Vorurteil"), author: "Jane Austen", kind: "fiction",
    themes: [theme("Judgment", "Urteile"), theme("Relationships", "Beziehungen")],
    description: text("A witty study of first impressions, independence, and changing judgment.", "Eine pointierte Studie über erste Eindrücke, Unabhängigkeit und veränderte Urteile."),
    mirrorProfile: { E: 3.5, O: 3.8, A: 3.0 }, growthProfile: { A: 2.1, O: 2.4 },
    mirrorReason: text("Elizabeth's lively independence may suit a socially alert and questioning temperament.", "Elizabeths lebhafte Unabhängigkeit kann zu einem sozial wachen und hinterfragenden Temperament passen."),
    growthReason: text("The story rewards revising quick judgments and allowing another perspective.", "Die Geschichte belohnt es, schnelle Urteile zu revidieren und eine andere Perspektive zuzulassen."),
  },
  {
    id: "remains-day", title: text("The Remains of the Day", "Was vom Tage übrig blieb"), originalTitle: "The Remains of the Day", author: "Kazuo Ishiguro", kind: "fiction",
    themes: [theme("Duty", "Pflicht"), theme("Emotion", "Gefühle")],
    description: text("A subtle reflection on duty, restraint, and paths not taken.", "Eine subtile Reflexion über Pflicht, Zurückhaltung und nicht eingeschlagene Wege."),
    mirrorProfile: { C: 4.6, E: 1.8, N: 2.3 }, growthProfile: { C: 4.4, E: 2.0 },
    mirrorReason: text("The narrator's discipline and reserve may feel recognizably close, though deliberately heightened.", "Disziplin und Zurückhaltung des Erzählers können vertraut wirken, wenn auch bewusst zugespitzt."),
    growthReason: text("It asks what may be missed when duty consistently outranks emotional honesty.", "Der Roman fragt, was verloren gehen kann, wenn Pflicht stets vor emotionaler Ehrlichkeit steht."),
  },
  {
    id: "convenience-store-woman", title: text("Convenience Store Woman", "Die Ladenhüterin"), originalTitle: "Konbini ningen", author: "Sayaka Murata", kind: "fiction",
    themes: [theme("Norms", "Normen"), theme("Belonging", "Zugehörigkeit")],
    description: text("An unusual, concise story about social scripts and living differently.", "Eine ungewöhnliche, knappe Geschichte über soziale Drehbücher und ein anderes Leben."),
    mirrorProfile: { E: 1.8, O: 4.0, A: 2.7 }, growthProfile: { E: 2.0, N: 3.8 },
    mirrorReason: text("Keiko's distance from conventional expectations may resonate with independent outsiders.", "Keikos Distanz zu üblichen Erwartungen kann unabhängige Außenseiter ansprechen."),
    growthReason: text("The novel creates room to question which expectations are truly your own.", "Der Roman schafft Raum für die Frage, welche Erwartungen wirklich die eigenen sind."),
  },
  {
    id: "little-prince", title: text("The Little Prince", "Der kleine Prinz"), originalTitle: "Le Petit Prince", author: "Antoine de Saint-Exupéry", kind: "fiction",
    themes: [theme("Wonder", "Staunen"), theme("Connection", "Verbindung")],
    description: text("A poetic fable about attention, friendship, loss, and what matters.", "Eine poetische Fabel über Aufmerksamkeit, Freundschaft, Verlust und das Wesentliche."),
    mirrorProfile: { O: 4.5, A: 4.3, N: 3.5 }, growthProfile: { O: 2.0, A: 2.4 },
    mirrorReason: text("Its imagination and tenderness may mirror curiosity and emotional attentiveness.", "Fantasie und Zärtlichkeit können Neugier und emotionale Aufmerksamkeit spiegeln."),
    growthReason: text("Its simplicity can reopen wonder and connection when practicality dominates.", "Seine Einfachheit kann Staunen und Verbindung neu öffnen, wenn Pragmatismus dominiert."),
  },
  {
    id: "circe", title: text("Circe", "Ich bin Circe"), originalTitle: "Circe", author: "Madeline Miller", kind: "fiction",
    themes: [theme("Transformation", "Wandlung"), theme("Autonomy", "Selbstbestimmung")],
    description: text("A mythic story of solitude, craft, power, and self-definition.", "Eine mythische Geschichte über Einsamkeit, Können, Macht und Selbstbestimmung."),
    mirrorProfile: { O: 4.5, E: 2.0, C: 3.8 }, growthProfile: { A: 4.1, E: 2.2 },
    mirrorReason: text("Circe's solitary learning and imaginative world may suit an inward, exploratory profile.", "Circes einsames Lernen und ihre imaginative Welt können zu einem innerlichen, entdeckenden Profil passen."),
    growthReason: text("Her development explores boundaries and agency without abandoning attachment.", "Ihre Entwicklung erkundet Grenzen und Selbstwirksamkeit, ohne Bindung aufzugeben."),
  },
  {
    id: "man-called-ove", title: text("A Man Called Ove", "Ein Mann namens Ove"), originalTitle: "En man som heter Ove", author: "Fredrik Backman", kind: "fiction",
    themes: [theme("Community", "Gemeinschaft"), theme("Grief", "Trauer")],
    description: text("A warm story about rigidity, loss, usefulness, and unexpected connection.", "Eine warme Geschichte über Starrheit, Verlust, Nützlichkeit und unerwartete Verbindung."),
    mirrorProfile: { C: 4.4, E: 1.7, A: 2.4 }, growthProfile: { A: 2.0, O: 2.1 },
    mirrorReason: text("Ove's orderliness and blunt reserve form an affectionate, exaggerated mirror.", "Oves Ordnungsliebe und schroffe Zurückhaltung bilden einen liebevollen, zugespitzten Spiegel."),
    growthReason: text("The story shows how connection can grow through action, even without easy sociability.", "Die Geschichte zeigt, wie Verbindung durch Handeln wachsen kann, auch ohne mühelose Geselligkeit."),
  },
  {
    id: "eleanor-oliphant", title: text("Eleanor Oliphant Is Completely Fine", "Ich, Eleanor Oliphant"), originalTitle: "Eleanor Oliphant Is Completely Fine", author: "Gail Honeyman", kind: "fiction",
    themes: [theme("Isolation", "Isolation"), theme("Change", "Veränderung")],
    description: text("A story about routine, loneliness, gradual trust, and human connection.", "Eine Geschichte über Routine, Einsamkeit, wachsendes Vertrauen und menschliche Verbindung."),
    mirrorProfile: { E: 1.5, C: 4.0, N: 4.0 }, growthProfile: { E: 1.7, N: 4.2 },
    mirrorReason: text("Eleanor's routines and social distance may echo parts of a reserved inner world.", "Eleanors Routinen und soziale Distanz können Teile einer zurückhaltenden Innenwelt spiegeln."),
    growthReason: text("Her gradual change offers a humane view of accepting support in small steps.", "Ihre schrittweise Veränderung zeigt menschlich, wie Unterstützung in kleinen Schritten angenommen werden kann."),
  },
  {
    id: "midnight-library", title: text("The Midnight Library", "Die Mitternachtsbibliothek"), originalTitle: "The Midnight Library", author: "Matt Haig", kind: "fiction",
    themes: [theme("Choices", "Entscheidungen"), theme("Regret", "Bedauern")],
    description: text("A speculative story about alternate lives, regret, and choosing the present.", "Eine spekulative Geschichte über alternative Leben, Bedauern und die Wahl der Gegenwart."),
    mirrorProfile: { O: 4.2, N: 4.1 }, growthProfile: { N: 4.3, C: 3.5 },
    mirrorReason: text("Its many possible lives may resonate with imagination and intensive reflection.", "Die vielen möglichen Leben können Fantasie und intensives Nachdenken spiegeln."),
    growthReason: text("It offers a gentle counterweight to rumination about perfect choices and missed paths.", "Es bietet ein sanftes Gegengewicht zum Grübeln über perfekte Entscheidungen und verpasste Wege."),
  },
];

const scoreProfile = (scores: BigFiveScores, profile: TraitProfile) => {
  const entries = Object.entries(profile) as Array<[keyof BigFiveScores, number]>;
  if (entries.length === 0) return 0;
  return entries.reduce((total, [trait, target]) => total + (1 - Math.abs(scores[trait] - target) / 4), 0) / entries.length;
};

export const recommendBooks = (
  scores: BigFiveScores,
  kind: BookKind,
  mode: RecommendationMode,
  limit = 6,
) => CURATED_BOOKS
  .filter((book) => book.kind === kind)
  .map((book) => ({ book, score: scoreProfile(scores, mode === "mirror" ? book.mirrorProfile : book.growthProfile) }))
  .sort((left, right) => right.score - left.score || left.book.id.localeCompare(right.book.id))
  .slice(0, limit);

export const localizeBook = (book: CuratedBook, locale: Locale, mode: RecommendationMode) => ({
  title: book.title[locale],
  author: book.author,
  description: book.description[locale],
  themes: book.themes.map((item) => item[locale]),
  reason: (mode === "mirror" ? book.mirrorReason : book.growthReason)[locale],
});
