import React, { useEffect, useState } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useLocale } from "../contexts/LocaleContext";
import { DEMO_RESULTS, STORAGE_KEY_FULL } from "../lib/bigfive-results";
import { getTestDraftSummary, type TestDraftSummary } from "../lib/test-draft";
import ShortBigFiveTest from "../components/ShortBigFiveTest";

const TestPage: React.FC = () => {
  const { locale, copy } = useLocale();
  const router = useRouter();
  const [draft, setDraft] = useState<TestDraftSummary | null>(null);
  const [isShortTestOpen, setIsShortTestOpen] = useState(false);
  const showDemo = router.query.demo === "1";
  const requestedReturnTo =
    typeof router.query.returnTo === "string" &&
    router.query.returnTo.startsWith("/") &&
    !router.query.returnTo.startsWith("//")
      ? router.query.returnTo
      : undefined;

  useEffect(() => {
    try {
      setDraft(getTestDraftSummary(window.localStorage));
    } catch {
      setDraft(null);
    }
  }, []);

  useEffect(() => {
    if (router.isReady && router.query.short === "1") {
      setIsShortTestOpen(true);
    }
  }, [router.isReady, router.query.short]);

  const closeShortTest = () => {
    setIsShortTestOpen(false);

    if (router.query.short === "1") {
      const { short: _short, ...remainingQuery } = router.query;
      void router.replace(
        { pathname: router.pathname, query: remainingQuery },
        undefined,
        { shallow: true },
      );
    }
  };

  const loadDemoResults = () => {
    window.localStorage.setItem(
      STORAGE_KEY_FULL,
      JSON.stringify({
        ...DEMO_RESULTS,
        timestamp: new Date().toISOString(),
      }),
    );
    void router.push("/results");
  };

  return (
    <>
      <Head>
        <title>{`${copy.testOverview.title} | TraitBridge`}</title>
        <meta key="og-title" property="og:title" content={`${copy.testOverview.title} | TraitBridge`} />
        <meta key="og-description" property="og:description" content={copy.testOverview.intro} />
        <meta name="description" content={copy.testOverview.intro} />
      </Head>

      <div className="content-shell test-overview">
        <header className="test-overview-hero">
          <div>
            <span className="page-kicker">{copy.testOverview.kicker}</span>
            <h1 className="page-title">{copy.testOverview.title}</h1>
            <p className="page-intro">{copy.testOverview.intro}</p>

            <div className="test-meta-row">
              <div className="test-meta-card">
                <span>{copy.testOverview.metaDurationLabel}</span>
                <strong>{copy.testOverview.metaDurationValue}</strong>
              </div>
              <div className="test-meta-card">
                <span>{copy.testOverview.metaScopeLabel}</span>
                <strong>{copy.testOverview.metaScopeValue}</strong>
              </div>
              <div className="test-meta-card">
                <span>{copy.testOverview.metaOutcomeLabel}</span>
                <strong>{copy.testOverview.metaOutcomeValue}</strong>
              </div>
              <div className="test-meta-card">
                <span>{copy.testOverview.metaStorageLabel}</span>
                <strong>{copy.testOverview.metaStorageValue}</strong>
              </div>
            </div>

            <div className="test-action-row">
              <Link
                href={draft ? `/test/full?lang=${draft.language}` : "/test/full"}
                className="btn btn-primary"
              >
                {draft
                  ? copy.testOverview.continueButton
                  : copy.testOverview.startButton}
              </Link>
              <Link href="/background" className="btn btn-outline">
                {copy.testOverview.backgroundButton}
              </Link>
              <button
                type="button"
                className="btn btn-quiet"
                onClick={() => setIsShortTestOpen(true)}
              >
                {locale === "de" ? "Kurztest · ca. 2 Minuten" : "Quick test · about 2 minutes"}
              </button>
              {showDemo && (
                <button type="button" className="btn btn-quiet" onClick={loadDemoResults}>
                  {copy.testOverview.demoButton}
                </button>
              )}
            </div>
          </div>

          <aside className="test-overview-aside">
            <div className="pill">
              <span className="pill-dot" />
              {copy.testOverview.inventoryPill}
            </div>
            <h2>{copy.testOverview.inventoryTitle}</h2>
            <p>{copy.testOverview.inventorySummary}</p>

            <details className="test-inventory-details">
              <summary>{copy.testOverview.inventoryButton}</summary>
              <div>
                <h3>{copy.testOverview.inventoryPopoverTitle}</h3>
                {copy.testOverview.inventoryParagraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                <a
                  href="https://doi.org/10.1016/j.jrp.2014.05.003"
                  target="_blank"
                  rel="noreferrer"
                  className="text-link"
                >
                  Johnson (2014) ↗
                </a>
              </div>
            </details>
          </aside>
        </header>

        <section className="test-trust-grid">
          <article className="trust-note">
            <strong>{copy.testOverview.storageTitle}</strong>
            <p>{copy.testOverview.storageText}</p>
          </article>
          <article className="trust-note">
            <strong>{copy.testOverview.diagnosisTitle}</strong>
            <p>{copy.testOverview.diagnosisText}</p>
          </article>
        </section>
      </div>

      <ShortBigFiveTest
        open={isShortTestOpen}
        onClose={closeShortTest}
        returnTo={requestedReturnTo}
      />
    </>
  );
};

export default TestPage;
