import { chromium } from "playwright";
import assert from "node:assert/strict";
const base = process.env.QA_PRODUCTION_URL || "http://127.0.0.1:3300";
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32"
    ? {
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      }
    : {}),
});
try {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
  });
  await context.route("**/*", (r) => {
    const u = new URL(r.request().url());
    return u.hostname === "127.0.0.1" || !u.protocol.startsWith("http")
      ? r.continue()
      : r.abort();
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  for (const route of [
    "/",
    "/messages",
    "/me",
    "/onboarding",
    "/test",
    "/learn",
    "/privacy",
    "/community-guidelines",
  ]) {
    const response = await page.goto(base + route, {
      waitUntil: "networkidle",
    });
    assert.equal(response.status(), 200);
    await page.locator("main").waitFor();
  }
  assert.deepEqual(errors, []);
  const response = await fetch(base + "/api/v2", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "snapshot" }),
  });
  assert.equal(response.status, 401);
  assert.ok(response.headers.get("cache-control").includes("no-store"));
  assert.equal((await fetch(base + "/manifest.webmanifest")).status, 200);
  assert.equal((await fetch(base + "/icons/icon-192.png")).status, 200);
  console.log(
    "Production smoke passed: 8 routes, 0 page errors, unauthorised API rejected/no-store, manifest and icon served. External browser requests blocked.",
  );
} finally {
  await browser.close();
}
