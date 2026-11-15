import { useLocale } from "../../contexts/LocaleContext";
export default function SensitiveHint({ text }: { text: string }) {
  const { locale } = useLocale();
  const de = locale === "de";
  if (
    !/suizid|selbstmord|self.?harm|umbringen|suicid|verletz|gewalt|abuse|missbrauch|medikament|medication|diagnos/i.test(
      text,
    )
  )
    return null;
  return (
    <aside className="tb-sensitive" role="note">
      <strong>
        {de ? "Du verdienst Unterstützung." : "You deserve support."}
      </strong>
      <p>
        {de
          ? "TraitBridge ist kein medizinischer oder therapeutischer Dienst und bietet keine Hilfe in Echtzeit. Bei akuter Gefahr wende dich an den örtlichen Notruf oder eine vertraute Person vor Ort. Warte in einer Krise nicht auf eine Community-Antwort. Teile keine identifizierenden Gesundheitsdaten."
          : "TraitBridge is not a medical or therapeutic service and does not provide immediate help. If there is immediate danger, contact your local emergency service or someone you trust nearby. Do not wait for a community reply in a crisis. Avoid sharing identifying health information."}
      </p>
    </aside>
  );
}
