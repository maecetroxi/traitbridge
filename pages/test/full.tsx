import React, { useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import BigFiveTest from "../../components/BigFiveTest";
import LanguageSelector from "../../components/LanguageSelector";
import { useLocale } from "../../contexts/LocaleContext";
import { Locale } from "../../lib/i18n";

const FullTestPage: React.FC = () => {
  const router = useRouter();
  const { copy } = useLocale();
  const [selectedLanguage, setSelectedLanguage] = useState<Locale | null>(null);

  useEffect(() => {
    const requestedLanguage =
      router.query.lang ||
      (typeof window !== "undefined"
        ? new URLSearchParams(window.location.search).get("lang")
        : null);
    if (requestedLanguage === "de" || requestedLanguage === "en") {
      setSelectedLanguage(requestedLanguage);
    }
  }, [router.query.lang]);

  const handleLanguageSelect = (languageCode: Locale) => {
    setSelectedLanguage(languageCode);
  };

  if (!selectedLanguage) {
    return (
      <>
        <Head>
          <title>{copy.testSelector.title} | TraitBridge</title>
          <meta name="description" content={copy.testSelector.description} />
        </Head>
        <LanguageSelector onSelect={handleLanguageSelect} />
      </>
    );
  }

  return (
    <>
      <Head>
        <title>{copy.test.title} | TraitBridge</title>
        <meta name="description" content={copy.test.introduction} />
      </Head>
      <BigFiveTest
        language={selectedLanguage}
        onChangeLanguage={() => setSelectedLanguage(null)}
      />
    </>
  );
};

export default FullTestPage;
