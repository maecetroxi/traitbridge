import Head from "next/head";
import { useLocale } from "../contexts/LocaleContext";

const copy = {
  de: {
    title: "Impressum",
    description: "Anbieter- und Kontaktangaben für TraitBridge.",
    sections: [
      {
        title: "Verantwortlich für TraitBridge",
        body: (
          <address>
            Marcel Troxler
            <br />
            Bonstetten, Zürich
            <br />
            Schweiz
          </address>
        ),
      },
      {
        title: "Kontakt",
        body: (
          <>
            <p>
              E-Mail: <a href="mailto:privacy@traitbridge.com">privacy@traitbridge.com</a>
            </p>
            <p>
              TraitBridge wird derzeit von Marcel Troxler als Privatperson betrieben. Es bestehen keine Firmen-,
              Handelsregister- oder Mehrwertsteuerangaben.
            </p>
          </>
        ),
      },
      {
        title: "Inhaltliche Einordnung",
        body: (
          <p>
            TraitBridge bietet Informationen und Werkzeuge zur persönlichen Reflexion. Die Inhalte und Ergebnisse
            stellen keine medizinische, psychologische, therapeutische, rechtliche oder sonstige professionelle
            Beratung dar und ersetzen keine individuelle Abklärung durch qualifizierte Fachpersonen.
          </p>
        ),
      },
      {
        title: "Externe Links",
        body: (
          <p>
            Verlinkte externe Angebote werden von ihren jeweiligen Betreibern verantwortet. TraitBridge prüft Links
            bei ihrer Aufnahme, hat jedoch keinen Einfluss auf spätere Änderungen externer Inhalte.
          </p>
        ),
      },
      {
        title: "Urheberrecht",
        body: (
          <p>
            Eigene Inhalte und Gestaltungen auf TraitBridge dürfen nur im Rahmen des anwendbaren Rechts oder mit
            vorheriger Zustimmung verwendet werden. Rechte an gekennzeichneten Inhalten Dritter verbleiben bei den
            jeweiligen Rechteinhabern.
          </p>
        ),
      },
    ],
  },
  en: {
    title: "Legal notice",
    description: "Provider and contact information for TraitBridge.",
    sections: [
      {
        title: "Responsible for TraitBridge",
        body: (
          <address>
            Marcel Troxler
            <br />
            Bonstetten, Zurich
            <br />
            Switzerland
          </address>
        ),
      },
      {
        title: "Contact",
        body: (
          <>
            <p>
              Email: <a href="mailto:privacy@traitbridge.com">privacy@traitbridge.com</a>
            </p>
            <p>
              TraitBridge is currently operated by Marcel Troxler as a private individual. There are no company,
              commercial-register or VAT details.
            </p>
          </>
        ),
      },
      {
        title: "Nature of the content",
        body: (
          <p>
            TraitBridge provides information and tools for personal reflection. Its content and results are not
            medical, psychological, therapeutic, legal or other professional advice and do not replace an individual
            assessment by a qualified professional.
          </p>
        ),
      },
      {
        title: "External links",
        body: (
          <p>
            Linked external services are the responsibility of their respective operators. TraitBridge checks links
            when they are added but has no control over subsequent changes to external content.
          </p>
        ),
      },
      {
        title: "Copyright",
        body: (
          <p>
            Original TraitBridge content and design may be used only as permitted by applicable law or with prior
            permission. Rights in identified third-party material remain with their respective owners.
          </p>
        ),
      },
    ],
  },
} as const;

const ImprintPage = () => {
  const { locale } = useLocale();
  const content = copy[locale];

  return (
    <>
      <Head>
        <title>{`${content.title} | TraitBridge`}</title>
        <meta name="description" content={content.description} />
      </Head>
      <article className="page-card content-shell">
        <header>
          <div className="page-kicker">TraitBridge</div>
          <h1 className="page-title">{content.title}</h1>
          <p className="page-intro">{content.description}</p>
        </header>
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            {section.body}
          </section>
        ))}
      </article>
    </>
  );
};

export default ImprintPage;
