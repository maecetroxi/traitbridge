import React, { useState } from "react";
import { useRouter } from "next/router";
import BigFiveTest from "../../components/BigFiveTest";
import LanguageSelector, { availableLanguages } from "../../components/LanguageSelector";

const FullTestPage: React.FC = () => {
  const router = useRouter();
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const handleLanguageSelect = (languageCode: string) => {
    setSelectedLanguage(languageCode);
  };

  if (!selectedLanguage) {
    return <LanguageSelector onSelect={handleLanguageSelect} />;
  }

  return <BigFiveTest language={selectedLanguage} />;
};

export default FullTestPage;
