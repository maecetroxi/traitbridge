import type { AppProps } from "next/app";
import Head from "next/head";
import { useRouter } from "next/router";
import "../styles/globals.css";
import Layout from "../components/Layout";
import LearningNavigation from "../components/LearningNavigation";
import { AuthProvider } from "../contexts/AuthContext";
import { LocaleProvider } from "../contexts/LocaleContext";
import { BridgeProvider } from "../contexts/BridgeContext";
import "../styles/bridge.css";

function MyApp({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://traitbridge.com"
  ).replace(/\/$/, "");
  const canonicalPath = router.asPath.split(/[?#]/, 1)[0] || "/";
  const canonicalUrl = `${siteUrl}${canonicalPath === "/" ? "" : canonicalPath}`;
  const noIndex = [
    "/login",
    "/profile",
    "/results",
    "/test/full",
    "/messages",
    "/me",
    "/onboarding",
    "/moderation",
  ].some(
    (path) => canonicalPath === path || canonicalPath.startsWith(`${path}/`),
  );

  return (
    <>
      <Head>
        <title>TraitBridge</title>
        <meta
          name="description"
          content="Manchmal versteht dich jemand am besten, der ähnlich tickt. Persönliche Fragen und Erfahrungen von echten Menschen."
        />
        <meta
          name="robots"
          content={noIndex ? "noindex, nofollow" : "index, follow"}
        />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="TraitBridge" />
        <meta key="og-title" property="og:title" content="TraitBridge" />
        <meta
          key="og-description"
          property="og:description"
          content="Big-Five-Selbstreflexion, praktische Lerninhalte und offener Erfahrungsaustausch."
        />
        <meta property="og:url" content={canonicalUrl} />
        <meta
          property="og:image"
          content={`${siteUrl}/traitbridge-logo.png.png`}
        />
        <meta name="twitter:card" content="summary" />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#f7f6f0" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </Head>
      <LocaleProvider>
        <AuthProvider>
          <BridgeProvider>
            <Layout>
              {router.pathname.startsWith("/learn") ? (
                <LearningNavigation>
                  <Component {...pageProps} />
                </LearningNavigation>
              ) : (
                <Component {...pageProps} />
              )}
            </Layout>
          </BridgeProvider>
        </AuthProvider>
      </LocaleProvider>
    </>
  );
}

export default MyApp;
