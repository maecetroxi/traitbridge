import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLoginPath,
  afterSignIn,
  authCallbackUrl,
  getAuthCallbackErrorCode,
  sanitizeReturnPath,
} from "../lib/return-path";

test("keeps only safe same-origin return paths", () => {
  assert.equal(sanitizeReturnPath("/community/post?view=all"), "/community/post?view=all");
  assert.equal(sanitizeReturnPath("https://example.com"), "/");
  assert.equal(sanitizeReturnPath("//example.com"), "/");
  assert.equal(sanitizeReturnPath("/\\example.com"), "/");
  assert.equal(sanitizeReturnPath(["/profile"]), "/");
});

test("participation intents survive sign-in and defer to onboarding only when needed", () => {
  assert.equal(afterSignIn("/?action=ask", true, true), "/?action=ask");
  assert.equal(afterSignIn("/?action=help", false, true), "/onboarding?returnTo=%2F%3Faction%3Dhelp");
  assert.equal(afterSignIn("/?action=ask", false, false), "/onboarding?returnTo=%2F%3Faction%3Dask");
  assert.equal(afterSignIn("/profile?view=details", false, false), "/profile?view=details");
});

test("callback URLs keep a local return path and reject ambiguous destinations", () => {
  for (const value of ["/%2fexample.org", "/%5cexample.org", "/a/../login/confirm", "/login/reset", "/a\\b", "/\t/a", "//example.org"]) {
    assert.equal(sanitizeReturnPath(value), "/", value);
  }
  const confirm = new URL(authCallbackUrl("https://traitbridge.com", false, "/?action=help", "ticket"));
  assert.equal(confirm.origin, "https://traitbridge.com");
  assert.equal(confirm.pathname, "/login/confirm");
  assert.equal(confirm.searchParams.get("returnTo"), "/?action=help");
  assert.equal(confirm.searchParams.get("test"), "ticket");
  const reset = new URL(authCallbackUrl("https://traitbridge.com", true, "//external.example", "ticket"));
  assert.equal(reset.pathname, "/login/reset");
  assert.equal(reset.searchParams.get("returnTo"), "/");
  assert.equal(reset.searchParams.has("test"), false);
});

test("builds a login URL with an encoded return destination", () => {
  assert.equal(
    buildLoginPath("/community/example?view=details"),
    "/login?returnTo=%2Fcommunity%2Fexample%3Fview%3Ddetails",
  );
});

test("recognizes Supabase callback errors without exposing their description", () => {
  assert.equal(
    getAuthCallbackErrorCode("#error=access_denied&error_code=otp_expired&error_description=Expired"),
    "otp_expired",
  );
  assert.equal(getAuthCallbackErrorCode("#error=server_error"), "unknown");
  assert.equal(getAuthCallbackErrorCode("#access_token=secret"), null);
  assert.equal(getAuthCallbackErrorCode(""), null);
});
