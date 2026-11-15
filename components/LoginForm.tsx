import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import {
  AUTH_RETURN_PATH_KEY,
  getAuthCallbackErrorCode,
  sanitizeReturnPath,
} from "../lib/return-path";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance | null>(null);
  const { user, loading: isAuthLoading, signInWithMagicLink } = useAuth();
  const { copy } = useLocale();
  const router = useRouter();
  const turnstileSiteKey =
    process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ??
    (process.env.NODE_ENV === "development" ? "1x00000000000000000000AA" : "");

  const returnTo = useMemo(
    () => sanitizeReturnPath(router.query.returnTo),
    [router.query.returnTo],
  );

  useEffect(() => {
    if (!isAuthLoading && user && !user.is_anonymous) {
      const storedReturnTo = sanitizeReturnPath(
        window.localStorage.getItem(AUTH_RETURN_PATH_KEY),
        returnTo,
      );
      window.localStorage.removeItem(AUTH_RETURN_PATH_KEY);
      void router.replace(storedReturnTo);
    }
  }, [isAuthLoading, returnTo, router, user]);

  useEffect(() => {
    const callbackErrorCode = getAuthCallbackErrorCode(window.location.hash);

    if (!callbackErrorCode) {
      return;
    }

    setError(
      callbackErrorCode === "otp_expired"
        ? copy.login.linkExpired
        : copy.login.linkInvalid,
    );
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
  }, [copy.login.linkExpired, copy.login.linkInvalid]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!turnstileSiteKey) {
      setError(copy.login.captchaUnavailable);
      return;
    }

    if (!captchaToken) {
      setError(copy.login.captchaRequired);
      return;
    }

    setIsLoading(true);

    try {
      // Keep the callback URL identical to the exact Supabase allow-list entry.
      // The same-origin continuation is stored separately because query strings
      // can cause Supabase to fall back to the configured Site URL.
      window.localStorage.setItem(AUTH_RETURN_PATH_KEY, returnTo);
      const redirectUrl = `${window.location.origin}/login`;
      const response = await signInWithMagicLink(email.trim(), redirectUrl, captchaToken);

      if (response.error) {
        window.localStorage.removeItem(AUTH_RETURN_PATH_KEY);
        setError(response.error.message);
      } else {
        setIsEmailSent(true);
      }
    } catch {
      setError(copy.login.serviceUnavailable);
    } finally {
      setCaptchaToken(null);
      turnstileRef.current?.reset();
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="page-card login-card">
        <div className="page-kicker">{copy.login.kicker}</div>
        <h1 className="page-title">{copy.login.sentTitle}</h1>
        <p className="page-intro">{copy.login.sentText}</p>
        <p className="login-email">{email}</p>
        <p className="muted login-sent-hint">{copy.login.sentHint}</p>
        <div className="login-actions">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => {
              setIsEmailSent(false);
              setError(null);
            }}
          >
            {copy.login.useDifferentEmail}
          </button>
          <Link href={returnTo} className="btn btn-primary">
            {copy.login.back}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-card login-card">
      <div className="page-kicker">{copy.login.kicker}</div>
      <h1 className="page-title">{copy.login.signInTitle}</h1>
      <p className="page-intro">{copy.login.intro}</p>

      <form onSubmit={handleSubmit} className="stack-md login-form">
        <div className="field-group">
          <label htmlFor="email" className="field-label">
            {copy.login.emailLabel}
          </label>
          <input
            className="field-control"
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder={copy.login.emailPlaceholder}
          />
        </div>

        {turnstileSiteKey ? (
          <div className="login-captcha">
            <Turnstile
              ref={turnstileRef}
              siteKey={turnstileSiteKey}
              onSuccess={setCaptchaToken}
              onExpire={() => setCaptchaToken(null)}
              onError={() => {
                setCaptchaToken(null);
                setError(copy.login.captchaUnavailable);
              }}
              options={{ language: copy.layout.nav.home === "Start" ? "de" : "en", theme: "auto" }}
            />
          </div>
        ) : (
          <div className="text-danger" role="alert">
            {copy.login.captchaUnavailable}
          </div>
        )}

        {error && (
          <div className="text-danger" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !email.trim() || !captchaToken || !turnstileSiteKey}
          className="btn btn-primary login-submit"
        >
          {isLoading ? copy.login.submitting : copy.login.submitSignIn}
        </button>
        <p className="muted login-hint">
          {copy.login.privacyHint}{" "}
          <Link href="/privacy">
            {copy.layout.nav.home === "Start" ? "Mehr zum Datenschutz." : "Read the privacy notice."}
          </Link>
        </p>
      </form>
    </div>
  );
};

export default LoginForm;
