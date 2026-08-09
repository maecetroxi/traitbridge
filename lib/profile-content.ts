import type { BigFiveScores } from "../components/PersonalityBadge";
import type { Locale } from "./i18n";

export type TraitKey = keyof BigFiveScores;
export type TraitBand = "lower" | "middle" | "higher";

type TraitContext = {
  higherBenefit: string;
  higherFriction: string;
  lowerBenefit: string;
  lowerFriction: string;
  middleBenefit: string;
  middleFriction: string;
  learningSlug: string;
};

export const PROFILE_TRAIT_CONTENT: Record<
  Locale,
  Record<TraitKey, TraitContext>
> = {
  en: {
    O: {
      higherBenefit: "Curiosity and openness to unfamiliar perspectives can make exploration easier.",
      higherFriction: "Many possibilities can make focus or a clear decision harder.",
      lowerBenefit: "Familiar approaches and concrete information can provide orientation.",
      lowerFriction: "Unfamiliar ideas or rapid change may require more time to feel workable.",
      middleBenefit: "You may move between exploration and familiar approaches depending on the situation.",
      middleFriction: "The useful balance can still change with pressure, topic and experience.",
      learningSlug: "decisions-with-overthinking",
    },
    C: {
      higherBenefit: "Planning and follow-through can support dependable progress.",
      higherFriction: "High standards or disrupted plans can create unnecessary pressure.",
      lowerBenefit: "Spontaneity can make it easier to adapt when plans change.",
      lowerFriction: "Long projects may need more external structure and clear starting points.",
      middleBenefit: "You may combine planning with room to adapt.",
      middleFriction: "Structure can vary considerably between interesting and less engaging tasks.",
      learningSlug: "personality-friendly-habits",
    },
    E: {
      higherBenefit: "Contact and outward activity can make it easier to create momentum with others.",
      higherFriction: "Quiet signals or a need for recovery can be overlooked in busy settings.",
      lowerBenefit: "Reflection and lower-stimulation settings can support sustained concentration.",
      lowerFriction: "Frequent social demands or speaking up quickly may consume more energy.",
      middleBenefit: "You may draw energy from both contact and time on your own.",
      middleFriction: "Your preferred level of stimulation may depend strongly on the group and setting.",
      learningSlug: "social-exhaustion",
    },
    A: {
      higherBenefit: "Cooperation and attention to other perspectives can support trust.",
      higherFriction: "Your own limits or disagreement can become too easy to postpone.",
      lowerBenefit: "Directness can make disagreements and trade-offs visible early.",
      lowerFriction: "Others may need more context or warmth to hear a direct message as intended.",
      middleBenefit: "You may combine cooperation with direct disagreement.",
      middleFriction: "The balance can shift when relationships, hierarchy or time pressure are involved.",
      learningSlug: "setting-boundaries",
    },
    N: {
      higherBenefit: "Sensitivity to risk and emotional signals can support preparation and empathy.",
      higherFriction: "Uncertainty or setbacks may stay active for longer and require deliberate recovery.",
      lowerBenefit: "Emotional steadiness can help keep perspective under pressure.",
      lowerFriction: "Subtle concerns—your own or other people's—can sometimes receive too little attention.",
      middleBenefit: "Your emotional response may vary with the kind and duration of stress.",
      middleFriction: "An average profile value does not show which situations affect you most.",
      learningSlug: "self-criticism-after-mistakes",
    },
  },
  de: {
    O: {
      higherBenefit: "Neugier und Offenheit für ungewohnte Perspektiven können Erkundung erleichtern.",
      higherFriction: "Viele Möglichkeiten können Fokus oder eine klare Entscheidung erschweren.",
      lowerBenefit: "Vertraute Vorgehensweisen und konkrete Informationen können Orientierung geben.",
      lowerFriction: "Ungewohnte Ideen oder schnelle Veränderungen brauchen möglicherweise mehr Anlaufzeit.",
      middleBenefit: "Je nach Situation kannst du zwischen Erkunden und vertrauten Wegen wechseln.",
      middleFriction: "Die hilfreiche Balance kann sich mit Druck, Thema und Erfahrung verändern.",
      learningSlug: "decisions-with-overthinking",
    },
    C: {
      higherBenefit: "Planung und Verbindlichkeit können zuverlässigen Fortschritt unterstützen.",
      higherFriction: "Hohe Ansprüche oder gestörte Pläne können unnötigen Druck erzeugen.",
      lowerBenefit: "Spontaneität kann Anpassung erleichtern, wenn Pläne sich ändern.",
      lowerFriction: "Lange Vorhaben brauchen eventuell mehr äussere Struktur und klare Startpunkte.",
      middleBenefit: "Du kannst Planung möglicherweise mit Spielraum zum Anpassen verbinden.",
      middleFriction: "Struktur kann zwischen interessanten und weniger anregenden Aufgaben stark schwanken.",
      learningSlug: "personality-friendly-habits",
    },
    E: {
      higherBenefit: "Kontakt und Aktivität nach aussen können gemeinsamen Schwung erleichtern.",
      higherFriction: "Leise Signale oder Erholungsbedarf können in lebhaften Situationen untergehen.",
      lowerBenefit: "Reflexion und reizärmere Umgebungen können längere Konzentration unterstützen.",
      lowerFriction: "Viele soziale Anforderungen oder schnelles Wortergreifen können mehr Energie kosten.",
      middleBenefit: "Du kannst Energie möglicherweise sowohl aus Kontakt als auch aus Zeit für dich ziehen.",
      middleFriction: "Das passende Reizniveau kann stark von Gruppe und Situation abhängen.",
      learningSlug: "social-exhaustion",
    },
    A: {
      higherBenefit: "Kooperation und Aufmerksamkeit für andere Perspektiven können Vertrauen fördern.",
      higherFriction: "Eigene Grenzen oder Widerspruch können zu leicht aufgeschoben werden.",
      lowerBenefit: "Direktheit kann Unterschiede und Zielkonflikte früh sichtbar machen.",
      lowerFriction: "Andere brauchen eventuell mehr Kontext oder Wärme, um Direktheit wie beabsichtigt zu hören.",
      middleBenefit: "Du kannst Kooperation möglicherweise mit direktem Widerspruch verbinden.",
      middleFriction: "Die Balance kann sich bei Nähe, Hierarchie oder Zeitdruck verschieben.",
      learningSlug: "setting-boundaries",
    },
    N: {
      higherBenefit: "Sensibilität für Risiken und emotionale Signale kann Vorbereitung und Empathie unterstützen.",
      higherFriction: "Unsicherheit oder Rückschläge können länger nachwirken und bewusste Erholung brauchen.",
      lowerBenefit: "Emotionale Stabilität kann helfen, unter Druck den Überblick zu behalten.",
      lowerFriction: "Feine Sorgen – eigene oder fremde – können manchmal zu wenig Beachtung erhalten.",
      middleBenefit: "Deine emotionale Reaktion kann je nach Art und Dauer der Belastung variieren.",
      middleFriction: "Ein mittlerer Profilwert zeigt nicht, welche Situationen dich besonders betreffen.",
      learningSlug: "self-criticism-after-mistakes",
    },
  },
};

export const getTraitBand = (score: number): TraitBand => {
  if (score >= 3.5) {
    return "higher";
  }

  if (score <= 2.5) {
    return "lower";
  }

  return "middle";
};

export const getTraitContext = (
  locale: Locale,
  trait: TraitKey,
  score: number,
) => {
  const content = PROFILE_TRAIT_CONTENT[locale][trait];
  const band = getTraitBand(score);

  if (band === "higher") {
    return {
      band,
      benefit: content.higherBenefit,
      friction: content.higherFriction,
      learningSlug: content.learningSlug,
    };
  }

  if (band === "lower") {
    return {
      band,
      benefit: content.lowerBenefit,
      friction: content.lowerFriction,
      learningSlug: content.learningSlug,
    };
  }

  return {
    band,
    benefit: content.middleBenefit,
    friction: content.middleFriction,
    learningSlug: content.learningSlug,
  };
};

export const getSuggestedLearningSlug = (scores: BigFiveScores) => {
  const [mostDistinctiveTrait] = (
    Object.entries(scores) as Array<[TraitKey, number]>
  ).sort(
    (first, second) =>
      Math.abs(second[1] - 3) - Math.abs(first[1] - 3),
  );

  return PROFILE_TRAIT_CONTENT.en[mostDistinctiveTrait[0]].learningSlug;
};

export const getProfileCombinationNotes = (
  scores: BigFiveScores,
  locale: Locale,
) => {
  const notes: string[] = [];

  if (scores.C >= 3.5 && scores.N >= 3.5) {
    notes.push(
      locale === "de"
        ? "Planungsorientierung und emotionale Sensibilität können gute Vorbereitung unterstützen; gemeinsam können sie aber auch den inneren Druck erhöhen."
        : "Planning orientation and emotional sensitivity can support good preparation; together they can also increase internal pressure.",
    );
  }

  if (scores.O >= 3.5 && scores.C <= 2.5) {
    notes.push(
      locale === "de"
        ? "Viele Ideen bei eher flexibler Struktur können Entdeckung fördern; kleine äussere Startpunkte können bei der Umsetzung helfen."
        : "Many ideas with a more flexible approach to structure can support discovery; small external starting points may help with follow-through.",
    );
  }

  if (scores.E <= 2.5 && scores.A >= 3.5) {
    notes.push(
      locale === "de"
        ? "Eine eher ruhige, kooperative Art kann gutes Zuhören unterstützen; achte zugleich darauf, eigene Bedürfnisse ausdrücklich einzubringen."
        : "A quieter, cooperative style can support careful listening; it may also help to voice your own needs explicitly.",
    );
  }

  if (notes.length === 0) {
    notes.push(
      locale === "de"
        ? "Die fünf Werte wirken als Kombination. Welche Tendenz hilfreich oder anstrengend wird, hängt von Situation, Zielen, Erfahrung und Umfeld ab."
        : "The five values work as a combination. Whether a tendency helps or creates friction depends on the situation, goals, experience and environment.",
    );
  }

  return notes;
};

