import Link from "next/link";
import { useEffect, useState } from "react";
import { useLocale } from "../../contexts/LocaleContext";
import { v2Request } from "../../lib/v2/client";

export function ModerationLink({ owner }: { owner: string }) {
  const { locale } = useLocale();
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function load() {
      try {
        const result = await v2Request<{ open_count: number }>(
          "moderation_status",
          {},
          controller.signal,
          owner,
        );
        if (active) setCount(result.open_count);
      } catch {
        if (active) setCount(null);
      }
    }
    void load();
    const refresh = () => {
      if (document.visibilityState === "visible") void load();
    };
    const timer = window.setInterval(refresh, 60_000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      controller.abort();
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [owner]);
  return (
    <Link className="tb-panel tb-moderation-link" href="/moderation">
      <strong>Moderation</strong>
      {count !== null && (
        <span>{locale === "de" ? `${count} offen` : `${count} open`}</span>
      )}
    </Link>
  );
}
