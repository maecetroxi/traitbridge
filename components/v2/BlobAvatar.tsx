import { avatarColors, generateAvatar } from "../../lib/v2/avatar";
import type { AvatarConfig } from "../../lib/v2/types";
const shapes = [
  "M22 79C10 58 29 20 57 20C87 11 110 40 107 70C114 99 88 114 63 109C37 116 16 102 22 79Z",
  "M18 77C21 55 17 24 46 24C64 10 91 21 94 41C119 55 116 88 96 100C72 118 18 110 18 77Z",
  "M20 75C13 46 37 22 62 24C82 12 106 33 104 57C120 83 99 109 77 107C48 117 15 103 20 75Z",
];
export default function BlobAvatar({
  config = generateAvatar("traitbridge"),
  size = 64,
  label,
}: {
  config?: AvatarConfig;
  size?: number;
  label?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 128 128"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={!label}
      className="tb-blob"
    >
      <ellipse cx="64" cy="113" rx="35" ry="5" fill="#273c3320" />
      <path d={shapes[config.shape]} fill={avatarColors[config.color]} />
      {config.detail === 1 && (
        <path d="M54 24Q48 6 62 11Q73 9 67 23" fill="#405449" />
      )}
      {config.detail === 2 && (
        <path
          d="M29 35Q58 12 95 35"
          fill="none"
          stroke="#fff7ea"
          strokeWidth="9"
          strokeLinecap="round"
        />
      )}
      {config.detail === 3 && (
        <path d="M91 27l3-9 5 8 9 1-7 6 1 9-8-5-8 3 3-8-5-6z" fill="#fff7ea" />
      )}
      {config.eyes === 1 ? (
        <g fill="none" stroke="#293d36" strokeWidth="3.4" strokeLinecap="round">
          <path d="M43 60q5-7 10 0M74 60q5-7 10 0" />
        </g>
      ) : (
        <g fill="#293d36">
          <ellipse cx="49" cy="59" rx="3" ry={config.eyes === 2 ? 5 : 4} />
          <ellipse cx="79" cy="59" rx="3" ry={config.eyes === 2 ? 5 : 4} />
        </g>
      )}
      <g fill="none" stroke="#293d36" strokeWidth="3" strokeLinecap="round">
        {config.mouth === 0 ? (
          <path d="M56 74q8 9 16 0" />
        ) : config.mouth === 1 ? (
          <path d="M58 76h12" />
        ) : (
          <path d="M57 73q7 14 14 0z" />
        )}
      </g>
      <g fill="#d47c773a">
        <ellipse cx="36" cy="71" rx="7" ry="4" />
        <ellipse cx="92" cy="71" rx="7" ry="4" />
      </g>
    </svg>
  );
}
