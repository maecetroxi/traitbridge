import { createAdmin, V2Error } from "./server";
import { executeV2 } from "./endpoint";

export async function dispatchV2(
  method: string,
  token: string | undefined,
  body: unknown,
  request: typeof fetch = fetch,
) {
  if (!token) throw new V2Error("AUTH_REQUIRED", 401);
  if (process.env.TRAITBRIDGE_V2_ENABLED !== "true")
    throw new V2Error("BETA_UNAVAILABLE", 503);
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) throw new V2Error("BETA_UNAVAILABLE", 503);
  // A configured Edge gateway keeps the privileged key inside Supabase.
  const edge = process.env.SUPABASE_V2_FUNCTION_URL;
  if (edge) {
    const endpoint = new URL(edge);
    const project = new URL(url);
    if (
      endpoint.origin !== project.origin ||
      endpoint.pathname !== "/functions/v1/traitbridge-v2"
    )
      throw new V2Error("BETA_UNAVAILABLE", 503);
    const publicKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
    if (!publicKey) throw new V2Error("BETA_UNAVAILABLE", 503);
    let response: Response;
    try {
      response = await request(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          apikey: publicKey,
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(20000),
      });
    } catch {
      throw new V2Error("BETA_UNAVAILABLE", 503);
    }
    let result: { data?: unknown; error?: string };
    try {
      result = await response.json();
    } catch {
      throw new V2Error("SERVER_ERROR", 502);
    }
    if (!response.ok)
      throw new V2Error(result.error || "SERVER_ERROR", response.status);
    return result.data;
  }
  // Direct service mode remains useful for the disposable local QA server.
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new V2Error("BETA_UNAVAILABLE", 503);
  return executeV2(createAdmin(url, key), method, token, body);
}
