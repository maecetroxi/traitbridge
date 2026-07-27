import React from "react";
import type { Domain } from "@bigfive-org/results";
import type { BigFiveScores } from "./PersonalityBadge";
import { useLocale } from "../contexts/LocaleContext";
import {
  getProfileCombinationNotes,
  getTraitContext,
  type TraitKey,
} from "../lib/profile-content";

type ProfileInterpretationProps = {
  scores: BigFiveScores;
  detailedResults?: Domain[] | null;
};

const TRAITS: TraitKey[] = ["O", "C", "E", "A", "N"];

const ProfileInterpretation: React.FC<ProfileInterpretationProps> = ({
  scores,
  detailedResults,
}) => {
  const { locale, copy } = useLocale();
  const detailsByDomain = new Map(
    (detailedResults || []).map((result) => [result.domain, result]),
  );

  return (
    <div className="profile-interpretation">
      <div className="profile-context-note">
        <h2 className="section-title">{copy.profile.interpretationTitle}</h2>
        <p>{copy.profile.contextIntro}</p>
      </div>

      <div className="profile-dimension-list">
        {TRAITS.map((trait) => {
          const context = getTraitContext(locale, trait, scores[trait]);
          const detail = detailsByDomain.get(trait);

          return (
            <article key={trait} className="surface profile-dimension-card">
              <header className="profile-dimension-heading">
                <div>
                  <span className="page-kicker">
                    {copy.profile.bandLabels[context.band]}
                  </span>
                  <h3>{copy.traits[trait]}</h3>
                </div>
                <strong>{scores[trait].toFixed(1)} / 5</strong>
              </header>

              <div className="profile-balance-grid">
                <div>
                  <h4>{copy.profile.possibleBenefit}</h4>
                  <p>{context.benefit}</p>
                </div>
                <div>
                  <h4>{copy.profile.possibleFriction}</h4>
                  <p>{context.friction}</p>
                </div>
              </div>

              {detail?.facets && detail.facets.length > 0 && (
                <details className="profile-facet-details">
                  <summary>{copy.profile.showFacets}</summary>
                  <p>{copy.profile.facetsContext}</p>
                  <ul>
                    {detail.facets.map((facet) => (
                      <li key={facet.facet}>
                        <span>{facet.title}</span>
                        <strong>{(facet.score / facet.count).toFixed(1)} / 5</strong>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </article>
          );
        })}
      </div>

      <aside className="trust-note profile-combination-note">
        <h3>{copy.profile.combinationTitle}</h3>
        {getProfileCombinationNotes(scores, locale).map((note) => (
          <p key={note}>{note}</p>
        ))}
      </aside>
    </div>
  );
};

export default ProfileInterpretation;
