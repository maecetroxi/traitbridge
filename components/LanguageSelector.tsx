import React, { useState, useEffect } from "react";
import Link from "next/link";

export type Language = {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
};

export const availableLanguages: Language[] = [
  { code: "de", name: "German", nativeName: "Deutsch", flag: "🇩🇪" },
  { code: "en", name: "English", nativeName: "English", flag: "🇬🇧" },
  { code: "es", name: "Spanish", nativeName: "Español", flag: "🇪🇸" },
  { code: "fr", name: "French", nativeName: "Français", flag: "🇫🇷" },
  { code: "it", name: "Italian", nativeName: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Portuguese", nativeName: "Português", flag: "🇵🇹" },
  { code: "nl", name: "Dutch", nativeName: "Nederlands", flag: "🇳🇱" },
  { code: "pl", name: "Polish", nativeName: "Polski", flag: "🇵🇱" },
  { code: "ru", name: "Russian", nativeName: "Русский", flag: "🇷🇺" },
  { code: "zh", name: "Chinese", nativeName: "中文", flag: "🇨🇳" }
];

type LanguageSelectorTranslations = {
  step1: string;
  selectLanguage: string;
  selectLanguageDescription: string;
};

const defaultTranslations: LanguageSelectorTranslations = {
  step1: "Schritt 1",
  selectLanguage: "Sprache wählen",
  selectLanguageDescription: "Wähle die Sprache, in der du den Big-Five-Test durchführen möchtest."
};

type LanguageSelectorProps = {
  onSelect: (languageCode: string) => void;
  language?: string;
};

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onSelect, language = "de" }) => {
  const [translations, setTranslations] = useState<LanguageSelectorTranslations>(defaultTranslations);

  useEffect(() => {
    fetch("/data/translations.json")
      .then(res => res.json())
      .then(data => {
        if (data[language]) {
          setTranslations({
            step1: data[language].step1,
            selectLanguage: data[language].selectLanguage,
            selectLanguageDescription: data[language].selectLanguageDescription
          });
        }
      })
      .catch(err => {
        console.error("Fehler beim Laden der Übersetzungen:", err);
      });
  }, [language]);

  return (
    <div className="page-card">
      <div className="page-kicker">{translations.step1}</div>
      <h1 className="page-title">{translations.selectLanguage}</h1>
      <p className="page-intro">
        {translations.selectLanguageDescription}
      </p>

      <div style={{ marginTop: "2rem", display: "grid", gap: "0.875rem" }}>
        {availableLanguages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => onSelect(lang.code)}
            className="btn btn-outline"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              padding: "1rem 1.25rem",
              textAlign: "left",
              width: "100%",
              justifyContent: "flex-start",
              borderRadius: "1rem"
            }}
          >
            <span style={{ fontSize: "1.75rem", lineHeight: 1 }}>{lang.flag}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: "0.9375rem", color: "var(--text)" }}>{lang.nativeName}</div>
              <div style={{ fontSize: "0.8125rem", color: "var(--text-soft)", marginTop: "0.125rem" }}>{lang.name}</div>
            </div>
            <span style={{ fontSize: "1.25rem", color: "var(--text-muted)" }}>→</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;





