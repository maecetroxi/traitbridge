import React from "react";
import { useLocale } from "../contexts/LocaleContext";
import { localeOptions, Locale } from "../lib/i18n";

type LanguageSelectorProps = {
  onSelect: (languageCode: Locale) => void;
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect }) => {
  const { copy } = useLocale();

  return (
    <div className="page-card">
      <div className="page-kicker">{copy.testSelector.kicker}</div>
      <h1 className="page-title">{copy.testSelector.title}</h1>
      <p className="page-intro">{copy.testSelector.description}</p>
      <p className="section-text" style={{ marginTop: "0.75rem" }}>
        {copy.testSelector.helper}
      </p>

      <div style={{ marginTop: "2rem", display: "grid", gap: "0.875rem" }}>
        {localeOptions.map((language) => (
          <button
            key={language.code}
            type="button"
            onClick={() => onSelect(language.code)}
            className="btn btn-outline"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "1rem 1.25rem",
              textAlign: "left",
              width: "100%",
              justifyContent: "flex-start",
              borderRadius: "1rem",
            }}
          >
            <span style={{ fontSize: "1.5rem", lineHeight: 1 }} aria-hidden="true">
              {language.flag}
            </span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text)" }}>
                {language.nativeLabel}
              </div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-soft)", marginTop: "0.125rem" }}>
                {language.label}
              </div>
            </div>
            <span style={{ fontSize: "1.25rem", color: "var(--text-muted)" }} aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
