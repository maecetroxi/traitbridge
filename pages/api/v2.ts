import type { NextApiRequest, NextApiResponse } from "next";
import { V2Error, getAdmin, runAction, rpc } from "../../lib/v2/server";
export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };
// Best-effort pre-auth flood guard. Authoritative per-user limits are in Postgres.
const buckets = new Map<string, { count: number; reset: number }>();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Vary", "Authorization");
  if (req.method !== "POST" && req.method !== "DELETE") {
    res.setHeader("Allow", "POST, DELETE");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }
  const ip = req.socket.remoteAddress || "unknown";
  const now = Date.now();
  if (buckets.size > 2000)
    for (const [key, b] of buckets) if (b.reset <= now) buckets.delete(key);
  if (buckets.size > 4000) return res.status(429).json({ error: "RATE_LIMIT" });
  const b = buckets.get(ip);
  const bucket = b && b.reset > now ? b : { count: 0, reset: now + 60000 };
  buckets.set(ip, bucket);
  if (++bucket.count > 180) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "RATE_LIMIT" });
  }
  try {
    const token = req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
    if (!token) throw new V2Error("AUTH_REQUIRED", 401);
    const admin = getAdmin();
    const {
      data: { user },
      error,
    } = await admin.auth.getUser(token);
    if (error || !user || user.is_anonymous)
      throw new V2Error("AUTH_REQUIRED", 401);
    // The actor is always derived from verified Auth, never from request data.
    if (req.method === "DELETE") {
      if (req.body?.confirmation !== "DELETE")
        throw new V2Error("CONFIRMATION_REQUIRED");
      // First disable beta access: a partially failed deletion stays fail-closed.
      // Auth getUser rejects tokens once the Auth row is deleted.
      // Idempotent even if Auth deletion previously failed after disabling beta.
      await rpc(admin, user.id, "delete_account_prepare");
      const { error: signOutError } = await admin.auth.admin.signOut(
        token,
        "global",
      );
      if (signOutError) throw new V2Error("DELETE_FAILED", 503);
      const { error: deletionError } = await admin.auth.admin.deleteUser(
        user.id,
      );
      if (deletionError) throw new V2Error("DELETE_FAILED", 503);
      return res.status(200).json({ data: { ok: true } });
    }
    const { action, data = {} } = req.body || {};
    if (
      typeof action !== "string" ||
      !data ||
      typeof data !== "object" ||
      Array.isArray(data)
    )
      throw new V2Error("INVALID_INPUT");
    const result = await runAction(admin, user.id, action, data);
    return res.status(200).json({ data: result });
  } catch (error) {
    const known = error instanceof V2Error;
    return res
      .status(known ? error.status : 500)
      .json({ error: known ? error.code : "SERVER_ERROR" });
  }
}
