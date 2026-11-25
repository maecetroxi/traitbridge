import Link from "next/link";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import { useBridge } from "../contexts/BridgeContext";
import LocaleSwitcher from "./LocaleSwitcher";
import Icon from "./v2/Icon";
export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { locale } = useLocale();
  const { user } = useAuth();
  const { snapshot } = useBridge();
  const de = locale === "de";
  const unread = snapshot.notifications.filter((n) => !n.read_at).length;
  const section =
    router.pathname === "/messages"
      ? "messages"
      : router.pathname === "/discover"
        ? "discover"
        : [
              "/me",
              "/profile",
              "/test",
              "/results",
              "/learn",
              "/background",
              "/onboarding",
              "/privacy",
              "/moderation",
            ].some((p) => router.pathname.startsWith(p))
          ? "me"
          : "home";
  return (
    <div className="tb-app">
      <a className="skip-link" href="#main-content">
        {de ? "Zum Inhalt" : "Skip to content"}
      </a>
      <header className="tb-header">
        <div className="tb-header-inner">
          <Link className="tb-brand" href="/" aria-label="TraitBridge Start">
            <span className="tb-brand-symbol" aria-hidden="true">
              <i />
              <i />
              <b />
            </span>
            traitbridge<span className="tb-beta">BETA</span>
          </Link>
          <nav
            className="tb-nav"
            aria-label={de ? "Hauptnavigation" : "Main navigation"}
          >
            {[
              { id: "home", href: "/", label: de ? "Start" : "Home" },
              {
                id: "discover",
                href: "/discover",
                label: de ? "Entdecken" : "Discover",
              },
              {
                id: "messages",
                href: "/messages",
                label: de ? "Nachrichten" : "Messages",
              },
              { id: "me", href: "/me", label: de ? "Ich" : "Me" },
            ].map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className={section === item.id ? "active" : ""}
                aria-current={section === item.id ? "page" : undefined}
              >
                <Icon name={item.id} />
                <span>{item.label}</span>
                {item.id === "messages" && unread > 0 && (
                  <span
                    className="tb-unread"
                    aria-label={`${unread} ${de ? "ungelesen" : "unread"}`}
                  >
                    {unread}
                  </span>
                )}
              </Link>
            ))}
          </nav>
          <div className="tb-utilities">
            <LocaleSwitcher />
            {(!user || user.is_anonymous) &&
              !router.pathname.startsWith("/login") && (
                <Link href="/login" className="tb-login">
                  {de ? "Anmelden" : "Sign in"}
                  <Icon name="arrow" size={17} />
                </Link>
              )}
          </div>
        </div>
      </header>
      <main id="main-content" className="tb-main" tabIndex={-1}>
        <div className="container">{children}</div>
      </main>
      <footer className="tb-footer">
        <span>TraitBridge</span>
        <div>
          <Link href="/community-guidelines">
            {de ? "Community-Regeln" : "Community guidelines"}
          </Link>
          <Link href="/privacy">{de ? "Datenschutz" : "Privacy"}</Link>
          <Link href="/imprint">{de ? "Impressum" : "Legal notice"}</Link>
        </div>
      </footer>
    </div>
  );
}
