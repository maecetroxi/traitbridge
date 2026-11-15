import type { NextApiRequest, NextApiResponse } from "next";
import { V2Error } from "../../lib/v2/server";
import { dispatchV2 } from "../../lib/v2/transport";
export const config = { api: { bodyParser: { sizeLimit: "16kb" } } };
const buckets = new Map<string, { count: number; reset: number }>();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  res.setHeader("Cache-Control", "private, no-store, max-age=0");
  res.setHeader("Vary", "Authorization");
  if (!["POST", "DELETE"].includes(req.method || "")) {
    res.setHeader("Allow", "POST, DELETE");
    return res.status(405).json({ error: "METHOD_NOT_ALLOWED" });
  }
  const ip = req.socket.remoteAddress || "unknown",
    now = Date.now();
  if (buckets.size > 2000)
    for (const [key, b] of buckets) if (b.reset <= now) buckets.delete(key);
  if (buckets.size > 4000) return res.status(429).json({ error: "RATE_LIMIT" });
  const old = buckets.get(ip),
    bucket = old && old.reset > now ? old : { count: 0, reset: now + 60000 };
  buckets.set(ip, bucket);
  if (++bucket.count > 180) {
    res.setHeader("Retry-After", "60");
    return res.status(429).json({ error: "RATE_LIMIT" });
  }
  try {
    const token = req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
    const data = await dispatchV2(req.method!, token, req.body);
    return res.status(200).json({ data });
  } catch (e) {
    return res
      .status(e instanceof V2Error ? e.status : 500)
      .json({ error: e instanceof V2Error ? e.code : "SERVER_ERROR" });
  }
}
