import React from "react";
import { useLocale } from "../contexts/LocaleContext";

export type BigFiveScores = {
  O: number;
  C: number;
  E: number;
  A: number;
  N: number;
};

type PersonalityBadgeProps = {
  scores: BigFiveScores;
  compact?: boolean;
};

const PersonalityBadge: React.FC<PersonalityBadgeProps> = ({ scores, compact }) => {
  const { copy } = useLocale();
  const entries = Object.entries(scores) as Array<[keyof BigFiveScores, number]>;

  if (compact) {
    return (
      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", fontSize: "0.75rem" }}>
        {entries.map(([trait, value]) => {
          const level = value >= 4 ? copy.traits.high : value <= 2 ? copy.traits.low : copy.traits.medium;
          return (
            <span key={trait} className="pill">
              <span className="pill-dot" />
              {trait}:{level}
            </span>
          );
        })}
      </div>
    );
  }

  return (
    <div className="stack-md">
      {entries.map(([trait, value]) => {
        const percent = (value / 5) * 100;
        return (
          <div key={trait} style={{ display: "grid", gap: "0.5rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "0.9375rem",
                gap: "1rem",
              }}
            >
              <span style={{ fontWeight: 500, color: "var(--text)" }}>{copy.traits[trait]}</span>
              <span
                style={{
                  fontWeight: 600,
                  color: "var(--accent)",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {value.toFixed(1)} / 5
              </span>
            </div>
            <div className="trait-bar-shell">
              <div className="trait-bar-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PersonalityBadge;
