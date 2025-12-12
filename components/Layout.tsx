import React, { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

type LayoutProps = {
  children: ReactNode;
};

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, signOut, loading } = useAuth();

  const navItems = [
    { href: "/", label: "Start" },
    { href: "/community", label: "Community" },
    { href: "/results", label: "Resultate" },
    { href: "/test", label: "Test" }
  ];

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <>
      <header className="app-header">
        <div className="app-header-inner">
          <div className="app-brand">
            <Link href="/" className="app-logo" style={{ cursor: 'pointer' }}>
              <Image
                src="/traitbridge-logo.png.png"
                alt="Traitbridge Logo"
                width={150}
                height={50}
                priority
                style={{ height: '100%', width: 'auto', objectFit: 'cover' }}
              />
            </Link>
            <div>
              <div className="app-title">OCEAN Community</div>
              <div className="app-subtitle">Big Five · Fragen · Austausch</div>
            </div>
          </div>
          <nav className="app-nav" aria-label="Hauptnavigation">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? router.pathname === item.href
                  : router.pathname.startsWith(item.href);
              const className = [
                "app-nav-link",
                isActive ? "app-nav-link-active" : ""
              ]
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
                {user ? (
                  <>
                    <Link 
                      href="/profile" 
                      className={router.pathname === "/profile" ? "app-nav-link app-nav-link-active" : "app-nav-link"}
                      style={{ marginLeft: "1rem" }}
                    >
                      Profil
                    </Link>
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
                        marginLeft: "0.5rem",
                      }}
                    >
                      Abmelden
                    </button>
                  </>
                ) : (
                  <Link href="/login" className="app-nav-link" style={{ marginLeft: "1rem" }}>
                    Anmelden
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>
      </header>
      <main>
        <div className="container">
          {children}
        </div>
      </main>
      <footer className="app-footer">
        <div className="app-footer-inner">
          <span>Big Five · Fragen · menschenfreundlicher Austausch</span>
        </div>
      </footer>
    </>
  );
};

export default Layout;
