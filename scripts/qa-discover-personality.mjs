/** Browser QA against the local Edge+SQL fixture with synthetic profiles only. */
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { orientationItems } from "../lib/v2/orientation.ts";
import { generateAvatar } from "../lib/v2/avatar.ts";

const base = "http://127.0.0.1:3200";
const output = process.env.QA_SCREENSHOT_DIR || "docs/screenshots/v2/persoenlichkeit";
const storageKey = process.env.QA_AUTH_STORAGE_KEY || "sb-localhost-auth-token";
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
    viewport: { width, height: 900 },
    reducedMotion: "reduce",
    serviceWorkers: "block",
  });
  await ctx.route("**/*", (route) =>
    new URL(route.request().url()).origin === base
      ? route.continue()
      : route.abort(),
  );
  await ctx.addInitScript(
    ({ base, locale, key, session }) => {
      if (location.origin !== base) return;
      localStorage.setItem("traitbridge-locale", locale);
      localStorage.setItem(key, JSON.stringify(session));
    },
    {
      base,
      locale,
      key: storageKey,
      session: {
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
      },
    },
  );
  const page = await ctx.newPage();
  page.on("pageerror", (err) => errors.push(err.message));
  return page;
}

async function call(account, action, data = {}) {
  const response = await fetch(base + "/api/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token(account)}`,
    },
    body: JSON.stringify({ action, data }),
  });
  const result = await response.json();
  assert.equal(response.status, 200, JSON.stringify(result));
  return result.data;
}

const titleShort = "Austausch zum Start, Ruhe für die Arbeit";
const titleFull = "Mit einer Liste in den Arbeitstag";
const titleFlat = "Ordnung im Wochenablauf";
const question = "Wie gestaltet ihr den Wechsel zwischen Arbeit und Freizeit?";
const card = (page, text) => page.locator("article").filter({ hasText: text });
const button = (target, name) =>
  target.getByRole("button", { name, exact: true });
const select = (page, name) => page.getByLabel(name, { exact: true });
const share = (page) =>
  page.getByRole("checkbox", {
    name: "Big-Five-Stufen bei meinen Beiträgen zeigen",
    exact: true,
  });
const personality = (target) => target.locator(".tb-discover-personality");

async function shot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    name,
  );
  await page.screenshot({
    path: `${output}/${name}.png`,
    animations: "disabled",
  });
}
async function onboard(n, name, test) {
  await call(n, "onboard", {
    ...test,
    pseudonym: name,
    avatar: generateAvatar(name),
    language: "de",
    interests: [],
    experiences: [],
    adult_consent: true,
    matching_consent: true,
  });
}
async function publish(n, title, body) {
  return call(n, "experience_publish", { title, body, topic: "work" });
}

try {
  await mkdir(output, { recursive: true });
  const scores = { O: 2, C: 1, E: 5, A: 4, N: 3 };
  await onboard(6, "Morgenfarn", {
    answers: Object.fromEntries(
      orientationItems.map(({ id, trait }) => [id, scores[trait]]),
    ),
  });
  await onboard(4, "Mohnpfad", {
    result_id: "20000000-0000-4000-8000-000000000004",
  });
  await publish(
    2,
    titleFlat,
    "Ein kurzer Wochenplan hilft mir, meine Aufgaben übersichtlich zu halten und Pausen mitzudenken.",
  );
  await call(6, "question", {
    body: question,
    topic: "work",
    discoverable: true,
  });
  const shortPost = await publish(
    6,
    titleShort,
    "Ich bespreche morgens meine Ideen im Team und lege danach eine ungestörte Arbeitsstunde ein.",
  );
  const fullPost = await publish(
    4,
    titleFull,
    "Ich notiere die drei wichtigsten Aufgaben, bevor ich den Posteingang öffne. Das erleichtert mir den Einstieg.",
  );

  const reader = await pageFor(3);
  await reader.goto(base + "/discover");
  await card(reader, titleShort).waitFor();
  assert.equal(await personality(card(reader, titleShort)).count(), 0);
  await select(reader, "Persönlichkeit").selectOption("different");
  await reader
    .getByText("Keine Beiträge für diese Auswahl.", { exact: true })
    .waitFor();
  await button(reader, "Alle Persönlichkeiten anzeigen").click();
  await card(reader, titleShort).waitFor();
  assert.equal(await select(reader, "Persönlichkeit").inputValue(), "");

  const author = await pageFor(6);
  await author.goto(base + "/me");
  await share(author).waitFor();
  assert.equal(await share(author).isChecked(), false);
  await share(author).check();
  await author.getByText("Gespeichert.", { exact: true }).waitFor();
  const settings = author
    .locator("section")
    .filter({
      has: author.getByRole("heading", { name: "Persönlichkeit in Entdecken" }),
    });
  await settings.evaluate((element) =>
    element.scrollIntoView({ block: "center" }),
  );
  await shot(author, "04-freigabe-ich-desktop");
  await call(4, "discover_personality", { enabled: true });
  await call(2, "discover_personality", { enabled: true });

  await reader.reload();
  const questionCard = card(reader, question);
  await personality(questionCard).locator("summary").waitFor();
  assert.equal(
    await personality(card(reader, titleFlat))
      .locator(".tb-trait-chip")
      .count(),
    0,
  );
  const shortCard = card(reader, titleShort);
  assert.equal(
    await personality(shortCard).locator(".tb-trait-chip").count(),
    2,
  );
  await shortCard.getByText("Hohe Extraversion", { exact: true }).waitFor();
  await shortCard
    .getByText("Tiefe Gewissenhaftigkeit", { exact: true })
    .waitFor();
  assert.equal(
    await shortCard.locator("details").evaluate((element) => element.open),
    false,
  );
  await select(reader, "Thema").selectOption("work");
  await personality(card(reader, question)).locator("summary").waitFor();
  await shot(reader, "01-entdecken-kompakt-desktop");

  await select(reader, "Beitragsart").selectOption("experience");
  await select(reader, "Persönlichkeit").selectOption("different");
  await shortCard.waitFor();
  assert.equal(await card(reader, titleFull).count(), 0);
  assert.equal(await questionCard.count(), 0);
  await reader.setViewportSize({ width: 390, height: 900 });
  await personality(shortCard).locator("summary").click();
  assert.equal(await personality(shortCard).locator("dt").count(), 5);
  assert.equal(
    await personality(shortCard).locator("i[data-active=true]").count(),
    5,
  );
  await shortCard.getByText("Kurztest · grobe Einordnung").waitFor();
  assert.doesNotMatch(await personality(shortCard).innerText(), /[0-9%]/);
  await personality(shortCard).evaluate((element) =>
    element.scrollIntoView({ block: "center" }),
  );
  await shot(reader, "02-details-kurztest-mobil");

  await reader.setViewportSize({ width: 1440, height: 900 });
  await select(reader, "Persönlichkeit").selectOption("similar");
  const fullCard = card(reader, titleFull);
  await personality(fullCard).locator("summary").click();
  assert.equal(await personality(fullCard).locator("dt").count(), 5);
  assert.equal(
    await fullCard.getByText("Kurztest · grobe Einordnung").count(),
    0,
  );
  assert.equal(await shortCard.count(), 0);
  await reader.evaluate(() => scrollTo(0, 0));
  await shot(reader, "03-aehnlich-desktop");
  const apiResult = await call(3, "discover_feed", {
    perspective: "similar",
    kind: "experience",
    topic: "work",
  });
  assert.ok(apiResult.items.some((item) => item.id === fullPost.id));
  assert.doesNotMatch(JSON.stringify(apiResult), /"scores"|"distance"|"rank"/);
  console.log(
    "PASS compact and expanded cards, both tests, combined filters, mobile/desktop and coarse API projection",
  );

  await select(reader, "Persönlichkeit").selectOption("different");
  await button(shortCard, "Merken").click();
  await button(shortCard, "Gemerkt").waitFor();
  await reader.goto(base + "/me");
  await button(reader, "Gemerkte Beiträge").click();
  const saved = reader.locator(".tb-saved-posts");
  await saved.locator(".tb-discover-personality").waitFor();
  await share(author).uncheck();
  await author.getByText("Gespeichert.", { exact: true }).waitFor();
  await reader.bringToFront();
  await reader.evaluate(() =>
    document.dispatchEvent(new Event("visibilitychange")),
  );
  await saved
    .locator(".tb-discover-personality")
    .waitFor({ state: "detached" });
  await saved.getByText(titleShort, { exact: true }).waitFor();
  const savedResult = await call(3, "discover_saved");
  assert.equal(
    savedResult.items.find((item) => item.id === shortPost.id).personality,
    null,
  );

  await reader.goto(base + "/discover");
  await shortCard.waitFor();
  assert.equal(await personality(shortCard).count(), 0);
  await select(reader, "Persönlichkeit").selectOption("different");
  await reader
    .getByText("Keine Beiträge für diese Auswahl.", { exact: true })
    .waitFor();
  await button(reader, "Alle Persönlichkeiten anzeigen").click();
  await shortCard.waitFor();

  const english = await pageFor(3, 390, "en");
  await english.goto(base + "/discover");
  await select(english, "Personality").selectOption("similar");
  await personality(card(english, titleFull)).locator("summary").click();
  await card(english, titleFull)
    .getByText("Conscientiousness", { exact: true })
    .waitFor();
  assert.equal(
    await english.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS default-off, opt-in, live bookmark refresh after revocation, empty-state fallback and English UI",
  );
} finally {
  await browser.close();
}
