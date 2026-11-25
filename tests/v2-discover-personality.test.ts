import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { generateAvatar } from "../lib/v2/avatar";
import { topicTraits } from "../lib/v2/matching";
import { validateAction } from "../lib/v2/server";
import type { DiscoverItem } from "../lib/v2/types";

const migration = [
  "20261115134218_traitbridge_v2_private_beta.sql",
  "20261125100010_v2_assessment_onboarding.sql",
  "20261125104611_v2_discover_experiences.sql",
  "20261125114044_v2_discover_personality.sql",
];
const ids = Array.from(
  { length: 6 },
  (_, i) => `00000000-0000-4010-9000-${String(i + 1).padStart(12, "0")}`,
);
const [viewer, similar, different, privateAuthor, moderator, noProfile] = ids;
const neutral = { O: 3, C: 3, E: 3, A: 3, N: 3 };
const full = { O: 2, C: 4.1, E: 3.2, A: 2.99, N: 3 };
const short = { O: 2.5, C: 1.5, E: 5, A: 3.5, N: 3 };

test("Discover only accepts explicit perspective modes and boolean consent", () => {
  assert.equal(
    validateAction("discover_feed", { perspective: "similar" }).perspective,
    "similar",
  );
  assert.equal(
    validateAction("discover_saved", { perspective: "different" }).perspective,
    undefined,
  );
  assert.throws(
    () => validateAction("discover_feed", { perspective: 0 }),
    /INVALID_INPUT/,
  );
  assert.throws(
    () => validateAction("discover_personality", { enabled: 1 }),
    /INVALID_INPUT/,
  );
  assert.deepEqual(
    validateAction("discover_personality", {
      enabled: false,
      user_id: different,
    }),
    { enabled: false },
  );
});

test("Discover personality projection, consent and comparisons are enforced in SQL", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key);",
  );
  for (const file of migration)
    await db.exec(
      readFileSync(
        new URL(`../supabase/migrations/${file}`, import.meta.url),
        "utf8",
      ),
    );
  await db.query("insert into auth.users select unnest($1::uuid[])", [ids]);
  await db.query(
    "insert into tb_private.beta_members(user_id,moderator) select i,i=$1 from unnest($2::uuid[]) i",
    [moderator, ids],
  );
  const call = async <T = unknown>(
    actor: string | null,
    action: string,
    input: Record<string, unknown> = {},
    functionName = "tb_v2_discover_profile",
  ) =>
    (
      await db.query<{ value: T }>(
        `select public.${functionName}($1::uuid,$2::text,$3::jsonb) as value`,
        [actor, action, JSON.stringify(input)],
      )
    ).rows[0].value;
  const list = (options: Record<string, unknown> = {}) =>
    call<DiscoverItem[]>(viewer, "discover_feed", options);
  const optIn = (actor: string, enabled: boolean) =>
    call(actor, "discover_personality", { enabled });
  const saved = () => call<DiscoverItem[]>(viewer, "discover_saved");
  const setScores = (actor: string, scores: object, variant = "short") =>
    db.query(
      "update tb_private.profiles set scores=$1, variant=$2 where id=$3",
      [JSON.stringify(scores), variant, actor],
    );
  const post = async (
    owner: string,
    title: string,
    topic: string,
    date: string,
  ) =>
    (
      await db.query<{ id: string }>(
        "insert into tb_private.experiences(author_id,title,body,topic,created_at) values($1,$2,$3,$4,$5) returning id",
        [
          owner,
          title,
          "Dieser fiktive Beitrag enthält eine kurze Erfahrung.",
          topic,
          date,
        ],
      )
    ).rows[0].id;
  for (const actor of ids.slice(0, 5)) {
    await call(
      actor,
      "onboard",
      {
        pseudonym: "Person " + actor.slice(-1),
        avatar: generateAvatar(actor),
        scores: neutral,
        language: "de",
        adult_consent: true,
        matching_consent: true,
      },
      "tb_v2",
    );
  }
  await db.exec("set role service_role");
  await setScores(similar, full, "full");
  await setScores(different, short);
  await setScores(privateAuthor, short);
  const question = await call<{ id: string }>(
    different,
    "question",
    {
      body: "Was hilft euch im Kontakt mit neuen Leuten?",
      topic: "social",
      discoverable: true,
    },
    "tb_v2",
  );
  const fullPost = await post(
    similar,
    "Mit einer Liste",
    "work",
    "2026-09-01T09:00:00Z",
  );
  const diffPost = await post(
    different,
    "Mit kurzen Pausen",
    "work",
    "2026-09-01T09:05:00Z",
  );
  const samePersonOtherTopic = await post(
    different,
    "Ruhe am Abend",
    "stress",
    "2026-09-01T09:04:00Z",
  );
  const privatePost = await post(
    privateAuthor,
    "Ohne Freigabe",
    "work",
    "2026-09-01T09:03:00Z",
  );

  await t.test(
    "visibility starts off and the author controls only their own consent",
    async () => {
      for (const item of await list()) assert.equal(item.personality, null);
      assert.deepEqual(await list({ perspective: "similar" }), []);
      assert.deepEqual(await list({ perspective: "different" }), []);
      await assert.rejects(() => call(null, "discover_feed"), /AUTH_REQUIRED/);
      await assert.rejects(() => optIn(noProfile, true), /ONBOARDING_REQUIRED/);
      assert.equal(
        (
          await db.query<{ granted: boolean }>(
            "select has_function_privilege('authenticated','public.tb_v2_discover_profile(uuid,text,jsonb)','execute') as granted",
          )
        ).rows[0].granted,
        false,
      );
      assert.deepEqual(await optIn(similar, true), { enabled: true });
      await optIn(different, true);
      assert.ok(
        (await list()).find((item) => item.id === privatePost)?.personality ===
          null,
      );
    },
  );

  await t.test(
    "only coarse bands and at most two genuinely strong traits are published",
    async () => {
      const feed = await list();
      const projection = feed.find((item) => item.id === fullPost)?.personality;
      assert.deepEqual(projection, {
        bands: { O: "low", C: "high", E: "middle", A: "middle", N: "middle" },
        highlights: ["O", "C"],
        short_test: false,
      });
      assert.deepEqual(
        feed.find((item) => item.id === question.id)?.personality,
        {
          bands: { O: "middle", C: "low", E: "high", A: "middle", N: "middle" },
          highlights: ["C", "E"],
          short_test: true,
        },
      );
      assert.ok(!JSON.stringify(feed).includes("scores"));
      assert.ok(!JSON.stringify(feed).includes("4.1"));
      const neutralish = { O: 3.6, C: 2.4, E: 3, A: 3.5, N: 2.5 };
      const result = (
        await db.query<{ value: object }>(
          "select tb_private.discover_personality($1,'short') as value",
          [JSON.stringify(neutralish)],
        )
      ).rows[0].value;
      assert.deepEqual(result, {
        bands: { O: "high", C: "low", E: "middle", A: "middle", N: "middle" },
        highlights: [],
        short_test: true,
      });
      for (const bad of [
        { ...neutral, E: 6 },
        { ...neutral, E: "3.5" },
        { ...neutral, E: undefined },
        null,
      ]) {
        const projected = (
          await db.query<{ value: unknown }>(
            "select tb_private.discover_personality($1,'short') as value",
            [JSON.stringify(bad)],
          )
        ).rows[0].value;
        assert.equal(projected, null);
      }
    },
  );

  await t.test(
    "matching depends only on shared bands and the existing topic dimensions",
    async () => {
      for (const [topic, relevant] of Object.entries(topicTraits)) {
        const { rows } = await db.query<{ value: string[] }>(
          "select tb_private.discover_topic_traits($1) as value",
          [topic],
        );
        assert.deepEqual(rows[0].value, relevant);
      }
      assert.deepEqual(
        (
          await list({
            perspective: "similar",
            kind: "experience",
            topic: "work",
          })
        ).map(({ id }) => id),
        [fullPost],
      );
      assert.deepEqual(
        (
          await list({
            perspective: "different",
            kind: "experience",
            topic: "work",
          })
        ).map(({ id }) => id),
        [diffPost],
      );
      assert.deepEqual(
        (
          await list({
            perspective: "similar",
            kind: "experience",
            topic: "stress",
          })
        ).map(({ id }) => id),
        [samePersonOtherTopic],
      );
      assert.deepEqual(
        (await list({ perspective: "different", kind: "question" })).map(
          ({ id }) => id,
        ),
        [question.id],
      );
      await setScores(similar, { ...full, C: 4.85, E: 2.51 }, "full");
      await setScores(privateAuthor, { O: 1, C: 3, E: 3, A: 4.9, N: 5 });
      assert.deepEqual(
        (await list({ perspective: "similar", topic: "work" })).map(
          ({ id }) => id,
        ),
        [fullPost],
      );
      assert.deepEqual(
        (await list({ perspective: "different", topic: "work" })).map(
          ({ id }) => id,
        ),
        [diffPost],
      );
      await setScores(viewer, { ...neutral, E: [] });
      assert.deepEqual(await list({ perspective: "similar" }), []);
      assert.ok((await list()).length > 0);
      await assert.rejects(() => optIn(viewer, true), /DISCOVER_TEST_REQUIRED/);
      await setScores(viewer, neutral);
    },
  );

  await t.test(
    "filter runs before paging across a large set of newer unshared content",
    async () => {
      for (const [actor, count, date] of [
        [privateAuthor, 30, "2026-10-01T00:00:00Z"],
        [similar, 25, "2026-08-01T00:00:00Z"],
      ] as const) {
        await db.query(
          `insert into tb_private.experiences(author_id, title, body, topic, created_at)
        select $1, 'Fiktiv ' || n, 'Ein Beispiel zur Prüfung der Seitenauswahl.', 'work', $3::timestamptz
        from generate_series(1,$2::int) n`,
          [actor, count, date],
        );
      }
      assert.ok(
        (await list({ kind: "experience", topic: "work" })).every(
          (i) => i.author.id === privateAuthor,
        ),
      );
      const filter = {
        kind: "experience",
        topic: "work",
        perspective: "similar",
      };
      const first = await list(filter);
      assert.equal(first.length, 25); // RPC returns one extra row for the Edge cursor.
      const cursor = first[23];
      const rest = await list({
        ...filter,
        before_at: cursor.created_at,
        before_id: cursor.id,
        before_kind: cursor.kind,
      });
      assert.equal(rest.length, 2);
      assert.equal(rest[0].id, first[24].id);
      assert.equal(
        new Set([...first.slice(0, 24), ...rest].map(({ id }) => id)).size,
        26,
      );
    },
  );

  await t.test(
    "revocation affects existing posts and bookmarks, and cannot bypass visibility",
    async () => {
      await call(
        viewer,
        "discover_bookmark",
        { id: diffPost, kind: "experience", enabled: true },
        "tb_v2_discover",
      );
      assert.equal((await saved())[0].personality?.short_test, true);
      await optIn(different, false);
      assert.equal((await saved())[0].personality, null);
      assert.equal(
        (await list({ perspective: "different" })).some(
          (i) => i.id === diffPost,
        ),
        false,
      );
      await optIn(different, true);
      await setScores(different, { ...short, E: "5" });
      assert.equal((await saved())[0].personality, null);
      assert.equal(
        (await list({ perspective: "different" })).some(
          (i) => i.id === question.id,
        ),
        false,
      );
      await setScores(different, short);
      await call(
        viewer,
        "discover_block",
        { id: diffPost, kind: "experience" },
        "tb_v2_discover",
      );
      assert.deepEqual(await saved(), []);
      assert.equal(
        (await list()).some((i) => i.id === question.id),
        false,
      );
      await call(viewer, "unblock", { user_id: different }, "tb_v2");
      await db.query(
        "update tb_private.experiences set status='hidden' where id=$1",
        [diffPost],
      );
      assert.deepEqual(await saved(), []);
      assert.equal(
        (await call<DiscoverItem[]>(different, "discover_own")).find(
          (i) => i.id === diffPost,
        )?.personality,
        null,
      );
      await db.query(
        "update tb_private.beta_members set enabled=false where user_id=$1",
        [different],
      );
      assert.equal(
        (await list()).some((i) => i.id === question.id),
        false,
      );
      await assert.rejects(() => optIn(different, true), /BETA_REQUIRED/);
    },
  );
});
