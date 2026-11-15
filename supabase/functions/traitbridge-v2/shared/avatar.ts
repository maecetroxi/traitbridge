import type { AvatarConfig } from "./types.ts";
export const avatarColors = [
  "#b5bbf5",
  "#a5cfc0",
  "#edb897",
  "#e7c971",
  "#c5b2d7",
  "#9ec5db",
] as const;
export function generateAvatar(seed: string): AvatarConfig {
  let state = 2166136261;
  for (const char of seed)
    state = Math.imul(state ^ char.charCodeAt(0), 16777619) >>> 0;
  const next = (n: number) => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state % n;
  };
  return {
    version: 1,
    shape: next(3),
    color: next(6),
    eyes: next(3),
    mouth: next(3),
    detail: next(4),
  };
}
export function validAvatar(value: unknown): value is AvatarConfig {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    Object.entries({ shape: 3, color: 6, eyes: 3, mouth: 3, detail: 4 }).every(
      ([key, n]) =>
        Number.isInteger(v[key]) && Number(v[key]) >= 0 && Number(v[key]) < n,
    )
  );
}
