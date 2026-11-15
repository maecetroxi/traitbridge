export const traits = ["O", "C", "E", "A", "N"] as const;
export type Trait = (typeof traits)[number];
export type Scores = Record<Trait, number>;
export const topics = [
  "relationships",
  "work",
  "decisions",
  "social",
  "stress",
  "habits",
  "self",
] as const;
export type Topic = (typeof topics)[number];
export type AvatarConfig = {
  version: 1;
  shape: number;
  color: number;
  eyes: number;
  mouth: number;
  detail: number;
};
export type Profile = {
  id: string;
  pseudonym: string;
  avatar: AvatarConfig;
  scores: Scores;
  language: "de" | "en";
  interests: Topic[];
  experiences: Topic[];
  available: boolean;
  notifications: boolean;
  variant: "short" | "full";
};
export type Person = { id: string; pseudonym: string; avatar: AvatarConfig };
export type Question = {
  id: string;
  author: Person;
  body: string;
  topic: Topic;
  language: "de" | "en";
  discoverable: boolean;
  status: string;
  created_at: string;
  reason?: string;
};
export type Answer = {
  id: string;
  question_id: string;
  author: Person;
  body: string;
  created_at: string;
  thanks: string | null;
};
export type Notice = {
  id: string;
  question_id: string | null;
  kind: "answer" | "thanks" | "question";
  read_at: string | null;
  created_at: string;
};
export type Snapshot = {
  profile: Profile | null;
  questions: Question[];
  answers: Answer[];
  notifications: Notice[];
  blocks: { id: string; pseudonym: string }[];
  moderator?: boolean;
};
export const emptySnapshot: Snapshot = {
  profile: null,
  questions: [],
  answers: [],
  notifications: [],
  blocks: [],
};
