import { useId, useState } from "react";
import { useBridge } from "../../contexts/BridgeContext";
import { useLocale } from "../../contexts/LocaleContext";
import { errorText, v2Request } from "../../lib/v2/client";
import {
  traits,
  type DiscoverBand,
  type DiscoverPersonality as Personality,
  type Trait,
} from "../../lib/v2/types";

const names: Record<"de" | "en", Record<Trait, string>> = {
  de: {
    O: "Offenheit",
    C: "Gewissenhaftigkeit",
    E: "Extraversion",
    A: "Verträglichkeit",
    N: "Emotionale Empfindlichkeit",
  },
  en: {
    O: "Openness",
    C: "Conscientiousness",
    E: "Extraversion",
    A: "Agreeableness",
    N: "Emotional sensitivity",
  },
};
const bands = ["low", "middle", "high"] as const;
const labels: Record<"de" | "en", Record<DiscoverBand, string>> = {
  de: { low: "Tief", middle: "Mittel", high: "Hoch" },
  en: { low: "Low", middle: "Medium", high: "High" },
};

export function DiscoverPersonality({
  personality,
}: {
  personality: Personality;
}) {
  const { locale } = useLocale();
  const de = locale === "de";
  const name = names[locale];
  return (
    <details className="tb-discover-personality">
      <summary>
        <span>Big Five</span>
        {personality.highlights.map((trait) => (
          <span className="tb-trait-chip" key={trait}>
            {de
              ? `${personality.bands[trait] === "high" ? "Hohe" : "Tiefe"} ${trait === "N" ? "emotionale Empfindlichkeit" : name[trait]}`
              : `${labels.en[personality.bands[trait]]} ${name[trait].toLowerCase()}`}
          </span>
        ))}
      </summary>
      <dl>
        {traits.map((trait) => (
          <div key={trait}>
            <dt>{name[trait]}</dt>
            <dd>
              <span className="tb-trait-dots" aria-hidden="true">
                {bands.map((band) => (
                  <i
                    key={band}
                    data-active={band === personality.bands[trait]}
                  />
                ))}
              </span>
              <span>{labels[locale][personality.bands[trait]]}</span>
            </dd>
          </div>
        ))}
      </dl>
      {personality.short_test && (
        <p className="tb-fine">
          {de ? "Kurztest · grobe Einordnung" : "Quick test · rough guide"}
        </p>
      )}
    </details>
  );
}

export function DiscoverPersonalitySetting({
  owner,
  shared,
}: {
  owner: string;
  shared: boolean;
}) {
  const { locale } = useLocale();
  const { refresh } = useBridge();
  const de = locale === "de";
  const hint = useId();
  const [pending, setPending] = useState<boolean | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function save(enabled: boolean) {
    setPending(enabled);
    setError("");
    setMessage("");
    try {
      await v2Request("discover_personality", { enabled }, undefined, owner);
      await refresh();
      setMessage(de ? "Gespeichert." : "Saved.");
    } catch (err) {
      setError(errorText(err, locale));
    } finally {
      setPending(null);
    }
  }

  return (
    <section className="tb-panel">
      <h2>{de ? "Persönlichkeit in Entdecken" : "Personality in Discover"}</h2>
      <label className="tb-checkbox">
        <input
          type="checkbox"
          aria-describedby={hint}
          checked={pending ?? shared}
          disabled={pending !== null}
          onChange={(event) => void save(event.target.checked)}
        />
        <span>
          {de
            ? "Big-Five-Stufen bei meinen Beiträgen zeigen"
            : "Show Big Five bands on my posts"}
        </span>
      </label>
      <p id={hint} className="tb-fine">
        {de
          ? "Beta-Mitglieder sehen grobe Stufen, bei Kurztests mit einem Hinweis, und können danach filtern. Die Freigabe ist widerrufbar. Das private Matching bleibt getrennt."
          : "Beta members can see and filter by broad bands. Quick tests have a note. You can withdraw sharing. Private matching is separate."}
      </p>
      {message && (
        <p role="status" className="tb-fine">
          {message}
        </p>
      )}
      {error && (
        <p role="alert" className="tb-error">
          {error}
        </p>
      )}
    </section>
  );
}
