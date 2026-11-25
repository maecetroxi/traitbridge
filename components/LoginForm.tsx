import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useAuth } from "../contexts/AuthContext";
import { useBridge } from "../contexts/BridgeContext";
import { useLocale } from "../contexts/LocaleContext";
import {
  authErrorText,
  loginMode,
  magicLinkEnabled,
  minimumPasswordLength,
  oauthProviders,
} from "../lib/auth-flow";
import {
  afterSignIn,
  authCallbackUrl,
  buildLoginPath,
  getAuthCallbackErrorCode,
  sanitizeReturnPath,
  type LoginMode,
} from "../lib/return-path";
import { passwordRecoveryClient, supabase } from "../lib/supabase";
import { prepareAssessmentTransfer } from "../lib/assessment-draft";

export default function LoginForm() {
  const { user, loading, signOut } = useAuth();
  const { snapshot, loading: bridgeLoading, error: bridgeError } = useBridge();
  const { locale, copy } = useLocale();
  const de = locale === "de";
  const router = useRouter();
  const mode = loginMode(router.query.mode);
  const returnTo = sanitizeReturnPath(router.query.returnTo);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState<LoginMode | null>(null);
  const [busy, setBusy] = useState(false);
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [captchaFailed, setCaptchaFailed] = useState(false);
  const turnstile = useRef<TurnstileInstance | null>(null);
  const siteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
    (process.env.NODE_ENV === "development" ? "1x00000000000000000000AA" : "");
  const passwordMode = mode === "signin" || mode === "signup";

  useEffect(() => {
    setPassword("");
    setSent(null);
    setError("");
    setCaptcha(null);
    setCaptchaFailed(false);
  }, [mode]);

  useEffect(() => {
    const code = getAuthCallbackErrorCode(window.location.hash);
    if (
      !code &&
      !new URLSearchParams(window.location.hash.slice(1)).has("access_token")
    )
      return;
    setError(
      code === "otp_expired" ? copy.login.linkExpired : copy.login.linkInvalid,
    );
    window.history.replaceState(
      window.history.state,
      "",
      window.location.pathname + window.location.search,
    );
  }, [copy.login.linkExpired, copy.login.linkInvalid]);

  useEffect(() => {
    if (
      !router.isReady ||
      loading ||
      !user ||
      user.is_anonymous ||
      bridgeLoading ||
      mode === "forgot"
    )
      return;
    void router.replace(
      afterSignIn(returnTo, Boolean(snapshot.profile), !bridgeError),
    );
  }, [
    router,
    router.isReady,
    mode,
    returnTo,
    loading,
    user,
    bridgeLoading,
    bridgeError,
    snapshot.profile,
  ]);

  async function clearAnonymousSession() {
    if (user?.is_anonymous) {
      const result = await supabase.auth.signOut({ scope: "local" });
      if (result.error) throw result.error;
    }
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || loading || !captcha) return;
    setBusy(true);
    setError("");
    const address = email.trim();
    const transfer =
      mode === "signup" || mode === "magic"
        ? prepareAssessmentTransfer()
        : null;
    const callback = authCallbackUrl(
      window.location.origin,
      mode === "forgot",
      returnTo,
      transfer,
    );
    try {
      if (mode !== "forgot") await clearAnonymousSession();
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email: address,
          password,
          options: { captchaToken: captcha },
        });
        if (error) throw error;
      } else if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: address,
          password,
          options: { emailRedirectTo: callback, captchaToken: captcha },
        });
        if (
          error &&
          error.code !== "user_already_exists" &&
          error.code !== "email_exists"
        )
          throw error;
        if (!data.session) setSent(mode);
      } else if (mode === "forgot") {
        const { error } =
          await passwordRecoveryClient().auth.resetPasswordForEmail(address, {
            redirectTo: callback,
            captchaToken: captcha,
          });
        if (error && error.code !== "user_not_found") throw error;
        setSent(mode);
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: address,
          options: {
            emailRedirectTo: callback,
            shouldCreateUser: false,
            captchaToken: captcha,
          },
        });
        if (
          error &&
          !["user_not_found", "otp_disabled", "signup_disabled"].includes(
            error.code ?? "",
          )
        )
          throw error;
        setSent(mode);
      }
    } catch (err) {
      setError(authErrorText(err, locale));
    } finally {
      setPassword("");
      setCaptcha(null);
      turnstile.current?.reset();
      setBusy(false);
    }
  }

  async function oauth(provider: (typeof oauthProviders)[number]) {
    if (busy || loading) return;
    setBusy(true);
    setError("");
    try {
      await clearAnonymousSession();
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: authCallbackUrl(
            window.location.origin,
            false,
            returnTo,
            prepareAssessmentTransfer(),
          ),
        },
      });
      if (error) throw error;
    } catch (err) {
      setError(authErrorText(err, locale));
      setBusy(false);
    }
  }

  const titles = {
    signin: de ? "Anmelden" : "Sign in",
    signup: de ? "Konto erstellen" : "Create an account",
    forgot: de ? "Passwort zurücksetzen" : "Reset password",
    magic: de ? "Mit E-Mail-Link anmelden" : "Sign in with an email link",
  };
  const modeLink = (next: LoginMode) => buildLoginPath(returnTo, next);
  if (loading || (user && !user.is_anonymous && mode !== "forgot"))
    return (
      <div className="page-card login-card" role="status">
        {de ? "Anmeldung wird geladen …" : "Loading sign-in …"}
      </div>
    );

  return (
    <div className="page-card login-card">
      <h1 className="page-title">
        {sent ? (de ? "Posteingang prüfen" : "Check your inbox") : titles[mode]}
      </h1>
      {sent ? (
        <>
          <p className="page-intro" role="status">
            {sent === "signup"
              ? de
                ? "Falls die Adresse für eine Registrierung verfügbar ist, erhältst du einen Bestätigungslink."
                : "If the address is available for registration, you’ll receive a confirmation link."
              : de
                ? "Falls ein Konto zu dieser Adresse besteht, erhältst du einen Link."
                : "If there’s an account for this address, you’ll receive a link."}
          </p>
          <p className="login-email">{email}</p>
          <p className="muted">
            {de
              ? "Öffne den Link in diesem Browser. Prüfe auch den Spamordner."
              : "Open the link in this browser. Check your spam folder as well."}
          </p>
          <div className="login-actions">
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => {
                setSent(null);
                setError("");
              }}
            >
              {de ? "E-Mail erneut anfordern" : "Request another email"}
            </button>
            <Link className="tb-text-link" href={modeLink("signin")}>
              {titles.signin}
            </Link>
          </div>
        </>
      ) : (
        <form onSubmit={submit} className="stack-md login-form">
          <div className="field-group">
            <label htmlFor="email" className="field-label">
              {de ? "E-Mail-Adresse" : "Email address"}
            </label>
            <input
              className="field-control"
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete={passwordMode ? "username" : "email"}
              autoCapitalize="none"
              spellCheck={false}
            />
          </div>
          {passwordMode && (
            <div className="field-group">
              <label htmlFor="password" className="field-label">
                {de ? "Passwort" : "Password"}
              </label>
              <input
                className="field-control"
                id="password"
                name="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={
                  mode === "signup" ? minimumPasswordLength : undefined
                }
                autoComplete={
                  mode === "signin" ? "current-password" : "new-password"
                }
                aria-describedby={
                  mode === "signup" ? "password-hint" : undefined
                }
              />
              {mode === "signup" && (
                <small id="password-hint">
                  {de ? "Mindestens 8 Zeichen." : "At least 8 characters."}
                </small>
              )}
            </div>
          )}
          {siteKey ? (
            <div className="login-captcha">
              <Turnstile
                key={mode}
                ref={turnstile}
                siteKey={siteKey}
                onSuccess={(token) => {
                  setCaptcha(token);
                  setCaptchaFailed(false);
                }}
                onExpire={() => setCaptcha(null)}
                onError={() => {
                  setCaptcha(null);
                  setCaptchaFailed(true);
                }}
                options={{ language: locale, theme: "auto" }}
              />
              {captchaFailed && (
                <>
                  <p className="tb-error" role="alert">
                    {copy.login.captchaUnavailable}
                  </p>
                  <button
                    type="button"
                    className="tb-text-button"
                    onClick={() => turnstile.current?.reset()}
                  >
                    {de
                      ? "Sicherheitsprüfung erneut laden"
                      : "Reload security check"}
                  </button>
                </>
              )}
            </div>
          ) : (
            <p className="tb-error" role="alert">
              {copy.login.captchaUnavailable}
            </p>
          )}
          {error && (
            <p className="tb-error" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary login-submit"
            disabled={busy || !captcha || !router.isReady}
          >
            {busy
              ? de
                ? "Bitte warten …"
                : "Please wait …"
              : passwordMode
                ? titles[mode]
                : de
                  ? "Link senden"
                  : "Send link"}
          </button>
        </form>
      )}
      {!sent && passwordMode && oauthProviders.length > 0 && (
        <div className="login-actions">
          {oauthProviders.map((provider) => {
            const label = provider === "google" ? "Google" : "Apple";
            return (
              <button
                key={provider}
                type="button"
                className="btn btn-outline"
                disabled={busy}
                onClick={() => void oauth(provider)}
              >
                {de ? `Mit ${label} fortfahren` : `Continue with ${label}`}
              </button>
            );
          })}
        </div>
      )}
      {!sent && (
        <div className="login-actions">
          {mode !== "signin" && (
            <Link className="tb-text-link" href={modeLink("signin")}>
              {titles.signin}
            </Link>
          )}
          {mode === "signin" && (
            <Link className="tb-text-link" href={modeLink("signup")}>
              {titles.signup}
            </Link>
          )}
          {mode !== "forgot" && (
            <Link className="tb-text-link" href={modeLink("forgot")}>
              {de ? "Passwort vergessen?" : "Forgot password?"}
            </Link>
          )}
          {mode === "signin" && magicLinkEnabled && (
            <Link className="tb-text-link" href={modeLink("magic")}>
              {titles.magic}
            </Link>
          )}
          {user && !user.is_anonymous && (
            <button
              className="tb-text-button"
              onClick={() =>
                void signOut().catch((err) =>
                  setError(authErrorText(err, locale)),
                )
              }
            >
              {de ? "Abmelden" : "Sign out"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
