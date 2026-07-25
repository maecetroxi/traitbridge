import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLocale } from "../contexts/LocaleContext";
import { DEMO_RESULTS, STORAGE_KEY_FULL } from "../lib/bigfive-results";

const TestPage: React.FC = () => {
  const { copy } = useLocale();
  const router = useRouter();

  const loadDemoResults = () => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY_FULL,
      JSON.stringify({
        ...DEMO_RESULTS,
        timestamp: new Date().toISOString(),
      }),
    );

    router.push("/results");
  };

  return (
    <div className="page-card">
      <div className="page-kicker">{copy.testOverview.kicker}</div>
      <div className="test-hero">
        <div className="test-hero-copy">
          <h1 className="page-title">{copy.testOverview.title}</h1>
          <p className="page-intro">{copy.testOverview.intro}</p>

          <div className="test-meta-row">
            <div className="test-meta-card">
              <span className="test-meta-label">{copy.testOverview.metaDurationLabel}</span>
              <strong>{copy.testOverview.metaDurationValue}</strong>
            </div>
            <div className="test-meta-card">
              <span className="test-meta-label">{copy.testOverview.metaScopeLabel}</span>
              <strong>{copy.testOverview.metaScopeValue}</strong>
            </div>
            <div className="test-meta-card">
              <span className="test-meta-label">{copy.testOverview.metaOutcomeLabel}</span>
              <strong>{copy.testOverview.metaOutcomeValue}</strong>
            </div>
          </div>

          <div className="test-action-row">
            <Link href="/test/full" className="btn btn-primary">
              {copy.testOverview.startButton}
            </Link>
            <button type="button" className="btn btn-outline" onClick={loadDemoResults}>
              {copy.testOverview.demoButton}
            </button>
            <Link href="/background" className="btn btn-outline">
              {copy.testOverview.backgroundButton}
            </Link>
          </div>
        </div>

        <aside className="test-side-card">
          <div className="pill">
            <span className="pill-dot" />
            {copy.testOverview.inventoryPill}
          </div>
          <h2 className="section-title" style={{ marginTop: "1rem" }}>
            {copy.testOverview.inventoryTitle}
          </h2>
          <p className="section-text">{copy.testOverview.inventorySummary}</p>

          <div className="inventory-popover-wrap">
            <button type="button" className="btn btn-outline inventory-popover-trigger">
              {copy.testOverview.inventoryButton}
            </button>
            <div className="inventory-popover-panel">
              <h3 className="inventory-popover-title">{copy.testOverview.inventoryPopoverTitle}</h3>
              {copy.testOverview.inventoryParagraphs.map((paragraph) => (
                <p key={paragraph} className="section-text">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <p className="muted" style={{ marginTop: "1rem" }}>
            {copy.testOverview.demoHint}
          </p>
        </aside>
      </div>
    </div>
  );
};

export default TestPage;
