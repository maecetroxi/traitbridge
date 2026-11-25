import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import { PGlite } from "@electric-sql/pglite";
import { generateAvatar } from "../lib/v2/avatar";
import { validateAction } from "../lib/v2/server";
import { afterSignIn } from "../lib/return-path";

const ids = Array.from(
  { length: 6 },
  (_, i) => `00000000-0000-4000-9000-${String(i + 1).padStart(12, "0")}`,
);
const [author, viewer, moderator, another, uninvited, incomplete] = ids;
const files = [
  "20261115134218_traitbridge_v2_private_beta.sql",
  "20261125100010_v2_assessment_onboarding.sql",
  "20261125104611_v2_discover_experiences.sql",
];

test("Discover actions validate topic, body, IDs and exact return intent", () => {
  const body = "Bei der Arbeit plane ich kurze, feste Pausen.";
  assert.deepEqual(
    validateAction("experience_publish", {
      body,
      title: "  ",
      author_id: viewer,
    }),
    {
      body,
      title: null,
      topic: "work",
    },
  );
  assert.throws(
    () => validateAction("experience_publish", { body, topic: false }),
    /INVALID_INPUT/,
  );
  assert.throws(
    () =>
      validateAction("experience_publish", {
        body: `${body} https://a.invalid https://b.invalid https://c.invalid`,
      }),
    /SPAM/,
  );
  assert.throws(
    () =>
      validateAction("discover_bookmark", {
        id: "x",
        kind: "experience",
        enabled: true,
      }),
    /INVALID_INPUT/,
  );
  assert.throws(
    () =>
      validateAction("discover_feed", {
        cursor: { at: "now", id: author, kind: "question" },
      }),
    /INVALID_INPUT/,
  );
  assert.equal(
    afterSignIn("/discover?write=1", false, true),
    "/onboarding?returnTo=%2Fdiscover%3Fwrite%3D1",
  );
  assert.equal(
    afterSignIn("/discover?write=1", true, true),
    "/discover?write=1",
  );
});

test("Discover database: shared visibility, owner actions, private reactions and moderation", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key);",
  );
  for (const file of files)
    await db.exec(
      readFileSync(
        new URL(`../supabase/migrations/${file}`, import.meta.url),
        "utf8",
      ),
    );
  await db.query("insert into auth.users select unnest($1::uuid[])", [ids]);
  await db.query(
    "insert into tb_private.beta_members(user_id,moderator) select i,i=$1 from unnest($2::uuid[]) i where i<>$3",
    [moderator, ids, uninvited],
  );
  const call = async (
    actor: string | null,
    action: string,
    data: Record<string, unknown> = {},
    gateway = "tb_v2_discover",
  ) => {
    const result = await db.query<{ value: any }>(
      `select public.${gateway}($1::uuid,$2::text,$3::jsonb) as value`,
      [actor, action, JSON.stringify(data)],
    );
    return result.rows[0].value;
  };
  const legacy = (
    actor: string,
    action: string,
    data: Record<string, unknown> = {},
  ) => call(actor, action, data, "tb_v2");
  for (const member of [author, viewer, moderator, another]) {
    await legacy(member, "onboard", {
      pseudonym: "Person " + member.slice(-1),
      avatar: generateAvatar(member),
      scores: { O: 3, C: 3, E: 3, A: 3, N: 3 },
      language: "de",
      adult_consent: true,
      matching_consent: true,
    });
  }
  const sample = {
    title: "Pausen",
    body: "Ich plane feste Pausen, wenn ich konzentriert arbeite.",
    topic: "work",
  };
  const { id: shared } = await legacy(author, "question", {
    body: "Was hilft euch nach langen Gesprächen?",
    topic: "social",
    discoverable: true,
  });
  const { id: privateQuestion } = await legacy(author, "question", {
    body: "Meine ganz private Frage über Beziehungen.",
    topic: "relationships",
  });
  const reservation = await legacy(viewer, "reserve", { question_id: shared });
  const privateReply = "Diese Antwort bleibt ausdrücklich privat sichtbar.";
  await legacy(viewer, "answer", {
    question_id: shared,
    reservation_id: reservation.id,
    body: privateReply,
  });
  await db.exec("set role service_role");
  const { id: exp } = await call(author, "experience_publish", sample);

  await t.test(
    "guests, nonmembers and incomplete profiles cannot access or publish",
    async () => {
      await assert.rejects(() => call(null, "discover_feed"), /AUTH_REQUIRED/);
      await assert.rejects(
        () => call(uninvited, "discover_feed"),
        /BETA_REQUIRED/,
      );
      await assert.rejects(
        () => call(incomplete, "experience_publish", sample),
        /ONBOARDING_REQUIRED/,
      );
      const grants = await db.query<{ safe: boolean }>(
        "select not has_function_privilege('anon','public.tb_v2_discover(uuid,text,jsonb)','execute') and not has_function_privilege('authenticated','public.tb_v2_discover(uuid,text,jsonb)','execute') and has_function_privilege('service_role','public.tb_v2_discover(uuid,text,jsonb)','execute') and not has_table_privilege('authenticated','tb_private.bookmarks','select') as safe",
      );
      assert.equal(grants.rows[0].safe, true);
    },
  );
  await t.test(
    "feed filters shared questions and experiences without private replies or scores",
    async () => {
      const mixed = await call(viewer, "discover_feed");
      assert.deepEqual(
        new Set(mixed.map((item: any) => item.id)),
        new Set([shared, exp]),
      );
      assert.ok(!JSON.stringify(mixed).includes(privateReply));
      assert.deepEqual(Object.keys(mixed[0].author).sort(), [
        "avatar",
        "id",
        "pseudonym",
      ]);
      assert.deepEqual(
        (
          await call(viewer, "discover_feed", {
            kind: "question",
            topic: "social",
          })
        ).map((item: any) => item.id),
        [shared],
      );
      assert.equal(
        (
          await call(viewer, "discover_feed", {
            kind: "experience",
            topic: "social",
          })
        ).length,
        0,
      );
      assert.equal(
        mixed.find((item: any) => item.id === shared).can_answer,
        false,
      );
      const own = (await call(author, "discover_feed")).find(
        (item: any) => item.id === shared,
      );
      assert.equal(own.can_answer, false);
      const [latest, other] = mixed;
      assert.deepEqual(
        (
          await call(viewer, "discover_feed", {
            before_at: latest.created_at,
            before_id: latest.id,
            before_kind: latest.kind,
          })
        ).map((item: any) => item.id),
        [other.id],
      );
    },
  );
  await t.test(
    "owner edits, and bookmark/helpfulness toggles are private and idempotent",
    async () => {
      await assert.rejects(
        () => call(viewer, "experience_edit", { id: exp, ...sample }),
        /NOT_FOUND/,
      );
      await assert.rejects(
        () => call(viewer, "experience_delete", { id: exp }),
        /NOT_FOUND/,
      );
      await call(author, "experience_edit", {
        id: exp,
        ...sample,
        title: "Feste Pausen",
      });
      const toggle = { id: exp, kind: "experience", enabled: true };
      await call(viewer, "experience_helpful", toggle);
      await call(viewer, "experience_helpful", toggle);
      await assert.rejects(
        () => call(author, "experience_helpful", toggle),
        /FORBIDDEN/,
      );
      await call(viewer, "discover_bookmark", toggle);
      await call(viewer, "discover_bookmark", toggle);
      await call(viewer, "discover_bookmark", {
        id: shared,
        kind: "question",
        enabled: true,
      });
      await assert.rejects(
        () =>
          call(viewer, "discover_bookmark", {
            id: privateQuestion,
            kind: "question",
            enabled: true,
          }),
        /NOT_FOUND/,
      );
      const owned = await call(author, "discover_own");
      assert.equal(owned[0].title, "Feste Pausen");
      assert.equal(owned[0].helpful, false);
      assert.equal((await call(another, "discover_saved")).length, 0);
      const saved = await call(viewer, "discover_saved");
      assert.equal(saved.length, 2);
      assert.equal(saved.find((item: any) => item.id === exp).helpful, true);
      assert.equal(
        (await db.query("select * from tb_private.experience_helpful")).rows
          .length,
        1,
      );
      await call(viewer, "experience_helpful", { ...toggle, enabled: false });
      assert.equal(
        (await call(viewer, "discover_saved")).find(
          (item: any) => item.id === exp,
        ).helpful,
        false,
      );
      await call(viewer, "discover_bookmark", { ...toggle, enabled: false });
      assert.deepEqual(
        (await call(viewer, "discover_saved")).map((item: any) => item.id),
        [shared],
      );
      await assert.rejects(
        () => call(viewer, "discover_unshare", { id: shared }),
        /NOT_FOUND/,
      );
      await call(author, "discover_unshare", { id: shared });
      assert.deepEqual(await call(viewer, "discover_saved"), []);
      assert.ok(
        (await legacy(viewer, "snapshot")).answers.some(
          (answer: any) => answer.body === privateReply,
        ),
      );
    },
  );
  await t.test(
    "blocking hides content both ways and moderation does not rely on report volume",
    async () => {
      await call(viewer, "discover_bookmark", {
        id: exp,
        kind: "experience",
        enabled: true,
      });
      await call(viewer, "discover_block", { id: exp, kind: "experience" });
      assert.deepEqual(await call(viewer, "discover_saved"), []);
      await assert.rejects(
        () =>
          call(viewer, "experience_report", {
            id: exp,
            kind: "experience",
            reason: "Testgrund",
          }),
        /NOT_FOUND/,
      );
      const { id: opposite } = await call(viewer, "experience_publish", {
        ...sample,
        body: "Meine Wochennotizen helfen mir, die Aufgaben zu sortieren.",
      });
      assert.ok(
        !(await call(author, "discover_feed")).some(
          (item: any) => item.id === opposite,
        ),
      );
      await legacy(viewer, "unblock", { user_id: author });
      const report = {
        id: exp,
        kind: "experience",
        reason: "Enthält persönliche Angaben.",
      };
      await call(viewer, "experience_report", report);
      await call(viewer, "experience_report", report);
      assert.equal((await call(moderator, "experience_moderation")).length, 1);
      assert.equal((await call(viewer, "discover_saved")).length, 1);
      const [pending] = await call(moderator, "experience_moderation");
      await assert.rejects(
        () =>
          call(viewer, "experience_moderate", {
            id: pending.id,
            decision: "hide",
          }),
        /FORBIDDEN/,
      );
      await call(moderator, "experience_moderate", {
        id: pending.id,
        decision: "hide",
      });
      assert.deepEqual(await call(viewer, "discover_saved"), []);
      assert.equal((await call(author, "discover_own"))[0].status, "hidden");
      await assert.rejects(
        () => call(author, "experience_edit", { id: exp, ...sample }),
        /NOT_AVAILABLE/,
      );
    },
  );
  await t.test(
    "bans, quotas and account deletion remove access without restoring older content",
    async () => {
      await call(author, "experience_delete", { id: exp });
      await assert.rejects(
        () =>
          call(author, "experience_publish", {
            ...sample,
            body: sample.body.toUpperCase().replaceAll(" ", "  "),
          }),
        /DUPLICATE_POST/,
      );
      const { id: active } = await call(author, "experience_publish", {
        ...sample,
        body: "Eine kurze Liste hilft mir beim Wochenstart.",
      });
      const { id: third } = await call(author, "experience_publish", {
        ...sample,
        body: "Am Abend trenne ich meine Berufskleidung von der Freizeitkleidung.",
      });
      await call(author, "experience_delete", { id: third });
      await assert.rejects(
        () =>
          call(author, "experience_publish", {
            ...sample,
            body: "Am Morgen mache ich die wichtigste Aufgabe zuerst.",
          }),
        /RATE_LIMIT/,
      );
      await call(viewer, "discover_bookmark", {
        id: active,
        kind: "experience",
        enabled: true,
      });
      await call(viewer, "experience_helpful", {
        id: active,
        kind: "experience",
        enabled: true,
      });
      await call(viewer, "experience_report", {
        id: active,
        kind: "experience",
        reason: "Testmeldung zur Sperre",
      });
      const [pending] = await call(moderator, "experience_moderation");
      await call(moderator, "experience_moderate", {
        id: pending.id,
        decision: "ban",
      });
      assert.deepEqual(await call(viewer, "discover_saved"), []);
      await assert.rejects(
        () => call(author, "discover_feed"),
        /BETA_REQUIRED/,
      );
      await legacy(author, "delete_account_prepare");
      await db.exec("reset role");
      await db.query("delete from auth.users where id=$1", [author]);
      for (const table of [
        "experiences",
        "bookmarks",
        "experience_helpful",
        "experience_reports",
        "experience_writes",
      ]) {
        const remaining = await db.query(
          `select 1 from tb_private.${table} where ${table === "experiences" ? "id" : "experience_id"}=$1`,
          [active],
        );
        assert.equal(remaining.rows.length, 0, table);
      }
    },
  );
});
