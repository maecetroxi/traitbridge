import type { Locale } from "./i18n";
import type {
  BigFiveTrait,
  LearningTopic,
  LearningTraitRelevance,
  TraitLevel,
} from "./learning-content";

type LocalizedText = Record<Locale, string>;

const text = (en: string, de: string): LocalizedText => ({ en, de });
const list = (en: string[], de: string[]) => ({ en, de });
const relevance = (
  trait: BigFiveTrait,
  level: TraitLevel,
  en: string,
  de: string,
): LearningTraitRelevance => ({
  trait,
  level,
  description: text(en, de),
});

export const ADDITIONAL_LEARNING_TOPICS: LearningTopic[] = [
  {
    slug: "turning-curiosity-into-useful-experiments",
    categories: ["work", "decisions"],
    traitRelevance: [
      relevance(
        "O",
        "high",
        "Higher openness can generate many connections and possibilities; a small experiment helps turn that range into useful learning.",
        "Hohe Offenheit kann viele Verbindungen und Möglichkeiten erzeugen; ein kleines Experiment übersetzt diese Vielfalt in brauchbares Lernen.",
      ),
    ],
    title: text(
      "Turning curiosity into useful experiments",
      "Neugier in nützliche Experimente übersetzen",
    ),
    summary: text(
      "Give an interesting idea enough structure to meet reality without removing its exploratory character.",
      "Gib einer interessanten Idee genug Struktur für die Realität, ohne ihren Entdeckungscharakter zu verlieren.",
    ),
    situation: text(
      "You see several promising directions, begin more than one of them and struggle to decide which possibility deserves a real test.",
      "Du siehst mehrere vielversprechende Richtungen, beginnst mehr als eine davon und kannst schwer entscheiden, welche Möglichkeit einen echten Test verdient.",
    ),
    whyHard: text(
      "Choosing one experiment can feel like abandoning the other possibilities. Yet ideas only produce feedback once they become observable.",
      "Ein Experiment auszuwählen kann sich anfühlen, als würdest du die anderen Möglichkeiten aufgeben. Rückmeldung entsteht jedoch erst, wenn eine Idee beobachtbar wird.",
    ),
    tendencies: text(
      "Higher openness may support imagination, unusual connections and comfort with novelty. It does not guarantee creativity, and lower openness does not imply a lack of ideas.",
      "Hohe Offenheit kann Vorstellungskraft, ungewöhnliche Verbindungen und Freude an Neuem unterstützen. Sie garantiert keine Kreativität; niedrige Offenheit bedeutet keinen Ideenmangel.",
    ),
    limits: text(
      "A trait score cannot tell you which idea is worthwhile, feasible or ethically appropriate.",
      "Ein Persönlichkeitswert kann nicht sagen, welche Idee sinnvoll, machbar oder ethisch passend ist.",
    ),
    actions: list(
      [
        "Choose the idea that could teach you the most within one week.",
        "Define the smallest visible result and one question it should answer.",
        "Keep the remaining ideas in a parking list instead of developing them in parallel.",
      ],
      [
        "Wähle die Idee, aus der du innerhalb einer Woche am meisten lernen kannst.",
        "Definiere das kleinste sichtbare Ergebnis und eine Frage, die es beantworten soll.",
        "Halte die übrigen Ideen auf einer Parkliste fest, statt sie parallel auszuarbeiten.",
      ],
    ),
    experiment: text(
      "Run one ninety-minute prototype and record what became clearer only through doing.",
      "Erstelle in neunzig Minuten einen Prototyp und notiere, was erst durch das Tun klarer wurde.",
    ),
    reflection: list(
      ["What do I want to learn rather than prove?", "Which idea can remain possible without being active?"],
      ["Was möchte ich lernen statt beweisen?", "Welche Idee darf möglich bleiben, ohne gerade aktiv zu sein?"],
    ),
    evidenceNote: text(
      "The Big Five framing is descriptive. The time-boxed experiment is an editorial learning aid, not a validated creativity intervention.",
      "Die Big-Five-Einordnung ist beschreibend. Das zeitlich begrenzte Experiment ist eine redaktionelle Lernhilfe, keine validierte Kreativitätsintervention.",
    ),
    sourceIds: ["johnson2014", "implementation2006"],
  },
  {
    slug: "improving-proven-approaches",
    categories: ["work", "decisions"],
    traitRelevance: [
      relevance(
        "O",
        "low",
        "Lower openness can support practical continuity, attention to what already works and careful adoption of change.",
        "Niedrige Offenheit kann praktische Kontinuität, Aufmerksamkeit für Bewährtes und eine sorgfältige Übernahme von Veränderungen unterstützen.",
      ),
    ],
    title: text(
      "Improving what already works",
      "Verbessern, was sich bereits bewährt",
    ),
    summary: text(
      "Use practical knowledge as a strength while making room for necessary change in manageable steps.",
      "Nutze praktisches Erfahrungswissen als Stärke und öffne zugleich überschaubaren Raum für notwendige Veränderung.",
    ),
    situation: text(
      "Others want a broad change quickly, while you see overlooked details, proven routines and risks in replacing too much at once.",
      "Andere möchten schnell vieles verändern, während du übersehene Details, bewährte Routinen und Risiken eines grossen Wechsels erkennst.",
    ),
    whyHard: text(
      "Continuity can be misread as resistance. Conversely, novelty can be presented as valuable before its practical benefit is clear.",
      "Kontinuität wird leicht als Widerstand missverstanden. Umgekehrt wird Neuheit manchmal als wertvoll dargestellt, bevor ihr praktischer Nutzen klar ist.",
    ),
    tendencies: text(
      "Lower openness may be associated with greater comfort around familiar methods and concrete information. This is not the same as rigidity or inability to learn.",
      "Niedrige Offenheit kann mit grösserer Nähe zu vertrauten Methoden und konkreten Informationen einhergehen. Das ist nicht dasselbe wie Starrheit oder Lernunfähigkeit.",
    ),
    limits: text(
      "A score cannot determine whether preserving or changing a process is the better decision.",
      "Ein Wert kann nicht bestimmen, ob Bewahren oder Verändern bei einem Ablauf die bessere Entscheidung ist.",
    ),
    actions: list(
      [
        "Name the function that the current approach protects.",
        "Ask which concrete problem the proposed change should solve.",
        "Test one reversible adjustment while keeping the reliable core.",
      ],
      [
        "Benenne die Funktion, welche der bestehende Ansatz schützt.",
        "Frage, welches konkrete Problem die vorgeschlagene Veränderung lösen soll.",
        "Teste eine umkehrbare Anpassung und behalte den verlässlichen Kern bei.",
      ],
    ),
    experiment: text(
      "Replace one step—not the whole routine—and compare the result with a clear practical criterion.",
      "Ersetze einen Schritt statt der ganzen Routine und vergleiche das Ergebnis anhand eines klaren praktischen Kriteriums.",
    ),
    reflection: list(
      ["What useful knowledge is embedded in the current method?", "What evidence would make a change worthwhile?"],
      ["Welches nützliche Wissen steckt in der heutigen Methode?", "Welche Beobachtung würde eine Veränderung lohnenswert machen?"],
    ),
    evidenceNote: text(
      "The personality description is broad and non-prescriptive. The reversible-change exercise is editorial.",
      "Die Persönlichkeitsbeschreibung ist breit und nicht vorschreibend. Die Übung zur umkehrbaren Veränderung ist redaktionell.",
    ),
    sourceIds: ["johnson2014", "roberts2017"],
  },
  {
    slug: "defining-done-and-delegating",
    categories: ["work", "stress"],
    traitRelevance: [
      relevance(
        "C",
        "high",
        "Higher conscientiousness can support dependable work while making it difficult to hand over control or accept a sufficient result.",
        "Hohe Gewissenhaftigkeit kann verlässliche Arbeit fördern und es zugleich erschweren, Kontrolle abzugeben oder ein ausreichendes Ergebnis anzunehmen.",
      ),
    ],
    title: text(
      "Defining done and sharing responsibility",
      "Fertig definieren und Verantwortung teilen",
    ),
    summary: text(
      "Protect reliability without becoming the person who quietly carries every detail.",
      "Schütze Verlässlichkeit, ohne still zur Person zu werden, die jedes Detail allein trägt.",
    ),
    situation: text(
      "You notice unfinished details, take over tasks to secure the result and become a bottleneck despite good intentions.",
      "Du bemerkst unfertige Details, übernimmst Aufgaben zur Absicherung des Ergebnisses und wirst trotz guter Absicht zum Engpass.",
    ),
    whyHard: text(
      "Responsibility can become fused with personal control. Delegation then feels riskier than absorbing more work.",
      "Verantwortung kann mit persönlicher Kontrolle verschmelzen. Delegieren fühlt sich dann riskanter an, als zusätzliche Arbeit zu übernehmen.",
    ),
    tendencies: text(
      "Higher conscientiousness can support planning, persistence and dependability. Its usefulness still depends on priorities, resources and shared expectations.",
      "Hohe Gewissenhaftigkeit kann Planung, Ausdauer und Verlässlichkeit unterstützen. Ihr Nutzen hängt dennoch von Prioritäten, Ressourcen und gemeinsamen Erwartungen ab.",
    ),
    limits: text(
      "A profile cannot establish whether your workload is fair or whether another person has the resources to take responsibility.",
      "Ein Profil zeigt weder, ob deine Arbeitslast fair ist, noch ob eine andere Person die nötigen Ressourcen für Verantwortung hat.",
    ),
    actions: list(
      [
        "Write three observable conditions for an acceptable result.",
        "Separate what requires your decision from what another person can decide.",
        "Agree on one check-in instead of monitoring every intermediate step.",
      ],
      [
        "Notiere drei beobachtbare Bedingungen für ein akzeptables Ergebnis.",
        "Trenne, was deinen Entscheid braucht, von dem, was eine andere Person entscheiden kann.",
        "Vereinbart einen Kontrollpunkt, statt jeden Zwischenschritt zu überwachen.",
      ],
    ),
    experiment: text(
      "Hand over one low-risk task with a clear outcome, decision space and review time.",
      "Übergib eine Aufgabe mit geringem Risiko samt klarem Ergebnis, Entscheidungsspielraum und Überprüfungszeitpunkt.",
    ),
    reflection: list(
      ["Which detail actually protects the outcome?", "Where am I equating responsibility with doing it myself?"],
      ["Welches Detail schützt das Ergebnis wirklich?", "Wo setze ich Verantwortung damit gleich, es selbst zu tun?"],
    ),
    evidenceNote: text(
      "Trait-performance associations are averages rather than rules. The delegation structure is an editorial practice suggestion.",
      "Zusammenhänge zwischen Persönlichkeit und Leistung sind Durchschnittswerte, keine Regeln. Die Delegationsstruktur ist ein redaktioneller Praxisvorschlag.",
    ),
    sourceIds: ["barrick1991", "johnson2014"],
  },
  {
    slug: "building-flexible-external-structure",
    categories: ["habits", "work"],
    traitRelevance: [
      relevance(
        "C",
        "low",
        "Lower conscientiousness can support responsiveness and improvisation while making invisible plans easier to lose.",
        "Niedrige Gewissenhaftigkeit kann Reaktionsfähigkeit und Improvisation unterstützen, während unsichtbare Pläne leichter verloren gehen.",
      ),
    ],
    title: text(
      "Building structure that leaves room to adapt",
      "Struktur schaffen, die Anpassung zulässt",
    ),
    summary: text(
      "Use visible anchors rather than trying to become a permanently different kind of person.",
      "Nutze sichtbare Anker, statt dauerhaft ein anderer Mensch werden zu wollen.",
    ),
    situation: text(
      "You respond well to immediate needs and changing circumstances, but distant or hidden commitments disappear from attention.",
      "Du reagierst gut auf unmittelbare Bedürfnisse und veränderte Umstände, doch entfernte oder unsichtbare Verpflichtungen verschwinden aus der Aufmerksamkeit.",
    ),
    whyHard: text(
      "Rigid systems can fail on the first unusual day. No structure at all makes every next step depend on memory and mood.",
      "Starre Systeme scheitern leicht am ersten ungewöhnlichen Tag. Ohne Struktur hängt jeder nächste Schritt von Erinnerung und Stimmung ab.",
    ),
    tendencies: text(
      "Lower conscientiousness may be associated with less natural order and advance planning. It can coexist with skill, care and strong performance in the right environment.",
      "Niedrige Gewissenhaftigkeit kann mit weniger natürlicher Ordnung und Vorausplanung einhergehen. Sie kann zugleich mit Können, Sorgfalt und starker Leistung im passenden Umfeld bestehen.",
    ),
    limits: text(
      "A trait score cannot explain executive-function problems or identify an attention disorder.",
      "Ein Persönlichkeitswert erklärt keine exekutiven Funktionsprobleme und identifiziert keine Aufmerksamkeitsstörung.",
    ),
    actions: list(
      [
        "Keep one visible list for commitments instead of several hidden systems.",
        "Choose a daily reset point rather than a detailed schedule for every hour.",
        "Define the minimum structure needed to recover after disruption.",
      ],
      [
        "Nutze eine sichtbare Liste für Verpflichtungen statt mehrerer versteckter Systeme.",
        "Wähle einen täglichen Rücksetzpunkt statt eines detaillierten Stundenplans.",
        "Definiere die minimale Struktur, mit der du nach einer Unterbrechung zurückfindest.",
      ],
    ),
    experiment: text(
      "For five days, review one visible list at the same existing cue and choose only the next concrete action.",
      "Prüfe fünf Tage lang bei demselben bestehenden Auslöser eine sichtbare Liste und wähle nur die nächste konkrete Handlung.",
    ),
    reflection: list(
      ["Which flexibility genuinely helps me?", "Which commitment needs to become visible outside my memory?"],
      ["Welche Flexibilität hilft mir wirklich?", "Welche Verpflichtung muss ausserhalb meiner Erinnerung sichtbar werden?"],
    ),
    evidenceNote: text(
      "The external-anchor design combines broad trait descriptions with editorial habit suggestions. It is not treatment advice.",
      "Das Design mit äusseren Ankern verbindet breite Persönlichkeitsbeschreibungen mit redaktionellen Gewohnheitstipps. Es ist keine Behandlungsempfehlung.",
    ),
    sourceIds: ["johnson2014", "implementation2006", "steel2007"],
  },
  {
    slug: "using-social-energy-with-space",
    categories: ["communication", "relationships", "work"],
    traitRelevance: [
      relevance(
        "E",
        "high",
        "Higher extraversion can bring momentum and connection while making quieter contributions easier to overlook.",
        "Hohe Extraversion kann Schwung und Verbindung schaffen, während leisere Beiträge leichter übersehen werden.",
      ),
    ],
    title: text(
      "Using social energy while making space",
      "Soziale Energie nutzen und zugleich Raum geben",
    ),
    summary: text(
      "Turn visible energy into participation that also helps quieter voices enter.",
      "Mache aus sichtbarer Energie Beteiligung, die auch leiseren Stimmen den Einstieg erleichtert.",
    ),
    situation: text(
      "You think through conversation, respond quickly and keep a group moving, but discover later that others needed more time or space.",
      "Du denkst im Gespräch, reagierst schnell und hältst eine Gruppe in Bewegung, erfährst aber später, dass andere mehr Zeit oder Raum gebraucht hätten.",
    ),
    whyHard: text(
      "Silence can feel like a gap to fill even when another person is still forming a contribution.",
      "Stille kann wie eine Lücke wirken, obwohl eine andere Person gerade noch einen Beitrag formuliert.",
    ),
    tendencies: text(
      "Higher extraversion can relate to social engagement, positive expression and preferred stimulation. It does not equal leadership or communication skill.",
      "Hohe Extraversion kann mit sozialer Aktivität, positivem Ausdruck und bevorzugter Stimulation zusammenhängen. Sie ist nicht dasselbe wie Führung oder Kommunikationskompetenz.",
    ),
    limits: text(
      "A score cannot reveal who has expertise, authority or a safe opportunity to speak.",
      "Ein Wert zeigt nicht, wer Expertise, Autorität oder eine sichere Gelegenheit zum Sprechen besitzt.",
    ),
    actions: list(
      [
        "State the question before offering your own answer.",
        "Leave a deliberate pause after inviting responses.",
        "Ask for written input when quick live discussion favours only some people.",
      ],
      [
        "Stelle zuerst die Frage, bevor du deine eigene Antwort anbietest.",
        "Lass nach einer Einladung zu Antworten bewusst eine Pause.",
        "Bitte um schriftliche Beiträge, wenn schnelle Live-Diskussionen nur manche Personen begünstigen.",
      ],
    ),
    experiment: text(
      "In one meeting, contribute your energy by inviting two perspectives before adding your second point.",
      "Nutze deine Energie in einem Gespräch, indem du zwei Perspektiven einlädst, bevor du deinen zweiten Punkt ergänzt.",
    ),
    reflection: list(
      ["When does my energy help the group?", "Whose thinking becomes visible only after a pause?"],
      ["Wann hilft meine Energie der Gruppe?", "Wessen Denken wird erst nach einer Pause sichtbar?"],
    ),
    evidenceNote: text(
      "The trait framing is descriptive. The participation structure is an editorial inclusion practice.",
      "Die Persönlichkeitseinordnung ist beschreibend. Die Beteiligungsstruktur ist eine redaktionelle Inklusionspraxis.",
    ),
    sourceIds: ["johnson2014", "barrick1991"],
  },
  {
    slug: "making-quiet-influence-visible",
    categories: ["communication", "work"],
    traitRelevance: [
      relevance(
        "E",
        "low",
        "Lower extraversion can support listening and depth while making valuable work less visible in fast social settings.",
        "Niedrige Extraversion kann Zuhören und Tiefe fördern, während wertvolle Arbeit in schnellen sozialen Situationen weniger sichtbar bleibt.",
      ),
    ],
    title: text(
      "Making quiet influence visible",
      "Leise Wirkung sichtbar machen",
    ),
    summary: text(
      "Create forms of visibility that do not require constant social performance.",
      "Schaffe Formen von Sichtbarkeit, die keine dauernde soziale Performance verlangen.",
    ),
    situation: text(
      "You prepare carefully, notice details and contribute more easily after reflection, but quick discussions end before your perspective appears.",
      "Du bereitest dich sorgfältig vor, bemerkst Details und trägst nach Reflexion leichter bei, doch schnelle Gespräche enden, bevor deine Perspektive sichtbar wird.",
    ),
    whyHard: text(
      "Work that is not narrated can be missed. The available forms of visibility may also demand more stimulation than the work itself.",
      "Arbeit, die nicht benannt wird, kann übersehen werden. Die verfügbaren Formen der Sichtbarkeit verlangen zudem oft mehr Stimulation als die Arbeit selbst.",
    ),
    tendencies: text(
      "Lower extraversion may relate to lower preferred stimulation and less frequent social expression. It does not mean shyness, low confidence or lack of influence.",
      "Niedrige Extraversion kann mit weniger bevorzugter Stimulation und seltenerem sozialem Ausdruck zusammenhängen. Sie bedeutet nicht Schüchternheit, geringes Selbstvertrauen oder fehlende Wirkung.",
    ),
    limits: text(
      "A profile cannot determine whether an environment distributes attention and recognition fairly.",
      "Ein Profil kann nicht bestimmen, ob ein Umfeld Aufmerksamkeit und Anerkennung fair verteilt.",
    ),
    actions: list(
      [
        "Share one concise written update before a fast discussion.",
        "Prepare one sentence that names your contribution and its effect.",
        "Request agendas or questions early enough for thoughtful input.",
      ],
      [
        "Teile vor einer schnellen Diskussion ein kurzes schriftliches Update.",
        "Bereite einen Satz vor, der deinen Beitrag und seine Wirkung benennt.",
        "Bitte früh genug um Agenda oder Fragen, damit überlegte Beiträge möglich werden.",
      ],
    ),
    experiment: text(
      "Send a three-line contribution note before one meeting: observation, implication and question.",
      "Sende vor einem Gespräch eine Beitragsnotiz in drei Zeilen: Beobachtung, Bedeutung und Frage.",
    ),
    reflection: list(
      ["Which form of visibility costs less than being constantly available?", "Who needs to know about this contribution?"],
      ["Welche Form von Sichtbarkeit kostet weniger als dauernde Verfügbarkeit?", "Wer sollte von diesem Beitrag wissen?"],
    ),
    evidenceNote: text(
      "The guide uses broad Big Five descriptions. The visibility practices are editorial and context-dependent.",
      "Der Leitfaden nutzt breite Big-Five-Beschreibungen. Die Sichtbarkeitspraktiken sind redaktionell und kontextabhängig.",
    ),
    sourceIds: ["johnson2014", "barrick1991"],
  },
  {
    slug: "disagreeing-without-losing-connection",
    categories: ["relationships", "communication"],
    traitRelevance: [
      relevance(
        "A",
        "high",
        "Higher agreeableness can support care and cooperation while making necessary disagreement feel relationally costly.",
        "Hohe Verträglichkeit kann Fürsorge und Kooperation fördern, während notwendiger Widerspruch beziehungsmässig teuer wirkt.",
      ),
    ],
    title: text(
      "Disagreeing without giving up connection",
      "Widersprechen, ohne Verbindung aufzugeben",
    ),
    summary: text(
      "Treat respectful disagreement as information that can protect cooperation.",
      "Behandle respektvollen Widerspruch als Information, die Zusammenarbeit schützen kann.",
    ),
    situation: text(
      "You understand several sides, soften your concern and later realise that your actual disagreement was never visible.",
      "Du verstehst mehrere Seiten, weichst dein Anliegen auf und bemerkst später, dass dein eigentlicher Widerspruch nie sichtbar wurde.",
    ),
    whyHard: text(
      "Agreement and connection can feel inseparable. A clear no may then seem like a withdrawal of care.",
      "Zustimmung und Verbindung können untrennbar wirken. Ein klares Nein erscheint dann wie ein Entzug von Fürsorge.",
    ),
    tendencies: text(
      "Higher agreeableness may support compassion, trust and cooperation. It does not require compliance or prevent firm boundaries.",
      "Hohe Verträglichkeit kann Mitgefühl, Vertrauen und Kooperation unterstützen. Sie verlangt keine Anpassung und verhindert keine festen Grenzen.",
    ),
    limits: text(
      "A trait score cannot tell you whether disagreement is safe or how power differences affect the conversation.",
      "Ein Persönlichkeitswert zeigt nicht, ob Widerspruch sicher ist oder wie Machtunterschiede das Gespräch beeinflussen.",
    ),
    actions: list(
      [
        "Name shared intent without pretending to share the conclusion.",
        "State your disagreement in one direct sentence.",
        "Ask what information could change either person's view.",
      ],
      [
        "Benenne die gemeinsame Absicht, ohne eine gemeinsame Schlussfolgerung vorzutäuschen.",
        "Formuliere deinen Widerspruch in einem direkten Satz.",
        "Frage, welche Information die Sicht einer der beiden Personen verändern könnte.",
      ],
    ),
    experiment: text(
      "Use: “I care about our shared goal, and I see this decision differently because…”",
      "Nutze: „Unser gemeinsames Ziel ist mir wichtig, und ich sehe diese Entscheidung anders, weil …“",
    ),
    reflection: list(
      ["What truth am I hiding to preserve short-term harmony?", "How can clarity serve the relationship?"],
      ["Welche Wahrheit verberge ich für kurzfristige Harmonie?", "Wie kann Klarheit der Beziehung dienen?"],
    ),
    evidenceNote: text(
      "The trait description is non-prescriptive. The conversation format is an editorial reflection aid.",
      "Die Persönlichkeitsbeschreibung ist nicht vorschreibend. Das Gesprächsformat ist eine redaktionelle Reflexionshilfe.",
    ),
    sourceIds: ["johnson2014", "who2020"],
  },
  {
    slug: "challenging-ideas-with-respect",
    categories: ["communication", "work", "relationships"],
    traitRelevance: [
      relevance(
        "A",
        "low",
        "Lower agreeableness can support independent judgment and candid challenge while increasing the risk that useful critique loses its audience.",
        "Niedrige Verträglichkeit kann unabhängiges Urteil und offenen Widerspruch fördern, während nützliche Kritik eher ihr Gegenüber verliert.",
      ),
    ],
    title: text(
      "Challenging ideas without reducing people",
      "Ideen herausfordern, ohne Menschen abzuwerten",
    ),
    summary: text(
      "Keep candour and independent judgment while making criticism easier to use.",
      "Bewahre Offenheit und unabhängiges Urteil und mache Kritik zugleich leichter nutzbar.",
    ),
    situation: text(
      "You see a weak assumption quickly and address it directly, but others respond to the delivery rather than the substance.",
      "Du erkennst eine schwache Annahme schnell und sprichst sie direkt an, doch andere reagieren stärker auf die Form als auf den Inhalt.",
    ),
    whyHard: text(
      "When the issue appears obvious, relational context can feel secondary. The listener still needs to understand the standard, evidence and possible next step.",
      "Wenn ein Problem offensichtlich wirkt, erscheint Beziehungskontext zweitrangig. Das Gegenüber muss dennoch Massstab, Beleg und nächsten Schritt verstehen.",
    ),
    tendencies: text(
      "Lower agreeableness may support scepticism, competitive energy or willingness to challenge consensus. It does not equal cruelty or lack of care.",
      "Niedrige Verträglichkeit kann Skepsis, Wettbewerbsenergie oder die Bereitschaft fördern, Konsens herauszufordern. Sie bedeutet weder Grausamkeit noch fehlende Fürsorge.",
    ),
    limits: text(
      "A profile cannot determine whether a criticism is accurate, proportionate or welcome in a specific role.",
      "Ein Profil bestimmt nicht, ob Kritik in einer konkreten Rolle korrekt, verhältnismässig oder erwünscht ist.",
    ),
    actions: list(
      [
        "Separate the claim from your interpretation of the person making it.",
        "Name the criterion or evidence behind your challenge.",
        "Offer one question or alternative that helps move the work forward.",
      ],
      [
        "Trenne die Aussage von deiner Deutung der Person, die sie macht.",
        "Benenne das Kriterium oder den Beleg hinter deinem Widerspruch.",
        "Biete eine Frage oder Alternative an, die die Arbeit weiterbringt.",
      ],
    ),
    experiment: text(
      "Rewrite one sharp judgment as: observation, criterion, consequence and constructive question.",
      "Formuliere ein scharfes Urteil neu als Beobachtung, Kriterium, Folge und konstruktive Frage.",
    ),
    reflection: list(
      ["What useful function does my challenge serve?", "What wording keeps the other person able to think?"],
      ["Welche nützliche Funktion erfüllt mein Widerspruch?", "Welche Formulierung hält die andere Person denkfähig?"],
    ),
    evidenceNote: text(
      "The Big Five frame describes broad tendencies, not moral character. The feedback structure is editorial.",
      "Die Big-Five-Einordnung beschreibt breite Tendenzen, keinen moralischen Charakter. Die Feedbackstruktur ist redaktionell.",
    ),
    sourceIds: ["johnson2014", "barrick1991"],
  },
  {
    slug: "using-early-warning-sensitivity",
    categories: ["stress", "decisions", "work"],
    traitRelevance: [
      relevance(
        "N",
        "high",
        "Higher emotional sensitivity can make emerging tension and possible problems noticeable early, while also making signals harder to prioritise.",
        "Hohe emotionale Empfindlichkeit kann aufkommende Spannung und mögliche Probleme früh sichtbar machen und zugleich die Priorisierung von Signalen erschweren.",
      ),
    ],
    title: text(
      "Using early-warning sensitivity without following every alarm",
      "Frühe Warnsignale nutzen, ohne jedem Alarm zu folgen",
    ),
    summary: text(
      "Turn a strong signal into a proportionate check, decision or request for support.",
      "Übersetze ein starkes Signal in eine verhältnismässige Prüfung, Entscheidung oder Bitte um Unterstützung.",
    ),
    situation: text(
      "You notice tone shifts, risks or signs of strain before others do, but several possible explanations become active at once.",
      "Du bemerkst Tonwechsel, Risiken oder Anzeichen von Belastung vor anderen, doch mehrere mögliche Erklärungen werden gleichzeitig aktiv.",
    ),
    whyHard: text(
      "A signal can be informative without its first interpretation being correct. Ignoring it loses information; treating it as proof can amplify uncertainty.",
      "Ein Signal kann informativ sein, ohne dass seine erste Deutung stimmt. Ignorieren verliert Information; es als Beweis zu behandeln verstärkt möglicherweise Unsicherheit.",
    ),
    tendencies: text(
      "Higher emotional sensitivity may involve stronger reactions to threat, uncertainty or negative events. It can support vigilance but does not guarantee accurate intuition.",
      "Hohe emotionale Empfindlichkeit kann stärkere Reaktionen auf Bedrohung, Unsicherheit oder negative Ereignisse umfassen. Sie kann Wachsamkeit fördern, garantiert aber keine korrekte Intuition.",
    ),
    limits: text(
      "A trait score cannot distinguish a useful warning from anxiety, trauma responses or unsafe circumstances.",
      "Ein Persönlichkeitswert unterscheidet keine nützliche Warnung von Angst, Traumareaktionen oder unsicheren Umständen.",
    ),
    actions: list(
      [
        "Write the signal as an observation without assigning a cause.",
        "List one benign and one concerning explanation.",
        "Choose the smallest check that would provide new information.",
      ],
      [
        "Notiere das Signal als Beobachtung, ohne ihm eine Ursache zuzuweisen.",
        "Liste eine harmlose und eine bedenkliche Erklärung auf.",
        "Wähle die kleinste Prüfung, die neue Information liefern würde.",
      ],
    ),
    experiment: text(
      "For one signal, separate: what I noticed, what I inferred and what I can verify.",
      "Trenne bei einem Signal: Was habe ich bemerkt, was habe ich geschlossen und was kann ich überprüfen?",
    ),
    reflection: list(
      ["What information is present in this feeling?", "What would a proportionate response look like?"],
      ["Welche Information steckt in diesem Gefühl?", "Wie sähe eine verhältnismässige Reaktion aus?"],
    ),
    evidenceNote: text(
      "The guide offers a non-clinical trait perspective and an editorial checking exercise. It is not anxiety treatment.",
      "Der Leitfaden bietet eine nicht-klinische Persönlichkeitsperspektive und eine redaktionelle Prüfübung. Er ist keine Angstbehandlung.",
    ),
    sourceIds: ["johnson2014", "who2020"],
    supportNote: text(
      "Seek professional support when alarm, fear or vigilance is persistent, overwhelming or connected to danger or trauma.",
      "Suche fachliche Unterstützung, wenn Alarm, Angst oder Wachsamkeit anhaltend, überwältigend oder mit Gefahr beziehungsweise Trauma verbunden sind.",
    ),
  },
  {
    slug: "noticing-weak-signals-while-calm",
    categories: ["communication", "stress", "work"],
    traitRelevance: [
      relevance(
        "N",
        "low",
        "Lower emotional sensitivity can support steadiness under pressure while subtle distress or emerging risks may require deliberate attention.",
        "Niedrige emotionale Empfindlichkeit kann Ruhe unter Druck fördern, während leise Belastung oder entstehende Risiken bewusste Aufmerksamkeit brauchen.",
      ),
    ],
    title: text(
      "Staying calm while noticing weak signals",
      "Ruhig bleiben und leise Signale wahrnehmen",
    ),
    summary: text(
      "Use emotional steadiness as an anchor without assuming that low urgency means low importance.",
      "Nutze emotionale Ruhe als Anker, ohne geringe Dringlichkeit mit geringer Bedeutung gleichzusetzen.",
    ),
    situation: text(
      "You remain composed when others are worried and can keep acting, but discover later that a concern had been building quietly.",
      "Du bleibst gelassen, wenn andere besorgt sind, und kannst weiter handeln, bemerkst aber später, dass sich ein Anliegen leise aufgebaut hatte.",
    ),
    whyHard: text(
      "Calm can provide perspective. It can also make another person's stronger signal look disproportionate before its context is understood.",
      "Ruhe kann Perspektive schaffen. Sie kann das stärkere Signal einer anderen Person auch unverhältnismässig wirken lassen, bevor sein Kontext verstanden ist.",
    ),
    tendencies: text(
      "Lower emotional sensitivity may relate to steadier reactions to stress and negative events. It does not mean indifference, courage or superior judgment.",
      "Niedrige emotionale Empfindlichkeit kann mit ruhigeren Reaktionen auf Stress und negative Ereignisse zusammenhängen. Sie bedeutet weder Gleichgültigkeit noch Mut oder überlegenes Urteil.",
    ),
    limits: text(
      "A score cannot show whether a calm response reflects resilience, limited information, avoidance or a genuinely low-risk situation.",
      "Ein Wert zeigt nicht, ob eine ruhige Reaktion auf Widerstandskraft, begrenzter Information, Vermeidung oder tatsächlich geringem Risiko beruht.",
    ),
    actions: list(
      [
        "Ask what the other person noticed before evaluating the intensity of their response.",
        "Review low-frequency but high-impact risks at a planned interval.",
        "Translate calm into one clarifying question rather than immediate reassurance.",
      ],
      [
        "Frage, was die andere Person bemerkt hat, bevor du die Stärke ihrer Reaktion bewertest.",
        "Prüfe seltene, aber folgenreiche Risiken in einem geplanten Rhythmus.",
        "Übersetze Ruhe in eine klärende Frage statt in sofortige Beruhigung.",
      ],
    ),
    experiment: text(
      "When someone raises a concern, summarise the signal and ask what evidence would increase or reduce it.",
      "Wenn jemand eine Sorge äussert, fasse das Signal zusammen und frage, welche Beobachtung es verstärken oder abschwächen würde.",
    ),
    reflection: list(
      ["What can my calm make possible here?", "Which signal deserves attention even if I do not feel urgency?"],
      ["Was ermöglicht meine Ruhe hier?", "Welches Signal verdient Aufmerksamkeit, auch wenn ich keine Dringlichkeit spüre?"],
    ),
    evidenceNote: text(
      "Lower emotional sensitivity is described neutrally. The listening and risk-review practices are editorial.",
      "Niedrige emotionale Empfindlichkeit wird wertneutral beschrieben. Die Zuhör- und Risikoprüfungen sind redaktionell.",
    ),
    sourceIds: ["johnson2014", "who2020"],
  },
];
