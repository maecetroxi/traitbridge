/** Requires scripts/qa-server.ts and Next dev configured as documented in docs/V2.md. */
import { chromium } from "playwright";
import fs from "node:fs/promises";
import assert from "node:assert/strict";
const base = "http://127.0.0.1:3200";
const ids = [
  "10000000-0000-4000-8000-000000000001",
  "10000000-0000-4000-8000-000000000002",
  "10000000-0000-4000-8000-000000000003",
];
const token = (id) =>
  [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(
      JSON.stringify({
        sub: id,
        exp: 4102444800,
        role: "authenticated",
        is_anonymous: false,
      }),
    ).toString("base64url"),
    "local-qa-only",
  ].join(".");
const browser = await chromium.launch({
  headless: true,
  ...(process.platform === "win32"
    ? {
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      }
    : {}),
});
const errors = [];
const pages = [];
const checks = [];
async function context(index) {
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    reducedMotion: "reduce",
  });
  await ctx.route("**/*", (route) => {
    const url = new URL(route.request().url());
    return ["127.0.0.1", "localhost"].includes(url.hostname) ||
      !url.protocol.startsWith("http")
      ? route.continue()
      : route.abort();
  });
  if (index !== undefined)
    await ctx.addInitScript(
      ({ id, access_token, storageKey }) => {
        localStorage.setItem("traitbridge-locale", "de");
        if (!localStorage.getItem(storageKey))
          localStorage.setItem(
            storageKey,
            JSON.stringify({
              access_token,
              refresh_token: "local-qa",
              expires_at: 4102444800,
              expires_in: 3600,
              token_type: "bearer",
              user: {
                id,
                email: "qa@example.invalid",
                role: "authenticated",
                aud: "authenticated",
                is_anonymous: false,
                app_metadata: {},
                user_metadata: {},
                created_at: "2026-11-15T09:00:00Z",
              },
            }),
          );
      },
      { id: ids[index], access_token: token(ids[index]), storageKey: process.env.QA_AUTH_STORAGE_KEY || "sb-127-auth-token" },
    );
  const page = await ctx.newPage();
  pages.push(page);
  page.on("pageerror", (e) => errors.push(e.message));
  return { ctx, page };
}
async function call(index, action, data = {}) {
  const response = await fetch(base + "/api/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token(ids[index])}`,
    },
    body: JSON.stringify({ action, data }),
  });
  const body = await response.json();
  assert.equal(response.status, 200, JSON.stringify(body));
  return body.data;
}
async function screenshot(page, name, width = 1440) {
  await page.setViewportSize({ width, height: width < 641 ? 844 : 1000 });
  await page.waitForTimeout(250);
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );
  assert.equal(overflow, false, `${name} overflows at ${width}`);
  const folder = `test-results/v2-browser/${width < 641 ? "mobile" : "desktop"}`;
  await fs.mkdir(folder, { recursive: true });
  await page.screenshot({
    path: `${folder}/${name}-${width}.png`,
    fullPage: true,
  });
  checks.push(`${name} ${width}px: no horizontal overflow`);
}
try {
  const guest = await context();
  const unauthorised = await fetch(base + "/api/v2", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "snapshot" }),
  });
  assert.equal(unauthorised.status, 401);
  await guest.page.goto(base, { waitUntil: "networkidle" });
  await guest.page.getByRole("heading", { name: /Manchmal hilft/ }).waitFor();
  for (const width of [375, 390, 768, 1024, 1280, 1440, 1920])
    await screenshot(guest.page, "start-guest", width);
  const first = await context(0);
  await first.page.goto(base + "/onboarding", { waitUntil: "networkidle" });
  await first.page.getByRole("heading", { name: "Big-Five-Kurztest", exact: true }).waitFor();
  for (let i = 0; i < 10; i++) {
    await first.page.getByRole("radio").nth(2).check();
    await first.page
      .getByRole("button", {
        name: "Weiter",
        exact: true,
      })
      .click();
  }
  await first.page
    .getByRole("heading", { name: "Pseudonym und Einwilligung" })
    .waitFor();
  await screenshot(first.page, "onboarding", 1440);
  await screenshot(first.page, "onboarding", 390);
  await first.page
    .getByLabel("Pseudonym", { exact: true })
    .fill("Farnfreund");
  await first.page.getByRole("checkbox").nth(0).check();
  await first.page.getByRole("checkbox").nth(1).check();
  await first.page
    .getByRole("button", { name: "Profil speichern", exact: true })
    .click();
  await first.page.waitForURL(base + "/");
  await first.page.getByRole("heading", { name: /Farnfreund/ }).waitFor();
  checks.push(
    "Onboarding: ten raw answers, avatar and explicit consent saved via real Next API",
  );
  await first.page
    .getByLabel("Deine persönliche Frage", { exact: true })
    .fill(
      "Ich sage oft Ja, obwohl ich Nein meine. Was hat euch persönlich geholfen, Grenzen zu setzen?",
    );
  await first.page
    .getByRole("button", { name: "Meine Frage losschicken", exact: true })
    .click();
  await first.page
    .getByRole("heading", { name: "Deine Frage ist unterwegs." })
    .waitFor();
  const own = await call(0, "snapshot");
  const q = own.questions[0];
  assert.equal(q.discoverable, false);
  assert.equal(
    (await call(1, "discover")).some((x) => x.id === q.id),
    false,
  );
  checks.push("Private question created and excluded from Discover");
  const second = await context(1);
  let failOnce = true;
  await second.ctx.route("**/api/v2", async (route) => {
    const body = route.request().postDataJSON();
    if (body.action === "answer" && failOnce) {
      failOnce = false;
      return route.fulfill({
        status: 503,
        contentType: "application/json",
        body: JSON.stringify({ error: "SERVER_ERROR" }),
      });
    }
    return route.continue();
  });
  await second.page.goto(base, { waitUntil: "networkidle" });
  await second.page
    .getByRole("button", { name: "Meine Erfahrung teilen", exact: true })
    .click();
  await second.page
    .getByLabel("Was hat dir persönlich geholfen?", { exact: true })
    .fill(
      "Mir hat es geholfen, erst einmal um Bedenkzeit zu bitten. So konnte ich später in Ruhe entscheiden, was sich für mich richtig anfühlt.",
    );
  await second.page
    .getByRole("button", { name: "Antwort senden", exact: true })
    .click();
  await second.page.locator(".tb-error[role=alert]").waitFor();
  assert.ok(
    (
      await second.page
        .getByLabel("Was hat dir persönlich geholfen?", { exact: true })
        .inputValue()
    ).includes("Bedenkzeit"),
  );
  await second.page
    .getByRole("button", { name: "Antwort senden", exact: true })
    .click();
  await second.page
    .getByRole("heading", { name: "Deine Erfahrung ist angekommen." })
    .waitFor();
  checks.push(
    "Second account reserved a slot and sent a real saved reply through the UI",
  );
  await first.page.goto(base + "/messages?id=" + q.id, {
    waitUntil: "networkidle",
  });
  await first.page
    .getByText("Mir hat es geholfen, erst einmal um Bedenkzeit zu bitten.", {
      exact: false,
    })
    .waitFor();
  await screenshot(first.page, "nachrichten", 1440);
  await screenshot(first.page, "nachrichten", 390);
  await first.page
    .getByRole("button", { name: "Danke sagen", exact: true })
    .click();
  await first.page
    .getByLabel("Dein Danke (optional mit Nachricht)", { exact: true })
    .fill("Danke für deine Erfahrung, das werde ich ausprobieren.");
  await first.page
    .getByRole("button", { name: "Danke senden", exact: true })
    .click();
  await first.page.getByText(/Ein persönliches Danke/).waitFor();
  assert.ok(
    (await call(1, "snapshot")).notifications.some((n) => n.kind === "thanks"),
  );
  checks.push(
    "Question author read reply and sent a genuine thank-you notification",
  );
  const secondState = await call(1, "snapshot");
  assert.equal(secondState.answers.length, 1);
  assert.equal((await call(2, "snapshot")).answers.length, 0);
  checks.push("Unrelated third account cannot read private replies");
  await first.page.goto(base, { waitUntil: "networkidle" });
  await screenshot(first.page, "start", 1440);
  await screenshot(first.page, "start", 390);
  await first.page
    .getByRole("link", { name: "Entdecken", exact: true })
    .click();
  await first.page
    .getByText(/In einer neuen Gruppe/)
    .waitFor();
  await screenshot(first.page, "entdecken", 1440);
  await screenshot(first.page, "entdecken", 390);
  await first.page.goto(base + "/me", { waitUntil: "networkidle" });
  await first.page
    .getByRole("heading", { name: "Hallo, das bin ich." })
    .waitFor();
  await screenshot(first.page, "ich", 1440);
  await screenshot(first.page, "ich", 390);
  await first.page.getByRole("button", { name: "Sprache DE ▾" }).count();
  await first.page.locator(".locale-switcher-trigger").click();
  await first.page
    .getByRole("button", { name: "English", exact: false })
    .click();
  await first.page
    .getByRole("heading", { name: "A little about me." })
    .waitFor();
  checks.push("Language switch changes V2 interface to English");
  await screenshot(first.page, "me-english", 390);
  for (const route of [
    "/",
    "/messages",
    "/me",
    "/onboarding",
    "/test/full?lang=de",
    "/learn",
  ]) {
    await guest.page.goto(base + route, { waitUntil: "networkidle" });
    for (const width of [375, 390, 768, 1024, 1280, 1440, 1920]) {
      await guest.page.setViewportSize({ width, height: 900 });
      await guest.page.waitForTimeout(80);
      assert.equal(
        await guest.page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth,
        ),
        false,
        `${route} overflows at ${width}`,
      );
    }
  }
  checks.push(
    "Guest messages, Me, onboarding, full test and learning fit all seven widths",
  );
  const third = await context(2);
  await third.page.goto(base + "/me", { waitUntil: "networkidle" });
  await third.page
    .getByRole("button", { name: "Konto löschen", exact: true })
    .click();
  await third.page
    .getByLabel("Tippe DELETE zur Bestätigung", { exact: true })
    .fill("DELETE");
  await third.page
    .getByRole("button", { name: "Konto endgültig löschen", exact: true })
    .click();
  await third.page.waitForURL(base + "/");
  const deleted = await fetch(base + "/api/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token(ids[2])}`,
    },
    body: JSON.stringify({ action: "snapshot" }),
  });
  assert.equal(deleted.status, 401);
  checks.push(
    "Account deletion revokes sessions, cascades records and rejects the old token",
  );
  assert.deepEqual(errors, []);
  await fs.mkdir("test-results", { recursive: true });
  await fs.writeFile(
    "test-results/v2-browser.json",
    JSON.stringify({ checks, pageErrors: errors }, null, 2),
  );
  console.log(JSON.stringify({ checks, pageErrors: errors }, null, 2));
} catch (error) {
  await fs.mkdir("test-results", { recursive: true });
  for (const [index, page] of pages.entries()) {
    await page
      .screenshot({
        path: `test-results/browser-failure-${index}.png`,
        fullPage: true,
      })
      .catch(() => {});
    console.log(
      index,
      page.url(),
      (await page.locator("body").innerText()).slice(-4000),
    );
  }
  throw error;
} finally {
  await browser.close();
}
