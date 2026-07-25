import React, { useState } from "react";
import { useLocale } from "../contexts/LocaleContext";
import { localeOptions } from "../lib/i18n";

const LocaleSwitcher: React.FC = () => {
  const { locale, setLocale } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const wrapperClassName = `locale-switcher${isOpen ? " locale-switcher-open" : ""}`;

  return (
    <div
      className={wrapperClassName}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
      onFocus={() => setIsOpen(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsOpen(false);
        }
      }}
    >
      <button
        type="button"
        className="locale-switcher-trigger"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>Sprache</span>
        <span className="locale-switcher-chevron" aria-hidden="true">
          v
        </span>
      </button>

      <div className="locale-switcher-panel" role="menu" aria-label="Language selector">
        {localeOptions.map((option) => {
          const isActive = option.code === locale;
          const className = `locale-switcher-option${isActive ? " locale-switcher-option-active" : ""}`;

          return (
            <button
              key={option.code}
              type="button"
              className={className}
              onClick={() => {
                setLocale(option.code);
                setIsOpen(false);
              }}
              aria-pressed={isActive}
              title={`${option.nativeLabel} / ${option.label}`}
            >
              <span className="locale-switcher-flag" aria-hidden="true">
                {option.flag}
              </span>
              <span>{option.nativeLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default LocaleSwitcher;
