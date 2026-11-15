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
    similar: "Bei diesem Thema tickt ihr ähnlich.",
    broader: "Eine etwas andere, verwandte Perspektive.",
    topic: "Ihr teilt ein Interesse oder eine Erfahrung.",
  },
  en: {
    similar: "You share similar traits relevant to this topic.",
    broader: "A broader, related perspective.",
    topic: "You share an interest or experience.",
  },
};
export const noticeLabels = {
  de: {
    answer: "Eine menschliche Antwort ist da.",
    thanks: "Jemand bedankt sich für deine Erfahrung.",
    question: "Eine neue Frage wurde dir angeboten.",
  },
  en: {
    answer: "A human reply has arrived.",
    thanks: "Someone thanked you for your experience.",
    question: "A new question has been offered to you.",
  },
};
