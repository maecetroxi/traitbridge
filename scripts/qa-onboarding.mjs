/** Local-only browser test for the real app/SDK, mocked GoTrue/Turnstile and local SQL. */
import assert from "node:assert/strict";
import { createHash, randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = "http://127.0.0.1:3200";
const storageKey = "sb-localhost-auth-token";
const output = process.env.QA_SCREENSHOT_DIR || "docs/screenshots/v2/registrierung";
const pass = "Local-QA-1234";
const codes = new Map();
const errors = [];
const checks = [];
const email = (n) => `qa-${n}@example.invalid`;
const id = (n) => `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const user = (n) => ({
  id: id(n),
  email: email(n),
  role: "authenticated",
  aud: "authenticated",
  is_anonymous: false,
  app_metadata: {},
  user_metadata: {},
  created_at: "2026-11-15T09:00:00Z",
});
const token = (n) =>
  [
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ),
    Buffer.from(
      JSON.stringify({
        sub: id(n),
        exp: 4102444800,
        role: "authenticated",
        is_anonymous: false,
      }),
    ).toString("base64url"),
    "local-qa-only",
  ].join(".");
const session = (n) => ({
  access_token: token(n),
  token_type: "bearer",
  expires_in: 3600,
  expires_at: 4102444800,
  refresh_token: "local-qa-refresh",
  user: user(n),
});
const captcha = "fixture-captcha";
const widget = `
  const currentScript = new URL(document.currentScript.src);
  const widgets = new Map();
  window.turnstile = {
    render(node, options) {
      const id = String(widgets.size + 1);
      widgets.set(id, options.callback);
      const status = document.createElement("small");
      status.textContent = "Sicherheitsprüfung (lokaler Test)";
      status.style.cssText = "display:block;padding:12px;border:1px solid #d0d5d3;border-radius:8px";
      node.replaceChildren(status);
      setTimeout(() => widgets.get(id)?.("${captcha}"), 20);
      return id;
    },
    reset(id) { setTimeout(() => widgets.get(id)?.("${captcha}"), 20); },
    remove(id) { widgets.delete(id); },
  };
  window[currentScript.searchParams.get("onload")]?.();
`;
const browser = await chromium.launch({
  ...(process.platform === "win32"
    ? {
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      }
    : {}),
});

function issue(redirect, challenge, account) {
  assert.match(challenge, /^[a-zA-Z0-9_-]{43}$/);
  const callback = new URL(redirect);
  assert.equal(callback.origin, base);
  assert.ok(callback.searchParams.get("sb_flow_id"));
  const code = randomUUID();
  codes.set(code, { challenge, account });
  callback.searchParams.set("code", code);
  return callback.href;
}

async function context(width = 1440, language = "de") {
  const ctx = await browser.newContext({
    viewport: { width, height: 950 },
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  const inbox = new Map();
  const passwords = new Map([
    [2, pass],
    [4, pass],
  ]);
  ctx.on("page", (page) =>
    page.on("pageerror", (error) => errors.push(error.message)),
  );
  await ctx.addInitScript(
    ({ locale, origin }) => {
      if (location.origin === origin)
        localStorage.setItem("traitbridge-locale", locale);
    },
    { locale: language, origin: base },
  );
  await ctx.route("**/*", async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    if (url.origin === base) return route.continue();
    if (
      url.hostname === "challenges.cloudflare.com" &&
      url.pathname.endsWith("/api.js")
    ) {
      return route.fulfill({
        contentType: "application/javascript",
        body: widget,
      });
    }
    if (
      url.origin !== "http://localhost:54325" ||
      !url.pathname.startsWith("/auth/v1/")
    )
      return route.abort();
    const headers = {
      "x-supabase-api-version": "2024-01-01",
      "access-control-allow-origin": base,
      "access-control-allow-headers":
        "authorization, apikey, content-type, x-client-info, x-supabase-api-version",
      "access-control-allow-methods": "GET,POST,PUT,OPTIONS",
      "access-control-expose-headers": "x-supabase-api-version",
    };
    if (req.method() === "OPTIONS")
      return route.fulfill({ status: 204, headers });
    const reply = (data, status = 200) =>
      route.fulfill({ json: data, status, headers });
    const body = req.postDataJSON() ?? {};
    const path = url.pathname.replace("/auth/v1/", "");
    const account = Number(/^qa-(\d)@example\.invalid$/.exec(body.email)?.[1]);
    const grant = url.searchParams.get("grant_type");
    const redirect = url.searchParams.get("redirect_to");
    if (path === "authorize") {
      assert.equal(url.searchParams.get("provider"), "google");
      return route.fulfill({
        status: 302,
        headers: {
          location: issue(redirect, url.searchParams.get("code_challenge"), 2),
        },
      });
    }
    if (path === "token" && grant === "pkce") {
      const attempt = codes.get(body.auth_code);
      const challenge = createHash("sha256")
        .update(body.code_verifier)
        .digest("base64url");
      if (!attempt || challenge !== attempt.challenge)
        return reply({ code: "flow_state_expired" }, 400);
      codes.delete(body.auth_code);
      return reply(session(attempt.account));
    }
    if (path === "token" && grant === "refresh_token")
      return reply({ code: "refresh_token_not_found" }, 401);
    if (path === "logout") return route.fulfill({ status: 204, headers });
    if (path === "user" && req.method() === "PUT") {
      assert.equal(req.headers().authorization, `Bearer ${token(4)}`);
      passwords.set(4, body.password);
      return reply(user(4));
    }
    assert.equal(body.gotrue_meta_security?.captcha_token, captcha);
    if (path === "signup") {
      assert.ok([5, 6].includes(account));
      passwords.set(account, body.password);
      inbox.set(
        `signup-${account}`,
        issue(redirect, body.code_challenge, account),
      );
      return reply(user(account));
    }
    if (path === "recover") {
      if (passwords.has(account))
        inbox.set(
          `recover-${account}`,
          issue(redirect, body.code_challenge, account),
        );
      return reply({});
    }
    if (path === "otp") {
      assert.equal(body.create_user, false);
      if (passwords.has(account))
        inbox.set(
          `magic-${account}`,
          issue(redirect, body.code_challenge, account),
        );
      return reply({});
    }
    if (path === "token" && grant === "password") {
      if (passwords.get(account) !== body.password)
        return reply(
          {
            code: "invalid_credentials",
            error_code: "invalid_credentials",
            msg: "Invalid login credentials",
          },
          400,
        );
      return reply(session(account));
    }
    throw new Error(`Unexpected auth route: ${req.method()} ${url.pathname}`);
  });
  return { ctx, inbox, page: await ctx.newPage() };
}

const click = (page, name) =>
  page.getByRole("button", { name, exact: true }).click();
const link = (page, name) =>
  page.getByRole("link", { name, exact: true }).click();
const heading = (page, name) => page.getByRole("heading", { name }).waitFor();
async function fill(page, account, password) {
  await page.getByLabel("E-Mail-Adresse", { exact: true }).fill(email(account));
  if (password)
    await page.getByLabel("Passwort", { exact: true }).fill(password);
}
async function profile(page, name) {
  await page.getByLabel("Pseudonym", { exact: true }).fill(name);
  await page.getByRole("checkbox").nth(0).check();
  await page.getByRole("checkbox").nth(1).check();
  await click(page, "Profil speichern");
}
async function shot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  await page.screenshot({
    path: `${output}/${name}.png`,
    fullPage: true,
    animations: "disabled",
  });
}

try {
  await mkdir(output, { recursive: true });
  const guest = await context(390);
  await guest.page.goto(base);
  assert.equal(await guest.page.locator("#question-body").count(), 0);
  await shot(guest.page, "01-start-mobil");
  await link(guest.page, "Frage stellen");
  await heading(guest.page, "Konto erstellen");
  assert.equal(
    new URL(guest.page.url()).searchParams.get("returnTo"),
    "/?action=ask",
  );
  assert.equal(
    await guest.page.locator("#password").getAttribute("autocomplete"),
    "new-password",
  );
  await fill(guest.page, 5, pass);
  await click(guest.page, "Konto erstellen");
  await heading(guest.page, "Posteingang prüfen");
  await shot(guest.page, "02-registrierung-email-mobil");
  assert.equal(
    await guest.page.evaluate((key) => localStorage.getItem(key), storageKey),
    null,
  );
  await guest.page.goto(guest.inbox.get("signup-5"));
  await heading(guest.page, "Beta-Zugang");
  assert.match(
    await guest.page.getByRole("status").last().innerText(),
    /nicht für die geschlossene Beta/i,
  );
  assert.equal(await guest.page.locator("#question-body").count(), 0);
  assert.ok(!guest.page.url().includes("code="));
  checks.push("New ask intent, signup, PKCE confirmation, beta denial");

  const action = await context();
  await action.page.goto(base + "/test?short=1");
  await action.page.getByRole("dialog").waitFor();
  for (let i = 0; i < 10; i++) {
    await action.page.getByRole("radio").nth(2).check();
    await action.page
      .getByRole("dialog")
      .getByRole("button", {
        name: i === 9 ? "Orientierung anzeigen" : "Weiter",
        exact: true,
      })
      .click();
  }
  await action.page
    .getByRole("dialog")
    .getByRole("heading", { name: "Deine grobe Orientierung" })
    .waitFor();
  await action.page.goto(base);
  await link(action.page, "Frage stellen");
  await fill(action.page, 6, pass);
  await click(action.page, "Konto erstellen");
  await heading(action.page, "Posteingang prüfen");
  // Opening the email in a new tab must still pick up the guest assessment.
  const emailTab = await action.ctx.newPage();
  await emailTab.goto(action.inbox.get("signup-6"));
  await heading(emailTab, "Testergebnis übernehmen");
  await shot(emailTab, "03-testergebnis-desktop");
  await click(emailTab, "Big-Five-Kurztest aus diesem Browser verwenden");
  await heading(emailTab, "Pseudonym und Einwilligung");
  await shot(emailTab, "04-profil-desktop");
  await profile(emailTab, "Testfarn");
  await emailTab.waitForURL(base + "/?action=ask");
  await emailTab.locator("#question-body:focus").waitFor();
  const snapshot = await fetch(base + "/api/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token(6)}`,
    },
    body: JSON.stringify({ action: "snapshot" }),
  }).then((r) => r.json());
  assert.equal(snapshot.data.profile.assessment.source, "device_test");
  assert.equal(
    snapshot.data.profile.assessment.version,
    "traitbridge-short-v1",
  );
  checks.push(
    "Guest quick test, explicit import across tabs, raw rescore, focused composer",
  );

  const existing = await context();
  await existing.page.goto(base);
  await link(existing.page, "Jemandem helfen");
  await existing.page
    .locator(".login-card")
    .getByRole("link", { name: "Anmelden", exact: true })
    .click();
  await fill(existing.page, 2, "wrong-password");
  await click(existing.page, "Anmelden");
  await existing.page
    .getByRole("alert")
    .filter({ hasText: "E-Mail oder Passwort stimmen nicht." })
    .waitFor();
  await fill(existing.page, 2, pass);
  await click(existing.page, "Anmelden");
  await existing.page.waitForURL(base + "/?action=help");
  await existing.page.locator("#help-title:focus").waitFor();
  assert.equal(
    await existing.page.locator("text=Pseudonym und Einwilligung").count(),
    0,
  );
  const privateText =
    "Private lokale QA-Frage, die vor einem Kontowechsel ausgeblendet werden muss.";
  await existing.page.locator("#question-body").fill(privateText);
  await click(existing.page, "Meine Frage losschicken");
  await heading(existing.page, "Deine Frage ist unterwegs.");
  await existing.page.goto(base + "/messages");
  await existing.page.getByText(privateText).first().waitFor();
  await existing.page.goto(base + "/login?mode=forgot");
  await fill(existing.page, 4);
  await click(existing.page, "Link senden");
  await heading(existing.page, "Posteingang prüfen");
  await existing.page.goto(existing.inbox.get("recover-4"));
  await existing.page.getByLabel("Neues Passwort").fill("Local-QA-reset-456");
  await shot(existing.page, "05-passwort-zuruecksetzen-desktop");
  await click(existing.page, "Passwort speichern");
  await existing.page.getByText("Dein Passwort wurde geändert.").waitFor();
  assert.equal(
    await existing.page.evaluate(
      (key) => JSON.parse(localStorage.getItem(key)).user.id,
      storageKey,
    ),
    id(2),
  );
  await existing.page.goto(base + "/me");
  await click(existing.page, "Abmelden");
  await existing.page
    .getByRole("link", { name: "Anmelden", exact: true })
    .last()
    .waitFor();
  await existing.page.goto(base + "/messages");
  assert.equal(await existing.page.getByText(privateText).count(), 0);
  await existing.page.goto(base + "/login?returnTo=%2F%3Faction%3Dhelp");
  await fill(existing.page, 4, "Local-QA-reset-456");
  await click(existing.page, "Anmelden");
  await heading(existing.page, "Testergebnis übernehmen");
  await click(
    existing.page,
    "Ausführlicher Big-Five-Test aus dem Konto verwenden",
  );
  await profile(existing.page, "Altprofil");
  await existing.page.waitForURL(base + "/?action=help");
  await existing.page.goto(base + "/messages");
  assert.equal(await existing.page.getByText(privateText).count(), 0);
  checks.push(
    "Help intent, password sign-in and reset, recovery session isolated, existing V1 assessment, account switch",
  );

  const interrupted = await context(390);
  await interrupted.page.goto(
    base + "/login/reset?error_code=otp_expired&returnTo=%2F%3Faction%3Dask",
  );
  await interrupted.page
    .getByRole("alert")
    .filter({ hasText: /Link ist abgelaufen/ })
    .waitFor();
  await interrupted.page.goto(
    base +
      "/login/confirm?code=foreign&sb_flow_id=091998ab-601e-4d11-889f-cccd07d4ae63",
  );
  await interrupted.page
    .getByRole("alert")
    .filter({ hasText: /Link ist ungültig/ })
    .waitFor();
  // Test the configured UI/PKCE callback against a fake Google redirect only.
  await interrupted.page.goto(base + "/login?returnTo=%2F%3Faction%3Dhelp");
  await click(interrupted.page, "Mit Google fortfahren");
  await interrupted.page.waitForURL(base + "/?action=help");
  await interrupted.page.locator("#help-title:focus").waitFor();
  checks.push(
    "Expired link, foreign browser link and configured Google OAuth simulation",
  );

  const resume = await context();
  await resume.page.addInitScript(
    ({ key, value, origin }) => {
      if (location.origin === origin && !localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(value));
    },
    { key: storageKey, value: session(1), origin: base },
  );
  await resume.page.goto(base + "/onboarding");
  await heading(resume.page, "Big-Five-Kurztest");
  const first = await resume.page.locator("legend").innerText();
  await resume.page.getByRole("radio").nth(2).check();
  await click(resume.page, "Weiter");
  await resume.page.reload();
  await heading(resume.page, "Big-Five-Kurztest");
  assert.notEqual(await resume.page.locator("legend").innerText(), first);
  await resume.page.getByText("2 / 10", { exact: true }).waitFor();
  checks.push("Interrupted onboarding resumes the same account draft");

  const english = await context(390, "en");
  await english.page.goto(base + "/login");
  await heading(english.page, "Sign in");
  assert.equal(
    await english.page.locator("#password").getAttribute("autocomplete"),
    "current-password",
  );
  assert.equal(
    await english.page.getByRole("button", { name: /Apple/ }).count(),
    0,
  );
  assert.equal(
    await english.page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  checks.push(
    "English login, responsive layout, password-manager semantics, Apple hidden",
  );

  const magic = await context();
  await magic.page.goto(base + "/login?mode=magic");
  await fill(magic.page, 2);
  await click(magic.page, "Link senden");
  await heading(magic.page, "Posteingang prüfen");
  await magic.page.goto(magic.inbox.get("magic-2"));
  await magic.page.waitForURL(base + "/");
  await magic.page.getByRole("heading", { name: /Wiesenwind/ }).waitFor();
  checks.push("Optional magic link signs in an existing account");

  const expired = await context();
  await expired.page.addInitScript(
    ({ key, value, origin }) => {
      if (location.origin === origin)
        localStorage.setItem(key, JSON.stringify(value));
    },
    { key: storageKey, value: { ...session(2), expires_at: 1 }, origin: base },
  );
  await expired.page.goto(base + "/messages");
  await expired.page
    .locator(".tb-empty")
    .getByRole("link", { name: "Anmelden", exact: true })
    .waitFor();
  assert.equal(await expired.page.getByText(privateText).count(), 0);
  checks.push(
    "Expired app session does not expose private data when refresh fails",
  );
  assert.deepEqual(errors, []);
  for (const check of checks) console.log("PASS", check);
} finally {
  await browser.close();
}
