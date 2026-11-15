/** Local QA only. This file is never imported by the application or deployed.
 * Run with `npx tsx scripts/qa-server.ts`; all records live in memory.
 */
import { createServer } from "node:http";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { generateAvatar } from "../lib/v2/avatar";
const db = new PGlite();
export const qaIds = [
  "10000000-0000-4000-8000-000000000001",
  "10000000-0000-4000-8000-000000000002",
  "10000000-0000-4000-8000-000000000003",
];
const users = qaIds.map((id, i) => ({
  id,
  email: `qa-${i + 1}@example.invalid`,
  aud: "authenticated",
  role: "authenticated",
  is_anonymous: false,
  app_metadata: { provider: "email" },
  user_metadata: {},
  created_at: "2026-11-15T09:00:00Z",
}));
const token = (id: string) =>
  [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(
      JSON.stringify({
        sub: id,
        exp: 4102444800,
        role: "authenticated",
        is_anonymous: false,
      }),
    ).toString("base64url"),
    "local-qa-only",
  ].join(".");
const call = async (
  id: string,
  action: string,
  data: Record<string, unknown> = {},
) =>
  (
    await db.query<{ value: unknown }>(
      "select public.tb_v2($1::uuid,$2::text,$3::jsonb) as value",
      [id, action, JSON.stringify(data)],
    )
  ).rows[0].value;
async function start() {
  await db.exec(
    "create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,is_anonymous boolean not null default false);grant usage on schema auth to service_role;",
  );
  await db.exec(
    readFileSync(
      "supabase/migrations/20261115091445_traitbridge_v2_private_beta.sql",
      "utf8",
    ),
  );
  for (const user of users) {
    await db.query("insert into auth.users(id) values($1)", [user.id]);
    await db.query(
      "insert into tb_private.beta_members(user_id,moderator) values($1,$2)",
      [user.id, user.id === qaIds[2]],
    );
  }
  for (const [i, name] of [
    [1, "Wiesenwind"],
    [2, "Moosfreund"],
  ] as const)
    await call(qaIds[i], "onboard", {
      pseudonym: name,
      avatar: generateAvatar(name),
      scores: { O: 3.5, C: 3, E: 3, A: 3.5, N: 3 },
      language: "de",
      interests: ["work", "social", "stress"],
      experiences: ["work"],
      adult_consent: true,
      matching_consent: true,
    });
  await call(qaIds[1], "question", {
    body: "Nach der Arbeit läuft mein Kopf oft einfach weiter. Was hilft euch persönlich, im Feierabend anzukommen?",
    topic: "work",
    discoverable: true,
  });
  await call(qaIds[1], "question", {
    body: "In einer neuen Gruppe bin ich erst einmal still. Wie findet ihr einen Anfang, ohne euch zu verstellen?",
    topic: "social",
    discoverable: true,
  });
  await call(qaIds[1], "question", {
    body: "Wenn alles gleichzeitig kommt, verliere ich den Überblick. Wie schafft ihr euch kleine ruhige Momente?",
    topic: "stress",
    discoverable: false,
  });
  const server = createServer(async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.setHeader("Access-Control-Allow-Origin", "http://127.0.0.1:3200");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
    );
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,OPTIONS");
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }
    try {
      const url = new URL(req.url || "/", "http://127.0.0.1:54325");
      if (url.pathname === "/auth/v1/user") {
        const user = users.find(
          (u) => `Bearer ${token(u.id)}` === req.headers.authorization,
        );
        const exists =
          user &&
          (await db.query("select id from auth.users where id=$1", [user.id]))
            .rows.length;
        if (!user || !exists) {
          res.writeHead(401);
          res.end(JSON.stringify({ msg: "Invalid local QA token" }));
          return;
        }
        res.end(JSON.stringify(user));
        return;
      }
      if (url.pathname === "/auth/v1/logout") {
        res.writeHead(204);
        res.end();
        return;
      }
      if (req.headers.apikey !== "qa-service") {
        res.writeHead(403);
        res.end(JSON.stringify({ message: "Server-only QA gateway" }));
        return;
      }
      if (url.pathname === "/rest/v1/rpc/tb_v2") {
        let raw = "";
        for await (const chunk of req) raw += chunk;
        const body = JSON.parse(raw);
        const result = await call(body.p_actor, body.p_action, body.p_data);
        res.end(JSON.stringify(result));
        return;
      }
      if (
        url.pathname.startsWith("/auth/v1/admin/users/") &&
        req.method === "DELETE"
      ) {
        await db.query("delete from auth.users where id=$1", [
          url.pathname.split("/").pop(),
        ]);
        res.end("{}");
        return;
      }
      if (url.pathname === "/rest/v1/personality_results") {
        res.end("[]");
        return;
      }
      res.writeHead(404);
      res.end("{}");
    } catch (e) {
      res.writeHead(400);
      res.end(
        JSON.stringify({
          code: "P0001",
          message: e instanceof Error ? e.message : "QA error",
        }),
      );
    }
  });
  server.listen(54325, "127.0.0.1", () =>
    console.log(
      "Ephemeral QA Supabase fixture: http://127.0.0.1:54325 (no production data)",
    ),
  );
}
void start();
