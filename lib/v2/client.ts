import { supabase } from "../supabase";
export async function v2Request<T>(
  action: string,
  data: Record<string, unknown> = {},
  signal?: AbortSignal,
  expectedUserId?: string,
): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (
    !session ||
    session.user.is_anonymous ||
    (session.expires_at ?? 0) * 1000 <= Date.now() ||
    (expectedUserId && session.user.id !== expectedUserId)
  )
    throw new Error("AUTH_REQUIRED");
  const response = await fetch("/api/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ action, data }),
    cache: "no-store",
    signal,
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "SERVER_ERROR");
  return result.data as T;
}
export function errorText(error: unknown, locale: "de" | "en") {
  const code = error instanceof Error ? error.message : "";
  const messages: Record<string, [string, string]> = {
    AUTH_REQUIRED: ["Bitte melde dich an.", "Please sign in."],
    BETA_REQUIRED: [
      "Dein Konto ist noch nicht für die geschlossene Beta freigeschaltet.",
      "Your account has not been invited to the closed beta yet.",
    ],
    BETA_UNAVAILABLE: [
      "Die geschlossene Beta ist noch nicht eingerichtet. Du kannst dich bereits umsehen und den Test ausprobieren.",
      "The closed beta is not configured yet. You can explore and try the test.",
    ],
    RATE_LIMIT: [
      "Limit erreicht. Bitte versuche es später erneut.",
      "Please take a break and try again later.",
    ],
    DUPLICATE_POST: [
      "Diesen Text hast du in den letzten 24 Stunden bereits veröffentlicht.",
      "You shared this text in the last 24 hours.",
    ],
    DISCOVER_TEST_REQUIRED: [
      "Für die Freigabe brauchst du ein gültiges Big-Five-Ergebnis.",
      "You need a valid Big Five result to share your traits.",
    ],
    SPAM: ["Kürze die Linkliste und prüfe deinen Text.", "Reduce the number of links and check your text."],
    NOT_FOUND: ["Dieser Inhalt ist nicht mehr verfügbar.", "This content is no longer available."],
    FORBIDDEN: ["Für diese Aktion fehlt dir die Berechtigung.", "You don’t have permission for this action."],
    NO_SLOT: [
      "Für diese Frage sind gerade alle Antwortplätze belegt. Dein Entwurf bleibt erhalten.",
      "All reply slots are occupied. Your draft is kept.",
    ],
    RESERVATION_EXPIRED: [
      "Dein Antwortplatz ist abgelaufen. Reserviere ihn erneut; dein Entwurf bleibt erhalten.",
      "Your reservation expired. Reserve again; your draft is kept.",
    ],
    NOT_AVAILABLE: [
      "Diese Frage kann gerade nicht beantwortet werden. Dein Entwurf bleibt erhalten.",
      "This question is no longer available. Your draft is kept.",
    ],
    FULL_TEST_REQUIRED: [
      "Es wurde noch kein vollständiges Testergebnis in deinem Konto gefunden.",
      "No full test result was found in your account yet.",
    ],
    ASSESSMENT_NOT_FOUND: [
      "Das ausgewählte Testergebnis ist nicht mehr verfügbar. Wähle ein anderes Ergebnis oder starte den Kurztest.",
      "The selected result is unavailable. Choose another result or take the quick test.",
    ],
    ASSESSMENT_UNAVAILABLE: [
      "Gespeicherte Testergebnisse konnten nicht geladen werden.",
      "Saved test results could not be loaded.",
    ],
    CONSENT_REQUIRED: [
      "Bitte bestätige Volljährigkeit und die private Vermittlung.",
      "Please confirm your age and private matching consent.",
    ],
  };
  return (
    messages[code]?.[locale === "de" ? 0 : 1] ||
    (locale === "de"
      ? "Das hat leider nicht geklappt. Deine Eingabe bleibt erhalten. Bitte versuche es erneut."
      : "That did not work. Your input is kept. Please try again.")
  );
}
