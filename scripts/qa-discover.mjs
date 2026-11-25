/** Real Next API + local Supabase/Edge fixture. No external requests or real accounts. */
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const base = "http://127.0.0.1:3200";
const output = process.env.QA_SCREENSHOT_DIR || "docs/screenshots/v2/entdecken";
const id = (n) => `10000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
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
const errors = [];
const browser = await chromium.launch(
  process.platform === "win32"
    ? {
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      }
    : {},
);

async function pageFor(account, width = 1440, locale = "de") {
  const ctx = await browser.newContext({
    viewport: { width, height: 850 },
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  await ctx.route("**/*", (route) =>
    new URL(route.request().url()).origin === base
      ? route.continue()
      : route.abort(),
  );
  await ctx.addInitScript(
    ({ base, locale, account, session, key }) => {
      if (location.origin !== base) return;
      localStorage.setItem("traitbridge-locale", locale);
      if (account && !localStorage.getItem(key))
        localStorage.setItem(key, JSON.stringify(session));
    },
    {
      base,
      locale,
      account,
      key: process.env.QA_AUTH_STORAGE_KEY || "sb-localhost-auth-token",
      session: account
        ? {
            access_token: token(account),
            refresh_token: "qa-session",
            expires_at: 4102444800,
            expires_in: 3600,
            token_type: "bearer",
            user: {
              id: id(account),
              email: `qa-${account}@example.invalid`,
              is_anonymous: false,
              aud: "authenticated",
              role: "authenticated",
              app_metadata: {},
              user_metadata: {},
              created_at: "2026-11-15T09:00:00Z",
            },
          }
        : null,
    },
  );
  const page = await ctx.newPage();
  page.on("pageerror", (error) => errors.push(error.message));
  return page;
}

async function api(account, action, data = {}, expected = 200) {
  const result = await fetch(base + "/api/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(account ? { Authorization: `Bearer ${token(account)}` } : {}),
    },
    body: JSON.stringify({ action, data }),
  });
  const json = await result.json();
  assert.equal(result.status, expected, JSON.stringify(json));
  return json.data ?? json;
}

const sharedQuestion = "Nach der Arbeit läuft mein Kopf oft einfach weiter.";
const title = "Ein kurzer Abschluss für den Arbeitstag";
const revised = "Feierabend mit einer kurzen Aufgabenliste";
const text =
  "Nach der Arbeit schreibe ich eine Aufgabe für morgen auf. So muss ich sie nicht im Kopf behalten und kann leichter abschalten.";
const clean = "Kurze Pausen zwischen Terminen";
const heading = (page, name) =>
  page.getByRole("heading", { name, exact: true });
const button = (target, name) =>
  target.getByRole("button", { name, exact: true });
const article = (page, title) =>
  page.locator("article").filter({ hasText: title });
async function publish(page, title, body, topic) {
  await page
    .getByRole("link", { name: "Erfahrung teilen", exact: true })
    .click();
  await page.getByLabel("Deine Erfahrung", { exact: true }).fill(body);
  if (title)
    await page.getByLabel("Titel (optional)", { exact: true }).fill(title);
  if (topic)
    await page
      .locator(".tb-experience-form")
      .getByLabel("Thema", { exact: true })
      .selectOption(topic);
}
async function screenshot(page, filename) {
  await page.evaluate(() => document.fonts.ready);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    filename,
  );
  await page.screenshot({
    path: `${output}/${filename}.png`,
    animations: "disabled",
  });
}
async function saved(page, text) {
  await page.goto(base + "/me");
  const panel = page.locator(".tb-saved-posts");
  await button(panel, "Gemerkte Beiträge").click();
  await panel.getByText(text, { exact: true }).waitFor();
  return panel;
}

try {
  await mkdir(output, { recursive: true });
  const guest = await pageFor(undefined, 390);
  await guest.goto(base + "/discover?write=1");
  await heading(guest, "Geschlossene Beta").waitFor();
  assert.equal(await guest.locator("textarea").count(), 0);
  assert.equal(
    await guest.getByText(sharedQuestion, { exact: false }).count(),
    0,
  );
  await guest.getByRole("link", { name: "Erfahrung teilen" }).click();
  await guest.waitForURL(/\/login\?/);
  assert.equal(
    new URL(guest.url()).searchParams.get("returnTo"),
    "/discover?write=1",
  );
  assert.equal(
    (await api(null, "discover_feed", {}, 401)).error,
    "AUTH_REQUIRED",
  );
  assert.equal((await api(5, "discover_feed", {}, 403)).error, "BETA_REQUIRED");
  assert.equal(
    (await api(4, "experience_publish", { body: text }, 409)).error,
    "ONBOARDING_REQUIRED",
  );
  const pending = await pageFor(4);
  await pending.goto(base + "/discover?write=1");
  await heading(pending, "Einrichtung abschliessen").waitFor();
  assert.equal(await pending.locator("textarea").count(), 0);
  await pending.getByRole("link", { name: "Profil einrichten" }).click();
  await pending.waitForURL(/\/onboarding\?/);
  assert.equal(
    new URL(pending.url()).searchParams.get("returnTo"),
    "/discover?write=1",
  );
  console.log(
    "PASS guest, closed-beta and required onboarding gates with write intent",
  );

  const author = await pageFor(2);
  const reader = await pageFor(3);
  await author.goto(base);
  await author.getByRole("link", { name: "Entdecken", exact: true }).click();
  await heading(author, "Entdecken").waitFor();
  await publish(author, title, text);
  await author.getByText(/Vorschlag ·/).waitFor();
  await screenshot(author, "01-erfahrung-schreiben");
  await button(author, "Veröffentlichen").click();
  await heading(author, title).waitFor();
  await button(author, "Meine Erfahrungen").click();
  await button(article(author, title), "Bearbeiten").click();
  await author.getByLabel("Titel (optional)", { exact: true }).fill(revised);
  await button(author, "Änderungen speichern").click();
  await heading(author, revised).waitFor();

  await reader.goto(base + "/discover");
  await heading(reader, revised).waitFor();
  await reader.getByText(sharedQuestion, { exact: false }).waitFor();
  assert.equal(
    await reader.getByText(/Wenn alles gleichzeitig kommt/).count(),
    0,
  );
  await screenshot(reader, "02-entdecken-desktop");
  await reader
    .getByLabel("Beitragsart", { exact: true })
    .selectOption("experience");
  await heading(reader, revised).waitFor();
  assert.equal(
    await reader.getByText(sharedQuestion, { exact: false }).count(),
    0,
  );
  await reader.getByLabel("Thema", { exact: true }).selectOption("social");
  await reader
    .getByText("Keine Beiträge für diese Auswahl.", { exact: true })
    .waitFor();
  await reader.getByLabel("Thema", { exact: true }).selectOption("work");
  await heading(reader, revised).waitFor();
  await reader.setViewportSize({ width: 390, height: 845 });
  await screenshot(reader, "03-entdecken-mobil");

  const card = article(reader, revised);
  await button(card, "Hat mir geholfen").click();
  await card
    .locator('button[aria-pressed="true"]')
    .filter({ hasText: "Hat mir geholfen" })
    .waitFor();
  await button(card, "Hat mir geholfen").click();
  await card
    .locator('button[aria-pressed="false"]')
    .filter({ hasText: "Hat mir geholfen" })
    .waitFor();
  await button(card, "Merken").click();
  await button(card, "Gemerkt").waitFor();
  let panel = await saved(reader, revised);
  await panel.evaluate((element) => element.scrollIntoView({ block: "start" }));
  await screenshot(reader, "04-merkliste-mobil");
  await button(panel, "Gemerkt").click();
  await panel.getByText("Noch keine gemerkten Beiträge.").waitFor();
  console.log(
    "PASS publish, auto-topic, filter, edit, toggle helpful and bookmark",
  );

  await reader.goto(base + "/discover");
  await heading(reader, revised).waitFor();
  await button(article(reader, revised), "Merken").click();
  await button(article(reader, revised), "Gemerkt").waitFor();
  await button(article(reader, revised), "Melden / blockieren").click();
  await button(article(reader, revised), "Person blockieren").click();
  await heading(reader, revised).waitFor({ state: "detached" });
  await saved(reader, "Noch keine gemerkten Beiträge.");
  await button(reader, "Blockierung aufheben").click();
  await button(reader, "Blockierung aufheben").waitFor({ state: "detached" });
  await reader.goto(base + "/discover");
  await heading(reader, revised).waitFor();
  await button(article(reader, revised), "Melden / blockieren").click();
  await article(reader, revised)
    .getByLabel("Grund der Meldung")
    .fill("Lokaler Test der Moderationsübersicht.");
  await button(article(reader, revised), "Meldung senden").click();
  await article(reader, revised).getByText("Meldung gespeichert.").waitFor();
  assert.equal((await api(2, "moderation", {}, 403)).error, "FORBIDDEN");
  await reader.setViewportSize({ width: 1440, height: 850 });
  await reader.goto(base + "/moderation");
  await heading(reader, "Gemeldete Erfahrung").waitFor();
  await screenshot(reader, "05-moderation-desktop");
  reader.once("dialog", (dialog) => dialog.accept());
  await button(article(reader, revised), "Inhalt ausblenden").click();
  await reader.getByText("Keine offenen Meldungen.").waitFor();
  await saved(reader, "Noch keine gemerkten Beiträge.");
  await author.goto(base + "/discover");
  await button(author, "Meine Erfahrungen").click();
  await article(author, revised)
    .getByText("Ausgeblendet", { exact: true })
    .waitFor();
  assert.equal(await button(article(author, revised), "Bearbeiten").count(), 0);
  author.once("dialog", (dialog) => dialog.accept());
  await button(article(author, revised), "Löschen").click();
  await heading(author, revised).waitFor({ state: "detached" });
  console.log(
    "PASS blocking, report, moderator hide, stale bookmark and owner deletion",
  );

  await publish(
    author,
    clean,
    "Zwischen jeweils zwei Terminen mache ich am Fenster eine kurze Pause und trinke ein Glas Wasser.",
    "work",
  );
  await button(author, "Veröffentlichen").click();
  await heading(author, clean).waitFor();
  const visible = (
    await api(3, "discover_feed", { kind: "experience" })
  ).items.find((item) => item.title === clean);
  await api(3, "discover_bookmark", {
    id: visible.id,
    kind: "experience",
    enabled: true,
  });
  const response = await fetch(base + "/api/v2", {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token(2)}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ confirmation: "DELETE" }),
  });
  assert.equal(response.status, 200);
  await saved(reader, "Noch keine gemerkten Beiträge.");
  assert.equal((await api(2, "discover_feed", {}, 401)).error, "AUTH_REQUIRED");
  assert.deepEqual((await api(3, "discover_feed")).items, []);
  const english = await pageFor(3, 390, "en");
  await english.goto(base + "/discover");
  await heading(english, "Discover").waitFor();
  await english
    .getByText("No posts match these filters.", { exact: true })
    .waitFor();
  assert.equal(
    await english.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS account deletion, saved and feed cleanup, and English responsive UI",
  );
} finally {
  await browser.close();
}
