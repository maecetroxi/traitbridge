import { useEffect, useRef, useState, type FormEvent } from "react";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { useBridge } from "../contexts/BridgeContext";
import { useLocale } from "../contexts/LocaleContext";
import { authErrorText, minimumPasswordLength } from "../lib/auth-flow";
import {
  afterSignIn,
  buildLoginPath,
  sanitizeReturnPath,
} from "../lib/return-path";
import { passwordRecoveryClient, supabase } from "../lib/supabase";
import { claimAssessmentTransfer } from "../lib/assessment-draft";

type Result = {
  destination: string;
  status: "ready" | "expired" | "invalid" | "signed-in";
};

async function completeLink(
  recovery: boolean,
  signedIn: boolean,
): Promise<Result> {
  const url = new URL(window.location.href);
  const destination = sanitizeReturnPath(url.searchParams.get("returnTo"));
  const fragment = new URLSearchParams(url.hash.slice(1));
  const code = url.searchParams.get("code");
  const flowId = url.searchParams.get("sb_flow_id");
  const codeError =
    url.searchParams.get("error_code") ?? fragment.get("error_code");
  const hasError =
    url.searchParams.has("error") ||
    fragment.has("error") ||
    Boolean(codeError);
  const clean = new URL(url.pathname, url.origin);
  clean.searchParams.set("returnTo", destination);
  window.history.replaceState(
    window.history.state,
    "",
    clean.pathname + clean.search,
  );
  if (codeError === "otp_expired" || codeError === "flow_state_expired")
    return { destination, status: "expired" };
  if (hasError || !code || !flowId) return { destination, status: "invalid" };
  if (!recovery && signedIn) return { destination, status: "signed-in" };

  try {
    const client = recovery ? passwordRecoveryClient() : supabase;
    const { data, error } = await client.auth.exchangeCodeForSession(code, {
      flowId,
    });
    if (error?.code === "flow_state_expired" || error?.code === "otp_expired")
      return { destination, status: "expired" };
    if (!error && data.session && !data.user.is_anonymous) {
      if (!recovery)
        claimAssessmentTransfer(url.searchParams.get("test"), data.user.id);
      return { destination, status: "ready" };
    }
  } catch {
    // Browser storage and network failures use the same restart path.
  }
  return { destination, status: "invalid" };
}

export default function AuthCallback({
  recovery = false,
}: {
  recovery?: boolean;
}) {
  const { locale } = useLocale();
  const { user, loading } = useAuth();
  const bridge = useBridge();
  const router = useRouter();
  const de = locale === "de";
  const request = useRef<Promise<Result> | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    if (loading || !router.isReady) return;
    let active = true;
    request.current ??= completeLink(
      recovery,
      Boolean(user && !user.is_anonymous),
    );
    void request.current.then((next) => {
      if (active) setResult(next);
    });
    return () => {
      active = false;
    };
  }, [loading, recovery, router.isReady, user]);

  useEffect(() => {
    if (
      !recovery &&
      user &&
      !user.is_anonymous &&
      !bridge.loading &&
      result?.status === "ready"
    )
      void router.replace(
        afterSignIn(
          result.destination,
          Boolean(bridge.snapshot.profile),
          !bridge.error,
        ),
      );
  }, [
    recovery,
    result,
    user,
    bridge.loading,
    bridge.snapshot.profile,
    bridge.error,
    router,
  ]);

  async function update(event: FormEvent) {
    event.preventDefault();
    if (busy || result?.status !== "ready") return;
    setBusy(true);
    setError("");
    try {
      const { auth } = passwordRecoveryClient();
      const { error } = await auth.updateUser({ password });
      if (error) throw error;
      setPassword("");
      setUpdated(true);
      // A successful update is independent of network errors during sign-out.
      void auth.signOut({ scope: "local" }).catch(() => {});
    } catch (err) {
      setError(authErrorText(err, locale));
    } finally {
      setBusy(false);
    }
  }

  const title = recovery
    ? de
      ? "Passwort zurücksetzen"
      : "Reset password"
    : de
      ? "Anmeldung bestätigen"
      : "Confirm sign-in";
  return (
    <div className="page-card login-card">
      <Head>
        <title>{`${title} | TraitBridge`}</title>
        <meta name="referrer" content="no-referrer" />
      </Head>
      <h1 className="page-title">{title}</h1>
      {updated && (
        <>
          <p role="status">
            {de
              ? "Dein Passwort wurde geändert."
              : "Your password has been updated."}
          </p>
          <Link
            className="btn btn-primary"
            href={buildLoginPath(result?.destination ?? "/")}
          >
            {de ? "Zur Anmeldung" : "Go to sign-in"}
          </Link>
        </>
      )}
      {!updated &&
        (result == null || (result.status === "ready" && !recovery)) && (
          <p role="status">
            {de ? "Link wird geprüft …" : "Checking your link …"}
          </p>
        )}
      {!updated && result?.status === "ready" && recovery && (
        <form className="stack-md login-form" onSubmit={update}>
          <label className="field-group">
            {de ? "Neues Passwort" : "New password"}
            <input
              type="password"
              name="new-password"
              className="field-control"
              autoComplete="new-password"
              minLength={minimumPasswordLength}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-describedby="password-hint"
            />
          </label>
          <small id="password-hint">
            {de ? "Mindestens 8 Zeichen." : "At least 8 characters."}
          </small>
          {error && (
            <p className="tb-error" role="alert">
              {error}
            </p>
          )}
          <button className="btn btn-primary login-submit" disabled={busy}>
            {de ? "Passwort speichern" : "Save password"}
          </button>
        </form>
      )}
      {result && result.status !== "ready" && (
        <>
          <p className="tb-error" role="alert">
            {result.status === "expired"
              ? de
                ? "Der Link ist abgelaufen. Fordere einen neuen an."
                : "The link has expired. Request a new one."
              : result.status === "signed-in"
                ? de
                  ? "In diesem Browser ist bereits ein Konto angemeldet. Melde dich ab und fordere für das andere Konto einen neuen Link an."
                  : "An account is already signed in. Sign out and request a new link for the other account."
                : de
                  ? "Der Link ist ungültig oder wurde in einem anderen Browser angefordert. Fordere hier einen neuen Link an oder melde dich mit Passwort an."
                  : "The link is invalid or was requested in another browser. Request a new link here or sign in with your password."}
          </p>
          <Link
            className="btn btn-primary"
            href={buildLoginPath(
              result.destination,
              recovery ? "forgot" : "signin",
            )}
          >
            {recovery
              ? de
                ? "Neuen Link anfordern"
                : "Request a new link"
              : de
                ? "Zur Anmeldung"
                : "Go to sign-in"}
          </Link>
        </>
      )}
    </div>
  );
}
