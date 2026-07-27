import React, { useState } from "react";
import { useLocale } from "../contexts/LocaleContext";
import { localeOptions } from "../lib/i18n";

const LocaleSwitcher: React.FC = () => {
  const { locale, setLocale, copy } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const panelId = "locale-switcher-panel";

  return (
    <div
      className={`locale-switcher${isOpen ? " locale-switcher-open" : ""}`}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="locale-switcher-trigger"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={() => setIsOpen((currentValue) => !currentValue)}
      >
        <span className="locale-switcher-full-label">{copy.layout.languageLabel}</span>
        <span className="locale-switcher-code">{locale.toUpperCase()}</span>
        <span className="locale-switcher-chevron" aria-hidden="true">
          ▾
        </span>
      </button>

      {isOpen && (
        <div
          id={panelId}
          className="locale-switcher-panel"
          role="group"
          aria-label={copy.layout.languageLabel}
        >
          {localeOptions.map((option) => {
            const isActive = option.code === locale;

            return (
              <button
                key={option.code}
                type="button"
                className={`locale-switcher-option${isActive ? " locale-switcher-option-active" : ""}`}
                onClick={() => {
                  setLocale(option.code);
                  setIsOpen(false);
                }}
                aria-pressed={isActive}
                lang={option.code}
              >
                <span>{option.nativeLabel}</span>
                <span aria-hidden="true">{isActive ? "✓" : ""}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LocaleSwitcher;
