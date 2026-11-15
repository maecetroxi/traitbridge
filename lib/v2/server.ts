// Server imports only. Never import this module into a component or browser helper.
import { createClient } from "@supabase/supabase-js";
import { scoreOrientation } from "./orientation";
import { validAvatar } from "./avatar";
import {
  classifyTopic,
  rankMatches,
  validScores,
  type MatchCandidate,
  type MatchReader,
} from "./matching";
import { topics } from "./types";

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
  if (
    [
      "snapshot",
      "help",
      "discover",
      "read",
      "moderation",
      "sync_full",
      "delete_account_prepare",
    ].includes(action)
  )
    return {};
  if (action === "onboard") {
    const profile = validateProfile(data);
    if (
      data.adult_consent !== true ||
      data.matching_consent !== true ||
      !data.answers ||
      typeof data.answers !== "object" ||
      Array.isArray(data.answers)
    )
      throw new V2Error("CONSENT_REQUIRED");
    const answers = data.answers as Record<string, number>;
    if (
      Object.values(answers).some((n) => !Number.isInteger(n) || n < 1 || n > 5)
    )
      throw new V2Error("INVALID_INPUT");
    let scores;
    try {
      scores = scoreOrientation(answers);
    } catch {
      throw new V2Error("INVALID_INPUT");
    }
    return { ...profile, scores, adult_consent: true, matching_consent: true };
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
  const result = await admin.rpc("tb_v2", {
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
export async function runAction(
  admin: Admin,
  actor: string,
  action: string,
  input: Record<string, unknown>,
) {
  const data = validateAction(action, input);
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
  if (action === "sync_full") {
    const { data: result, error } = await admin
      .from("personality_results")
      .select("scores")
      .eq("user_id", actor)
      .eq("variant", "full")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (error || !validScores(result?.scores))
      throw new V2Error("FULL_TEST_REQUIRED");
    return rpc(admin, actor, action, { scores: result.scores });
  }
  return rpc(admin, actor, action, data);
}
