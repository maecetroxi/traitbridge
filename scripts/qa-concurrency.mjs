// Optional native PostgreSQL check. Install pinned tools in .local-tools as in docs/V2.md.
import EmbeddedPostgres from "../.local-tools/node_modules/embedded-postgres/dist/index.js";
import { readFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
const databaseDir = path.resolve(".local-tools/native-pg-" + Date.now());
const pg = new EmbeddedPostgres({
  databaseDir,
  user: "postgres",
  password: "local-qa-only",
  port: 54326,
  persistent: true,
  createPostgresUser: false,
  postgresFlags: ["-h", "127.0.0.1", "-c", "io_method=sync"],
  onLog: (message) => {
    if (/FATAL|could not|ready to accept/i.test(message))
      console.log(message.trim());
  },
  onError: () => {},
});
const clients = [];
try {
  console.log("Initialising isolated native PostgreSQL test cluster");
  await pg.initialise();
  console.log("Starting local PostgreSQL on 127.0.0.1:54326");
  await pg.start();
  console.log("Running concurrent transactions on independent connections");
  const control = pg.getPgClient();
  await control.connect();
  clients.push(control);
  await control.query(
    "create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create table auth.users(id uuid primary key,is_anonymous boolean not null default false);grant usage on schema auth to service_role;",
  );
  await control.query(
    await readFile(
      "supabase/migrations/20261115091445_traitbridge_v2_private_beta.sql",
      "utf8",
    ),
  );
  const ids = Array.from(
    { length: 9 },
    (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
  );
  const call = async (c, id, action, data = {}) =>
    (
      await c.query(
        "select public.tb_v2($1::uuid,$2::text,$3::jsonb) as value",
        [id, action, JSON.stringify(data)],
      )
    ).rows[0].value;
  for (const id of ids) {
    await control.query("insert into auth.users(id) values($1)", [id]);
    await control.query(
      "insert into tb_private.beta_members(user_id) values($1)",
      [id],
    );
    await call(control, id, "onboard", {
      pseudonym: "Native QA",
      avatar: { version: 1, shape: 0, color: 0, eyes: 0, mouth: 0, detail: 0 },
      scores: { O: 3, C: 3, E: 3, A: 3, N: 3 },
      language: "de",
      adult_consent: true,
      matching_consent: true,
    });
  }
  const q = await call(control, ids[0], "question", {
    body: "Eine ausschliesslich lokale Frage für echte parallele Reservierungsversuche.",
    topic: "self",
    discoverable: true,
  });
  const peers = [];
  for (let i = 1; i < ids.length; i++) {
    const c = pg.getPgClient();
    await c.connect();
    clients.push(c);
    peers.push({ c, id: ids[i] });
  }
  const reservations = await Promise.allSettled(
    peers.map(async ({ c, id }) => ({
      id,
      c,
      r: await call(c, id, "reserve", { question_id: q.id }),
    })),
  );
  assert.equal(reservations.filter((x) => x.status === "fulfilled").length, 3);
  assert.equal(reservations.filter((x) => x.status === "rejected").length, 5);
  const winners = reservations
    .filter((x) => x.status === "fulfilled")
    .map((x) => x.value);
  await Promise.all(
    winners.map(({ id, c, r }) =>
      call(c, id, "answer", {
        question_id: q.id,
        reservation_id: r.id,
        body: "Meine ausschliesslich lokale Beispielerfahrung für den Paralleltest.",
      }),
    ),
  );
  assert.equal(
    Number(
      (
        await control.query(
          "select count(*) from tb_private.answers where question_id=$1",
          [q.id],
        )
      ).rows[0].count,
    ),
    3,
  );
  const repeats = await Promise.all(
    winners.map(({ id, c, r }) =>
      call(c, id, "answer", {
        question_id: q.id,
        reservation_id: r.id,
        body: "Meine ausschliesslich lokale Beispielerfahrung für den Paralleltest.",
      }),
    ),
  );
  assert.ok(repeats.every((x) => x.duplicate));
  const q2 = await call(control, ids[0], "question", {
    body: "Eine zweite lokale Frage prüft Blockieren gegen gleichzeitiges Antworten.",
    topic: "self",
    discoverable: true,
  });
  // Use a responder actually visible to the question owner. Arrival order in
  // the reservation burst is intentionally nondeterministic.
  const participant = winners[0];
  const reserved = await call(participant.c, participant.id, "reserve", {
    question_id: q2.id,
  });
  // Hold the transaction gate, queue a block before the answer on other connections.
  await control.query("begin");
  await control.query("select pg_advisory_xact_lock(748923,2)");
  const blocker = pg.getPgClient();
  await blocker.connect();
  clients.push(blocker);
  const blocked = call(blocker, ids[0], "block", { user_id: participant.id });
  await new Promise((r) => setTimeout(r, 50));
  const answer = call(participant.c, participant.id, "answer", {
    question_id: q2.id,
    reservation_id: reserved.id,
    body: "Diese Antwort darf nach der Blockierung nicht gespeichert werden.",
  });
  const pending = Promise.allSettled([blocked, answer]);
  await control.query("commit");
  const race = await pending;
  assert.equal(race[0].status, "fulfilled");
  assert.equal(race[1].status, "rejected");
  const result = {
    postgres: (await control.query("select version()")).rows[0].version,
    connections: clients.length,
    checks: [
      "8 simultaneous reservations → exactly 3 accepted",
      "3 simultaneous replies → exactly 3 saved",
      "duplicate submissions create no new replies",
      "block-versus-answer race rejects answer after block",
    ],
  };
  await mkdir("test-results", { recursive: true });
  await writeFile(
    "test-results/v2-concurrency.json",
    JSON.stringify(result, null, 2),
  );
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  process.exitCode = 1;
  console.error("Native transaction test failed", error);
  throw error;
} finally {
  await Promise.all(clients.map((c) => c.end().catch(() => {})));
  if (pg.process && pg.process.exitCode !== null) pg.process = undefined;
  await pg.stop();
}
