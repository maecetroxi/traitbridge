import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";
import { useLocale } from "../contexts/LocaleContext";
import LocaleSwitcher from "./LocaleSwitcher";

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();
  const { copy } = useLocale();

  const navItems = [
    { href: "/", label: copy.layout.nav.home },
    { href: "/test", label: copy.layout.nav.test },
    { href: "/community", label: copy.layout.nav.community },
    { href: "/learn", label: copy.layout.nav.learn },
  ];
  const isRegisteredUser = Boolean(user && !user.is_anonymous);
  const visibleNavItems = isRegisteredUser
    ? [...navItems, { href: "/profile", label: copy.layout.nav.profile }]
    : navItems;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-brand">
            <Link href="/" className="app-logo" style={{ cursor: "pointer" }}>
              <Image
                src="/traitbridge-logo.png.png"
                alt="TraitBridge Logo"
                width={150}
                height={50}
                priority
                style={{ height: "100%", width: "auto", objectFit: "cover" }}
              />
            </Link>
            <div>
              <div className="app-title">TraitBridge</div>
              <div className="app-subtitle">{copy.layout.subtitle}</div>
            </div>
          </div>
          <div className="app-header-actions">
            <nav className="app-nav" aria-label="Primary navigation">
              {visibleNavItems.map((item) => {
                const isActive =
                  item.href === "/"
                    ? router.pathname === item.href
                    : router.pathname.startsWith(item.href);
                const className = ["app-nav-link", isActive ? "app-nav-link-active" : ""]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <Link key={item.href} href={item.href} className={className}>
                    {item.label}
                  </Link>
                );
              })}
              {!loading && (
                <>
                  {isRegisteredUser ? (
                    <button
                      onClick={handleSignOut}
                      className="app-nav-link"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontFamily: "inherit",
                        fontSize: "inherit",
                        padding: 0,
                        marginLeft: 0,
                      }}
                    >
                      {copy.layout.nav.signOut}
                    </button>
                  ) : (
                    <Link href="/login" className="app-nav-link" style={{ marginLeft: 0 }}>
                      {copy.layout.nav.signIn}
                    </Link>
                  )}
                </>
              )}
            </nav>
            <LocaleSwitcher />
          </div>
        </div>
      </header>
      <main>
        <div className="container">{children}</div>
      </main>
      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>{copy.layout.footer}</span>
        </div>
      </footer>
    </>
  );
};

export default Layout;
