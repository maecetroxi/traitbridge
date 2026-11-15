import { topics, traits, type Scores, type Topic, type Trait } from "./types.ts";
export const topicTraits: Record<Topic, Trait[]> = {
  relationships: ["A", "E"],
  work: ["C", "E"],
  decisions: ["O", "N"],
  social: ["E"],
  stress: ["N"],
  habits: ["C"],
  self: ["O", "N"],
};
export const matchingDefaults = {
  close: 0.65,
  broad: 1.35,
  interestWeight: 0.35,
  experienceWeight: 0.5,
  limit: 6,
};
export type MatchCandidate = {
  id: string;
  author_id: string;
  scores: Scores;
  topic: Topic;
  language: string;
  answered: boolean;
  skipped: boolean;
  blocked: boolean;
  available: boolean;
  slots: number;
  created_at: string;
};
export type MatchReader = {
  id: string;
  scores: Scores;
  language: string;
  available: boolean;
  interests: Topic[];
  experiences: Topic[];
};
export function rankMatches(
  reader: MatchReader,
  candidates: MatchCandidate[],
  config = matchingDefaults,
) {
  if (!reader.available || !validScores(reader.scores)) return [];
  return candidates
    .flatMap((q) => {
      if (
        q.author_id === reader.id ||
        q.blocked ||
        q.answered ||
        q.skipped ||
        !q.available ||
        q.slots <= 0 ||
        q.language !== reader.language ||
        !validScores(q.scores) ||
        !topics.includes(q.topic)
      )
        return [];
      const relevant = topicTraits[q.topic];
      const distance =
        relevant.reduce(
          (sum, t) => sum + Math.abs(q.scores[t] - reader.scores[t]),
          0,
        ) / relevant.length;
      const interest = reader.interests.includes(q.topic),
        experience = reader.experiences.includes(q.topic);
      const tier =
        distance <= config.close
          ? 1
          : distance <= config.broad
            ? 2
            : interest || experience
              ? 3
              : 0;
      return tier
        ? [
            {
              id: q.id,
              tier,
              reason: tier === 1 ? "similar" : tier === 2 ? "broader" : "topic",
              rank:
                distance -
                Number(interest) * config.interestWeight -
                Number(experience) * config.experienceWeight,
              created_at: q.created_at,
            },
          ]
        : [];
    })
    .sort(
      (a, b) =>
        a.tier - b.tier ||
        a.rank - b.rank ||
        a.created_at.localeCompare(b.created_at) ||
        a.id.localeCompare(b.id),
    )
    .slice(0, config.limit);
}
export function validScores(value: unknown): value is Scores {
  return (
    !!value &&
    typeof value === "object" &&
    traits.every(
      (t) =>
        typeof (value as Scores)[t] === "number" &&
        Number.isFinite((value as Scores)[t]) &&
        (value as Scores)[t] >= 1 &&
        (value as Scores)[t] <= 5,
    )
  );
}
export function classifyTopic(body: string): Topic {
  const rules: [Topic, RegExp][] = [
    ["relationships", /partner|beziehung|relationship|freund|family|familie/i],
    ["work", /arbeit|beruf|job|work|kolleg|career/i],
    ["social", /party|partys|gruppe|group|gespräch|social|fremd/i],
    ["stress", /stress|angst|anxiety|overwhelm|überfordert/i],
    ["habits", /gewohnheit|habit|routine|aufschieb|procrastin/i],
    ["decisions", /entscheid|decision|choose|wahl/i],
  ];
  return rules.find(([, pattern]) => pattern.test(body))?.[0] || "self";
}
