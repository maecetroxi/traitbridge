import type { Question as PackageQuestion } from "@bigfive-org/questions";
import type { BigFiveScores } from "../components/PersonalityBadge";
import { getScoreBands } from "./bigfive-results";

export const SHORT_TEST_ITEM_IDS = [
  "888dd864-7449-4e96-8d5c-7a439603ea91",
  "73d84e5d-cbf5-47f0-b8cb-4d2159a52e32",
  "d50a597f-632b-4f7b-89e6-6d85b50fd1c9",
  "ccf3a5c8-fb50-4bd4-8e7a-22af3d657279",
  "43c98ce8-a07a-4dc2-80f6-c1b2a2485f06",
  "33b81fd0-7e32-4cd8-a13a-d5f5f754f998",
  "bd9eec0a-b68b-472c-8803-7db29c308cdb",
  "03c10b30-b88f-4c63-8acc-71251ca24615",
  "cd54bd76-ca9c-4030-b325-bb8d896bcb3f",
  "88a3c2fe-3aa4-4f46-9322-da656332268a",
] as const;

const TRAITS: Array<keyof BigFiveScores> = ["O", "C", "E", "A", "N"];

export const selectShortTestQuestions = (
  questions: PackageQuestion[],
): PackageQuestion[] => {
  const byId = new Map(questions.map((question) => [question.id, question]));
  const selected = SHORT_TEST_ITEM_IDS.flatMap((id) => {
    const question = byId.get(id);
    return question ? [question] : [];
  });

  if (selected.length !== SHORT_TEST_ITEM_IDS.length) {
    throw new Error("The short-test question set is incomplete.");
  }

  for (const trait of TRAITS) {
    if (selected.filter((question) => question.domain === trait).length !== 2) {
      throw new Error(`The short test needs exactly two ${trait} items.`);
    }
  }

  return selected;
};

export const calculateShortTestScores = (
  questions: PackageQuestion[],
  answers: Record<string, number>,
): BigFiveScores => {
  const selected = selectShortTestQuestions(questions);
  const scores = {} as BigFiveScores;

  for (const trait of TRAITS) {
    const traitQuestions = selected.filter((question) => question.domain === trait);
    const values = traitQuestions.map((question) => answers[question.id]);

    if (values.some((value) => !Number.isInteger(value) || value < 1 || value > 5)) {
      throw new Error("Please answer every short-test statement.");
    }

    scores[trait] = Number(
      (values.reduce((total, value) => total + value, 0) / values.length).toFixed(2),
    );
  }

  return scores;
};

export const calculateShortTestBands = (
  questions: PackageQuestion[],
  answers: Record<string, number>,
) => getScoreBands(calculateShortTestScores(questions, answers));
