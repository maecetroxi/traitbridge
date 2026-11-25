// Server imports only. Never import this module into a component or browser helper.
import { createClient } from "@supabase/supabase-js";
import {
  assessmentVersions,
  parseAssessmentDraft,
  scoreAssessment,
} from "./assessment.ts";
import { validAvatar } from "./avatar.ts";
import {
  classifyTopic,
  rankMatches,
  validScores,
  type MatchCandidate,
  type MatchReader,
} from "./matching.ts";
import {
  topics,
  type AssessmentMetadata,
  type AssessmentVariant,
  type DiscoverItem,
  type DiscoverPage,
} from "./types.ts";

export class V2Error extends Error {
  constructor(
    public code: string,
    public status = 400,
  ) {
    super(code);
  }
}
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function uuid(value: unknown) {
  if (typeof value !== "string" || !uuidPattern.test(value))
    throw new V2Error("INVALID_INPUT");
  return value;
}
function text(value: unknown, min: number, max: number) {
  if (
    typeof value !== "string" ||
    value.trim().length < min ||
    value.trim().length > max ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
  )
    throw new V2Error("INVALID_INPUT");
  return value.trim();
}
function topicArray(value: unknown) {
  if (
    !Array.isArray(value) ||
    value.length > topics.length ||
    value.some((x) => !topics.includes(x))
  )
    throw new V2Error("INVALID_INPUT");
  return [...new Set(value)];
}
const discoverLists = new Set([
  "discover_feed",
  "discover_saved",
  "discover_own",
]);
const discoverActions = new Set([
  ...discoverLists,
  "discover_personality",
  "experience_publish",
  "experience_edit",
  "experience_delete",
  "discover_bookmark",
  "experience_helpful",
  "experience_report",
  "discover_block",
  "discover_unshare",
]);
function discoverKind(value: unknown) {
  if (value !== "question" && value !== "experience")
    throw new V2Error("INVALID_INPUT");
  return value;
}
function discoverTopic(value: unknown) {
  if (value === undefined || value === "") return undefined;
  const topic = topics.find((candidate) => candidate === value);
  if (!topic) throw new V2Error("INVALID_INPUT");
  return topic;
}
function validateDiscover(action: string, data: Record<string, unknown>) {
  if (action === "discover_personality") {
    if (typeof data.enabled !== "boolean") throw new V2Error("INVALID_INPUT");
    return { enabled: data.enabled };
  }
  if (discoverLists.has(action)) {
    if (
      action === "discover_feed" &&
      data.perspective !== undefined &&
      data.perspective !== "similar" &&
      data.perspective !== "different"
    )
      throw new V2Error("INVALID_INPUT");
    const scope =
      action === "discover_feed"
        ? {
            kind: data.kind === undefined ? undefined : discoverKind(data.kind),
            topic: discoverTopic(data.topic),
            perspective: data.perspective,
          }
        : {};
    if (data.cursor === undefined) return scope;
    if (
      !data.cursor ||
      typeof data.cursor !== "object" ||
      Array.isArray(data.cursor)
    )
      throw new V2Error("INVALID_INPUT");
    const { at, id, kind } = data.cursor as Record<string, unknown>;
    if (
      typeof at !== "string" ||
      at.length > 40 ||
      !/^\d{4}-\d{2}-\d{2}T/.test(at) ||
      !Number.isFinite(Date.parse(at))
    )
      throw new V2Error("INVALID_INPUT");
    return {
      ...scope,
      before_at: at,
      before_id: uuid(id),
      before_kind: discoverKind(kind),
    };
  }
  if (action === "experience_publish" || action === "experience_edit") {
    const body = text(data.body, 20, 4000);
    const heading = data.title === undefined ? "" : text(data.title, 0, 100);
    if (((heading + " " + body).match(/https?:\/\//gi) || []).length > 2)
      throw new V2Error("SPAM");
    return {
      ...(action === "experience_edit" ? { id: uuid(data.id) } : {}),
      title: heading || null,
      body,
      topic: discoverTopic(data.topic) ?? classifyTopic(body),
    };
  }
  const id = uuid(data.id);
  if (action === "experience_delete" || action === "discover_unshare")
    return { id };
  if (action === "experience_report")
    return { id, kind: "experience", reason: text(data.reason, 3, 1000) };
  const kind =
    action === "experience_helpful" ? "experience" : discoverKind(data.kind);
  if (action === "discover_block") return { id, kind };
  if (typeof data.enabled !== "boolean") throw new V2Error("INVALID_INPUT");
  return { id, kind, enabled: data.enabled };
}
export function validateProfile(data: Record<string, unknown>) {
  if (
    !validAvatar(data.avatar) ||
    !["de", "en"].includes(String(data.language))
  )
    throw new V2Error("INVALID_INPUT");
  return {
    pseudonym: text(data.pseudonym, 2, 30),
    avatar: data.avatar,
    language: data.language,
    interests: topicArray(data.interests),
    experiences: topicArray(data.experiences),
  };
}
export function validateAction(
  action: string,
  data: Record<string, unknown>,
): Record<string, unknown> {
  if (discoverActions.has(action)) return validateDiscover(action, data);
  if (
    [
      "snapshot",
      "help",
      "discover",
      "read",
      "moderation",
      "assessment_candidate",
      "sync_full",
      "delete_account_prepare",
    ].includes(action)
  )
    return {};
  if (action === "onboard") {
    const profile = validateProfile(data);
    if (data.adult_consent !== true || data.matching_consent !== true)
      throw new V2Error("CONSENT_REQUIRED");
    const base = { ...profile, adult_consent: true, matching_consent: true };
    if (data.result_id !== undefined)
      return { ...base, result_id: uuid(data.result_id) };
    const draft = parseAssessmentDraft(
      data.device_test === undefined
        ? {
            variant: "short",
            version: assessmentVersions.short,
            language: data.language,
            answers: data.answers,
          }
        : data.device_test,
    );
    if (!draft) throw new V2Error("INVALID_INPUT");
    const assessment: AssessmentMetadata = {
      source: data.device_test === undefined ? "onboarding" : "device_test",
      variant: draft.variant,
      version: draft.version,
      language: draft.language,
    };
    return { ...base, scores: scoreAssessment(draft), assessment };
  }
  if (action === "preferences") {
    if (
      typeof data.available !== "boolean" ||
      typeof data.notifications !== "boolean"
    )
      throw new V2Error("INVALID_INPUT");
    return {
      ...validateProfile(data),
      available: data.available,
      notifications: data.notifications,
    };
  }
  if (action === "question") {
    const body = text(data.body, 20, 2000);
    if (
      typeof data.discoverable !== "boolean" ||
      (data.topic && !topics.includes(data.topic as (typeof topics)[number]))
    )
      throw new V2Error("INVALID_INPUT");
    if ((body.match(/https?:\/\//gi) || []).length > 2)
      throw new V2Error("SPAM");
    return {
      body,
      topic: data.topic || classifyTopic(body),
      discoverable: data.discoverable,
    };
  }
  if (
    ["reserve", "release", "skip", "close", "delete_question"].includes(action)
  )
    return { question_id: uuid(data.question_id) };
  if (["answer", "renew"].includes(action)) {
    const body = action === "answer" ? text(data.body, 20, 4000) : undefined;
    if (body && (body.match(/https?:\/\//gi) || []).length > 2)
      throw new V2Error("SPAM");
    return {
      question_id: uuid(data.question_id),
      reservation_id: uuid(data.reservation_id),
      ...(action === "answer" ? { body } : {}),
    };
  }
  if (action === "report")
    return {
      question_id: uuid(data.question_id),
      answer_id: data.answer_id ? uuid(data.answer_id) : null,
      reason: text(data.reason, 3, 1000),
    };
  if (action === "thanks")
    return {
      answer_id: uuid(data.answer_id),
      body: typeof data.body === "string" ? text(data.body || " ", 0, 500) : "",
    };
  if (action === "delete_answer") return { answer_id: uuid(data.answer_id) };
  if (["block", "unblock"].includes(action))
    return { user_id: uuid(data.user_id) };
  if (action === "moderate") {
    if (!["hide", "ban", "dismiss"].includes(String(data.decision)))
      throw new V2Error("INVALID_INPUT");
    if (data.kind !== undefined && data.kind !== "experience")
      throw new V2Error("INVALID_INPUT");
    return { report_id: uuid(data.report_id), decision: data.decision };
  }
  throw new V2Error("UNKNOWN_ACTION");
}
export function createAdmin(url: string, key: string) {
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
export type Admin = ReturnType<typeof createAdmin>;
export async function rpc(
  admin: Admin,
  actor: string,
  action: string,
  data: Record<string, unknown> = {},
) {
  return gateway(admin, "tb_v2", actor, action, data);
}

async function gateway(
  admin: Admin,
  name:
    | "tb_v2"
    | "tb_v2_save_assessment"
    | "tb_v2_discover"
    | "tb_v2_discover_profile",
  actor: string,
  action: string,
  data: Record<string, unknown>,
) {
  const result = await admin.rpc(name, {
    p_actor: actor,
    p_action: action,
    p_data: data,
  });
  if (result.error) {
    const codes = [
      "AUTH_REQUIRED",
      "BETA_REQUIRED",
      "ONBOARDING_REQUIRED",
      "RATE_LIMIT",
      "NO_SLOT",
      "RESERVATION_EXPIRED",
      "FORBIDDEN",
      "NOT_FOUND",
      "NOT_AVAILABLE",
      "ALREADY_ANSWERED",
      "ALREADY_ONBOARDED",
      "DUPLICATE_POST",
      "DISCOVER_TEST_REQUIRED",
      "SPAM",
    ];
    const code =
      codes.find((c) => result.error.message.includes(c)) || "SAVE_FAILED";
    throw new V2Error(
      code,
      code === "RATE_LIMIT"
        ? 429
        : code === "NOT_FOUND"
          ? 404
          : ["FORBIDDEN", "BETA_REQUIRED"].includes(code)
            ? 403
            : 409,
    );
  }
  return result.data;
}

async function ownAssessment(
  admin: Admin,
  actor: string,
  options: { resultId?: string; fullOnly?: boolean } = {},
) {
  let query = admin
    .from("personality_results")
    .select(
      "id,variant,scores,language,created_at,calculated_scores->assessment_version",
    )
    .eq("user_id", actor)
    .in("variant", options.fullOnly ? ["full"] : ["full", "short"]);
  if (options.resultId) query = query.eq("id", options.resultId);
  const { data, error } = await query
    .order("variant", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(20);
  if (error) throw new V2Error("ASSESSMENT_UNAVAILABLE", 503);
  const result = data?.find(
    (row) =>
      validScores(row.scores) &&
      (row.variant === "full" ||
        (row.variant === "short" &&
          Object.values(row.scores).every((score) =>
            Number.isInteger(score * 2),
          ))),
  );
  if (!result) return null;
  const variant = result.variant as AssessmentVariant;
  const assessment: AssessmentMetadata = {
    source: "account_result",
    resultId: result.id,
    variant,
    version:
      result.assessment_version === assessmentVersions[variant]
        ? assessmentVersions[variant]
        : null,
    language:
      result.language === "de" || result.language === "en"
        ? result.language
        : null,
    createdAt: result.created_at ?? null,
  };
  return { scores: result.scores, assessment };
}
export async function runAction(
  admin: Admin,
  actor: string,
  action: string,
  input: Record<string, unknown>,
) {
  const data = validateAction(action, input);
  if (discoverActions.has(action)) {
    const rpcName =
      discoverLists.has(action) || action === "discover_personality"
        ? "tb_v2_discover_profile"
        : "tb_v2_discover";
    const result = await gateway(admin, rpcName, actor, action, data);
    if (!discoverLists.has(action)) return result;
    const rows = result as DiscoverItem[];
    const items = rows.slice(0, 24);
    const last = items.at(-1);
    return {
      items,
      next:
        rows.length > items.length && last
          ? { at: last.created_at, id: last.id, kind: last.kind }
          : null,
    } satisfies DiscoverPage;
  }
  if (action === "moderation") {
    const reports = (await rpc(admin, actor, action)) as {
      created_at: string;
    }[];
    const experiences = (await gateway(
      admin,
      "tb_v2_discover",
      actor,
      "experience_moderation",
      {},
    )) as { created_at: string }[];
    return [...reports, ...experiences].sort(
      (a, b) => Date.parse(a.created_at) - Date.parse(b.created_at),
    );
  }
  if (action === "moderate" && input.kind === "experience")
    return gateway(admin, "tb_v2_discover", actor, "experience_moderate", {
      id: data.report_id,
      decision: data.decision,
    });
  if (action === "help") {
    const pool = (await rpc(admin, actor, "candidates")) as {
      reader: MatchReader;
      candidates: MatchCandidate[];
    };
    const matches = rankMatches(pool.reader, pool.candidates).map(
      ({ id, reason }) => ({ id, reason }),
    );
    if (matches.length) await rpc(admin, actor, "assign", { matches });
    return rpc(admin, actor, "help");
  }
  if (action === "assessment_candidate") {
    await rpc(admin, actor, "snapshot");
    return (await ownAssessment(admin, actor))?.assessment ?? null;
  }
  if (action === "onboard" || action === "sync_full") {
    if (action === "sync_full" || typeof data.result_id === "string") {
      await rpc(admin, actor, "snapshot");
      const result = await ownAssessment(admin, actor, {
        fullOnly: action === "sync_full",
        resultId:
          typeof data.result_id === "string" ? data.result_id : undefined,
      });
      if (!result)
        throw new V2Error(
          action === "sync_full"
            ? "FULL_TEST_REQUIRED"
            : "ASSESSMENT_NOT_FOUND",
        );
      return gateway(admin, "tb_v2_save_assessment", actor, action, {
        ...data,
        ...result,
      });
    }
    return gateway(admin, "tb_v2_save_assessment", actor, action, data);
  }
  return rpc(admin, actor, action, data);
}
