import type { LoginMode } from "./return-path";

export const minimumPasswordLength = 8;
export const magicLinkEnabled =
  process.env.NEXT_PUBLIC_AUTH_MAGIC_LINK_ENABLED !== "false";
export const oauthProviders = (["google", "apple"] as const).filter(
  (provider) =>
    provider === "google"
      ? process.env.NEXT_PUBLIC_AUTH_GOOGLE_ENABLED === "true"
      : process.env.NEXT_PUBLIC_AUTH_APPLE_ENABLED === "true",
);

export function loginMode(value: unknown): LoginMode {
  if (
    value === "signup" ||
    value === "forgot" ||
    (value === "magic" && magicLinkEnabled)
  )
    return value;
  return "signin";
}

export function authErrorText(error: unknown, locale: "de" | "en") {
  const code =
    error && typeof error === "object" && "code" in error
      ? String(error.code)
      : "";
  const copy: Record<string, [string, string]> = {
    email_not_confirmed: [
      "Bestätige zuerst deine E-Mail-Adresse.",
      "Confirm your email address first.",
    ],
    invalid_credentials: [
      "E-Mail oder Passwort stimmen nicht.",
      "Email or password is incorrect.",
    ],
    weak_password: [
      "Wähle ein stärkeres Passwort.",
      "Choose a stronger password.",
    ],
    same_password: [
      "Wähle ein anderes Passwort als bisher.",
      "Choose a different password from your previous one.",
    ],
    captcha_failed: [
      "Die Sicherheitsprüfung ist abgelaufen. Versuche es erneut.",
      "The security check expired. Try again.",
    ],
    over_request_rate_limit: [
      "Zu viele Versuche. Versuche es später erneut.",
      "Too many attempts. Try again later.",
    ],
    over_email_send_rate_limit: [
      "Zu viele E-Mails angefordert. Warte kurz und versuche es erneut.",
      "Too many emails requested. Wait and try again.",
    ],
    otp_expired: [
      "Der Link ist abgelaufen. Fordere einen neuen an.",
      "The link has expired. Request a new one.",
    ],
    flow_state_expired: [
      "Der Link ist abgelaufen. Fordere einen neuen an.",
      "The link has expired. Request a new one.",
    ],
    email_address_not_authorized: [
      "Der E-Mail-Versand ist für diese Adresse noch nicht verfügbar.",
      "Email delivery is not available for this address yet.",
    ],
  };
  const generic = [
    "Die Anmeldung konnte nicht abgeschlossen werden. Versuche es erneut.",
    "Sign-in could not be completed. Try again.",
  ];
  return (copy[code] ?? generic)[locale === "de" ? 0 : 1];
}
