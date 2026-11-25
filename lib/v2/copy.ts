import type { Locale } from "../i18n";
import type { Topic } from "./types";
export const topicLabels: Record<Locale, Record<Topic, string>> = {
  de: {
    relationships: "Beziehungen",
    work: "Arbeit & Alltag",
    decisions: "Entscheidungen",
    social: "Miteinander",
    stress: "Stress & Ruhe",
    habits: "Gewohnheiten",
    self: "Selbstverständnis",
  },
  en: {
    relationships: "Relationships",
    work: "Work & everyday life",
    decisions: "Decisions",
    social: "Social situations",
    stress: "Stress & calm",
    habits: "Habits",
    self: "Understanding yourself",
  },
};
export const reasonLabels = {
  de: {
    similar: "Ähnliche Merkmale für dieses Thema.",
    broader: "Andere Perspektive zum Thema.",
    topic: "Gemeinsames Interesse oder Erfahrung.",
  },
  en: {
    similar: "You share similar traits relevant to this topic.",
    broader: "A broader, related perspective.",
    topic: "You share an interest or experience.",
  },
};
export const noticeLabels = {
  de: {
    answer: "Neue Antwort",
    thanks: "Danke erhalten",
    question: "Passende Frage",
  },
  en: {
    answer: "New reply",
    thanks: "Thank-you received",
    question: "Matching question",
  },
};
