import { traits, type Scores, type Trait } from "./types";

// Same ten item identities as lib/short-test. The UI sends the package's
// already reverse-keyed choice scores; never reverse them a second time.
export const orientationItems: { id: string; trait: Trait }[] = [
  { id: "888dd864-7449-4e96-8d5c-7a439603ea91", trait: "O" },
  { id: "73d84e5d-cbf5-47f0-b8cb-4d2159a52e32", trait: "C" },
  { id: "d50a597f-632b-4f7b-89e6-6d85b50fd1c9", trait: "E" },
  { id: "ccf3a5c8-fb50-4bd4-8e7a-22af3d657279", trait: "A" },
  { id: "43c98ce8-a07a-4dc2-80f6-c1b2a2485f06", trait: "N" },
  { id: "33b81fd0-7e32-4cd8-a13a-d5f5f754f998", trait: "O" },
  { id: "bd9eec0a-b68b-472c-8803-7db29c308cdb", trait: "C" },
  { id: "03c10b30-b88f-4c63-8acc-71251ca24615", trait: "E" },
  { id: "cd54bd76-ca9c-4030-b325-bb8d896bcb3f", trait: "A" },
  { id: "88a3c2fe-3aa4-4f46-9322-da656332268a", trait: "N" },
];
export function scoreOrientation(answers: Record<string, number>): Scores {
  if (
    orientationItems.some(
      (item) =>
        !Number.isInteger(answers[item.id]) ||
        answers[item.id] < 1 ||
        answers[item.id] > 5,
    )
  )
    throw new Error("INCOMPLETE_TEST");
  return Object.fromEntries(
    traits.map((trait) => {
      const items = orientationItems.filter((item) => item.trait === trait);
      return [
        trait,
        items.reduce((sum, item) => sum + answers[item.id], 0) / items.length,
      ];
    }),
  ) as Scores;
}
