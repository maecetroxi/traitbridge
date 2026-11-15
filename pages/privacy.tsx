import Head from "next/head";
import { useLocale } from "../contexts/LocaleContext";

const copy = {
  de: {
    title: "Datenschutz",
    intro: "Diese Hinweise erklären, welche Daten TraitBridge verarbeitet und welche Dienste daran beteiligt sind.",
    updated: "Stand: 26. August 2026",
    sections: [
      {
        title: "Verantwortung und Kontakt",
        body: (
          <p>
            Verantwortlich für die Verarbeitung innerhalb dieser Web-App ist Marcel Troxler, Bonstetten, Zürich,
            Schweiz. Datenschutzanfragen können an <a href="mailto:privacy@traitbridge.com">privacy@traitbridge.com</a>{" "}
            gerichtet werden.
          </p>
        ),
      },
      {
        title: "Lokale Speicherung",
        body: (
          <p>
            Sprache, Testentwürfe und Ergebnisse nicht angemeldeter Personen werden ausschließlich im lokalen
            Browserspeicher gespeichert. Diese Daten verlassen das Gerät erst, wenn eine angemeldete Person ein
            Ergebnis ausdrücklich in ihrem Konto speichert. Browserdaten können jederzeit über die
            Browsereinstellungen gelöscht werden.
          </p>
        ),
      },
      {
        title: "Konto, Testergebnisse und Community",
        body: (
          <p>
            Anmeldung, Sitzungen und Datenbank werden über Supabase in der EU-Region Frankfurt betrieben.
            Gespeichert werden die für das Konto erforderliche E-Mail-Adresse, eigene Testergebnisse und freiwillig
            veröffentlichte Community-Inhalte. Exakte Testergebnisse und E-Mail-Adressen sind nicht öffentlich;
            öffentlich erscheinen nur der gewählte Anzeigename und freiwillig freigegebene OCEAN-Bereiche.
          </p>
        ),
      },
      {
        title: "Schutz vor automatisierten Zugriffen",
        body: (
          <p>
            Das Anmeldeformular verwendet Cloudflare Turnstile, um automatisierte und missbräuchliche Zugriffe zu
            erkennen. Dabei verarbeitet Cloudflare technisch notwendige Verbindungs-, Geräte- und Browserdaten. Die
            von Turnstile ausgestellte Prüfmarke wird an Supabase übermittelt und dort für die Freigabe der
            Anmeldung geprüft.
          </p>
        ),
      },
      {
        title: "Hosting, Protokolle und externe Links",
        body: (
          <p>
            Die Website wird bei Hostinger betrieben. Hosting- und Sicherheitsprotokolle können technisch
            notwendige Angaben wie IP-Adresse, Zeitpunkt, angeforderte URL und Browserkennung enthalten. Externe
            Quellen werden erst aufgerufen, wenn ein entsprechender Link angeklickt wird. TraitBridge verwendet
            keine Analyse-, Werbe- oder Social-Media-Tracker und lädt keine Webfonts von Drittanbietern.
          </p>
        ),
      },
      {
        title: "Aufbewahrung und Rechte",
        body: (
          <p>
            Kontodaten und eigene Inhalte bleiben bis zur Löschung oder einem berechtigten Löschbegehren erhalten,
            soweit keine gesetzlichen Pflichten entgegenstehen. Betroffene Personen können Auskunft, Berichtigung,
            Löschung, Einschränkung, Datenübertragung oder Widerspruch verlangen und sich an die zuständige
            Datenschutzaufsicht wenden.
          </p>
        ),
      },
    ],
  },
  en: {
    title: "Privacy",
    intro: "This notice explains which data TraitBridge processes and which services are involved.",
    updated: "Last updated: 26 August 2026",
    sections: [
      {
        title: "Responsibility and contact",
        body: (
          <p>
            Marcel Troxler, Bonstetten, Zurich, Switzerland, is responsible for processing within this web app.
            Privacy requests can be sent to <a href="mailto:privacy@traitbridge.com">privacy@traitbridge.com</a>.
          </p>
        ),
      },
      {
        title: "Local storage",
        body: (
          <p>
            Language, assessment drafts and signed-out results are stored only in the browser. They leave the device
            only when a signed-in person explicitly saves a result to their account. Browser data can be removed at
            any time through browser settings.
          </p>
        ),
      },
      {
        title: "Account, results and Community",
        body: (
          <p>
            Sign-in, sessions and the database are provided through Supabase in its Frankfurt EU region. TraitBridge
            stores the email address needed for the account, the person’s own results and voluntarily published
            Community content. Exact scores and email addresses are not public; only the selected display name and
            voluntarily shared OCEAN bands are public.
          </p>
        ),
      },
      {
        title: "Protection against automated access",
        body: (
          <p>
            The sign-in form uses Cloudflare Turnstile to detect automated and abusive access. Cloudflare processes
            technically necessary connection, device and browser data for this purpose. The verification token
            issued by Turnstile is sent to Supabase, where it is checked before the sign-in request is accepted.
          </p>
        ),
      },
      {
        title: "Hosting, logs and external links",
        body: (
          <p>
            The website is hosted by Hostinger. Technically necessary hosting and security logs may contain the IP
            address, timestamp, requested URL and browser identifier. External sources are contacted only after a
            person selects the relevant link. TraitBridge uses no analytics, advertising or social-media trackers and
            loads no third-party web fonts.
          </p>
        ),
      },
      {
        title: "Retention and rights",
        body: (
          <p>
            Account data and a person’s own content remain until deletion or a valid deletion request, unless a legal
            duty requires longer retention. Data subjects may request access, correction, deletion, restriction,
            portability or object to processing and may contact the competent data-protection authority.
          </p>
        ),
      },
    ],
  },
} as const;

const PrivacyPage = () => {
  const { locale } = useLocale();
  const content = copy[locale];

  return (
    <>
      <Head>
        <title>{`${content.title} | TraitBridge`}</title>
        <meta key="og-title" property="og:title" content={`${content.title} | TraitBridge`} />
        <meta key="og-description" property="og:description" content={content.intro} />
        <meta name="description" content={content.intro} />
      </Head>
      <article className="page-card content-shell">
        <header>
          <div className="page-kicker">TraitBridge</div>
          <h1 className="page-title">{content.title}</h1>
          <p className="page-intro">{content.intro}</p>
          <p className="muted">{content.updated}</p>
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

export default PrivacyPage;
