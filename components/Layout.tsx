import React, { ReactNode, useEffect, useState } from "react";
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [router.asPath]);

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
    await router.push("/");
  };

  return (
    <>
      <a className="skip-link" href="#main-content">
        {copy.layout.skipToContent}
      </a>
      <header className="app-header">
        <div className="app-header-inner">
          <Link href="/" className="app-brand" aria-label="TraitBridge">
            <span className="app-logo">
              <Image
                src="/traitbridge-logo.png.png"
                alt=""
                width={58}
                height={58}
                priority
              />
            </span>
            <span>
              <span className="app-title">TraitBridge</span>
              <span className="app-subtitle">{copy.layout.subtitle}</span>
            </span>
          </Link>

          <div className="app-header-utilities">
            <LocaleSwitcher />
            <button
              type="button"
              className="app-menu-button"
              aria-expanded={isMenuOpen}
              aria-controls="primary-navigation"
              aria-label={isMenuOpen ? copy.layout.closeMenu : copy.layout.openMenu}
              onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
            >
              <span aria-hidden="true">{isMenuOpen ? "×" : "☰"}</span>
            </button>
          </div>

          <nav
            id="primary-navigation"
            className={`app-nav${isMenuOpen ? " app-nav-open" : ""}`}
            aria-label={copy.layout.navigationLabel}
          >
            {visibleNavItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? router.pathname === item.href
                  : router.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`app-nav-link${isActive ? " app-nav-link-active" : ""}`}
                  aria-current={isActive ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            {!loading &&
              (isRegisteredUser ? (
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="app-nav-link app-nav-button"
                >
                  {copy.layout.nav.signOut}
                </button>
              ) : (
                <Link href="/login" className="app-nav-link">
                  {copy.layout.nav.signIn}
                </Link>
              ))}
          </nav>
        </div>
      </header>

      <main id="main-content" className="app-main">
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
