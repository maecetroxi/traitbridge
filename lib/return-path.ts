export const sanitizeReturnPath = (value: unknown, fallback = "/") => {
  if (typeof value !== "string" || value.length > 512) return fallback;
  const path = value.split(/[?#]/, 1)[0];
  if (
    !path.startsWith("/") ||
    path.startsWith("//") ||
    /[\\%\s\u0000-\u001f\u007f]/.test(path) ||
    path.split("/").some((part) => part === "." || part === "..") ||
    /[\u0000-\u001f\u007f]/.test(value) ||
    /^\/login(?:\/|$)/i.test(path)
  )
    return fallback;
  return value;
};

export type LoginMode = "signin" | "signup" | "forgot" | "magic";
export const buildLoginPath = (returnTo: string, mode: LoginMode = "signin") =>
  `/login?returnTo=${encodeURIComponent(sanitizeReturnPath(returnTo))}${mode === "signin" ? "" : `&mode=${mode}`}`;

export const participationPaths = {
  ask: "/?action=ask",
  help: "/?action=help",
  publish: "/discover?write=1",
} as const;
export const buildOnboardingPath = (returnTo: string) =>
  `/onboarding?returnTo=${encodeURIComponent(sanitizeReturnPath(returnTo))}`;

export function authCallbackUrl(
  origin: string,
  recovery: boolean,
  returnTo: string,
  assessmentTransfer?: string | null,
) {
  const url = new URL(recovery ? "/login/reset" : "/login/confirm", origin);
  url.searchParams.set("returnTo", sanitizeReturnPath(returnTo));
  if (!recovery && assessmentTransfer)
    url.searchParams.set("test", assessmentTransfer);
  return url.toString();
}

export function afterSignIn(
  returnTo: unknown,
  hasProfile: boolean,
  betaReady: boolean,
) {
  const path = sanitizeReturnPath(returnTo);
  if (!Object.values(participationPaths).some((intent) => intent === path))
    return path;
  return hasProfile && betaReady ? path : buildOnboardingPath(path);
}

export const getAuthCallbackErrorCode = (hash: string) => {
  if (!hash.startsWith("#")) {
    return null;
  }

  const params = new URLSearchParams(hash.slice(1));
  return params.get("error_code") ?? (params.has("error") ? "unknown" : null);
};
