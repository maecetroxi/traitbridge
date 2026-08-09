import React from "react";
import Head from "next/head";
import Link from "next/link";
import { useLocale } from "../contexts/LocaleContext";

const BackgroundPage: React.FC = () => {
  const { copy } = useLocale();

  return (
    <>
      <Head>
        <title>{copy.background.title} | TraitBridge</title>
        <meta name="description" content={copy.background.intro} />
      </Head>
      <div className="page-card">
      <div className="page-kicker">{copy.background.kicker}</div>
      <h1 className="page-title">{copy.background.title}</h1>
      <p className="page-intro">{copy.background.intro}</p>

      <div className="background-grid">
        {(Object.entries(copy.background.traits) as Array<
          [keyof typeof copy.background.traits, (typeof copy.background.traits)[keyof typeof copy.background.traits]]
        >).map(([traitKey, trait]) => (
          <section key={traitKey} className="card-subtle background-card">
            <div className="pill">
              <span className="pill-dot" />
              {trait.label}
            </div>
            <p className="section-text">{trait.description}</p>
          </section>
        ))}
      </div>

      <section className="card-subtle background-reading">
        <h2 className="section-title">{copy.background.readingTitle}</h2>
        <div className="stack-md">
          {copy.background.readingParagraphs.map((paragraph) => (
            <p key={paragraph} className="section-text">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      <div className="test-action-row background-actions">
        <Link href="/test" className="btn btn-outline">
          {copy.background.backToTest}
        </Link>
        <Link href="/test/full" className="btn btn-primary">
          {copy.background.directToTest}
        </Link>
      </div>
      </div>
    </>
  );
};

export default BackgroundPage;
