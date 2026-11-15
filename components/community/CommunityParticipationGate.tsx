import Link from "next/link";
import React, { useState } from "react";
import { useLocale } from "../../contexts/LocaleContext";
import PersonalityBadge from "../PersonalityBadge";
import type { CommunityParticipation } from "./useCommunityParticipation";

type CommunityParticipationGateProps = {
  participation: CommunityParticipation;
  returnTo: string;
  children: React.ReactNode;
};

const CommunityParticipationGate: React.FC<CommunityParticipationGateProps> = ({
  participation,
  returnTo,
  children,
}) => {
  const { copy } = useLocale();
  const [displayName, setDisplayName] = useState("");
  const [consent, setConsent] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);

  if (!participation.permanentUser) {
    return (
      <div className="community-auth-prompt">
        <div>
          <h3>{copy.community.signInTitle}</h3>
          <p>{copy.community.signInDescription}</p>
        </div>
        <Link
          href={{ pathname: "/login", query: { returnTo } }}
          className="btn btn-primary"
        >
          {copy.community.signInAction}
        </Link>
      </div>
    );
  }

  if (participation.isLoading) {
    return <p className="muted" role="status">{copy.community.checkingEligibility}</p>;
  }

  if (participation.error) {
    return (
      <div className="community-status community-status-error" role="alert">
        <span>{copy.community.eligibilityError}</span>
        <button type="button" className="btn btn-outline" onClick={() => void participation.reload()}>
          {copy.community.retry}
        </button>
      </div>
    );
  }

  if (!participation.result) {
    return (
      <div className="community-test-gate">
        <div>
          <h3>{copy.community.testRequiredTitle}</h3>
          <p>{copy.community.testRequiredText}</p>
        </div>
        <div className="community-gate-actions">
          <Link
            href={{ pathname: "/test", query: { short: "1", returnTo } }}
            className="btn btn-primary"
          >
            {copy.community.startShortTest}
          </Link>
          <Link
            href={{ pathname: "/test/full", query: { returnTo } }}
            className="btn btn-outline"
          >
            {copy.community.startFullTest}
          </Link>
        </div>
      </div>
    );
  }

  if (!participation.profile) {
    return (
      <form
        className="community-profile-setup"
        onSubmit={async (event) => {
          event.preventDefault();
          if (displayName.trim().length < 2 || !consent) return;

          try {
            setIsSaving(true);
            setSaveError(false);
            await participation.createProfile(displayName);
          } catch (error) {
            console.error("Failed to create public Community profile:", error);
            setSaveError(true);
          } finally {
            setIsSaving(false);
          }
        }}
      >
        <div>
          <h3>{copy.community.profileSetupTitle}</h3>
          <p>{copy.community.profileSetupText}</p>
        </div>
        <PersonalityBadge scores={participation.result.scores} compact />
        <label className="field-group">
          <span className="field-label">{copy.community.displayNameLabel}</span>
          <input
            className="field-control"
            value={displayName}
            minLength={2}
            maxLength={40}
            required
            autoComplete="nickname"
            placeholder={copy.community.displayNamePlaceholder}
            onChange={(event) => setDisplayName(event.target.value)}
          />
          <span className="field-hint">{copy.community.displayNameHint}</span>
        </label>
        <label className="community-profile-consent">
          <input
            type="checkbox"
            checked={consent}
            onChange={(event) => setConsent(event.target.checked)}
          />
          <span>{copy.community.profileConsent}</span>
        </label>
        <p className="muted">
          {copy.layout.nav.home === "Start" ? "Bitte beachte die " : "Please review the "}
          <Link href="/community-guidelines">
            {copy.layout.nav.home === "Start" ? "Community-Regeln" : "Community guidelines"}
          </Link>
          {copy.layout.nav.home === "Start" ? " und den " : " and the "}
          <Link href="/privacy">
            {copy.layout.nav.home === "Start" ? "Datenschutz" : "privacy notice"}
          </Link>
          .
        </p>
        {saveError && <p className="text-danger" role="alert">{copy.community.profileSetupError}</p>}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isSaving || displayName.trim().length < 2 || !consent}
        >
          {isSaving ? copy.community.savingProfile : copy.community.saveProfile}
        </button>
      </form>
    );
  }

  return <>{children}</>;
};

export default CommunityParticipationGate;
