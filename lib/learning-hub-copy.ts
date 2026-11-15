import type { Locale } from "./i18n";

export const learningHubCopy: Record<
  Locale,
  {
    hub: {
      metaTitle: string;
      kicker: string;
      title: string;
      titleLines: [string, string];
      intro: string;
      startTitle: string;
      startText: string;
      navigationLabel: string;
      sections: Array<{
        id: "contribution" | "opposites" | "articles" | "library";
        number: string;
        label: string;
        title: string;
        text: string;
        outcome: string;
        action: string;
        href: string;
      }>;
      bridgeKicker: string;
      bridgeTitle: string;
      bridgeText: string;
      bridgeTrait: string;
      bridgeLow: string;
      bridgeLowText: string;
      bridgeHigh: string;
      bridgeHighText: string;
      bridgeAction: string;
    };
    articles: {
      metaTitle: string;
      kicker: string;
      title: string;
      intro: string;
      back: string;
      searchLabel: string;
      searchPlaceholder: string;
      quickStart: string;
      situationLabel: string;
      allSituations: string;
      traitLabel: string;
      allTraits: string;
      poleLabel: string;
      allPoles: string;
      low: string;
      high: string;
      both: string;
      perspectiveLabel: string;
      mirror: string;
      mirrorText: string;
      growth: string;
      growthText: string;
      results: string;
      showMore: string;
      noResults: string;
      noResultsText: string;
      open: string;
      mirrorReason: string;
      growthReason: string;
      clear: string;
      activeFilters: string;
      advancedFilters: string;
      communityTitle: string;
      communityText: string;
      communityAction: string;
    };
  }
> = {
  en: {
    hub: {
      metaTitle: "Learn & understand",
      kicker: "TraitBridge learning",
      title: "Understand yourself. See what others bring.",
      titleLines: ["Understand yourself.", "See what others bring."],
      intro:
        "Explore how different personality tendencies can contribute, complement one another and become easier to understand in everyday life.",
      startTitle: "What would help you right now?",
      startText: "Choose one starting point. You can move between all areas at any time.",
      navigationLabel: "Learning areas",
      sections: [
        {
          id: "contribution",
          number: "01",
          label: "My profile",
          title: "I want to understand my profile",
          text: "See what your profile may contribute and where context matters more than a score.",
          outcome: "A grounded interpretation of your result",
          action: "Put my profile in context",
          href: "/learn/contribution",
        },
        {
          id: "articles",
          number: "02",
          label: "Everyday life",
          title: "I have a concrete situation",
          text: "Find a practical guide for decisions, stress, work, relationships or communication.",
          outcome: "A short guide with practical next steps",
          action: "Find a practical guide",
          href: "/learn/articles",
        },
        {
          id: "opposites",
          number: "03",
          label: "Understanding",
          title: "I want to understand someone different",
          text: "Compare both poles of every Big Five dimension and see where misunderstandings can arise.",
          outcome: "A bridge between two different styles",
          action: "Compare both sides",
          href: "/learn/opposites",
        },
        {
          id: "library",
          number: "04",
          label: "Perspectives",
          title: "I want to discover other perspectives",
          text: "Use books and films to mirror your experience or deliberately widen your view.",
          outcome: "Recommendations suited to your perspective",
          action: "Discover perspectives",
          href: "/learn/library",
        },
      ],
      bridgeKicker: "The name is the idea",
      bridgeTitle: "A bridge needs both sides",
      bridgeText:
        "TraitBridge does not sort people into better and worse. It makes different contributions visible and helps translate between them.",
      bridgeTrait: "Example: Openness",
      bridgeLow: "Low expression",
      bridgeLowText: "Grounds ideas in experience, continuity and practical application.",
      bridgeHigh: "High expression",
      bridgeHighText: "Opens possibilities through curiosity, imagination and exploration.",
      bridgeAction: "Compare all five dimensions",
    },
    articles: {
      metaTitle: "Knowledge articles",
      kicker: "Practical knowledge",
      title: "Find a guide for your situation.",
      intro:
        "Filter by everyday context, Big Five dimension and expression. Every guide marks hypotheses, limitations and sources.",
      back: "Back to learning hub",
      searchLabel: "Search articles",
      searchPlaceholder: "For example: visibility, conflict or change",
      quickStart: "Start with a common situation",
      situationLabel: "Everyday situation",
      allSituations: "All situations",
      traitLabel: "Big Five dimension",
      allTraits: "All dimensions",
      poleLabel: "Expression",
      allPoles: "All expressions",
      low: "Low",
      high: "High",
      both: "Both poles",
      perspectiveLabel: "Reading perspective",
      mirror: "Mirror",
      mirrorText: "What may feel familiar in this pattern.",
      growth: "Development",
      growthText: "A practical counterweight you can try.",
      results: "articles",
      showMore: "Show more articles",
      noResults: "No article matches these filters.",
      noResultsText: "Remove a filter or try a broader search term.",
      open: "Open guide",
      mirrorReason: "Possible mirror",
      growthReason: "Possible next step",
      clear: "Reset filters",
      activeFilters: "Active filters",
      advancedFilters: "More filters and reading perspective",
      communityTitle: "Compare your experience",
      communityText:
        "Personality becomes clearer when different people describe the same situation from their perspective.",
      communityAction: "Open matching Community questions",
    },
  },
  de: {
    hub: {
      metaTitle: "Lernen & Verstehen",
      kicker: "TraitBridge Lernen",
      title: "Verstehe dich selbst. Erkenne, was andere beitragen.",
      titleLines: ["Verstehe dich selbst.", "Erkenne, was andere beitragen."],
      intro:
        "Entdecke, wie unterschiedliche Persönlichkeitstendenzen beitragen, einander ergänzen und im Alltag verständlicher werden können.",
      startTitle: "Was hilft dir gerade weiter?",
      startText: "Wähle einen Einstieg. Du kannst jederzeit zwischen allen Bereichen wechseln.",
      navigationLabel: "Lernbereiche",
      sections: [
        {
          id: "contribution",
          number: "01",
          label: "Mein Profil",
          title: "Ich möchte mein Profil verstehen",
          text: "Erkenne, was dein Profil beitragen könnte und wo der Kontext wichtiger ist als ein Wert.",
          outcome: "Eine verständliche Einordnung deines Ergebnisses",
          action: "Mein Profil einordnen",
          href: "/learn/contribution",
        },
        {
          id: "articles",
          number: "02",
          label: "Alltag",
          title: "Ich habe eine konkrete Situation",
          text: "Finde einen praktischen Leitfaden zu Entscheidungen, Stress, Arbeit, Beziehungen oder Kommunikation.",
          outcome: "Einen kurzen Leitfaden mit nächsten Schritten",
          action: "Passenden Leitfaden finden",
          href: "/learn/articles",
        },
        {
          id: "opposites",
          number: "03",
          label: "Verständnis",
          title: "Ich möchte jemanden besser verstehen",
          text: "Vergleiche beide Pole jeder Big-Five-Dimension und erkenne, wo Missverständnisse entstehen können.",
          outcome: "Eine Brücke zwischen zwei unterschiedlichen Stilen",
          action: "Beide Seiten vergleichen",
          href: "/learn/opposites",
        },
        {
          id: "library",
          number: "04",
          label: "Perspektiven",
          title: "Ich möchte andere Perspektiven entdecken",
          text: "Nutze Bücher und Filme, um deine Erfahrung zu spiegeln oder deinen Blick bewusst zu erweitern.",
          outcome: "Empfehlungen passend zu deiner Perspektive",
          action: "Perspektiven entdecken",
          href: "/learn/library",
        },
      ],
      bridgeKicker: "Der Name ist die Idee",
      bridgeTitle: "Eine Brücke braucht beide Seiten",
      bridgeText:
        "TraitBridge sortiert Menschen nicht in besser und schlechter. Es macht unterschiedliche Beiträge sichtbar und hilft, zwischen ihnen zu übersetzen.",
      bridgeTrait: "Beispiel: Offenheit",
      bridgeLow: "Niedrige Ausprägung",
      bridgeLowText: "Verankert Ideen in Erfahrung, Kontinuität und praktischer Anwendung.",
      bridgeHigh: "Hohe Ausprägung",
      bridgeHighText: "Öffnet durch Neugier, Vorstellungskraft und Erkundung neue Möglichkeiten.",
      bridgeAction: "Alle fünf Dimensionen vergleichen",
    },
    articles: {
      metaTitle: "Wissensartikel",
      kicker: "Praktisches Wissen",
      title: "Finde einen Leitfaden für deine Situation.",
      intro:
        "Filtere nach Alltagssituation, Big-Five-Dimension und Ausprägung. Jeder Leitfaden kennzeichnet Hypothesen, Grenzen und Quellen.",
      back: "Zurück zum Lern-Hub",
      searchLabel: "Artikel durchsuchen",
      searchPlaceholder: "Zum Beispiel: Sichtbarkeit, Konflikt oder Veränderung",
      quickStart: "Schnelleinstieg nach Situation",
      situationLabel: "Alltagssituation",
      allSituations: "Alle Situationen",
      traitLabel: "Big-Five-Dimension",
      allTraits: "Alle Dimensionen",
      poleLabel: "Ausprägung",
      allPoles: "Alle Ausprägungen",
      low: "Niedrig",
      high: "Hoch",
      both: "Beide Pole",
      perspectiveLabel: "Leseperspektive",
      mirror: "Spiegel",
      mirrorText: "Was sich an diesem Muster vertraut anfühlen könnte.",
      growth: "Entwicklung",
      growthText: "Welches praktische Gegengewicht du ausprobieren kannst.",
      results: "Artikel",
      showMore: "Weitere Artikel anzeigen",
      noResults: "Kein Artikel passt zu diesen Filtern.",
      noResultsText: "Entferne einen Filter oder nutze einen allgemeineren Suchbegriff.",
      open: "Leitfaden öffnen",
      mirrorReason: "Möglicher Spiegel",
      growthReason: "Möglicher nächster Schritt",
      clear: "Filter zurücksetzen",
      activeFilters: "Aktive Filter",
      advancedFilters: "Weitere Filter und Leseperspektive",
      communityTitle: "Vergleiche deine Erfahrung",
      communityText:
        "Persönlichkeit wird verständlicher, wenn verschiedene Menschen dieselbe Situation aus ihrer Perspektive beschreiben.",
      communityAction: "Passende Community-Fragen öffnen",
    },
  },
};
