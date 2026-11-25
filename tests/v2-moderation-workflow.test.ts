import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { PGlite } from "@electric-sql/pglite";
import { generateAvatar } from "../lib/v2/avatar";
import { validateAction } from "../lib/v2/server";

const migrations = [
  "20261115134218_traitbridge_v2_private_beta.sql",
  "20261125100010_v2_assessment_onboarding.sql",
  "20261125104611_v2_discover_experiences.sql",
  "20261125114044_v2_discover_personality.sql",
  "20261125165424_v2_moderation_workflow.sql",
];
const ids = Array.from(
  { length: 5 },
  (_, i) => "00000000-0000-4010-9000-" + String(i + 1).padStart(12, "0"),
);
const [operator, author, reader, archivedAccount, otherOperator] = ids;
const body = "Dieser fiktive Beitrag dient der Prüfung der Moderation.";
type Report = {
  id: string;
  kind: string;
  reason: string;
  created_at: string;
  resolution: string;
};
type Dashboard = {
  open_count: number;
  reports: Report[];
  recent: Report[];
  hidden: { id: string }[];
  accounts: { id: string }[];
};

test("Moderation API validates the content kind and accepts only a single target", () => {
  assert.deepEqual(
    validateAction("moderation_restore", {
      id: author,
      kind: "answer",
      user_id: reader,
    }),
    { id: author, kind: "answer" },
  );
  assert.throws(
    () => validateAction("moderation_restore", { id: author, kind: "profile" }),
    /INVALID_INPUT/,
  );
  assert.throws(
    () => validateAction("moderation_unsuspend", { id: "other" }),
    /INVALID_INPUT/,
  );
  assert.deepEqual(
    validateAction("moderation_dashboard", { user_id: reader }),
    {},
  );
});

test("Moderation decisions preserve visibility and only reverse known actions", async (t) => {
  const db = new PGlite();
  t.after(() => db.close());
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key);",
  );
  for (const file of migrations)
    await db.exec(
      readFileSync(
        new URL("../supabase/migrations/" + file, import.meta.url),
        "utf8",
      ),
    );
  await db.query("insert into auth.users select unnest($1::uuid[])", [ids]);
  await db.query(
    "insert into tb_private.beta_members(user_id,enabled,moderator) select i,i<>$2,i=any($3::uuid[]) from unnest($1::uuid[]) i",
    [ids, archivedAccount, [operator, otherOperator]],
  );
  await db.query(
    "insert into tb_private.profiles(id,pseudonym,avatar,scores,variant,language) select i,'Konto ' || n,$2,$3,'short','de' from unnest($1::uuid[]) with ordinality u(i,n)",
    [
      ids,
      JSON.stringify(generateAvatar("local")),
      '{"O":3,"C":3,"E":3,"A":3,"N":3}',
    ],
  );
  async function call<T = unknown>(
    actor: string | null,
    action: string,
    data = {},
    rpc = "tb_v2_moderation_workflow",
  ) {
    const { rows } = await db.query<{ value: T }>(
      "select public." + rpc + "($1::uuid,$2::text,$3::jsonb) as value",
      [actor, action, JSON.stringify(data)],
    );
    return rows[0].value;
  }
  async function rowId(sql: string, params: unknown[]) {
    return (await db.query<{ id: string }>(sql, params)).rows[0].id;
  }
  const dashboard = () => call<Dashboard>(operator, "moderation_dashboard");
  const decide = (report: Report, decision: string) =>
    call(operator, "moderation_decide", {
      id: report.id,
      kind: report.kind,
      decision,
    });
  const restore = (id: string, kind: string) =>
    call(operator, "moderation_restore", { id, kind });
  const question = await rowId(
    "insert into tb_private.questions(author_id,body,topic,language,discoverable,status,delivered_count) values($1,$2,'work','de',false,'closed',1) returning id",
    [author, body],
  );
  const answer = await rowId(
    "insert into tb_private.answers(question_id,author_id,body) values($1,$2,$3) returning id",
    [
      question,
      reader,
      "Diese private Antwort bleibt ausserhalb dieses Austauschs unsichtbar.",
    ],
  );
  const previousHide = await rowId(
    "insert into tb_private.questions(author_id,body,topic,language,status) values($1,$2,'work','de','hidden') returning id",
    [author, body],
  );
  const experience = await rowId(
    "insert into tb_private.experiences(author_id,title,body,topic) values($1,'Lokale Erfahrung',$2,'work') returning id",
    [author, body],
  );
  const operatorExperience = await rowId(
    "insert into tb_private.experiences(author_id,title,body,topic) values($1,'Moderationskonto',$2,'work') returning id",
    [otherOperator, body],
  );

  await t.test(
    "Browser roles, non-moderators and suspended accounts cannot read moderation entries",
    async () => {
      const grants = await db.query<{ execute: boolean; read: boolean }>(
        "select has_function_privilege('authenticated','public.tb_v2_moderation_workflow(uuid,text,jsonb)','EXECUTE') as execute, has_table_privilege('anon','tb_private.moderation_entries','SELECT') as read",
      );
      assert.deepEqual(grants.rows, [{ execute: false, read: false }]);
      await assert.rejects(call(null, "moderation_dashboard"), /AUTH_REQUIRED/);
      await assert.rejects(call(reader, "moderation_dashboard"), /FORBIDDEN/);
      await assert.rejects(
        call(archivedAccount, "moderation_status"),
        /FORBIDDEN/,
      );
      await db.exec("set role service_role");
      try {
        assert.equal((await dashboard()).open_count, 0);
      } finally {
        await db.exec("reset role");
      }
      await assert.rejects(restore(previousHide, "question"), /NOT_FOUND/);
      await assert.rejects(
        call(operator, "moderation_unsuspend", { id: archivedAccount }),
        /NOT_FOUND/,
      );
    },
  );

  await t.test(
    "Three content kinds, dates, decisions and duplicate reports",
    async () => {
      await call(
        reader,
        "report",
        { question_id: question, reason: "Prüfung der Frage" },
        "tb_v2",
      );
      await call(
        author,
        "report",
        {
          question_id: question,
          answer_id: answer,
          reason: "Prüfung der Antwort",
        },
        "tb_v2",
      );
      for (const account of [reader, operator])
        await call(
          account,
          "experience_report",
          { id: experience, reason: "Prüfung des Beitrags" },
          "tb_v2_discover",
        );
      const before = await dashboard();
      assert.equal(before.open_count, 4);
      assert.deepEqual(
        new Set(before.reports.map((report) => report.kind)),
        new Set(["question", "answer", "experience"]),
      );
      assert.ok(
        before.reports.every(
          ({ reason, created_at }) =>
            reason && !Number.isNaN(Date.parse(created_at)),
        ),
      );
      const feed = () =>
        call<{ id: string }[]>(
          reader,
          "discover_feed",
          {},
          "tb_v2_discover_profile",
        );
      assert.equal(
        (await feed()).some(({ id }) => id === experience),
        true,
      );
      const find = (kind: string) =>
        before.reports.find((report) => report.kind === kind)!;
      await decide(find("question"), "hide");
      await decide(find("answer"), "hide");
      await decide(find("experience"), "hide");
      const after = await dashboard();
      assert.equal(after.open_count, 0);
      assert.equal(
        after.recent.filter(({ resolution }) => resolution === "hidden").length,
        4,
      );
      assert.deepEqual(
        new Set(after.hidden.map(({ id }) => id)),
        new Set([question, answer, experience]),
      );
      assert.deepEqual(
        (await feed()).map(({ id }) => id),
        [operatorExperience],
      );
      await restore(question, "question");
      await restore(answer, "answer");
      await restore(experience, "experience");
      assert.deepEqual(
        (
          await db.query(
            "select status, discoverable, delivered_count from tb_private.questions where id=$1",
            [question],
          )
        ).rows,
        [{ status: "closed", discoverable: false, delivered_count: 1 }],
      );
      assert.deepEqual(
        (
          await db.query("select tb_private.can_read($1,$2) as visible", [
            operator,
            question,
          ])
        ).rows,
        [{ visible: false }],
      );
      await call(
        author,
        "report",
        { question_id: question, answer_id: answer, reason: "Neuer Hinweis" },
        "tb_v2",
      );
      await decide((await dashboard()).reports[0], "hide");
      await call(reader, "delete_answer", { answer_id: answer }, "tb_v2");
      await assert.rejects(restore(answer, "answer"), /NOT_FOUND/);
    },
  );

  await t.test(
    "Suspension revokes gate access and is reversible until account deletion starts",
    async () => {
      await call(
        reader,
        "experience_report",
        { id: operatorExperience, reason: "Prüfung des Kontos" },
        "tb_v2_discover",
      );
      const operatorReport = (await dashboard()).reports[0];
      await assert.rejects(decide(operatorReport, "ban"), /FORBIDDEN/);
      await decide(operatorReport, "dismiss");
      assert.equal(
        (await dashboard()).recent.some(
          ({ resolution }) => resolution === "dismissed",
        ),
        true,
      );
      for (let i = 0; i < 2; i++) {
        await call(
          reader,
          "experience_report",
          { id: experience, reason: "Prüfung des Zugangs" },
          "tb_v2_discover",
        );
        await decide((await dashboard()).reports[0], "ban");
        await assert.rejects(
          call(author, "snapshot", {}, "tb_v2"),
          /BETA_REQUIRED/,
        );
        assert.deepEqual(
          (await dashboard()).accounts.map(({ id }) => id),
          [author],
        );
        if (i === 0) {
          await call(operator, "moderation_unsuspend", { id: author });
          await call(author, "snapshot", {}, "tb_v2");
        }
      }
      await call(author, "delete_account_prepare");
      assert.deepEqual((await dashboard()).accounts, []);
      await assert.rejects(
        call(operator, "moderation_unsuspend", { id: author }),
        /NOT_FOUND/,
      );
    },
  );
});
