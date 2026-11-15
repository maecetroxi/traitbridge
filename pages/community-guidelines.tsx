import Head from "next/head";
import { useLocale } from "../contexts/LocaleContext";

const copy = {
  de: {
    title: "Community-Regeln",
    description:
      "Regeln für respektvolle und sichere Beiträge in der TraitBridge-Community.",
    intro:
      "Die Community dient dem Austausch persönlicher Erfahrungen und Perspektiven. Sie ersetzt keine professionelle Beratung.",
    sections: [
      {
        title: "V2: persönlich und freiwillig, ab 18",
        text: "V2 startet als geschlossene Beta für Erwachsene. Eine Frage sehen nur berechtigte vermittelte Personen, bis du ausdrücklich Entdecken erlaubst. Entdecken zeigt in der Beta nur die Frage, niemals die privaten Antworten. Dein Pseudonym und Avatar sind für diese Personen sichtbar, deine genauen Persönlichkeitswerte nicht. Veröffentliche keine Namen, E-Mail-Adressen oder andere identifizierenden Angaben. Bestehende öffentliche V1-Beiträge bleiben als solche getrennt erhalten.",
      },
      {
        title: "Respektvoll beitragen",
        text: "Beschreibe eigene Erfahrungen als Perspektive, nicht als Tatsache über andere. Keine Beleidigungen, Diskriminierung, Drohungen, Diagnosen, gefährlichen Behandlungsanweisungen, Gewaltverherrlichung, Werbung, Täuschung oder rechtswidrigen Inhalte. Veröffentliche nur Inhalte, zu deren Weitergabe du berechtigt bist. Antworten müssen von Menschen kommen; gib keine KI-generierten Ratschläge als eigene Erfahrung aus.",
      },
      {
        title: "Moderation und Meldungen",
        text: "Nutze Melden / blockieren an einer V2-Frage oder Antwort. Meldungen werden gespeichert und können durch freigeschaltete Moderationspersonen geprüft werden. Blockierungen verhindern weitere Vermittlung und den gegenseitigen Zugriff in V2. Inhalte können gesperrt und Beta-Konten deaktiviert werden. Die Moderation ist nicht rund um die Uhr besetzt. V1-Inhalte oder sonstige Anliegen kannst du mit Link und Grund an privacy@traitbridge.com melden.",
      },
      {
        title: "Eigene Inhalte und Daten",
        text: "Eigene V2-Fragen und Antworten lassen sich unter Nachrichten löschen. Unter Ich kannst du die Vermittlung pausieren und dein Konto mit Inhalten und Ergebnissen löschen. Für weitere Anfragen nutze privacy@traitbridge.com. Bei akuter Gefahr wende dich an den örtlichen Notruf oder unmittelbare Hilfe vor Ort. TraitBridge ist kein medizinischer oder therapeutischer Dienst; warte in Krisen nicht auf eine Antwort.",
      },
    ],
  },
  en: {
    title: "Community guidelines",
    description:
      "Rules for respectful and safe participation in the TraitBridge Community.",
    intro:
      "The Community is for sharing personal experiences and perspectives. It is not a substitute for professional advice.",
    sections: [
      {
        title: "V2: personal, voluntary, adults only",
        text: "V2 starts as an invite-only beta for adults 18+. Only authorised matched people can see a question unless you explicitly allow Discover. During the beta, Discover shows questions, never private replies. These people see your pseudonym and avatar, not your exact personality scores. Do not share identifying details. Existing public V1 content stays separate.",
      },
      {
        title: "Contribute respectfully",
        text: "Share personal experiences as perspectives. No insults, discrimination, threats, diagnoses, dangerous treatment instructions, promotion of violence, advertising, deception or unlawful material. Share only content you are entitled to publish. Replies must come from people; do not present AI-generated advice as personal experience.",
      },
      {
        title: "Moderation and reports",
        text: "Use Report / block on a V2 question or reply. Reports are saved for authorised moderators. Blocking prevents further matching and mutual V2 access. Moderators can hide content or disable beta accounts. Moderation is not staffed around the clock. Report V1 content or other concerns to privacy@traitbridge.com with a link and reason.",
      },
      {
        title: "Your content and data",
        text: "Delete your V2 questions and replies in Messages. Pause matching or delete your account with content and results in Me. Contact privacy@traitbridge.com for further requests. In immediate danger, contact your local emergency service or immediate help nearby. TraitBridge is not a medical or therapeutic service; do not wait for a community reply during a crisis.",
      },
    ],
  },
} as const;

const CommunityGuidelinesPage = () => {
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
          content={content.description}
        />
        <meta name="description" content={content.description} />
      </Head>
      <article className="page-card content-shell">
        <header>
          <div className="page-kicker">TraitBridge</div>
          <h1 className="page-title">{content.title}</h1>
          <p className="page-intro">{content.intro}</p>
        </header>
        {content.sections.map((section) => (
          <section key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.text}</p>
          </section>
        ))}
      </article>
    </>
  );
};

export default CommunityGuidelinesPage;
