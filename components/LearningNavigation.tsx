import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { useLocale } from "../contexts/LocaleContext";
import styles from "../styles/LearningNavigation.module.css";

type LearningNavigationProps = {
  children: React.ReactNode;
};

type LearningSection = "overview" | "articles" | "library" | "opposites" | "contribution";

const navigationCopy = {
  en: {
    label: "Learning navigation",
    title: "Learning paths",
    hint: "You are here",
    area: "Learning area",
    items: [
      { id: "overview", href: "/learn", label: "Overview", description: "Choose a starting point" },
      { id: "articles", href: "/learn/articles", label: "Practical guides", description: "Everyday situations" },
      { id: "library", href: "/learn/library", label: "Books & films", description: "Discover perspectives" },
      { id: "opposites", href: "/learn/opposites", label: "Trait bridges", description: "Understand both poles" },
      { id: "contribution", href: "/learn/contribution", label: "Your contribution", description: "Reflect on your profile" },
    ],
  },
  de: {
    label: "Navigation im Lernbereich",
    title: "Lernwege",
    hint: "Du bist hier",
    area: "Lernbereich",
    items: [
      { id: "overview", href: "/learn", label: "Übersicht", description: "Einstieg wählen" },
      { id: "articles", href: "/learn/articles", label: "Praxiswissen", description: "Situationen im Alltag" },
      { id: "library", href: "/learn/library", label: "Bücher & Filme", description: "Perspektiven entdecken" },
      { id: "opposites", href: "/learn/opposites", label: "Gegenpole", description: "Beide Seiten verstehen" },
      { id: "contribution", href: "/learn/contribution", label: "Dein Beitrag", description: "Das eigene Profil reflektieren" },
    ],
  },
} as const;

export default function LearningNavigation({ children }: LearningNavigationProps) {
  const router = useRouter();
  const { locale } = useLocale();
  const copy = navigationCopy[locale];

  const currentSection: LearningSection =
    router.pathname === "/learn"
      ? "overview"
      : router.pathname === "/learn/library"
        ? "library"
        : router.pathname === "/learn/opposites"
          ? "opposites"
          : router.pathname === "/learn/contribution"
            ? "contribution"
            : "articles";
  const currentItem = copy.items.find((item) => item.id === currentSection) ?? copy.items[0];

  const isActive = (href: string) => {
    if (href === "/learn") {
      return router.pathname === "/learn";
    }

    if (href === "/learn/articles") {
      return router.pathname === "/learn/articles" || router.pathname === "/learn/[slug]";
    }

    return router.pathname === href;
  };

  return (
    <div className={styles.shell} data-section={currentSection}>
      <aside className={styles.sidebar}>
        <nav aria-label={copy.label}>
          <header className={styles.heading}>
            <span>{copy.hint}</span>
            <strong>{copy.title}</strong>
          </header>
          <ol className={styles.list}>
            {copy.items.map((item, index) => {
              const active = isActive(item.href);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={styles.link}
                    data-target={item.id}
                    data-active={active ? "true" : "false"}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className={styles.number}>{String(index + 1).padStart(2, "0")}</span>
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </nav>
      </aside>
      <div className={styles.content}>
        <div className={styles.sectionMarker}>
          <span className={styles.sectionIcon} aria-hidden="true">
            <SectionIcon section={currentSection} />
          </span>
          <span className={styles.sectionName}>
            <small>{copy.area}</small>
            <strong>{currentItem.label}</strong>
          </span>
          <span className={styles.sectionPattern} aria-hidden="true" />
        </div>
        {children}
      </div>
    </div>
  );
}

function SectionIcon({ section }: { section: LearningSection }) {
  if (section === "articles") {
    return (
      <svg viewBox="0 0 32 32">
        <path d="M8 7h16M8 13h10M8 19h16M8 25h11" />
        <path d="m21 12 2 2 4-5" />
      </svg>
    );
  }

  if (section === "library") {
    return (
      <svg viewBox="0 0 32 32">
        <path d="M4 7c5-1 9 .3 12 3v16c-3-2.7-7-3.7-12-2.7zM28 7c-5-1-9 .3-12 3v16c3-2.7 7-3.7 12-2.7z" />
      </svg>
    );
  }

  if (section === "opposites") {
    return (
      <svg viewBox="0 0 32 32">
        <path d="M5 11h20m0 0-5-5m5 5-5 5M27 21H7m0 0 5-5m-5 5 5 5" />
      </svg>
    );
  }

  if (section === "contribution") {
    return (
      <svg viewBox="0 0 32 32">
        <circle cx="16" cy="15" r="5" />
        <path d="M16 3v4m0 16v6M4 15h4m16 0h4M7.5 6.5l3 3m11 11 3 3m0-17-3 3m-11 11-3 3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 32 32">
      <circle cx="16" cy="16" r="11" />
      <path d="m20.5 11.5-2.7 6.3-6.3 2.7 2.7-6.3z" />
      <circle cx="16" cy="16" r="1.5" />
    </svg>
  );
}
