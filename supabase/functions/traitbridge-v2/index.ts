import { createAdmin, V2Error } from "./shared/server.ts";
import { executeV2 } from "./shared/endpoint.ts";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });

const handler = async (req: Request) => {
  // Reachable endpoint, but no data access without getUser and beta membership.
  if (req.method === "GET")
    return json({
      status: "ready",
      service: "traitbridge-v2",
      version: "2.0.0-beta.1",
    });
  if (!["POST", "DELETE"].includes(req.method))
    return json({ error: "METHOD_NOT_ALLOWED" }, 405);
  const token = req.headers.get("authorization")?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return json({ error: "AUTH_REQUIRED" }, 401);
  try {
    if (Number(req.headers.get("content-length") || 0) > 16384)
      return json({ error: "INVALID_INPUT" }, 413);
    const raw = await req.text();
    if (new TextEncoder().encode(raw).length > 16384)
      return json({ error: "INVALID_INPUT" }, 413);
    let body: unknown;
    try {
      body = JSON.parse(raw);
    } catch {
      return json({ error: "INVALID_INPUT" }, 400);
    }
    const url = Deno.env.get("SUPABASE_URL");
    const keys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") || "{}");
    const secret = keys.default || Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !secret) throw new V2Error("BETA_UNAVAILABLE", 503);
    const data = await executeV2(
      createAdmin(url, secret),
      req.method,
      token,
      body,
    );
    return json({ data });
  } catch (e) {
    return json(
      { error: e instanceof V2Error ? e.code : "SERVER_ERROR" },
      e instanceof V2Error ? e.status : 500,
    );
  }
};
Deno.serve(
  Deno.env.get("TRAITBRIDGE_LOCAL_QA") === "true"
    ? { hostname: "127.0.0.1", port: 8000 }
    : {},
  handler,
);
