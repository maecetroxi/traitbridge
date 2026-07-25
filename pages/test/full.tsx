import React, { useState } from "react";
import BigFiveTest from "../../components/BigFiveTest";
import LanguageSelector from "../../components/LanguageSelector";
import { Locale } from "../../lib/i18n";

const FullTestPage: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<Locale | null>(null);

  const handleLanguageSelect = (languageCode: Locale) => {
    setSelectedLanguage(languageCode);
  };

  if (!selectedLanguage) {
    return <LanguageSelector onSelect={handleLanguageSelect} />;
  }

  return (
    <BigFiveTest
      language={selectedLanguage}
      onChangeLanguage={() => setSelectedLanguage(null)}
    />
  );
};

export default FullTestPage;
