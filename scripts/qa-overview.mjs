/** Local-only overview and browser checks. Uses the ephemeral SQL and Edge fixtures. */
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { generateAvatar } from "../lib/v2/avatar.ts";
import { orientationItems } from "../lib/v2/orientation.ts";

const base = "http://127.0.0.1:3200";
const output =
  process.env.QA_SCREENSHOT_DIR || "docs/screenshots/v2/uebersicht";
const storageKey = "sb-localhost-auth-token";
const id = (n) => "10000000-0000-4000-8000-" + String(n).padStart(12, "0");
const token = (n) =>
  [
    { alg: "HS256", typ: "JWT" },
    { sub: id(n), exp: 4102444800, role: "authenticated", is_anonymous: false },
  ]
    .map((part) => Buffer.from(JSON.stringify(part)).toString("base64url"))
    .concat("local-qa-only")
    .join(".");
const browser = await chromium.launch(
  process.platform === "win32"
    ? {
        executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
      }
    : {},
);
const errors = [];

async function pageFor(account, width, locale = "de") {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    isMobile: width <= 390,
    hasTouch: width <= 390,
    reducedMotion: "reduce",
    serviceWorkers: "block",
    timezoneId: "Europe/Zurich",
  });
  await context.route("**/*", (route) => {
    const url = new URL(route.request().url());
    if (url.origin === base) return route.continue();
    if (
      url.hostname === "challenges.cloudflare.com" &&
      url.pathname.endsWith("/api.js")
    ) {
      return route.fulfill({
        contentType: "application/javascript",
        body: 'window.turnstile={render(node, options){node.textContent="Sicherheitsprüfung (lokaler Test)";options.callback("fixture-captcha");return "widget"},reset(){},remove(){}}; window[new URL(document.currentScript.src).searchParams.get("onload")]?.();',
      });
    }
    return route.abort();
  });
  await context.addInitScript(
    ({ base, key, locale, session }) => {
      if (location.origin !== base) return;
      localStorage.setItem("traitbridge-locale", locale);
      if (session) localStorage.setItem(key, JSON.stringify(session));
    },
    {
      base,
      key: storageKey,
      locale,
      session: !account
        ? null
        : {
            access_token: token(account),
            refresh_token: "qa-session",
            expires_at: 4102444800,
            expires_in: 3600,
            token_type: "bearer",
            user: {
              id: id(account),
              email: "qa-" + account + "@example.invalid",
              aud: "authenticated",
              role: "authenticated",
              is_anonymous: false,
              app_metadata: {},
              user_metadata: {},
              created_at: "2026-11-15T09:00:00Z",
            },
          },
    },
  );
  const page = await context.newPage();
  page.setDefaultTimeout(12_000);
  page.on("pageerror", (error) => errors.push(error.message));
  return page;
}

async function api(account, action, data = {}, expected = 200) {
  const response = await fetch(base + "/api/v2", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(account && { Authorization: "Bearer " + token(account) }),
    },
    body: JSON.stringify({ action, data }),
  });
  const result = await response.json();
  assert.equal(response.status, expected, JSON.stringify(result));
  return expected === 200 ? result.data : result;
}

const heading = (page, name) =>
  page.getByRole("heading", { name, exact: true });
const button = (page, name) => page.getByRole("button", { name, exact: true });
const card = (page, title) =>
  page.locator("article").filter({ hasText: title });
const nav = (page) => page.locator(".tb-nav");
async function noOverflow(page) {
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    ),
    false,
    page.url(),
  );
}
async function shot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  await noOverflow(page);
  await page.screenshot({
    path: output + "/" + name + ".png",
    animations: "disabled",
  });
}
async function visit(page, path, title) {
  await page.goto(base + path);
  await heading(page, title).waitFor();
}
async function navigate(page, href, title) {
  const link = nav(page).locator('a[href="' + href + '"]');
  await link.click();
  await heading(page, title).waitFor();
  assert.equal(await link.getAttribute("aria-current"), "page");
  assert.equal(await nav(page).locator('[aria-current="page"]').count(), 1);
  await noOverflow(page);
}
async function confirm(page, control) {
  page.once("dialog", (dialog) => dialog.accept());
  await control.click();
}
const experienceTitle = "Ein fester Übergang in den Feierabend";
const replyBody =
  "Ich schreibe vor dem Feierabend auf, womit ich morgen anfange. Danach hilft mir eine kurze Runde zu Fuss.";
const reportReason =
  "Der Beitrag empfiehlt eine Übung, die für die eigene Situation ungeeignet sein kann.";

try {
  await mkdir(output, { recursive: true });
  const scores = { O: 2, C: 5, E: 1, A: 4, N: 3 };
  await api(6, "onboard", {
    answers: Object.fromEntries(
      orientationItems.map(({ id, trait }) => [id, scores[trait]]),
    ),
    pseudonym: "Morgenfarn",
    avatar: generateAvatar("Morgenfarn"),
    language: "de",
    interests: ["work"],
    experiences: ["work"],
    adult_consent: true,
    matching_consent: true,
  });
  await api(6, "discover_personality", { enabled: true });
  const reported = await api(6, "experience_publish", {
    title: "Übung für angespannte Arbeitstage",
    body: "Bei einem langen Arbeitstag habe ich verschiedene kurze Übungen ausprobiert. Ein paar davon klappen für mich am Schreibtisch besser als andere.",
    topic: "stress",
  });
  const experience = await api(6, "experience_publish", {
    title: experienceTitle,
    body: "Am Ende des Arbeitstags räume ich meinen Tisch auf und notiere den ersten Schritt für morgen. Anschliessend gehe ich zehn Minuten zu Fuss. Das hilft mir beim Wechsel in den Feierabend.",
    topic: "work",
  });
  const questions = (await api(2, "snapshot")).questions;
  const question = questions.find(({ topic }) => topic === "work");
  const reservation = await api(3, "reserve", { question_id: question.id });
  await api(3, "answer", {
    question_id: question.id,
    reservation_id: reservation.id,
    body: replyBody,
  });
  await api(2, "discover_bookmark", {
    id: experience.id,
    kind: "experience",
    enabled: true,
  });
  const report = () =>
    api(2, "experience_report", { id: reported.id, reason: reportReason });
  await report();

  for (const [width, suffix] of [
    [1440, "desktop"],
    [390, "mobil"],
  ]) {
    const guest = await pageFor(null, width);
    await visit(guest, "/", "Frage stellen");
    assert.equal(await guest.locator("#question-body").count(), 0);
    assert.equal(await nav(guest).getByRole("link").count(), 4);
    assert.equal(
      await nav(guest).evaluate(
        (element) => getComputedStyle(element).position,
      ),
      width === 390 ? "fixed" : "static",
    );
    await guest
      .getByRole("link", { name: "Frage stellen", exact: true })
      .click();
    await heading(guest, "Konto erstellen").waitFor();
    assert.equal(
      new URL(guest.url()).searchParams.get("returnTo"),
      "/?action=ask",
    );
    await guest.getByLabel("E-Mail-Adresse", { exact: true }).waitFor();
    await shot(guest, "registrierung-" + suffix);
    await guest.context().close();

    const newcomer = await pageFor(1, width);
    await visit(
      newcomer,
      "/onboarding?returnTo=%2F%3Faction%3Dhelp",
      "Profil einrichten",
    );
    await heading(newcomer, "Big-Five-Kurztest").waitFor();
    await shot(newcomer, "onboarding-" + suffix);
    await newcomer.context().close();

    const member = await pageFor(2, width);
    await visit(member, "/", "Frage stellen");
    await member.getByText("Zurzeit keine passende Frage.").waitFor();
    await member.locator("#question-body").waitFor();
    await nav(member).locator(".tb-unread").waitFor();
    await navigate(member, "/discover", "Entdecken");
    const entry = card(member, experienceTitle);
    await entry.waitFor();
    const details = entry.locator(".tb-discover-personality summary");
    await details.focus();
    await details.press("Enter");
    assert.equal(await details.locator("..").getAttribute("open"), "");
    await details.blur();
    if (width === 390) {
      await member
        .getByLabel("Beitragsart", { exact: true })
        .selectOption("experience");
      await member.getByLabel("Thema", { exact: true }).selectOption("work");
      await member
        .getByLabel("Persönlichkeit", { exact: true })
        .selectOption("different");
      await entry.waitFor();
      await entry.locator(".tb-discover-personality summary").click();
    }
    await member.evaluate(() => scrollTo(0, 0));
    await shot(member, "entdecken-" + suffix);
    await member
      .getByRole("link", { name: "Erfahrung teilen", exact: true })
      .click();
    await heading(member, "Erfahrung teilen").waitFor();
    if (width === 390) await shot(member, "erfahrung-mobil");
    await navigate(member, "/messages", "Nachrichten");
    await button(member, "Meine Fragen").click();
    await member.locator(".tb-notices summary").click();
    await member.getByRole("button", { name: /Neue Antwort/ }).click();
    await member.getByText(replyBody, { exact: true }).waitFor();
    await button(member, "Danke sagen").waitFor();
    if (width === 390) await member.locator(".tb-notices summary").click();
    await shot(member, "nachrichten-" + suffix);
    await navigate(member, "/me", "Mein Profil");
    await heading(member, "Gemerkte Beiträge").waitFor();
    await button(member, "Gemerkte Beiträge").click();
    await card(member, experienceTitle).waitFor();
    await member.evaluate(() => scrollTo(0, 0));
    assert.equal(await member.locator(".tb-moderation-link").count(), 0);
    await shot(member, "ich-" + suffix);
    if (width === 390) {
      await heading(member, "Gemerkte Beiträge").evaluate((element) =>
        element.scrollIntoView({ block: "start" }),
      );
      await shot(member, "merkliste-mobil");
    }
    await member
      .getByRole("link", { name: "Meine Erfahrungen", exact: true })
      .click();
    await member
      .getByRole("button", {
        name: "Meine Erfahrungen",
        exact: true,
        pressed: true,
      })
      .waitFor();
    await member.goto(base + "/moderation");
    await member.getByText("Kein Moderationszugang.").waitFor();
    await member.context().close();

    const moderator = await pageFor(3, width);
    await visit(moderator, "/", "Jemandem helfen");
    await moderator.locator(".tb-help-question").waitFor();
    await moderator.locator("#question-body").waitFor();
    await shot(moderator, "start-" + suffix);
    await navigate(moderator, "/me", "Mein Profil");
    await moderator
      .locator(".tb-moderation-link")
      .getByText("1 offen")
      .waitFor();
    await moderator.locator(".tb-moderation-link").click();
    await heading(moderator, "Moderation").waitFor();
    assert.equal(
      await nav(moderator)
        .locator('a[href="/me"]')
        .getAttribute("aria-current"),
      "page",
    );
    await heading(moderator, "Gemeldete Erfahrung").waitFor();
    await moderator.getByText(/Verfasst von Morgenfarn/).waitFor();
    await moderator.getByText(reportReason).waitFor();
    await shot(moderator, "moderation-" + suffix);
    await moderator.context().close();
  }
  console.log(
    "PASS four destinations, current section, unread count, guest return, onboarding, combined filters, profile, bookmarks and responsive gallery",
  );

  const english = await pageFor(3, 320, "en");
  await visit(english, "/", "Help someone");
  await english.keyboard.press("Tab");
  assert.equal(await english.locator(":focus").innerText(), "Skip to content");
  await english.keyboard.press("Enter");
  assert.equal(await english.locator("main:focus").count(), 1);
  await navigate(english, "/discover", "Discover");
  await navigate(english, "/messages", "Messages");
  await navigate(english, "/me", "My profile");
  await english.locator(".tb-moderation-link").click();
  await heading(english, "Reported experience").waitFor();
  await noOverflow(english);
  await confirm(english, button(english, "Hide content"));
  await english.getByText("No open reports.").waitFor();
  await button(english, "Hidden").click();
  await confirm(english, button(english, "Restore"));
  await english.getByText("No entries.").waitFor();
  assert.ok(
    (await api(2, "discover_feed")).items.some(({ id }) => id === reported.id),
  );

  await report();
  await button(english, "Refresh").click();
  await button(english, "Open").click();
  await heading(english, "Reported experience").waitFor();
  await confirm(english, button(english, "Suspend account"));
  await english.getByText("No open reports.").waitFor();
  assert.equal((await api(6, "snapshot", {}, 403)).error, "BETA_REQUIRED");
  await button(english, "Suspended accounts").click();
  await heading(english, "Morgenfarn").waitFor();
  await confirm(english, button(english, "Lift suspension"));
  await english.getByText("No entries.").waitFor();
  await api(6, "snapshot");
  await report();
  await button(english, "Refresh").click();
  await button(english, "Open").click();
  await button(english, "Close without action").click();
  await english.getByText("No open reports.").waitFor();
  await button(english, "Closed").click();
  await english
    .locator(".tb-entry")
    .getByText("Closed without action", { exact: true })
    .waitFor();
  await noOverflow(english);
  assert.equal((await api(2, "moderation_status", {}, 403)).error, "FORBIDDEN");
  assert.equal(
    (await api(null, "moderation_dashboard", {}, 401)).error,
    "AUTH_REQUIRED",
  );
  assert.deepEqual(errors, []);
  console.log(
    "PASS English and keyboard at 320 px, moderator role guard, hide/restore, suspend/unsuspend and dismiss",
  );
} finally {
  await browser.close();
}
