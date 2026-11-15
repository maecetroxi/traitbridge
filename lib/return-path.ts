export const sanitizeReturnPath = (value: unknown, fallback = "/") => {
  if (
    typeof value === "string" &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\") &&
    !/[\u0000-\u001F\u007F]/.test(value)
  ) {
    return value;
  }

  return fallback;
};

export const buildLoginPath = (returnTo: string) =>
  `/login?returnTo=${encodeURIComponent(sanitizeReturnPath(returnTo))}`;

export const AUTH_RETURN_PATH_KEY = "traitbridge.auth.returnTo";

export const getAuthCallbackErrorCode = (hash: string) => {
  if (!hash.startsWith("#")) {
    return null;
  }

  const params = new URLSearchParams(hash.slice(1));
  return params.get("error_code") ?? (params.has("error") ? "unknown" : null);
};
