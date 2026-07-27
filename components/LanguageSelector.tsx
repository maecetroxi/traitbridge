import React from "react";
import { useLocale } from "../contexts/LocaleContext";
import { localeOptions, type Locale } from "../lib/i18n";

type LanguageSelectorProps = {
  onSelect: (languageCode: Locale) => void;
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect }) => {
  const { copy } = useLocale();

  return (
    <div className="surface language-selector">
      <div className="page-kicker">{copy.testSelector.kicker}</div>
      <h1 className="page-title">{copy.testSelector.title}</h1>
      <p className="page-intro">{copy.testSelector.description}</p>
      <p className="section-text language-selector-helper">
        {copy.testSelector.helper}
      </p>

      <div className="language-selector-options">
        {localeOptions.map((language) => (
          <button
            key={language.code}
            type="button"
            onClick={() => onSelect(language.code)}
            className="btn btn-outline language-selector-option"
          >
            <span className="language-selector-flag" aria-hidden="true">
              {language.flag}
            </span>
            <span className="language-selector-copy">
              <strong>{language.nativeLabel}</strong>
              <small>{language.label}</small>
            </span>
            <span className="language-selector-arrow" aria-hidden="true">
              →
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;
