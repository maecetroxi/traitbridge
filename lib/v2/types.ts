export const traits = ["O", "C", "E", "A", "N"] as const;
export type Trait = (typeof traits)[number];
export type Scores = Record<Trait, number>;
export type AssessmentVariant = "short" | "full";
export type AssessmentMetadata = {
  source: "onboarding" | "device_test" | "account_result";
  variant: AssessmentVariant;
  version: string | null;
  language: "de" | "en" | null;
  resultId?: string;
  createdAt?: string | null;
};
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
  assessment?: AssessmentMetadata | null;
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
export type DiscoverKind = "question" | "experience";
export type DiscoverItem = {
  id: string;
  kind: DiscoverKind;
  author: Person;
  title: string | null;
  body: string;
  topic: Topic;
  status: "open" | "closed" | "visible" | "hidden";
  created_at: string;
  can_answer: boolean;
  bookmarked: boolean;
  helpful: boolean;
};
export type DiscoverCursor = { at: string; id: string; kind: DiscoverKind };
export type DiscoverPage = { items: DiscoverItem[]; next: DiscoverCursor | null };
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
