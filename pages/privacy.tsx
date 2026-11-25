import Head from "next/head";
import { useLocale } from "../contexts/LocaleContext";

const copy = {
  de: {
    title: "Datenschutz",
    intro:
      "Diese Hinweise erklären, welche Daten TraitBridge verarbeitet und welche Dienste daran beteiligt sind.",
    updated: "Stand: 15. November 2026 · V2 geschlossene Beta",
    sections: [
      {
        title: "V2: private Vermittlung mit deiner Einwilligung",
        body: (
          <p>
            In der geschlossenen Beta speichern wir nach deiner Bestätigung der
            Volljährigkeit und Einwilligung ein Pseudonym, eine reproduzierbare
            Avatar-Konfiguration, dein privates Persönlichkeitsprofil, Sprache
            und freiwillige Themeninteressen und Erfahrungen. Das serverseitige
            Matching nutzt die zum Thema relevanten Dimensionen. Es gibt keine
            wissenschaftlich validierten Kompatibilitätsprozente. Nur
            berechtigte Personen sehen eine vermittelte Frage. In Entdecken
            sehen Beta-Mitglieder ausdrücklich freigegebene Fragen und bewusst
            veröffentlichte Erfahrungsbeiträge mit Pseudonym und Avatar.
            Private Antworten werden dort nie veröffentlicht. Der Fragesteller sieht jede Antwort;
            Antwortende sehen nur ihre eigene Antwort. Moderatoren können
            gemeldete Inhalte prüfen. Keine persönlichen Inhalte werden an
            KI-Dienste gesendet.
          </p>
        ),
      },
      {
        title: "V2: Kontrolle, Entwürfe und Aufbewahrung",
        body: (
          <p>
            Du kannst die Vermittlung unter Ich pausieren, Benachrichtigungen
            deaktivieren, eigene Inhalte unter Nachrichten löschen und dein
            Konto samt Inhalten und Testergebnissen löschen. Angaben zur
            Einwilligung werden mit Versionsstand und Zeitpunkt gespeichert.
            Frage- und Antwortentwürfe liegen im Sitzungsspeicher dieses
            Browser-Tabs; du kannst sie durch Leeren des Feldes oder Schliessen
            des Tabs entfernen. Bereits gelesene Inhalte können nicht
            zurückgeholt werden. Meldungen enthalten den gemeldeten Inhalt und
            den angegebenen Grund, Blockierungen die beteiligten Konten.
            Sicherheitszähler dienen der Begrenzung von Missbrauch. Fragen,
            Antworten und Erfahrungen bleiben bis zur Löschung gespeichert.
            Merkliste und hilfreiche Rückmeldungen sind kontogebunden und
            werden anderen Mitgliedern nicht angezeigt. Die Beta versendet
            keine automatischen Antwort-E-Mails und verwendet keine
            Push-Nachrichten.
          </p>
        ),
      },
      {
        title: "Verantwortung und Kontakt",
        body: (
          <p>
            Verantwortlich für die Verarbeitung innerhalb dieser Web-App ist
            Marcel Troxler, Bonstetten, Zürich, Schweiz. Datenschutzanfragen
            können an{" "}
            <a href="mailto:privacy@traitbridge.com">privacy@traitbridge.com</a>{" "}
            gerichtet werden.
          </p>
        ),
      },
      {
        title: "Lokale Speicherung",
        body: (
          <p>
            Sprache, Testentwürfe und Ergebnisse nicht angemeldeter Personen
            werden ausschließlich im lokalen Browserspeicher gespeichert. Diese
            Daten verlassen das Gerät erst, wenn eine angemeldete Person ein
            Ergebnis ausdrücklich in ihrem Konto speichert. Browserdaten können
            jederzeit über die Browsereinstellungen gelöscht werden.
          </p>
        ),
      },
      {
        title: "Kontodaten und frühere Veröffentlichungen",
        body: (
          <p>
            Anmeldung, Sitzungen und Datenbank werden über Supabase in der
            EU-Region Frankfurt betrieben. Gespeichert werden die für das Konto
            erforderliche E-Mail-Adresse, eigene Testergebnisse und freiwillig
            veröffentlichte Community-Inhalte. Exakte Testergebnisse und
            E-Mail-Adressen sind nicht öffentlich. Früher ausdrücklich
            veröffentlichte Beiträge und grobe Persönlichkeitsbereiche können
            bis zu ihrer Löschung weiterhin im bisherigen Datenbestand liegen.
            Sie werden in der neuen App nicht als private Nachrichten angezeigt.
          </p>
        ),
      },
      {
        title: "Schutz vor automatisierten Zugriffen",
        body: (
          <p>
            Das Anmeldeformular verwendet Cloudflare Turnstile, um
            automatisierte und missbräuchliche Zugriffe zu erkennen. Dabei
            verarbeitet Cloudflare technisch notwendige Verbindungs-, Geräte-
            und Browserdaten. Die von Turnstile ausgestellte Prüfmarke wird an
            Supabase übermittelt und dort für die Freigabe der Anmeldung
            geprüft.
          </p>
        ),
      },
      {
        title: "Hosting, Protokolle und externe Links",
        body: (
          <p>
            Die Website wird bei Hostinger betrieben. Hosting- und
            Sicherheitsprotokolle können technisch notwendige Angaben wie
            IP-Adresse, Zeitpunkt, angeforderte URL und Browserkennung
            enthalten. Externe Quellen werden erst aufgerufen, wenn ein
            entsprechender Link angeklickt wird. TraitBridge verwendet keine
            Analyse-, Werbe- oder Social-Media-Tracker und lädt keine Webfonts
            von Drittanbietern.
          </p>
        ),
      },
      {
        title: "Aufbewahrung und Rechte",
        body: (
          <p>
            Kontodaten und eigene Inhalte bleiben bis zur Löschung oder einem
            berechtigten Löschbegehren erhalten, soweit keine gesetzlichen
            Pflichten entgegenstehen. Betroffene Personen können Auskunft,
            Berichtigung, Löschung, Einschränkung, Datenübertragung oder
            Widerspruch verlangen und sich an die zuständige Datenschutzaufsicht
            wenden.
          </p>
        ),
      },
    ],
  },
  en: {
    title: "Privacy",
    intro:
      "This notice explains which data TraitBridge processes and which services are involved.",
    updated: "Last updated: 15 November 2026 · V2 closed beta",
    sections: [
      {
        title: "V2: private matching with your consent",
        body: (
          <p>
            After you confirm you are at least 18 and consent to matching, the
            closed beta stores your pseudonym, reproducible avatar, private
            personality profile, language and optional interests and
            experiences. Matching runs on the server using traits relevant to
            the question. There are no scientifically validated compatibility
            percentages. Beta members can see explicitly shared questions and
            published experiences in Discover, together with the author's
            pseudonym and avatar. Discover never publishes private replies.
            The person asking can read every reply; each responder sees
            only their own reply. Authorised moderators can inspect reported
            content. Personal content is never sent to AI services. Pause
            matching, disable in-app notifications or delete your account and
            content in Me. Delete your own questions and replies in Messages.
            Drafts stay in this browser tab’s session storage. Reports, blocks
            and abuse counters support safety. Questions, replies and
            experiences remain until deleted. Saved posts and helpful
            reactions are tied to your account and hidden from other members.
            No reply emails or push notifications are sent during
            this beta.
          </p>
        ),
      },
      {
        title: "Responsibility and contact",
        body: (
          <p>
            Marcel Troxler, Bonstetten, Zurich, Switzerland, is responsible for
            processing within this web app. Privacy requests can be sent to{" "}
            <a href="mailto:privacy@traitbridge.com">privacy@traitbridge.com</a>
            .
          </p>
        ),
      },
      {
        title: "Local storage",
        body: (
          <p>
            Language, assessment drafts and signed-out results are stored only
            in the browser. They leave the device only when a signed-in person
            explicitly saves a result to their account. Browser data can be
            removed at any time through browser settings.
          </p>
        ),
      },
      {
        title: "Account data and earlier publications",
        body: (
          <p>
            Sign-in, sessions and the database are provided through Supabase in
            its Frankfurt EU region. TraitBridge stores the email address needed
            for the account, the person’s own results and voluntarily published
            content. Exact scores and email addresses are not public. Previously
            shared public posts and broad personality bands may remain in the
            previous data store until deleted. They are not converted into
            private messages in the current application.
          </p>
        ),
      },
      {
        title: "Protection against automated access",
        body: (
          <p>
            The sign-in form uses Cloudflare Turnstile to detect automated and
            abusive access. Cloudflare processes technically necessary
            connection, device and browser data for this purpose. The
            verification token issued by Turnstile is sent to Supabase, where it
            is checked before the sign-in request is accepted.
          </p>
        ),
      },
      {
        title: "Hosting, logs and external links",
        body: (
          <p>
            The website is hosted by Hostinger. Technically necessary hosting
            and security logs may contain the IP address, timestamp, requested
            URL and browser identifier. External sources are contacted only
            after a person selects the relevant link. TraitBridge uses no
            analytics, advertising or social-media trackers and loads no
            third-party web fonts.
          </p>
        ),
      },
      {
        title: "Retention and rights",
        body: (
          <p>
            Account data and a person’s own content remain until deletion or a
            valid deletion request, unless a legal duty requires longer
            retention. Data subjects may request access, correction, deletion,
            restriction, portability or object to processing and may contact the
            competent data-protection authority.
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
        <meta
          key="og-title"
          property="og:title"
          content={`${content.title} | TraitBridge`}
        />
        <meta
          key="og-description"
          property="og:description"
          content={content.intro}
        />
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
