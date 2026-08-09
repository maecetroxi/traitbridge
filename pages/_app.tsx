import type { AppProps } from "next/app";
import Head from "next/head";
import "../styles/globals.css";
import Layout from "../components/Layout";
import { AuthProvider } from "../contexts/AuthContext";
import { LocaleProvider } from "../contexts/LocaleContext";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>TraitBridge</title>
        <meta
          name="description"
          content="TraitBridge verbindet Big-Five-Selbstreflexion, praktische Lerninhalte und offenen Erfahrungsaustausch."
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;700;800&display=swap"
          rel="stylesheet"
        />
      </Head>
      <LocaleProvider>
        <AuthProvider>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </AuthProvider>
      </LocaleProvider>
    </>
  );
}

export default MyApp;
