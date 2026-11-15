import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLoginPath,
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
