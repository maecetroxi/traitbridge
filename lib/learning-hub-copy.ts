import type { Locale } from "./i18n";

export const learningHubCopy: Record<
  Locale,
  {
    hub: {
      metaTitle: string;
      kicker: string;
      title: string;
      intro: string;
      promise: string;
      navigationLabel: string;
      articleCountLabel: string;
      mediaCountLabel: string;
      sections: Array<{
        id: "contribution" | "opposites" | "articles" | "library";
        number: string;
        title: string;
        text: string;
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
      featuredKicker: string;
      featuredTitle: string;
      featuredText: string;
      allArticles: string;
      communityKicker: string;
      communityTitle: string;
      communityText: string;
      communityAction: string;
      toolKicker: string;
      toolTitle: string;
      toolText: string;
      toolAction: string;
    };
    articles: {
      metaTitle: string;
      kicker: string;
      title: string;
      intro: string;
      back: string;
      searchLabel: string;
      searchPlaceholder: string;
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
      noResults: string;
      noResultsText: string;
      open: string;
      mirrorReason: string;
      growthReason: string;
      clear: string;
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
      intro:
        "Explore how different personality tendencies can contribute, complement one another and become easier to understand in everyday life.",
      promise:
        "No pole is the ideal. Every profile combines possibilities, trade-offs, context and room to learn.",
      navigationLabel: "Learning areas",
      articleCountLabel: "articles",
      mediaCountLabel: "books & films",
      sections: [
        {
          id: "contribution",
          number: "01",
          title: "My possible contribution",
          text: "Translate your profile into careful hypotheses about what you may notice, support and bring to other people.",
          action: "Open contribution compass",
          href: "/learn/contribution",
        },
        {
          id: "opposites",
          number: "02",
          title: "Understand opposites",
          text: "Compare both poles of every dimension and see why teams, relationships and communities need different styles.",
          action: "Explore the bridge",
          href: "/learn/opposites",
        },
        {
          id: "articles",
          number: "03",
          title: "Knowledge articles",
          text: "Find practical, sourced guides for specific situations, dimensions and expressions.",
          action: "Browse all articles",
          href: "/learn/articles",
        },
        {
          id: "library",
          number: "04",
          title: "Books & films",
          text: "Discover editorial recommendations that either mirror your tendencies or deliberately widen your perspective.",
          action: "Open media library",
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
      featuredKicker: "Start with a situation",
      featuredTitle: "Practical guides for everyday life",
      featuredText:
        "Short guides connect possible personality tendencies with a concrete experiment—without turning a score into a diagnosis.",
      allArticles: "View all knowledge articles",
      communityKicker: "Learn with other perspectives",
      communityTitle: "Understanding grows through conversation",
      communityText:
        "Ask how other people experience a similar situation, or read perspectives that differ from your own.",
      communityAction: "Explore Community discussions",
      toolKicker: "Personal question",
      toolTitle: "Use the Big Five Compass",
      toolText:
        "Ask one concrete question and use your profile as a perspective—not as an answer that decides for you.",
      toolAction: "Open personality compass",
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
      noResults: "No article matches these filters.",
      noResultsText: "Remove a filter or try a broader search term.",
      open: "Open guide",
      mirrorReason: "Possible mirror",
      growthReason: "Possible next step",
      clear: "Reset filters",
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
      intro:
        "Entdecke, wie unterschiedliche Persönlichkeitstendenzen beitragen, einander ergänzen und im Alltag verständlicher werden können.",
      promise:
        "Kein Pol ist das Ideal. Jedes Profil verbindet Möglichkeiten, Spannungsfelder, Kontext und Entwicklungsspielraum.",
      navigationLabel: "Lernbereiche",
      articleCountLabel: "Artikel",
      mediaCountLabel: "Bücher & Filme",
      sections: [
        {
          id: "contribution",
          number: "01",
          title: "Mein möglicher Beitrag",
          text: "Übersetze dein Profil in vorsichtige Hypothesen darüber, was du wahrnehmen, unterstützen und für andere einbringen könntest.",
          action: "Beitragskompass öffnen",
          href: "/learn/contribution",
        },
        {
          id: "opposites",
          number: "02",
          title: "Gegensätze verstehen",
          text: "Vergleiche beide Pole jeder Dimension und erkenne, weshalb Teams, Beziehungen und Gemeinschaften verschiedene Stile brauchen.",
          action: "Die Brücke erkunden",
          href: "/learn/opposites",
        },
        {
          id: "articles",
          number: "03",
          title: "Wissensartikel",
          text: "Finde praktische, belegte Leitfäden für konkrete Situationen, Dimensionen und Ausprägungen.",
          action: "Alle Artikel entdecken",
          href: "/learn/articles",
        },
        {
          id: "library",
          number: "04",
          title: "Bücher & Filme",
          text: "Entdecke redaktionelle Empfehlungen, die deine Tendenzen spiegeln oder bewusst eine andere Perspektive öffnen.",
          action: "Medienbibliothek öffnen",
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
      featuredKicker: "Beginne mit einer Situation",
      featuredTitle: "Praktische Leitfäden für den Alltag",
      featuredText:
        "Kurze Leitfäden verbinden mögliche Persönlichkeitstendenzen mit einem konkreten Experiment – ohne aus einem Wert eine Diagnose zu machen.",
      allArticles: "Alle Wissensartikel anzeigen",
      communityKicker: "Mit anderen Perspektiven lernen",
      communityTitle: "Verständnis wächst im Austausch",
      communityText:
        "Frage, wie andere eine ähnliche Situation erleben, oder lies Sichtweisen, die sich von deiner unterscheiden.",
      communityAction: "Community-Diskussionen entdecken",
      toolKicker: "Persönliche Frage",
      toolTitle: "Nutze den Big-Five-Kompass",
      toolText:
        "Stelle eine konkrete Frage und nutze dein Profil als Perspektive – nicht als Antwort, die für dich entscheidet.",
      toolAction: "Persönlichkeits-Kompass öffnen",
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
      noResults: "Kein Artikel passt zu diesen Filtern.",
      noResultsText: "Entferne einen Filter oder nutze einen allgemeineren Suchbegriff.",
      open: "Leitfaden öffnen",
      mirrorReason: "Möglicher Spiegel",
      growthReason: "Möglicher nächster Schritt",
      clear: "Filter zurücksetzen",
      communityTitle: "Vergleiche deine Erfahrung",
      communityText:
        "Persönlichkeit wird verständlicher, wenn verschiedene Menschen dieselbe Situation aus ihrer Perspektive beschreiben.",
      communityAction: "Passende Community-Fragen öffnen",
    },
  },
};
