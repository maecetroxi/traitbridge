import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabasePublishableKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "";

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    "Supabase configuration is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
  );
}

const parsedSupabaseUrl = new URL(supabaseUrl);

if (
  process.env.NODE_ENV === "production" &&
  parsedSupabaseUrl.protocol !== "https:"
) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL must use HTTPS in production.");
}

export const supabase = createClient<Database>(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      flowType: "pkce",
      experimental: { appendPkceFlowIdToRedirects: true },
      // Only dedicated callback pages may exchange a code for a session.
      detectSessionInUrl: false,
    },
  },
);

let recoveryClient: ReturnType<typeof createClient<Database>> | undefined;

export function passwordRecoveryClient() {
  if (!recoveryClient) {
    const memory = new Map<string, string>();
    const isVerifier = (key: string) => key.endsWith("-code-verifier");
    // Keep only the PKCE verifier across tabs. Recovery credentials never
    // become the app session, even if another account is signed in.
    recoveryClient = createClient<Database>(
      supabaseUrl,
      supabasePublishableKey,
      {
        auth: {
          flowType: "pkce",
          experimental: { appendPkceFlowIdToRedirects: true },
          detectSessionInUrl: false,
          autoRefreshToken: false,
          storageKey: `traitbridge-recovery-${parsedSupabaseUrl.hostname}`,
          storage: {
            getItem: (key) =>
              isVerifier(key)
                ? window.localStorage.getItem(key)
                : (memory.get(key) ?? null),
            setItem: (key, value) => {
              if (isVerifier(key)) window.localStorage.setItem(key, value);
              else memory.set(key, value);
            },
            removeItem: (key) => {
              if (isVerifier(key)) window.localStorage.removeItem(key);
              else memory.delete(key);
            },
          },
        },
      },
    );
  }
  return recoveryClient;
}
