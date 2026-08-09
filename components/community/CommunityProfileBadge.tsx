import React from "react";
import { useLocale } from "../../contexts/LocaleContext";
import type { CommunityProfile } from "../../lib/supabase-queries";

const TRAITS = ["O", "C", "E", "A", "N"] as const;
const bandIndex = { low: 0, middle: 1, high: 2 } as const;

export const CommunityProfileBadge: React.FC<{
  profile: CommunityProfile | null;
}> = ({ profile }) => {
  const { copy } = useLocale();

  if (!profile) {
    return <span className="community-profile-unavailable">{copy.community.profileUnavailable}</span>;
  }

  return (
    <div className="community-author-profile">
      <strong className="community-display-name">{profile.display_name}</strong>
      <div className="ocean-micro-profile" aria-label={copy.community.profileAriaLabel}>
        {TRAITS.map((trait) => {
          const band = profile.bands[trait];
          const accessibleLabel = `${copy.traits[trait]}: ${copy.traits[band === "middle" ? "medium" : band]}`;

          return (
            <span
              key={trait}
              className="ocean-micro-trait"
              data-trait={trait}
              role="img"
              aria-label={accessibleLabel}
              title={accessibleLabel}
            >
              <b aria-hidden="true">{trait}</b>
              <span className="ocean-micro-dots" aria-hidden="true">
                {[0, 1, 2].map((index) => (
                  <i key={index} data-active={bandIndex[band] === index ? "true" : "false"} />
                ))}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
};

export const CommunityProfileLegend: React.FC = () => {
  const { copy } = useLocale();
  return (
    <p className="community-profile-legend">
      <strong>OCEAN</strong>
      <span>{copy.community.profileLegend}</span>
    </p>
  );
};
