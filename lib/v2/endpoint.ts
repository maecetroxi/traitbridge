import {
  V2Error,
  prepareAccountDeletion,
  runAction,
  type Admin,
} from "./server";

// Shared by Next.js and Supabase Edge. The verified Auth identity is the only
// source of the actor ID. Neither user metadata nor request data grants access.
export async function executeV2(
  admin: Admin,
  method: string,
  token: string | undefined,
  body: unknown,
) {
  if (!["POST", "DELETE"].includes(method))
    throw new V2Error("METHOD_NOT_ALLOWED", 405);
  if (!token) throw new V2Error("AUTH_REQUIRED", 401);
  const {
    data: { user },
    error,
  } = await admin.auth.getUser(token);
  if (error || !user || user.is_anonymous)
    throw new V2Error("AUTH_REQUIRED", 401);
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new V2Error("INVALID_INPUT");
  const input = body as Record<string, unknown>;
  if (method === "DELETE") {
    if (input.confirmation !== "DELETE")
      throw new V2Error("CONFIRMATION_REQUIRED");
    await prepareAccountDeletion(admin, user.id);
    const signOut = await admin.auth.admin.signOut(token, "global");
    if (signOut.error) throw new V2Error("DELETE_FAILED", 503);
    const deleted = await admin.auth.admin.deleteUser(user.id);
    if (deleted.error) throw new V2Error("DELETE_FAILED", 503);
    return { ok: true };
  }
  const { action, data = {} } = input;
  if (
    typeof action !== "string" ||
    !data ||
    typeof data !== "object" ||
    Array.isArray(data)
  )
    throw new V2Error("INVALID_INPUT");
  // Account deactivation is an internal step of explicit account deletion.
  if (action === "delete_account_prepare") throw new V2Error("UNKNOWN_ACTION");
  return runAction(admin, user.id, action, data as Record<string, unknown>);
}
