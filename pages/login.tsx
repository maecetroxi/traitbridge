import React from "react";
import Head from "next/head";
import LoginForm from "../components/LoginForm";
import { useLocale } from "../contexts/LocaleContext";

const LoginPage: React.FC = () => {
  const { copy } = useLocale();

  return (
    <>
      <Head>
        <title>{copy.login.signInTitle} | TraitBridge</title>
        <meta name="description" content={copy.login.intro} />
      </Head>
      <LoginForm />
    </>
  );
};

export default LoginPage;
