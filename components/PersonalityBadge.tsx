import React from "react";

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

const traitLabels: Record<keyof BigFiveScores, string> = {
  O: "Offenheit",
  C: "Gewissenhaftigkeit",
  E: "Extraversion",
  A: "Verträglichkeit",
  N: "Emotionale Stabilität"
};

const PersonalityBadge: React.FC<PersonalityBadgeProps> = ({ scores, compact }) => {
  const entries = Object.entries(scores) as [keyof BigFiveScores, number][];

  if (compact) {
    return (
      <div style={{ display: "flex", gap: "0.25rem", flexWrap: "wrap", fontSize: "0.75rem" }}>
        {entries.map(([trait, value]) => {
          const level = value >= 4 ? "hoch" : value <= 2 ? "tief" : "mittel";
          return (
            <span
              key={trait}
              className="pill"
            >
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
        const label = traitLabels[trait];
        const percent = (value / 5) * 100;
        return (
          <div key={trait} style={{ display: "grid", gap: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.9375rem" }}>
              <span style={{ fontWeight: 500, color: "var(--text)" }}>{label}</span>
              <span style={{ fontWeight: 600, color: "var(--accent)", fontVariantNumeric: "tabular-nums" }}>{value.toFixed(1)} / 5</span>
            </div>
            <div className="trait-bar-shell">
              <div
                className="trait-bar-fill"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PersonalityBadge;
