import Head from "next/head";
import { useLocale } from "../contexts/LocaleContext";

const copy = {
  de: {
    title: "Community-Regeln",
    description: "Regeln für respektvolle und sichere Beiträge in der TraitBridge-Community.",
    intro:
      "Die Community dient dem Austausch persönlicher Erfahrungen und Perspektiven. Sie ersetzt keine professionelle Beratung.",
    sections: [
      {
        title: "Öffentlich und freiwillig",
        text: "Beiträge, Antworten, der gewählte Anzeigename und die fünf OCEAN-Stufen sind öffentlich im Internet sichtbar. Veröffentliche keine Namen, E-Mail-Adressen, Gesundheitsdaten oder andere Angaben, die dich oder Dritte identifizieren. Exakte Testergebnisse und die Konto-E-Mail werden nicht öffentlich angezeigt.",
      },
      {
        title: "Respektvoll beitragen",
        text: "Beschreibe eigene Erfahrungen als Perspektive, nicht als Tatsache über andere. Keine Beleidigungen, Diskriminierung, Drohungen, Diagnosen, Werbung, Täuschung oder rechtswidrigen Inhalte. Veröffentliche nur Inhalte, zu deren Weitergabe du berechtigt bist.",
      },
      {
        title: "Moderation und Meldungen",
        text: "TraitBridge kann Inhalte entfernen oder Konten einschränken, wenn diese Regeln oder geltendes Recht verletzt werden. Rechtswidrige, gefährdende oder personenbezogene Inhalte können unter privacy@traitbridge.com gemeldet werden. Bitte nenne den Link zum Beitrag und den Grund der Meldung.",
      },
      {
        title: "Eigene Inhalte und Daten",
        text: "Eigene Beiträge können auf Anfrage entfernt werden. Auskunfts-, Berichtigungs- und Löschanfragen können ebenfalls an privacy@traitbridge.com gerichtet werden. Weitere Informationen stehen in der Datenschutzerklärung.",
      },
    ],
  },
  en: {
    title: "Community guidelines",
    description: "Rules for respectful and safe participation in the TraitBridge Community.",
    intro:
      "The Community is for sharing personal experiences and perspectives. It is not a substitute for professional advice.",
    sections: [
      {
        title: "Public and voluntary",
        text: "Posts, replies, the chosen display name and five OCEAN bands are publicly visible on the internet. Do not publish names, email addresses, health data or other details that identify you or another person. Exact results and the account email are not shown publicly.",
      },
      {
        title: "Contribute respectfully",
        text: "Describe personal experience as a perspective, not as a fact about someone else. Do not post insults, discrimination, threats, diagnoses, advertising, deception or unlawful material. Share only content you are entitled to publish.",
      },
      {
        title: "Moderation and reports",
        text: "TraitBridge may remove content or restrict accounts when these guidelines or applicable law are violated. Unlawful, harmful or personal content can be reported to privacy@traitbridge.com. Include the post link and the reason for the report.",
      },
      {
        title: "Your content and data",
        text: "Your own contributions can be removed on request. Access, correction and deletion requests can also be sent to privacy@traitbridge.com. See the privacy notice for more information.",
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
        <meta key="og-title" property="og:title" content={`${content.title} | TraitBridge`} />
        <meta key="og-description" property="og:description" content={content.description} />
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
