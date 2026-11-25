import {
  assessmentVersions,
  parseAssessmentDraft,
  type AssessmentDraft,
} from "./v2/assessment";
import type { AssessmentVariant } from "./v2/types";

const key = (owner: string | null, variant: AssessmentVariant) =>
  `tb-v2-assessment:${owner ?? "visitor"}:${variant}`;
const transferKey = "tb-v2-assessment:transfer";
const transferPrefix = `${transferKey}:`;
const transferLifetime = 60 * 60 * 1000;
const variants = ["full", "short"] as const;

export function validTransferId(value: string | null) {
  return Boolean(value && /^[a-f0-9-]{36}$/.test(value));
}

function readTransfer(id: string) {
  const draft = JSON.parse(localStorage.getItem(transferPrefix + id) || "null");
  return draft &&
    typeof draft.expires === "number" &&
    draft.expires > Date.now()
    ? (draft as {
        expires: number;
        tests: Partial<Record<AssessmentVariant, unknown>>;
      })
    : null;
}

// The link gets an opaque handle so opening the email in a new tab in the
// same browser can restore the guest test. No personal data goes in the URL.
export function prepareAssessmentTransfer(): string | null {
  try {
    for (const storageKey of Object.keys(localStorage)) {
      if (
        storageKey.startsWith(transferPrefix) &&
        !readTransfer(storageKey.slice(transferPrefix.length))
      )
        localStorage.removeItem(storageKey);
    }
    const existing = sessionStorage.getItem(transferKey);
    const id =
      existing && validTransferId(existing) ? existing : crypto.randomUUID();
    const tests = { ...readTransfer(id)?.tests };
    for (const variant of variants) {
      const draft = parseAssessmentDraft(
        JSON.parse(sessionStorage.getItem(key(null, variant)) || "null"),
      );
      if (draft) tests[variant] = draft;
    }
    if (!Object.keys(tests).length) return null;
    localStorage.setItem(
      transferPrefix + id,
      JSON.stringify({ tests, expires: Date.now() + transferLifetime }),
    );
    sessionStorage.setItem(transferKey, id);
    for (const variant of variants)
      sessionStorage.removeItem(key(null, variant));
    return id;
  } catch {
    return null;
  }
}

export function claimAssessmentTransfer(id: string | null, owner: string) {
  if (!id || !validTransferId(id)) return;
  try {
    const transfer = readTransfer(id);
    for (const variant of variants) {
      const draft = parseAssessmentDraft(transfer?.tests?.[variant]);
      if (draft && !sessionStorage.getItem(key(owner, variant)))
        sessionStorage.setItem(key(owner, variant), JSON.stringify(draft));
    }
    localStorage.removeItem(transferPrefix + id);
  } catch {}
}

export function rememberAssessment(
  owner: string | null,
  variant: AssessmentVariant,
  language: "de" | "en",
  answers: Record<string, number>,
) {
  try {
    const draft = {
      variant,
      version: assessmentVersions[variant],
      language,
      answers,
    };
    sessionStorage.setItem(key(owner, variant), JSON.stringify(draft));
  } catch {}
}

export function availableAssessment(owner: string): AssessmentDraft | null {
  try {
    claimAssessmentTransfer(sessionStorage.getItem(transferKey), owner);
    sessionStorage.removeItem(transferKey);
    // Bind this tab's visitor test to the first eligible onboarding account.
    // Never read a different account's draft. No aggregate scores are imported.
    for (const variant of variants) {
      const guest = sessionStorage.getItem(key(null, variant));
      if (guest) {
        if (!sessionStorage.getItem(key(owner, variant)))
          sessionStorage.setItem(key(owner, variant), guest);
        sessionStorage.removeItem(key(null, variant));
      }
    }
    for (const variant of variants) {
      const draft = parseAssessmentDraft(
        JSON.parse(sessionStorage.getItem(key(owner, variant)) || "null"),
      );
      if (draft) return draft;
    }
  } catch {}
  return null;
}

export function forgetAssessment(owner: string) {
  try {
    sessionStorage.removeItem(key(owner, "full"));
    sessionStorage.removeItem(key(owner, "short"));
  } catch {}
}
