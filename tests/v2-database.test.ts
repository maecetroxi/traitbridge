import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { generateAvatar } from "../lib/v2/avatar";

const ids = Array.from(
  { length: 9 },
  (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
);
const migration = readFileSync(
  new URL(
    "../supabase/migrations/20261115091445_traitbridge_v2_private_beta.sql",
    import.meta.url,
  ),
  "utf8",
);
const scores = { O: 3, C: 3, E: 3, A: 3, N: 3 };
async function setup() {
  const db = new PGlite();
  await db.exec(
    `create role anon;create role authenticated;create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key,is_anonymous boolean not null default false);grant usage on schema auth to service_role;create table public.questions(id int);create table public.answers(id int);create table public.community_profiles(id int);grant select,insert,update,delete on public.questions,public.answers,public.community_profiles to authenticated;`,
  );
  await db.exec(migration);
  for (const id of ids) {
    await db.query("insert into auth.users(id) values($1)", [id]);
    await db.query("insert into tb_private.beta_members(user_id) values($1)", [
      id,
    ]);
  }
  const call = async (
    actor: string,
    action: string,
    data: Record<string, unknown> = {},
  ) => {
    const r = await db.query<{ value: any }>(
      "select public.tb_v2($1::uuid,$2::text,$3::jsonb) as value",
      [actor, action, JSON.stringify(data)],
    );
    return r.rows[0].value;
  };
  for (const id of ids)
    await call(id, "onboard", {
      pseudonym: "Person " + id.slice(-2),
      avatar: generateAvatar(id),
      scores,
      language: "de",
      adult_consent: true,
      matching_consent: true,
    });
  return { db, call };
}
test("database: isolated grants, private visibility, reservations, moderation and deletion", async (t) => {
  const { db, call } = await setup();
  t.after(() => db.close());
  const [owner, a, b, c, d, outsider] = ids;
  const q = await call(owner, "question", {
    body: "Wie findet ihr nach der Arbeit persönlich zur Ruhe?",
    topic: "stress",
    discoverable: false,
  });
  await t.test(
    "private questions are invisible without an assignment; discovery is opt-in",
    async () => {
      assert.equal((await call(a, "discover")).length, 0);
      await assert.rejects(
        () => call(a, "reserve", { question_id: q.id }),
        /NOT_FOUND/,
      );
      await assert.rejects(
        () => call(outsider, "close", { question_id: q.id }),
        /NOT_FOUND/,
      );
      const publicQ = await call(owner, "question", {
        body: "Was hilft euch persönlich beim Lernen neuer Dinge?",
        topic: "self",
        discoverable: true,
      });
      assert.equal((await call(a, "discover"))[0].id, publicQ.id);
      await call(owner, "delete_question", { question_id: publicQ.id });
    },
  );
  for (const id of [a, b, c, d])
    await call(id, "assign", { matches: [{ id: q.id, reason: "similar" }] });
  await t.test(
    "owner cannot reply and only three slots survive a burst of parallel promises",
    async () => {
      await assert.rejects(
        () => call(owner, "reserve", { question_id: q.id }),
        /NOT_AVAILABLE/,
      );
      const burst = await Promise.allSettled(
        [a, b, c, d].map((id) => call(id, "reserve", { question_id: q.id })),
      );
      assert.equal(burst.filter((r) => r.status === "fulfilled").length, 3);
      assert.equal(burst.filter((r) => r.status === "rejected").length, 1);
      assert.equal(
        (await db.query("select * from tb_private.reservations")).rows.length,
        3,
      );
    },
  );
  await t.test(
    "idempotent reservation, renewal, slot ownership, cancellation and expiry",
    async () => {
      const first = await call(a, "reserve", { question_id: q.id });
      assert.equal(
        (await call(a, "reserve", { question_id: q.id })).id,
        first.id,
      );
      await assert.rejects(
        () =>
          call(b, "answer", {
            question_id: q.id,
            reservation_id: first.id,
            body: "Mir persönlich hilft es, nach draussen zu gehen.",
          }),
        /RESERVATION_EXPIRED/,
      );
      await call(a, "renew", { question_id: q.id, reservation_id: first.id });
      await call(a, "release", { question_id: q.id });
      const next = await call(d, "reserve", { question_id: q.id });
      assert.ok(next.id);
      await db.query(
        "update tb_private.reservations set expires_at=now()-interval '1 second' where user_id=$1",
        [d],
      );
      await assert.rejects(
        () =>
          call(d, "answer", {
            question_id: q.id,
            reservation_id: next.id,
            body: "Mir persönlich hilft es, nach draussen zu gehen.",
          }),
        /RESERVATION_EXPIRED/,
      );
      const replacement = await call(a, "reserve", { question_id: q.id });
      assert.ok(replacement.id);
    },
  );
  await t.test(
    "valid replies deliver immediately, duplicate submission creates no extra reply or notice",
    async () => {
      for (const id of [a, b, c]) {
        const r = await call(id, "reserve", { question_id: q.id });
        const answer = await call(id, "answer", {
          question_id: q.id,
          reservation_id: r.id,
          body: "Mir persönlich hilft es, nach draussen zu gehen.",
        });
        const duplicate = await call(id, "answer", {
          question_id: q.id,
          reservation_id: r.id,
          body: "Mir persönlich hilft es, nach draussen zu gehen.",
        });
        assert.equal(answer.id, duplicate.id);
      }
      await assert.rejects(
        () => call(d, "reserve", { question_id: q.id }),
        /NO_SLOT/,
      );
      const inbox = await call(owner, "snapshot");
      assert.equal(inbox.answers.length, 3);
      assert.equal(
        inbox.notifications.filter((n: any) => n.kind === "answer").length,
        3,
      );
      assert.equal((await call(a, "snapshot")).answers.length, 1);
      assert.equal((await call(outsider, "snapshot")).answers.length, 0);
      assert.equal(JSON.stringify(inbox.questions).includes("scores"), false);
    },
  );
  await t.test(
    "only the question author can send thanks; one genuine notification is emitted",
    async () => {
      const inbox = await call(owner, "snapshot");
      const answer = inbox.answers[0];
      await assert.rejects(
        () => call(b, "thanks", { answer_id: answer.id, body: "Danke" }),
        /FORBIDDEN/,
      );
      await call(owner, "thanks", {
        answer_id: answer.id,
        body: "Das probiere ich aus.",
      });
      await call(owner, "thanks", { answer_id: answer.id, body: "Nochmals" });
      assert.equal(
        (await call(answer.author.id, "snapshot")).notifications.filter(
          (n: any) => n.kind === "thanks",
        ).length,
        1,
      );
      await call(answer.author.id, "read");
      assert.ok(
        (await call(answer.author.id, "snapshot")).notifications.every(
          (n: any) => n.read_at,
        ),
      );
    },
  );
  await t.test(
    "blocking is bidirectional and removes message access; skipped and closed questions cannot be answered",
    async () => {
      await call(owner, "block", { user_id: a });
      assert.equal((await call(a, "snapshot")).questions.length, 0);
      assert.equal((await call(owner, "snapshot")).answers.length, 2);
      await assert.rejects(
        () => call(a, "reserve", { question_id: q.id }),
        /NOT_FOUND/,
      );
      await call(owner, "unblock", { user_id: a });
      const other = await call(owner, "question", {
        body: "Wie geht ihr persönlich mit neuen sozialen Situationen um?",
        topic: "social",
        discoverable: true,
      });
      await call(a, "skip", { question_id: other.id });
      assert.ok(!(await call(a, "help")).some((x: any) => x.id === other.id));
      await assert.rejects(
        () => call(a, "reserve", { question_id: other.id }),
        /NOT_AVAILABLE/,
      );
      const r = await call(b, "reserve", { question_id: other.id });
      await call(owner, "close", { question_id: other.id });
      await assert.rejects(
        () =>
          call(b, "answer", {
            question_id: other.id,
            reservation_id: r.id,
            body: "Mir persönlich hilft es, nach draussen zu gehen.",
          }),
        /NOT_AVAILABLE/,
      );
    },
  );
  await t.test(
    "deleting a reply redacts the content without creating a fourth lifetime delivery slot",
    async () => {
      const reply = (await call(a, "snapshot")).answers[0];
      await call(a, "delete_answer", { answer_id: reply.id });
      assert.equal((await call(owner, "snapshot")).answers.length, 2);
      assert.equal(
        (
          await db.query<{ body: string }>(
            "select body from tb_private.answers where id=$1",
            [reply.id],
          )
        ).rows[0].body,
        "[Deleted by its author]",
      );
      await assert.rejects(
        () => call(d, "reserve", { question_id: q.id }),
        /NO_SLOT/,
      );
    },
  );
  await t.test(
    "offers are capped, notification opt-out is respected and mutation limits are authoritative",
    async () => {
      const recipient = ids[7],
        author = ids[8];
      await db.query(
        "update tb_private.profiles set notifications=false where id=$1",
        [recipient],
      );
      const offers = [];
      for (let i = 0; i < 5; i++)
        offers.push(
          await call(author, "question", {
            body: "Eine lokale passende Frage für das tägliche Limit " + i,
            topic: "self",
            discoverable: false,
          }),
        );
      await call(author, "question", {
        body: "Eine sechste Frage ist am selben Tag nicht erlaubt.",
        topic: "self",
        discoverable: false,
      }).then(
        () => assert.fail("question rate limit missing"),
        (e) => assert.match(e.message, /RATE_LIMIT/),
      );
      await call(recipient, "assign", {
        matches: offers.map((x) => ({ id: x.id, reason: "similar" })),
      });
      assert.equal((await call(recipient, "snapshot")).notifications.length, 0);
      const more = await call(owner, "question", {
        body: "Eine weitere Frage für das begrenzte Angebot pro Tag.",
        topic: "self",
        discoverable: false,
      });
      const another = await call(owner, "question", {
        body: "Noch eine Frage soll die Angebotsgrenze nicht überschreiten.",
        topic: "self",
        discoverable: false,
      });
      await call(recipient, "assign", {
        matches: [
          { id: more.id, reason: "topic" },
          { id: another.id, reason: "topic" },
        ],
      });
      assert.equal(
        (
          await db.query<{ n: number }>(
            "select count(*)::int as n from tb_private.assignments where user_id=$1",
            [recipient],
          )
        ).rows[0].n,
        6,
      );
      for (let i = 0; i < 120; i++)
        await db.query(
          "insert into tb_private.events(user_id,action) values($1,$2)",
          [recipient, "test"],
        );
      await assert.rejects(
        () => call(recipient, "reserve", { question_id: more.id }),
        /RATE_LIMIT/,
      );
    },
  );
  await t.test(
    "real moderation reports, moderator-only decisions and bans are enforced",
    async () => {
      await call(a, "report", {
        question_id: q.id,
        reason: "Dies ist eine Testmeldung.",
      });
      await assert.rejects(() => call(a, "moderation"), /FORBIDDEN/);
      await db.query(
        "update tb_private.beta_members set moderator=true where user_id=$1",
        [outsider],
      );
      const report = (await call(outsider, "moderation"))[0];
      await call(outsider, "moderate", {
        report_id: report.id,
        decision: "hide",
      });
      assert.equal((await call(a, "snapshot")).questions.length, 0);
      await db.query(
        "update tb_private.beta_members set enabled=false where user_id=$1",
        [d],
      );
      await assert.rejects(() => call(d, "snapshot"), /BETA_REQUIRED/);
    },
  );
  await t.test(
    "browser roles cannot call the gateway or read exact scores even with guessed identifiers",
    async () => {
      await db.exec("set role authenticated");
      await assert.rejects(
        () =>
          db.query("select public.tb_v2($1,$2,$3)", [owner, "snapshot", "{}"]),
        /permission denied/,
      );
      await assert.rejects(
        () => db.query("select * from tb_private.profiles"),
        /permission denied/,
      );
      await db.exec("reset role;set role anon");
      await assert.rejects(
        () => db.query("select * from tb_private.questions"),
        /permission denied/,
      );
      await db.exec("reset role");
    },
  );
  await t.test(
    "service gateway works under the intended service role and user deletion cascades",
    async () => {
      await db.exec("set role service_role");
      await assert.rejects(
        () => db.query("select * from auth.users"),
        /permission denied/,
      );
      assert.ok((await call(owner, "snapshot")).profile);
      await db.exec("reset role");
      await db.query("delete from auth.users where id=$1", [owner]);
      assert.equal(
        (
          await db.query(
            "select * from tb_private.questions where author_id=$1",
            [owner],
          )
        ).rows.length,
        0,
      );
      await assert.rejects(() => call(owner, "snapshot"), /BETA_REQUIRED/);
    },
  );
  await t.test(
    "legacy writes are retired while public archive read and own-delete grants remain",
    async () => {
      const rights = await db.query<{
        can_insert: boolean;
        can_update: boolean;
        can_select: boolean;
        can_delete: boolean;
      }>(
        "select has_table_privilege('authenticated','public.questions','INSERT') can_insert,has_table_privilege('authenticated','public.questions','UPDATE') can_update,has_table_privilege('authenticated','public.questions','SELECT') can_select,has_table_privilege('authenticated','public.questions','DELETE') can_delete",
      );
      assert.deepEqual(rights.rows[0], {
        can_insert: false,
        can_update: false,
        can_select: true,
        can_delete: true,
      });
    },
  );
});
