import type { Locale } from "./i18n";

export const TRAIT_DIMENSIONS = ["O", "C", "E", "A", "N"] as const;

export type TraitDimension = (typeof TRAIT_DIMENSIONS)[number];
export type TraitBand = "low" | "middle" | "high";
export type BridgePole = Exclude<TraitBand, "middle">;
export type LocalizedText = Record<Locale, string>;
export type LocalizedList = Record<Locale, string[]>;

export type TraitPoleProfile = {
  label: LocalizedText;
  contribution: LocalizedText;
  strengths: LocalizedList;
  misconception: LocalizedText;
  overextension: LocalizedText;
  oppositeValue: LocalizedText;
  collaboration: LocalizedList;
};

export type TraitBridge = {
  trait: TraitDimension;
  name: LocalizedText;
  scaleEnds: Record<BridgePole, LocalizedText>;
  bridgePrinciple: LocalizedText;
  middlePerspective: LocalizedText;
  reflectionQuestion: LocalizedText;
  communitySearch: LocalizedText;
  poles: Record<BridgePole, TraitPoleProfile>;
};

export const TRAIT_BRIDGES: Record<TraitDimension, TraitBridge> = {
  O: {
    trait: "O",
    name: { en: "Openness", de: "Offenheit" },
    scaleEnds: {
      low: { en: "more familiar and concrete", de: "eher vertraut und konkret" },
      high: { en: "more exploratory and imaginative", de: "eher erkundend und fantasievoll" },
    },
    bridgePrinciple: {
      en: "Exploration becomes useful when it can meet reality; continuity stays useful when it remains open to revision.",
      de: "Erkundung wird nützlich, wenn sie auf die Realität trifft; Beständigkeit bleibt nützlich, wenn sie für Überprüfung offen ist.",
    },
    middlePerspective: {
      en: "A middle score can make it easier to move between proven approaches and new possibilities, depending on the situation.",
      de: "Ein mittlerer Wert kann es erleichtern, je nach Situation zwischen bewährten Ansätzen und neuen Möglichkeiten zu wechseln.",
    },
    reflectionQuestion: {
      en: "Where would a proven approach help right now, and where is one careful experiment worth trying?",
      de: "Wo hilft gerade ein bewährter Ansatz – und wo lohnt sich ein vorsichtiges Experiment?",
    },
    communitySearch: { en: "openness perspectives", de: "Offenheit Perspektiven" },
    poles: {
      low: {
        label: { en: "Grounding what works", de: "Bewährtes tragfähig machen" },
        contribution: {
          en: "You may preserve useful knowledge, turn vague ideas into practical steps, and improve routines that people rely on.",
          de: "Du kannst nützliches Wissen bewahren, vage Ideen in praktische Schritte übersetzen und Abläufe verbessern, auf die Menschen angewiesen sind.",
        },
        strengths: {
          en: ["Practical judgement", "Continuity and follow-through", "Learning from concrete experience"],
          de: ["Praktisches Urteilsvermögen", "Beständigkeit und Umsetzung", "Lernen aus konkreter Erfahrung"],
        },
        misconception: {
          en: "A preference for the familiar is sometimes mistaken for having no imagination. It can instead reflect a wish for evidence, usefulness, and continuity.",
          de: "Eine Vorliebe für Vertrautes wird manchmal mit Fantasielosigkeit verwechselt. Dahinter kann ebenso der Wunsch nach Belegen, Nutzen und Kontinuität stehen.",
        },
        overextension: {
          en: "Unfamiliar proposals may be dismissed before their practical value has been tested.",
          de: "Unvertraute Vorschläge könnten abgelehnt werden, bevor ihr praktischer Wert geprüft wurde.",
        },
        oppositeValue: {
          en: "The more exploratory pole can reveal alternatives when a proven path no longer fits.",
          de: "Der stärker erkundende Pol kann Alternativen sichtbar machen, wenn ein bewährter Weg nicht mehr passt.",
        },
        collaboration: {
          en: ["Ask for a concrete example or small trial.", "Help translate a new idea into a repeatable routine."],
          de: ["Bitte um ein konkretes Beispiel oder einen kleinen Versuch.", "Hilf dabei, eine neue Idee in einen wiederholbaren Ablauf zu übersetzen."],
        },
      },
      high: {
        label: { en: "Opening new possibilities", de: "Neue Möglichkeiten eröffnen" },
        contribution: {
          en: "You may explore alternatives, connect distant ideas, and help groups imagine a different response when familiar answers are insufficient.",
          de: "Du kannst Alternativen erkunden, entfernte Ideen verbinden und Gruppen helfen, andere Antworten zu entwerfen, wenn Vertrautes nicht mehr ausreicht.",
        },
        strengths: {
          en: ["Curiosity and imagination", "Comfort with ambiguity", "Reframing stuck questions"],
          de: ["Neugier und Vorstellungskraft", "Umgang mit Mehrdeutigkeit", "Festgefahrene Fragen neu rahmen"],
        },
        misconception: {
          en: "Curiosity is sometimes read as impracticality or an inability to commit. Exploring broadly and choosing carefully can coexist.",
          de: "Neugier wird manchmal als Unpraktikabilität oder fehlende Verbindlichkeit gelesen. Breites Erkunden und sorgfältiges Entscheiden können zusammengehören.",
        },
        overextension: {
          en: "Novelty can become attractive for its own sake, while constraints and implementation receive too little attention.",
          de: "Neues kann um seiner selbst willen attraktiv werden, während Grenzen und Umsetzung zu wenig Beachtung finden.",
        },
        oppositeValue: {
          en: "The more familiar-oriented pole tests whether an idea is workable, understandable, and sustainable.",
          de: "Der stärker am Vertrauten orientierte Pol prüft, ob eine Idee umsetzbar, verständlich und tragfähig ist.",
        },
        collaboration: {
          en: ["Turn one promising idea into a bounded experiment.", "Invite someone to name the constraints that must remain intact."],
          de: ["Übersetze eine vielversprechende Idee in ein begrenztes Experiment.", "Bitte jemanden, die unverzichtbaren Rahmenbedingungen zu benennen."],
        },
      },
    },
  },
  C: {
    trait: "C",
    name: { en: "Conscientiousness", de: "Gewissenhaftigkeit" },
    scaleEnds: {
      low: { en: "more spontaneous and flexible", de: "eher spontan und flexibel" },
      high: { en: "more structured and planful", de: "eher strukturiert und planvoll" },
    },
    bridgePrinciple: {
      en: "Plans create reliability; flexibility keeps a plan responsive to what actually happens.",
      de: "Pläne schaffen Verlässlichkeit; Flexibilität hält einen Plan anschlussfähig an das, was tatsächlich geschieht.",
    },
    middlePerspective: {
      en: "A middle score may support a situational balance between structure and improvisation rather than a single fixed working style.",
      de: "Ein mittlerer Wert kann eine situationsabhängige Balance zwischen Struktur und Improvisation unterstützen statt nur eines festen Arbeitsstils.",
    },
    reflectionQuestion: {
      en: "Which commitment needs a clear structure, and where would more room to adapt improve the result?",
      de: "Welche Verpflichtung braucht klare Struktur – und wo würde mehr Anpassungsspielraum das Ergebnis verbessern?",
    },
    communitySearch: { en: "conscientiousness structure flexibility", de: "Gewissenhaftigkeit Struktur Flexibilität" },
    poles: {
      low: {
        label: { en: "Adapting in the moment", de: "Im Moment anpassungsfähig bleiben" },
        contribution: {
          en: "You may improvise when plans break, notice unexpected opportunities, and keep a group responsive in changing conditions.",
          de: "Du kannst improvisieren, wenn Pläne scheitern, unerwartete Möglichkeiten erkennen und Gruppen unter wechselnden Bedingungen beweglich halten.",
        },
        strengths: {
          en: ["Improvisation", "Flexible use of time and methods", "Rapid response to changing priorities"],
          de: ["Improvisation", "Flexibler Umgang mit Zeit und Methoden", "Schnelle Reaktion auf veränderte Prioritäten"],
        },
        misconception: {
          en: "Less preference for structure is often labelled laziness. It does not determine motivation, care, or ability, although commitments still matter.",
          de: "Eine geringere Vorliebe für Struktur wird oft als Faulheit bezeichnet. Sie bestimmt weder Motivation noch Sorgfalt oder Fähigkeit – Verpflichtungen bleiben dennoch wichtig.",
        },
        overextension: {
          en: "Important details or deadlines may become visible too late when everything stays open.",
          de: "Wichtige Details oder Fristen könnten zu spät sichtbar werden, wenn alles offenbleibt.",
        },
        oppositeValue: {
          en: "The more structured pole creates shared expectations and protects long-term commitments.",
          de: "Der stärker strukturierte Pol schafft gemeinsame Erwartungen und schützt langfristige Verpflichtungen.",
        },
        collaboration: {
          en: ["Agree on a few non-negotiable checkpoints.", "Keep freedom in the method while making the outcome explicit."],
          de: ["Vereinbart wenige unverhandelbare Kontrollpunkte.", "Lasst den Weg offen, aber macht das erwartete Ergebnis eindeutig."],
        },
      },
      high: {
        label: { en: "Making commitments dependable", de: "Verpflichtungen verlässlich machen" },
        contribution: {
          en: "You may turn intentions into dependable action, maintain quality, and build structures that let people coordinate over time.",
          de: "Du kannst Absichten in verlässliches Handeln übersetzen, Qualität sichern und Strukturen schaffen, mit denen Menschen sich langfristig koordinieren.",
        },
        strengths: {
          en: ["Planning and persistence", "Attention to responsibilities", "Reliable completion"],
          de: ["Planung und Ausdauer", "Aufmerksamkeit für Verantwortung", "Verlässlicher Abschluss"],
        },
        misconception: {
          en: "Orderliness is sometimes mistaken for rigidity or valuing output above people. Structure can also be a form of care for others' time.",
          de: "Ordnung wird manchmal mit Starrheit oder einer Überbewertung von Leistung verwechselt. Struktur kann auch Fürsorge für die Zeit anderer sein.",
        },
        overextension: {
          en: "Perfectionism, overcontrol, or difficulty changing course can consume more energy than the task warrants.",
          de: "Perfektionismus, Überkontrolle oder ein schwieriger Kurswechsel können mehr Energie beanspruchen, als die Aufgabe rechtfertigt.",
        },
        oppositeValue: {
          en: "The more spontaneous pole notices when reality has outgrown the plan and makes room for timely adaptation.",
          de: "Der spontanere Pol erkennt, wenn die Realität den Plan überholt hat, und schafft Raum für rechtzeitige Anpassung.",
        },
        collaboration: {
          en: ["Separate essential standards from optional polish.", "Build one deliberate review point where the plan may change."],
          de: ["Trennt unverzichtbare Standards von optionalem Feinschliff.", "Plant einen bewussten Prüfpunkt ein, an dem der Plan verändert werden darf."],
        },
      },
    },
  },
  E: {
    trait: "E",
    name: { en: "Extraversion", de: "Extraversion" },
    scaleEnds: {
      low: { en: "more inward and low-stimulation", de: "eher nach innen und reizärmer orientiert" },
      high: { en: "more outward and stimulation-seeking", de: "eher nach außen und anregungsorientiert" },
    },
    bridgePrinciple: {
      en: "Visible momentum benefits from quiet depth, and quiet insight has more impact when it finds a way to be heard.",
      de: "Sichtbarer Schwung profitiert von stiller Tiefe – und stille Einsicht wirkt stärker, wenn sie Gehör findet.",
    },
    middlePerspective: {
      en: "A middle score can mean that social energy and quiet focus vary strongly with people, purpose, and setting.",
      de: "Ein mittlerer Wert kann bedeuten, dass soziale Energie und ruhige Konzentration stark von Menschen, Zweck und Umfeld abhängen.",
    },
    reflectionQuestion: {
      en: "Does this situation need more visible energy, or more protected space to listen and think?",
      de: "Braucht diese Situation mehr sichtbare Energie – oder mehr geschützten Raum zum Zuhören und Nachdenken?",
    },
    communitySearch: { en: "extraversion introversion energy", de: "Extraversion Introversion Energie" },
    poles: {
      low: {
        label: { en: "Creating depth and listening space", de: "Tiefe und Raum zum Zuhören schaffen" },
        contribution: {
          en: "You may sustain concentration, notice what is said quietly, and create thoughtful one-to-one or small-group exchanges.",
          de: "Du kannst Konzentration halten, leise geäußerte Dinge wahrnehmen und nachdenkliche Gespräche zu zweit oder in kleinen Gruppen ermöglichen.",
        },
        strengths: {
          en: ["Sustained focus", "Careful observation", "Thoughtful, lower-stimulation exchange"],
          de: ["Anhaltende Konzentration", "Sorgfältige Beobachtung", "Bedachte Begegnung mit weniger Reizen"],
        },
        misconception: {
          en: "A quieter style is sometimes interpreted as shyness, disinterest, or lack of leadership. Engagement does not have to be loud.",
          de: "Ein ruhigerer Stil wird manchmal als Schüchternheit, Desinteresse oder fehlende Führung verstanden. Beteiligung muss nicht laut sein.",
        },
        overextension: {
          en: "Needs and useful ideas may remain unspoken, or withdrawal may replace a necessary conversation.",
          de: "Bedürfnisse und nützliche Ideen könnten unausgesprochen bleiben, oder Rückzug ersetzt ein notwendiges Gespräch.",
        },
        oppositeValue: {
          en: "The more outward pole makes connection visible, invites participation, and creates collective momentum.",
          de: "Der stärker nach außen gerichtete Pol macht Verbindung sichtbar, lädt zur Beteiligung ein und erzeugt gemeinsamen Schwung.",
        },
        collaboration: {
          en: ["Use agendas or written input before group discussion.", "Name one point you want the group to hear, even if briefly."],
          de: ["Nutzt Agenden oder schriftliche Beiträge vor Gruppengesprächen.", "Benenne einen Punkt, den die Gruppe hören sollte – auch wenn nur kurz."],
        },
      },
      high: {
        label: { en: "Mobilising connection and energy", de: "Verbindung und Energie mobilisieren" },
        contribution: {
          en: "You may bring people together, make enthusiasm contagious, and help a group move from private intentions to shared action.",
          de: "Du kannst Menschen zusammenbringen, Begeisterung ansteckend machen und einer Gruppe helfen, aus privaten Absichten gemeinsames Handeln zu entwickeln.",
        },
        strengths: {
          en: ["Social initiative", "Visible encouragement", "Fast connection across people"],
          de: ["Soziale Initiative", "Sichtbare Ermutigung", "Schnelle Verbindung zwischen Menschen"],
        },
        misconception: {
          en: "An expressive style is sometimes read as superficiality or dominance. Social energy can coexist with depth and careful attention.",
          de: "Ein ausdrucksstarker Stil wird manchmal als Oberflächlichkeit oder Dominanz gelesen. Soziale Energie kann mit Tiefe und genauer Aufmerksamkeit zusammengehen.",
        },
        overextension: {
          en: "Speed and airtime can crowd out quieter signals, reflection, or another person's need for recovery.",
          de: "Tempo und Redeanteil könnten leisere Signale, Reflexion oder das Erholungsbedürfnis anderer verdrängen.",
        },
        oppositeValue: {
          en: "The quieter pole slows the pace, deepens attention, and often notices what a lively room overlooks.",
          de: "Der ruhigere Pol verlangsamt das Tempo, vertieft die Aufmerksamkeit und bemerkt oft, was ein lebhafter Raum übersieht.",
        },
        collaboration: {
          en: ["Leave an intentional pause before filling silence.", "Invite written or one-to-one input from people who think before speaking."],
          de: ["Lass bewusst eine Pause, bevor du Stille füllst.", "Lade Menschen, die vor dem Sprechen nachdenken, zu schriftlichen Beiträgen oder Einzelgesprächen ein."],
        },
      },
    },
  },
  A: {
    trait: "A",
    name: { en: "Agreeableness", de: "Verträglichkeit" },
    scaleEnds: {
      low: { en: "more challenging and self-directed", de: "eher widersprechend und eigenständig" },
      high: { en: "more cooperative and accommodating", de: "eher kooperativ und entgegenkommend" },
    },
    bridgePrinciple: {
      en: "Care without honest challenge can hide problems; challenge without care can make truth impossible to hear.",
      de: "Fürsorge ohne ehrlichen Widerspruch kann Probleme verdecken; Widerspruch ohne Fürsorge kann Wahrheit unhörbar machen.",
    },
    middlePerspective: {
      en: "A middle score may allow cooperation and candid challenge to take turns, especially when expectations are explicit.",
      de: "Ein mittlerer Wert kann Kooperation und offenen Widerspruch abwechselnd ermöglichen – besonders bei klaren Erwartungen.",
    },
    reflectionQuestion: {
      en: "What needs protection here: the relationship, a boundary, an uncomfortable truth—or a thoughtful combination?",
      de: "Was braucht hier Schutz: die Beziehung, eine Grenze, eine unbequeme Wahrheit – oder eine bedachte Verbindung davon?",
    },
    communitySearch: { en: "agreeableness conflict boundaries", de: "Verträglichkeit Konflikt Grenzen" },
    poles: {
      low: {
        label: { en: "Protecting boundaries and honest challenge", de: "Grenzen und ehrlichen Widerspruch schützen" },
        contribution: {
          en: "You may question weak assumptions, negotiate firmly, protect boundaries, and voice difficult truths before a group drifts into false agreement.",
          de: "Du kannst schwache Annahmen prüfen, klar verhandeln, Grenzen schützen und schwierige Wahrheiten aussprechen, bevor eine Gruppe in falsche Einigkeit gerät.",
        },
        strengths: {
          en: ["Independent judgement", "Direct challenge", "Firm boundary-setting"],
          de: ["Eigenständiges Urteil", "Direkter Widerspruch", "Klare Grenzsetzung"],
        },
        misconception: {
          en: "Candour is sometimes mistaken for hostility or lack of care. Direct scrutiny can serve fairness, quality, and people who cannot speak up.",
          de: "Offenheit im Widerspruch wird manchmal mit Feindseligkeit oder fehlender Fürsorge verwechselt. Direkte Prüfung kann Fairness, Qualität und weniger gehörten Menschen dienen.",
        },
        overextension: {
          en: "Blunt delivery or constant opposition can damage trust and obscure an otherwise important point.",
          de: "Schroffe Formulierungen oder ständiger Widerspruch könnten Vertrauen beschädigen und einen wichtigen Punkt verdecken.",
        },
        oppositeValue: {
          en: "The more cooperative pole makes disagreement safer, maintains trust, and notices relational costs.",
          de: "Der kooperativere Pol macht Uneinigkeit sicherer, erhält Vertrauen und bemerkt Beziehungskosten.",
        },
        collaboration: {
          en: ["Challenge the claim rather than the person's worth.", "State the shared goal before naming the disagreement."],
          de: ["Kritisiere die Aussage statt den Wert der Person.", "Benenne das gemeinsame Ziel, bevor du den Widerspruch formulierst."],
        },
      },
      high: {
        label: { en: "Building trust and cooperation", de: "Vertrauen und Kooperation aufbauen" },
        contribution: {
          en: "You may help people cooperate, repair strain, share resources, and keep human needs visible while work gets done.",
          de: "Du kannst Menschen beim Zusammenarbeiten helfen, Spannungen reparieren, Ressourcen teilen und menschliche Bedürfnisse während der Arbeit sichtbar halten.",
        },
        strengths: {
          en: ["Empathy and consideration", "Cooperation", "Trust-building and repair"],
          de: ["Empathie und Rücksicht", "Kooperation", "Vertrauensaufbau und Wiedergutmachung"],
        },
        misconception: {
          en: "Cooperation is sometimes mistaken for weakness or naivety. Care can include firm boundaries and deliberate courage.",
          de: "Kooperation wird manchmal mit Schwäche oder Naivität verwechselt. Fürsorge kann klare Grenzen und bewussten Mut einschließen.",
        },
        overextension: {
          en: "Necessary conflict may be softened too far, or personal needs may be traded away to preserve harmony.",
          de: "Notwendige Konflikte könnten zu stark abgeschwächt oder eigene Bedürfnisse zugunsten von Harmonie aufgegeben werden.",
        },
        oppositeValue: {
          en: "The more challenging pole tests comfortable consensus, protects boundaries, and says what politeness may conceal.",
          de: "Der stärker widersprechende Pol prüft bequemen Konsens, schützt Grenzen und sagt, was Höflichkeit verdecken könnte.",
        },
        collaboration: {
          en: ["Name one real disagreement instead of implying consent.", "Invite dissent and show that the relationship can withstand it."],
          de: ["Benenne eine echte Meinungsverschiedenheit, statt Zustimmung anzudeuten.", "Lade zu Widerspruch ein und zeige, dass die Beziehung ihn aushalten kann."],
        },
      },
    },
  },
  N: {
    trait: "N",
    name: { en: "Emotional sensitivity", de: "Emotionale Empfindlichkeit" },
    scaleEnds: {
      low: { en: "more emotionally steady", de: "eher emotional stabil" },
      high: { en: "more emotionally sensitive", de: "eher emotional empfindsam" },
    },
    bridgePrinciple: {
      en: "Sensitivity detects early signals; steadiness helps decide which signals require action and which can pass.",
      de: "Empfindsamkeit erkennt frühe Signale; Stabilität hilft zu entscheiden, welche Signale Handeln brauchen und welche vorübergehen dürfen.",
    },
    middlePerspective: {
      en: "A middle score may offer access to both emotional alertness and steadiness, with considerable variation across situations.",
      de: "Ein mittlerer Wert kann Zugang zu emotionaler Wachsamkeit und Stabilität bieten – mit deutlichen Unterschieden je nach Situation.",
    },
    reflectionQuestion: {
      en: "What might this emotional signal be noticing, and what steadying perspective would help assess it?",
      de: "Was könnte dieses emotionale Signal wahrnehmen – und welche stabilisierende Perspektive hilft bei seiner Einordnung?",
    },
    communitySearch: { en: "emotional sensitivity stress signals", de: "emotionale Empfindlichkeit Stress Signale" },
    poles: {
      low: {
        label: { en: "Offering steadiness under pressure", de: "Unter Druck Stabilität anbieten" },
        contribution: {
          en: "You may remain composed during uncertainty, help others regain perspective, and keep essential action possible when emotions run high.",
          de: "Du kannst bei Unsicherheit gefasst bleiben, anderen helfen, Perspektive zurückzugewinnen, und notwendiges Handeln ermöglichen, wenn Gefühle stark werden.",
        },
        strengths: {
          en: ["Calm under pressure", "Emotional recovery", "A steadying perspective"],
          de: ["Ruhe unter Druck", "Emotionale Erholung", "Eine stabilisierende Perspektive"],
        },
        misconception: {
          en: "Lower emotional reactivity is sometimes mistaken for indifference. A quieter internal alarm does not imply an absence of empathy or care.",
          de: "Geringere emotionale Reaktivität wird manchmal mit Gleichgültigkeit verwechselt. Ein leiseres inneres Alarmsystem bedeutet nicht, dass Empathie oder Fürsorge fehlen.",
        },
        overextension: {
          en: "Early warning signs may be missed, or another person's distress may be minimised too quickly.",
          de: "Frühe Warnzeichen könnten übersehen oder die Belastung einer anderen Person zu schnell relativiert werden.",
        },
        oppositeValue: {
          en: "The more sensitive pole detects subtle shifts, risks, and relational tension before they become obvious.",
          de: "Der empfindsamere Pol erkennt feine Veränderungen, Risiken und Beziehungsspannungen, bevor sie offensichtlich werden.",
        },
        collaboration: {
          en: ["Validate the signal before offering a solution.", "Ask what a more sensitive observer has noticed that is not yet visible."],
          de: ["Bestätige zuerst das Signal, bevor du eine Lösung anbietest.", "Frage, was eine empfindsamere Person bemerkt hat, das noch nicht sichtbar ist."],
        },
      },
      high: {
        label: { en: "Detecting what needs attention", de: "Wahrnehmen, was Aufmerksamkeit braucht" },
        contribution: {
          en: "You may notice tension, risk, unmet needs, and subtle change early, giving people a chance to respond before problems grow.",
          de: "Du kannst Spannungen, Risiken, unerfüllte Bedürfnisse und feine Veränderungen früh bemerken, sodass Menschen reagieren können, bevor Probleme wachsen.",
        },
        strengths: {
          en: ["Sensitivity to subtle signals", "Anticipating risk", "Emotional attunement"],
          de: ["Empfindsamkeit für feine Signale", "Vorausschau für Risiken", "Emotionales Gespür"],
        },
        misconception: {
          en: "Strong emotional signals are sometimes labelled instability or being 'too sensitive'. A signal can contain useful information without being complete proof.",
          de: "Starke emotionale Signale werden manchmal als Instabilität oder „zu empfindlich“ abgewertet. Ein Signal kann nützliche Information enthalten, ohne ein vollständiger Beweis zu sein.",
        },
        overextension: {
          en: "Sustained alarm, rumination, or taking responsibility for every signal can become exhausting.",
          de: "Anhaltende Alarmbereitschaft, Grübeln oder Verantwortung für jedes Signal können erschöpfend werden.",
        },
        oppositeValue: {
          en: "The steadier pole can reduce urgency, widen perspective, and support action without amplifying every concern.",
          de: "Der stabilere Pol kann Dringlichkeit senken, die Perspektive weiten und Handeln unterstützen, ohne jede Sorge zu verstärken.",
        },
        collaboration: {
          en: ["Separate the signal from the estimated probability.", "Pair early noticing with a calm check of evidence and next steps."],
          de: ["Trenne das Signal von der geschätzten Wahrscheinlichkeit.", "Verbinde frühes Wahrnehmen mit einer ruhigen Prüfung von Belegen und nächsten Schritten."],
        },
      },
    },
  },
};

export const getTraitBridge = (trait: TraitDimension) => TRAIT_BRIDGES[trait];

export const getOppositePole = (pole: BridgePole): BridgePole =>
  pole === "low" ? "high" : "low";

export const getTraitPole = (score: number): TraitBand => {
  if (score < 2.5) {
    return "low";
  }

  if (score > 3.5) {
    return "high";
  }

  return "middle";
};

export const localizeTraitText = <T>(value: Record<Locale, T>, locale: Locale): T =>
  value[locale];
