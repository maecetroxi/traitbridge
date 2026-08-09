import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const { user, loading: isAuthLoading, signInWithMagicLink } = useAuth();
  const { copy } = useLocale();
  const router = useRouter();

  const returnTo = useMemo(() => {
    const requestedPath = router.query.returnTo;

    if (
      typeof requestedPath === "string" &&
      requestedPath.startsWith("/") &&
      !requestedPath.startsWith("//")
    ) {
      return requestedPath;
    }

    return "/";
  }, [router.query.returnTo]);

  useEffect(() => {
    if (!isAuthLoading && user && !user.is_anonymous) {
      void router.replace(returnTo);
    }
  }, [isAuthLoading, returnTo, router, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const redirectUrl = `${window.location.origin}${returnTo}`;
      const response = await signInWithMagicLink(email.trim(), redirectUrl);

      if (response.error) {
        setError(response.error.message);
      } else {
        setIsEmailSent(true);
      }
    } catch {
      setError(copy.login.serviceUnavailable);
    } finally {
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

        {error && (
          <div className="text-danger" role="alert">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !email.trim()}
          className="btn btn-primary login-submit"
        >
          {isLoading ? copy.login.submitting : copy.login.submitSignIn}
        </button>
        <p className="muted login-hint">{copy.login.privacyHint}</p>
      </form>
    </div>
  );
};

export default LoginForm;
