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
      <div className="personality-badge-compact">
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
    <div className="personality-badge">
      {entries.map(([trait, value]) => {
        const percent = (value / 5) * 100;
        return (
          <div key={trait} className="personality-trait">
            <div className="personality-trait-heading">
              <span>{copy.traits[trait]}</span>
              <strong>
                {value.toFixed(1)} / 5
              </strong>
            </div>
            <div
              className="trait-bar-shell"
              role="img"
              aria-label={`${copy.traits[trait]}: ${value.toFixed(1)} / 5`}
            >
              <div className="trait-bar-fill" style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PersonalityBadge;
