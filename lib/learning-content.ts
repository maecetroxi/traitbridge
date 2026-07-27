import type { Locale } from "./i18n";

export const LEARNING_CATEGORIES = [
  "work",
  "relationships",
  "communication",
  "stress",
  "decisions",
  "habits",
] as const;

export type LearningCategory = (typeof LEARNING_CATEGORIES)[number];
export type EvidenceKind =
  | "meta-analysis"
  | "systematic-review"
  | "primary-study"
  | "institution"
  | "editorial";

type LocalizedText = Record<Locale, string>;

export type LearningSource = {
  id: string;
  title: string;
  authors: string;
  year: number;
  href: string;
  kind: Exclude<EvidenceKind, "editorial">;
};

export type LearningTopic = {
  slug: string;
  categories: LearningCategory[];
  relatedTraits: Array<"O" | "C" | "E" | "A" | "N">;
  title: LocalizedText;
  summary: LocalizedText;
  situation: LocalizedText;
  whyHard: LocalizedText;
  tendencies: LocalizedText;
  limits: LocalizedText;
  actions: Record<Locale, string[]>;
  experiment: LocalizedText;
  reflection: Record<Locale, string[]>;
  evidenceNote: LocalizedText;
  sourceIds: string[];
  supportNote?: LocalizedText;
};

const localized = (en: string, de: string): LocalizedText => ({ en, de });
const localizedList = (en: string[], de: string[]) => ({ en, de });

export const LEARNING_SOURCES: Record<string, LearningSource> = {
  johnson2014: {
    id: "johnson2014",
    title:
      "Measuring thirty facets of the Five Factor Model with a 120-item public domain inventory",
    authors: "Johnson, J. A.",
    year: 2014,
    href: "https://doi.org/10.1016/j.jrp.2014.05.003",
    kind: "primary-study",
  },
  implementation2006: {
    id: "implementation2006",
    title: "Implementation intentions and goal achievement: A meta-analysis",
    authors: "Gollwitzer, P. M. & Sheeran, P.",
    year: 2006,
    href: "https://doi.org/10.1016/S0065-2601(06)38002-1",
    kind: "meta-analysis",
  },
  steel2007: {
    id: "steel2007",
    title: "The nature of procrastination: A meta-analytic and theoretical review",
    authors: "Steel, P.",
    year: 2007,
    href: "https://pubmed.ncbi.nlm.nih.gov/17201571/",
    kind: "meta-analysis",
  },
  macbeth2012: {
    id: "macbeth2012",
    title:
      "Exploring compassion: A meta-analysis of the association between self-compassion and psychopathology",
    authors: "MacBeth, A. & Gumley, A.",
    year: 2012,
    href: "https://doi.org/10.1016/j.cpr.2012.06.003",
    kind: "meta-analysis",
  },
  barrick1991: {
    id: "barrick1991",
    title: "The Big Five personality dimensions and job performance: A meta-analysis",
    authors: "Barrick, M. R. & Mount, M. K.",
    year: 1991,
    href: "https://doi.org/10.1111/j.1744-6570.1991.tb00688.x",
    kind: "meta-analysis",
  },
  roberts2017: {
    id: "roberts2017",
    title: "A systematic review of personality trait change through intervention",
    authors: "Roberts, B. W. et al.",
    year: 2017,
    href: "https://pubmed.ncbi.nlm.nih.gov/28054797/",
    kind: "systematic-review",
  },
  who2020: {
    id: "who2020",
    title: "Doing What Matters in Times of Stress: An Illustrated Guide",
    authors: "World Health Organization",
    year: 2020,
    href: "https://www.who.int/publications-detail-redirect/9789240003927",
    kind: "institution",
  },
};

export const LEARNING_TOPICS: LearningTopic[] = [
  {
    slug: "decisions-with-overthinking",
    categories: ["decisions", "stress"],
    relatedTraits: ["O", "C", "N"],
    title: localized(
      "Making decisions when you tend to overthink",
      "Entscheidungen treffen, wenn du viel grübelst",
    ),
    summary: localized(
      "A small structure for moving from endless comparison to a decision you can revisit.",
      "Eine kleine Struktur, um vom endlosen Vergleichen zu einer überprüfbaren Entscheidung zu kommen.",
    ),
    situation: localized(
      "You keep collecting information, revisit the same options and still do not feel ready to decide.",
      "Du sammelst immer mehr Informationen, gehst dieselben Optionen wiederholt durch und fühlst dich trotzdem nicht entscheidungsbereit.",
    ),
    whyHard: localized(
      "Uncertainty cannot be removed completely. More analysis can briefly feel safer while also creating new criteria and doubts.",
      "Unsicherheit lässt sich nicht vollständig beseitigen. Mehr Analyse kann sich kurz sicherer anfühlen und gleichzeitig neue Kriterien und Zweifel erzeugen.",
    ),
    tendencies: localized(
      "Curiosity, carefulness or emotional sensitivity can each shape this pattern. The same tendencies may also support thoughtful decisions when they are given a clear stopping point.",
      "Neugier, Sorgfalt oder emotionale Sensibilität können dieses Muster mitprägen. Dieselben Tendenzen können durch einen klaren Endpunkt auch besonders durchdachte Entscheidungen unterstützen.",
    ),
    limits: localized(
      "A profile cannot tell you which option is right or whether your hesitation has one single cause.",
      "Ein Profil kann dir weder sagen, welche Option richtig ist, noch ob dein Zögern nur eine einzige Ursache hat.",
    ),
    actions: localizedList(
      [
        "Write down the two criteria that matter most; treat the rest as secondary.",
        "Set a time at which you will decide with the information currently available.",
        "Define what would justify revisiting the decision later.",
      ],
      [
        "Notiere die zwei wichtigsten Kriterien; behandle den Rest als zweitrangig.",
        "Lege einen Zeitpunkt fest, an dem du mit den dann verfügbaren Informationen entscheidest.",
        "Definiere vorab, was ein späteres Überprüfen der Entscheidung rechtfertigen würde.",
      ],
    ),
    experiment: localized(
      "For one low-risk decision, use: “If I notice that I am comparing the same options again, then I will check my two criteria and choose.”",
      "Nutze bei einer Entscheidung mit kleinem Risiko: „Wenn ich merke, dass ich dieselben Optionen erneut vergleiche, prüfe ich meine zwei Kriterien und entscheide.“",
    ),
    reflection: localizedList(
      ["Which uncertainty am I trying to eliminate?", "What would be a good-enough decision?"],
      ["Welche Unsicherheit versuche ich ganz zu beseitigen?", "Wie sähe eine ausreichend gute Entscheidung aus?"],
    ),
    evidenceNote: localized(
      "The if–then format is based on research on implementation intentions. The decision worksheet itself is an editorial reflection aid, not a diagnostic or therapeutic method.",
      "Das Wenn-dann-Format stützt sich auf Forschung zu Implementierungsintentionen. Das Entscheidungsblatt selbst ist eine redaktionelle Reflexionshilfe, keine diagnostische oder therapeutische Methode.",
    ),
    sourceIds: ["implementation2006", "who2020"],
  },
  {
    slug: "procrastination-and-structure",
    categories: ["work", "habits"],
    relatedTraits: ["C", "N"],
    title: localized(
      "Procrastination and missing structure",
      "Aufschieben und fehlende Struktur",
    ),
    summary: localized(
      "Reduce the distance between intention and the first visible action.",
      "Verkleinere die Distanz zwischen Absicht und erster sichtbarer Handlung.",
    ),
    situation: localized(
      "A task matters to you, yet you repeatedly turn to something easier or wait for the right mood.",
      "Eine Aufgabe ist dir wichtig, trotzdem wechselst du immer wieder zu etwas Leichterem oder wartest auf die richtige Stimmung.",
    ),
    whyHard: localized(
      "Procrastination is not explained by laziness alone. Task aversion, delay, unclear next actions and short-term mood repair can all matter.",
      "Aufschieben lässt sich nicht einfach mit Faulheit erklären. Unangenehme Aufgaben, zeitliche Distanz, unklare nächste Schritte und kurzfristige Stimmungsregulation können alle eine Rolle spielen.",
    ),
    tendencies: localized(
      "Lower preference for structure or stronger stress reactions may make some contexts harder. Neither score determines whether someone procrastinates.",
      "Eine geringere Vorliebe für Struktur oder stärkere Stressreaktionen können manche Situationen erschweren. Kein Wert bestimmt, ob jemand aufschiebt.",
    ),
    limits: localized(
      "A personality score does not identify ADHD, depression, burnout or another clinical explanation.",
      "Ein Persönlichkeitswert identifiziert weder ADHS noch Depression, Burnout oder eine andere klinische Erklärung.",
    ),
    actions: localizedList(
      [
        "Rewrite the task as an action that takes no more than ten minutes.",
        "Choose a concrete time and place for starting.",
        "Make the desired material visible and the main distraction less immediate.",
      ],
      [
        "Formuliere die Aufgabe als Handlung, die höchstens zehn Minuten dauert.",
        "Lege einen konkreten Startzeitpunkt und -ort fest.",
        "Mache das benötigte Material sichtbar und die wichtigste Ablenkung weniger unmittelbar.",
      ],
    ),
    experiment: localized(
      "Use a ten-minute start. After ten minutes you may stop deliberately; continuing is optional.",
      "Nutze einen Zehn-Minuten-Start. Danach darfst du bewusst aufhören; Weitermachen ist optional.",
    ),
    reflection: localizedList(
      ["What exactly feels aversive?", "Is the next action observable and small enough?"],
      ["Was genau fühlt sich unangenehm an?", "Ist der nächste Schritt sichtbar und klein genug?"],
    ),
    evidenceNote: localized(
      "The explanation draws on a meta-analytic review of procrastination. If–then planning has separate meta-analytic support; the ten-minute format is an editorial implementation suggestion.",
      "Die Einordnung stützt sich auf eine metaanalytische Übersicht zu Prokrastination. Wenn-dann-Planung ist separat metaanalytisch untersucht; das Zehn-Minuten-Format ist eine redaktionelle Umsetzungshilfe.",
    ),
    sourceIds: ["steel2007", "implementation2006"],
    supportNote: localized(
      "If persistent avoidance causes major impairment or may be connected to a mental-health or attention problem, consider professional assessment.",
      "Wenn anhaltendes Aufschieben zu deutlichen Einschränkungen führt oder mit psychischen beziehungsweise Aufmerksamkeitsproblemen zusammenhängen könnte, kann eine fachliche Abklärung sinnvoll sein.",
    ),
  },
  {
    slug: "softening-perfectionistic-standards",
    categories: ["work", "stress"],
    relatedTraits: ["C", "N"],
    title: localized(
      "Softening perfectionistic standards",
      "Perfektionistische Ansprüche reduzieren",
    ),
    summary: localized(
      "Keep care and ambition while making completion possible.",
      "Sorgfalt und Anspruch behalten, ohne Fertigwerden unmöglich zu machen.",
    ),
    situation: localized(
      "You invest far more time than the task requires, delay sharing work or treat small mistakes as evidence of failure.",
      "Du investierst deutlich mehr Zeit als nötig, zeigst Arbeit erst sehr spät oder deutest kleine Fehler als persönliches Scheitern.",
    ),
    whyHard: localized(
      "High standards and fear of mistakes can become entangled. Lowering one standard may then feel like lowering every standard.",
      "Hohe Ansprüche und Fehlerangst können sich miteinander verknüpfen. Einen Anspruch zu senken fühlt sich dann an, als würden alle Ansprüche fallen.",
    ),
    tendencies: localized(
      "Carefulness can support quality, while emotional sensitivity may amplify the cost of uncertainty or criticism. Context and learned rules matter as much as a broad trait score.",
      "Sorgfalt kann Qualität unterstützen, während emotionale Sensibilität die Belastung durch Unsicherheit oder Kritik verstärken kann. Kontext und gelernte Regeln sind ebenso wichtig wie ein breiter Persönlichkeitswert.",
    ),
    limits: localized(
      "High conscientiousness is not the same as clinical perfectionism, and low scores do not imply healthy flexibility.",
      "Hohe Gewissenhaftigkeit ist nicht dasselbe wie klinischer Perfektionismus; niedrigere Werte bedeuten nicht automatisch gesunde Flexibilität.",
    ),
    actions: localizedList(
      [
        "Define a minimum, target and exceptional version before starting.",
        "Decide which errors would genuinely matter to the recipient.",
        "Ask for feedback on an earlier, clearly labelled draft.",
      ],
      [
        "Definiere vor dem Start eine Mindest-, Ziel- und Ausnahmeversion.",
        "Entscheide, welche Fehler für die Empfänger wirklich relevant wären.",
        "Bitte früher um Feedback und kennzeichne den Stand klar als Entwurf.",
      ],
    ),
    experiment: localized(
      "Complete one low-risk task at your predefined target level and record what actually happened.",
      "Schliesse eine Aufgabe mit geringem Risiko auf deinem vorher definierten Zielniveau ab und notiere, was tatsächlich passiert.",
    ),
    reflection: localizedList(
      ["Whose standard am I applying?", "What does this task need—not what could it theoretically become?"],
      ["Wessen Massstab wende ich an?", "Was braucht diese Aufgabe – nicht: Was könnte theoretisch aus ihr werden?"],
    ),
    evidenceNote: localized(
      "The distinction between striving and distress needs careful interpretation. The concrete three-level standard is an editorial exercise; self-compassion research is correlational and does not prove a treatment effect here.",
      "Die Unterscheidung zwischen Streben und Belastung muss vorsichtig interpretiert werden. Der dreistufige Standard ist eine redaktionelle Übung; Forschung zu Selbstmitgefühl ist hier korrelativ und kein Beleg für eine Behandlungswirkung.",
    ),
    sourceIds: ["macbeth2012", "who2020"],
    supportNote: localized(
      "Seek professional support when perfectionistic rules are tied to severe distress, self-harm thoughts or major impairment.",
      "Suche fachliche Unterstützung, wenn perfektionistische Regeln mit starker Belastung, Selbstverletzungsgedanken oder deutlichen Einschränkungen verbunden sind.",
    ),
  },
  {
    slug: "setting-boundaries",
    categories: ["relationships", "communication"],
    relatedTraits: ["A", "N", "E"],
    title: localized(
      "Setting boundaries without becoming unnecessarily harsh",
      "Grenzen setzen, ohne unnötig hart zu wirken",
    ),
    summary: localized(
      "Express a limit as clear information rather than a verdict about the other person.",
      "Eine Grenze als klare Information formulieren – nicht als Urteil über die andere Person.",
    ),
    situation: localized(
      "You agree too quickly, feel resentment later or wait until your limit comes out more sharply than intended.",
      "Du stimmst zu schnell zu, ärgerst dich später oder wartest so lange, bis deine Grenze schärfer herauskommt als beabsichtigt.",
    ),
    whyHard: localized(
      "A boundary can activate competing goals: protecting time, preserving closeness and avoiding conflict.",
      "Eine Grenze kann konkurrierende Ziele aktivieren: Zeit schützen, Nähe bewahren und Konflikt vermeiden.",
    ),
    tendencies: localized(
      "Cooperativeness, assertiveness and sensitivity to tension may influence how easy a boundary feels. They do not define what you owe another person.",
      "Kooperationsbereitschaft, Durchsetzungsneigung und Sensibilität für Spannung können beeinflussen, wie leicht sich eine Grenze anfühlt. Sie bestimmen nicht, was du einer anderen Person schuldest.",
    ),
    limits: localized(
      "A profile cannot assess whether a relationship is safe or whether a boundary will be respected.",
      "Ein Profil kann nicht beurteilen, ob eine Beziehung sicher ist oder eine Grenze respektiert wird.",
    ),
    actions: localizedList(
      [
        "Name what you can or cannot do without diagnosing the other person.",
        "Keep the first explanation brief; add context only if it helps.",
        "Offer an alternative only when you genuinely want to.",
      ],
      [
        "Benenne, was du tun kannst oder nicht kannst, ohne die andere Person zu diagnostizieren.",
        "Halte die erste Erklärung kurz; ergänze Kontext nur, wenn er hilft.",
        "Biete eine Alternative nur an, wenn du sie wirklich anbieten möchtest.",
      ],
    ),
    experiment: localized(
      "Practise one sentence: “I cannot take this on this week. I can look at it next Tuesday.”",
      "Übe einen Satz: „Diese Woche kann ich das nicht übernehmen. Am nächsten Dienstag kann ich es anschauen.“",
    ),
    reflection: localizedList(
      ["What limit is already present even if I do not say it?", "Which explanation is enough?"],
      ["Welche Grenze ist bereits da, auch wenn ich sie nicht ausspreche?", "Welche Erklärung ist ausreichend?"],
    ),
    evidenceNote: localized(
      "This is an editorial communication framework informed by general stress-management principles, not a validated protocol.",
      "Dies ist ein redaktioneller Kommunikationsrahmen, orientiert an allgemeinen Prinzipien der Stressbewältigung – kein validiertes Trainingsprotokoll.",
    ),
    sourceIds: ["who2020"],
    supportNote: localized(
      "If you fear retaliation, coercion or violence, prioritise safety and seek specialised local support rather than relying on a communication script.",
      "Wenn du Vergeltung, Zwang oder Gewalt befürchtest, hat Sicherheit Vorrang. Suche spezialisierte lokale Unterstützung, statt dich auf ein Gesprächsskript zu verlassen.",
    ),
  },
  {
    slug: "preparing-difficult-conversations",
    categories: ["communication", "relationships", "work"],
    relatedTraits: ["A", "E", "N"],
    title: localized(
      "Preparing a difficult conversation",
      "Ein schwieriges Gespräch vorbereiten",
    ),
    summary: localized(
      "Clarify the observation, your concern and the one change you want to discuss.",
      "Beobachtung, Anliegen und die eine gewünschte Veränderung voneinander trennen.",
    ),
    situation: localized(
      "You rehearse many versions of a conversation but become vague, defensive or overloaded when it starts.",
      "Du spielst viele Gesprächsversionen durch, wirst im tatsächlichen Gespräch aber vage, defensiv oder überlastet.",
    ),
    whyHard: localized(
      "Anticipated conflict consumes attention. Trying to solve every possible reaction in advance can obscure the central message.",
      "Erwarteter Konflikt bindet Aufmerksamkeit. Wer jede mögliche Reaktion vorab lösen will, verliert leicht die zentrale Botschaft.",
    ),
    tendencies: localized(
      "Sensitivity to tension, preference for harmony or lower social assertiveness can matter. Direct communicators can face a different risk: moving too quickly past context.",
      "Sensibilität für Spannung, Harmoniebedürfnis oder geringere soziale Durchsetzung können eine Rolle spielen. Direkte Personen haben ein anderes Risiko: zu schnell über Kontext hinwegzugehen.",
    ),
    limits: localized(
      "A trait profile does not reveal the other person's intentions or predict the outcome of the conversation.",
      "Ein Persönlichkeitsprofil zeigt weder die Absichten der anderen Person noch sagt es den Gesprächsausgang voraus.",
    ),
    actions: localizedList(
      [
        "Write one neutral observation without motives or labels.",
        "Name the practical impact and the topic you want to decide together.",
        "Choose a time and setting with enough attention and an exit option.",
      ],
      [
        "Notiere eine neutrale Beobachtung ohne Motive oder Etiketten.",
        "Benenne die praktische Auswirkung und das Thema, das ihr gemeinsam klären sollt.",
        "Wähle Zeitpunkt und Ort mit genügend Aufmerksamkeit und einer Pausenmöglichkeit.",
      ],
    ),
    experiment: localized(
      "Prepare a three-line opening and read it aloud once. Do not script the entire conversation.",
      "Bereite einen Einstieg aus drei Sätzen vor und lies ihn einmal laut. Skripte nicht das ganze Gespräch.",
    ),
    reflection: localizedList(
      ["What is the observable issue?", "What would a useful next ten minutes achieve?"],
      ["Was ist konkret beobachtbar?", "Was sollten die nächsten zehn Minuten sinnvollerweise erreichen?"],
    ),
    evidenceNote: localized(
      "Specific planning is supported in goal research. The three-line conversation structure is an editorial practice aid.",
      "Konkrete Planung ist in der Zielforschung untersucht. Die Drei-Satz-Struktur ist eine redaktionelle Übungshilfe.",
    ),
    sourceIds: ["implementation2006", "who2020"],
  },
  {
    slug: "addressing-conflict-directly",
    categories: ["communication", "relationships", "work"],
    relatedTraits: ["A", "E", "N"],
    title: localized(
      "Addressing conflict directly and respectfully",
      "Konflikte direkter und respektvoll ansprechen",
    ),
    summary: localized(
      "Move from assumptions about character to a specific pattern that can be discussed.",
      "Von Annahmen über den Charakter zu einem konkreten, besprechbaren Muster wechseln.",
    ),
    situation: localized(
      "A recurring issue is discussed indirectly, through hints or with other people, but not with the person involved.",
      "Ein wiederkehrendes Problem wird indirekt, über Andeutungen oder mit Dritten besprochen – aber nicht mit der beteiligten Person.",
    ),
    whyHard: localized(
      "Avoidance can protect the relationship in the short term while allowing interpretations and resentment to accumulate.",
      "Vermeidung kann die Beziehung kurzfristig schützen, während sich Deutungen und Ärger ansammeln.",
    ),
    tendencies: localized(
      "Harmony orientation may favour waiting; assertiveness may favour fast confrontation. Either tendency can be useful or costly depending on timing and wording.",
      "Harmonieorientierung kann zum Warten führen, Durchsetzungsneigung zur schnellen Konfrontation. Beides kann je nach Zeitpunkt und Formulierung hilfreich oder belastend sein.",
    ),
    limits: localized(
      "No trait value determines whether directness is safe, fair or culturally appropriate in a specific context.",
      "Kein Persönlichkeitswert bestimmt, ob Direktheit in einer konkreten Situation sicher, fair oder kulturell passend ist.",
    ),
    actions: localizedList(
      [
        "Describe one recurring behaviour and its effect.",
        "Ask how the other person sees the situation before proposing a solution.",
        "Agree on one observable next step and a time to revisit it.",
      ],
      [
        "Beschreibe ein wiederkehrendes Verhalten und seine Auswirkung.",
        "Frage nach der Sicht der anderen Person, bevor du eine Lösung vorschlägst.",
        "Vereinbart einen sichtbaren nächsten Schritt und einen Zeitpunkt zur Überprüfung.",
      ],
    ),
    experiment: localized(
      "Replace one character judgement with an observation you could record on camera or a calendar.",
      "Ersetze ein Charakterurteil durch eine Beobachtung, die eine Kamera oder ein Kalender erfassen könnte.",
    ),
    reflection: localizedList(
      ["What am I assuming without checking?", "What change could both people observe?"],
      ["Was nehme ich an, ohne es geprüft zu haben?", "Welche Veränderung könnten beide Personen beobachten?"],
    ),
    evidenceNote: localized(
      "The observation-based structure is editorial. Personality-performance research supports context-dependent associations, not fixed communication rules.",
      "Die beobachtungsbasierte Struktur ist redaktionell. Persönlichkeits- und Leistungsforschung zeigt kontextabhängige Zusammenhänge, keine festen Kommunikationsregeln.",
    ),
    sourceIds: ["barrick1991"],
  },
  {
    slug: "social-exhaustion",
    categories: ["stress", "relationships"],
    relatedTraits: ["E", "N"],
    title: localized(
      "Responding to social exhaustion",
      "Mit sozialer Erschöpfung umgehen",
    ),
    summary: localized(
      "Notice which parts of social contact cost energy and which forms restore it.",
      "Unterscheide, welche Aspekte sozialer Kontakte Energie kosten und welche Formen sie wiederherstellen.",
    ),
    situation: localized(
      "After meetings or social events you need recovery, yet you judge that need or withdraw longer than intended.",
      "Nach Meetings oder sozialen Anlässen brauchst du Erholung, bewertest dieses Bedürfnis aber negativ oder ziehst dich länger zurück als beabsichtigt.",
    ),
    whyHard: localized(
      "Duration, noise, role demands, unfamiliarity and emotional tension can all influence social load. “Being social” is not one uniform activity.",
      "Dauer, Geräuschpegel, Rollenerwartungen, Unvertrautheit und emotionale Spannung können soziale Belastung beeinflussen. „Sozial sein“ ist keine einheitliche Aktivität.",
    ),
    tendencies: localized(
      "Extraversion can relate to preferred stimulation and social engagement, but it does not measure social skill, kindness or need for belonging.",
      "Extraversion kann mit bevorzugter Stimulation und sozialer Aktivität zusammenhängen, misst aber weder soziale Kompetenz noch Freundlichkeit oder Zugehörigkeitsbedürfnis.",
    ),
    limits: localized(
      "A lower extraversion score does not explain persistent exhaustion, anxiety, sensory overload or low mood.",
      "Ein niedrigerer Extraversionswert erklärt keine anhaltende Erschöpfung, Angst, Reizüberlastung oder gedrückte Stimmung.",
    ),
    actions: localizedList(
      [
        "Track the setting, duration and role demands—not only the number of people.",
        "Plan a short transition after demanding contact.",
        "Choose a lower-intensity form of connection instead of an all-or-nothing withdrawal.",
      ],
      [
        "Notiere Umfeld, Dauer und Rollenerwartungen – nicht nur die Zahl der Personen.",
        "Plane nach fordernden Kontakten einen kurzen Übergang.",
        "Wähle eine ruhigere Form von Kontakt statt vollständigem Rückzug.",
      ],
    ),
    experiment: localized(
      "Compare two social situations this week and note one factor that changed your energy.",
      "Vergleiche diese Woche zwei soziale Situationen und notiere einen Faktor, der deine Energie verändert hat.",
    ),
    reflection: localizedList(
      ["Which part of the situation was tiring?", "What kind of contact still feels nourishing?"],
      ["Welcher Teil der Situation war anstrengend?", "Welche Art von Kontakt fühlt sich weiterhin nährend an?"],
    ),
    evidenceNote: localized(
      "The tracking exercise is editorial. The Big Five describe broad tendencies and should not be used as a diagnosis of exhaustion.",
      "Die Beobachtungsübung ist redaktionell. Die Big Five beschreiben breite Tendenzen und dürfen nicht zur Diagnose von Erschöpfung verwendet werden.",
    ),
    sourceIds: ["johnson2014", "who2020"],
    supportNote: localized(
      "Persistent exhaustion or marked withdrawal deserves medical or psychological assessment, especially when daily functioning changes.",
      "Anhaltende Erschöpfung oder deutlicher Rückzug sollte medizinisch oder psychologisch abgeklärt werden, besonders wenn sich der Alltag spürbar verändert.",
    ),
  },
  {
    slug: "uncertainty-and-change",
    categories: ["stress", "decisions"],
    relatedTraits: ["N", "O", "C"],
    title: localized(
      "Coping with change and uncertainty",
      "Veränderungen und Unsicherheit bewältigen",
    ),
    summary: localized(
      "Separate what needs action now from what cannot yet be resolved.",
      "Trenne, was jetzt eine Handlung braucht, von dem, was noch nicht lösbar ist.",
    ),
    situation: localized(
      "A change at work, in a relationship or in your plans leaves many open questions and repeated future scenarios.",
      "Eine Veränderung bei der Arbeit, in einer Beziehung oder in deinen Plänen hinterlässt viele offene Fragen und wiederkehrende Zukunftsszenarien.",
    ),
    whyHard: localized(
      "Uncertainty invites the mind to simulate possibilities. Simulation can prepare action, but it can also continue after no new action is available.",
      "Unsicherheit lädt dazu ein, Möglichkeiten durchzuspielen. Das kann Handlungen vorbereiten, aber auch weiterlaufen, wenn gerade keine neue Handlung möglich ist.",
    ),
    tendencies: localized(
      "Emotional sensitivity, openness to change and preference for planning may influence the experience. None of these traits decides whether a change is objectively manageable.",
      "Emotionale Sensibilität, Offenheit für Veränderung und Planungsneigung können das Erleben beeinflussen. Keine dieser Tendenzen entscheidet, ob eine Veränderung objektiv bewältigbar ist.",
    ),
    limits: localized(
      "A profile cannot distinguish ordinary uncertainty from an anxiety disorder or response to trauma.",
      "Ein Profil kann gewöhnliche Unsicherheit nicht von einer Angststörung oder Traumareaktion unterscheiden.",
    ),
    actions: localizedList(
      [
        "Create two lists: actionable within 48 hours, and not yet actionable.",
        "Choose one reliable source and a time for the next information check.",
        "Return attention to a present sensory task when no action is available.",
      ],
      [
        "Erstelle zwei Listen: innerhalb von 48 Stunden beeinflussbar und noch nicht beeinflussbar.",
        "Wähle eine verlässliche Quelle und einen Zeitpunkt für die nächste Informationsprüfung.",
        "Lenke die Aufmerksamkeit auf eine gegenwärtige Sinneshandlung, wenn gerade nichts zu tun ist.",
      ],
    ),
    experiment: localized(
      "Spend five minutes on the two-list exercise, then complete one item from the actionable side.",
      "Nutze fünf Minuten für die Zwei-Listen-Übung und erledige danach einen Punkt von der beeinflussbaren Seite.",
    ),
    reflection: localizedList(
      ["What information would actually change my next action?", "What is already stable today?"],
      ["Welche Information würde meine nächste Handlung wirklich verändern?", "Was ist heute bereits stabil?"],
    ),
    evidenceNote: localized(
      "The grounding and values-oriented framing follows a WHO stress-management guide. The two-list format is editorial.",
      "Die Orientierung an Gegenwart und Werten folgt einem WHO-Leitfaden zur Stressbewältigung. Das Zwei-Listen-Format ist redaktionell.",
    ),
    sourceIds: ["who2020"],
    supportNote: localized(
      "Seek professional help when anxiety is intense, persistent or significantly restricts sleep, work, relationships or safety.",
      "Suche professionelle Hilfe, wenn Angst stark und anhaltend ist oder Schlaf, Arbeit, Beziehungen beziehungsweise Sicherheit deutlich einschränkt.",
    ),
  },
  {
    slug: "personality-friendly-habits",
    categories: ["habits", "work"],
    relatedTraits: ["C", "E", "O"],
    title: localized(
      "Adapting habits to your personality",
      "Gewohnheiten an deine Persönlichkeit anpassen",
    ),
    summary: localized(
      "Design the cue and the first action around your real context, not an ideal routine.",
      "Passe Auslöser und erste Handlung an deinen echten Kontext an – nicht an eine Idealroutine.",
    ),
    situation: localized(
      "A routine works for a few days but depends on motivation, a perfect morning or a level of structure you do not maintain.",
      "Eine Routine funktioniert einige Tage, hängt aber von Motivation, einem perfekten Morgen oder einem Strukturniveau ab, das du nicht aufrechterhältst.",
    ),
    whyHard: localized(
      "Goals describe an outcome; habits need a repeatable cue and behaviour in a specific environment.",
      "Ziele beschreiben ein Ergebnis; Gewohnheiten brauchen einen wiederkehrenden Auslöser und ein Verhalten in einer konkreten Umgebung.",
    ),
    tendencies: localized(
      "Structure preference, novelty seeking and social energy may affect which design feels natural. A trait is a design clue, not an excuse or prescription.",
      "Strukturpräferenz, Neuheitssuche und soziale Energie können beeinflussen, welches Design sich natürlich anfühlt. Ein Wert ist ein Gestaltungshinweis, keine Ausrede oder Vorschrift.",
    ),
    limits: localized(
      "Personality does not determine whether a habit will work, and a profile cannot account for health, workload or resources.",
      "Persönlichkeit bestimmt nicht, ob eine Gewohnheit funktioniert; ein Profil bildet Gesundheit, Arbeitslast oder Ressourcen nicht ab.",
    ),
    actions: localizedList(
      [
        "Attach the habit to a cue that already occurs reliably.",
        "Make the first version small enough for a difficult day.",
        "Choose social support only if it helps rather than adds pressure.",
      ],
      [
        "Verknüpfe die Gewohnheit mit einem bereits verlässlichen Auslöser.",
        "Mache die erste Version klein genug für einen schwierigen Tag.",
        "Nutze soziale Unterstützung nur, wenn sie hilft statt zusätzlichen Druck zu erzeugen.",
      ],
    ),
    experiment: localized(
      "Write one plan: “After [reliable cue], I will [two-minute action] in [place].” Test it three times before changing it.",
      "Formuliere: „Nach [verlässlicher Auslöser] mache ich [Zwei-Minuten-Handlung] an [Ort].“ Teste den Plan dreimal, bevor du ihn änderst.",
    ),
    reflection: localizedList(
      ["Which cue already exists?", "What makes the action unnecessarily difficult?"],
      ["Welcher Auslöser existiert bereits?", "Was macht die Handlung unnötig schwierig?"],
    ),
    evidenceNote: localized(
      "Specific if–then planning has meta-analytic support. The two-minute size and personality adaptation are editorial design suggestions.",
      "Konkrete Wenn-dann-Planung ist metaanalytisch untersucht. Die Zwei-Minuten-Grösse und Persönlichkeitsanpassung sind redaktionelle Gestaltungsvorschläge.",
    ),
    sourceIds: ["implementation2006", "steel2007"],
  },
  {
    slug: "self-criticism-after-mistakes",
    categories: ["stress", "work"],
    relatedTraits: ["N", "C", "A"],
    title: localized(
      "Reducing self-criticism after mistakes",
      "Selbstkritik nach Fehlern reduzieren",
    ),
    summary: localized(
      "Keep responsibility while replacing global self-judgement with useful review.",
      "Verantwortung behalten und pauschale Selbsturteile durch eine brauchbare Auswertung ersetzen.",
    ),
    situation: localized(
      "After an error, your review shifts quickly from what happened to what the mistake supposedly says about you.",
      "Nach einem Fehler wechselt die Auswertung schnell von dem, was passiert ist, zu dem, was der Fehler angeblich über dich aussagt.",
    ),
    whyHard: localized(
      "Harsh judgement can feel like proof that you care. It may also narrow attention and make it harder to identify the next useful correction.",
      "Harte Selbstbewertung kann sich wie ein Beleg für Verantwortungsgefühl anfühlen. Gleichzeitig kann sie Aufmerksamkeit verengen und die nächste sinnvolle Korrektur erschweren.",
    ),
    tendencies: localized(
      "Emotional sensitivity and high standards may shape the intensity of the response. Agreeableness toward others does not guarantee the same tone toward oneself.",
      "Emotionale Sensibilität und hohe Ansprüche können die Intensität der Reaktion mitprägen. Freundlichkeit gegenüber anderen bedeutet nicht automatisch denselben Ton sich selbst gegenüber.",
    ),
    limits: localized(
      "A score cannot explain shame, trauma, depression or obsessive patterns.",
      "Ein Wert erklärt weder Scham noch Trauma, Depression oder zwanghafte Muster.",
    ),
    actions: localizedList(
      [
        "Describe the error in one factual sentence.",
        "Separate impact, repair and prevention into three short notes.",
        "Use the tone you would use with a responsible colleague you respect.",
      ],
      [
        "Beschreibe den Fehler in einem sachlichen Satz.",
        "Trenne Auswirkung, Wiedergutmachung und Vorbeugung in drei kurze Notizen.",
        "Nutze den Ton, den du bei einer verantwortungsvollen, respektierten Kollegin verwenden würdest.",
      ],
    ),
    experiment: localized(
      "Complete a three-column review: what happened, what I can repair, what I will try next time.",
      "Fülle drei Spalten aus: Was ist passiert? Was kann ich reparieren? Was versuche ich nächstes Mal?",
    ),
    reflection: localizedList(
      ["Is this sentence about a behaviour or my whole identity?", "What would responsibility without humiliation look like?"],
      ["Geht dieser Satz um ein Verhalten oder meine ganze Identität?", "Wie sähe Verantwortung ohne Demütigung aus?"],
    ),
    evidenceNote: localized(
      "Self-compassion has meta-analytic associations with lower psychological distress, but this does not establish that the exercise treats distress. The review format is editorial.",
      "Selbstmitgefühl zeigt metaanalytische Zusammenhänge mit geringerer psychischer Belastung; daraus folgt nicht, dass diese Übung Belastungen behandelt. Das Auswertungsformat ist redaktionell.",
    ),
    sourceIds: ["macbeth2012", "who2020"],
    supportNote: localized(
      "Persistent worthlessness, severe guilt or thoughts of self-harm require timely professional support.",
      "Anhaltende Wertlosigkeitsgefühle, starke Schuld oder Selbstverletzungsgedanken brauchen zeitnahe professionelle Unterstützung.",
    ),
  },
  {
    slug: "working-across-personality-differences",
    categories: ["work", "communication"],
    relatedTraits: ["C", "E", "A", "O"],
    title: localized(
      "Working with very different personalities",
      "Mit sehr unterschiedlichen Persönlichkeiten zusammenarbeiten",
    ),
    summary: localized(
      "Translate broad differences into observable working agreements.",
      "Übersetze breite Unterschiede in beobachtbare Arbeitsvereinbarungen.",
    ),
    situation: localized(
      "One person wants fast discussion, another wants preparation; one values flexibility, another wants clear plans.",
      "Eine Person möchte schnell diskutieren, eine andere vorbereitet sein; eine schätzt Flexibilität, eine andere klare Pläne.",
    ),
    whyHard: localized(
      "Different preferences are easily interpreted as lack of care, competence or respect when expectations remain implicit.",
      "Unterschiedliche Präferenzen werden leicht als mangelndes Interesse, fehlende Kompetenz oder Respektlosigkeit gedeutet, wenn Erwartungen unausgesprochen bleiben.",
    ),
    tendencies: localized(
      "Big Five tendencies can offer hypotheses about work preferences. Research shows that associations with performance vary by criterion and context.",
      "Big-Five-Tendenzen können Hypothesen über Arbeitspräferenzen liefern. Forschung zeigt, dass Zusammenhänge mit Leistung je nach Kriterium und Kontext variieren.",
    ),
    limits: localized(
      "A profile does not establish competence, intent, role fit or the best team process.",
      "Ein Profil belegt weder Kompetenz und Absicht noch Rollenpassung oder den besten Teamprozess.",
    ),
    actions: localizedList(
      [
        "Ask each person what information they need before a decision.",
        "Agree what requires synchronous discussion and what can be written.",
        "Define deadlines, ownership and the acceptable degree of change explicitly.",
      ],
      [
        "Frage, welche Informationen jede Person vor einer Entscheidung braucht.",
        "Vereinbart, was synchron besprochen und was schriftlich geklärt wird.",
        "Definiert Fristen, Verantwortung und den akzeptablen Änderungsumfang ausdrücklich.",
      ],
    ),
    experiment: localized(
      "At the next task handoff, ask: “What does done mean, and when should we check in?”",
      "Frage bei der nächsten Übergabe: „Was bedeutet fertig, und wann stimmen wir uns wieder ab?“",
    ),
    reflection: localizedList(
      ["Which behaviour am I interpreting as a character flaw?", "Which agreement would reduce guesswork?"],
      ["Welches Verhalten deute ich als Charakterfehler?", "Welche Vereinbarung würde Rätselraten reduzieren?"],
    ),
    evidenceNote: localized(
      "Meta-analytic personality-performance links are averages and context-dependent. The working agreements are editorial practice suggestions.",
      "Metaanalytische Zusammenhänge zwischen Persönlichkeit und Leistung sind Durchschnittswerte und kontextabhängig. Die Arbeitsvereinbarungen sind redaktionelle Praxisvorschläge.",
    ),
    sourceIds: ["barrick1991", "johnson2014"],
  },
];

export const getLearningTopic = (slug: string) =>
  LEARNING_TOPICS.find((topic) => topic.slug === slug) || null;

export const filterLearningTopics = (
  category: LearningCategory | "all",
  search = "",
) => {
  const normalizedSearch = search.trim().toLocaleLowerCase();

  return LEARNING_TOPICS.filter((topic) => {
    if (category !== "all" && !topic.categories.includes(category)) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    return (["en", "de"] as const).some((locale) =>
      `${topic.title[locale]} ${topic.summary[locale]}`
        .toLocaleLowerCase()
        .includes(normalizedSearch),
    );
  });
};

export const getLearningSources = (topic: LearningTopic) =>
  topic.sourceIds
    .map((sourceId) => LEARNING_SOURCES[sourceId])
    .filter((source): source is LearningSource => Boolean(source));
