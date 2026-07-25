# TraitBridge Web App

TraitBridge is a Next.js web application for Big Five personality testing, concise AI-supported reflection, and an open community area. Users can complete a scientifically grounded assessment, review their profile, and exchange questions and answers without a visible registration step.

## Features

- Full Big Five assessment with 120 items and detailed interpretation
- English-first interface with German as a secondary locale
- Dedicated test-language selection before starting the questionnaire
- Community space for questions and answers
- Big Five Compass with concise, personalized OpenAI responses
- Local browser storage fallback for profile results
- Supabase-backed anonymous access, authentication, and persistence

## Tech Stack

- Next.js
- TypeScript
- `@bigfive-org/questions`
- `@bigfive-org/results`
- `@bigfive-org/score`
- Supabase
- OpenAI Responses API

## Big Five Compass

The tool at `/tools/personality-guide` loads an existing Big Five result from the browser or starts with neutral values. Questions and answers are not stored by TraitBridge or Supabase.

OpenAI requests run only through the server route `/api/personality-advice`. Set a server-only `OPENAI_API_KEY` before using it. See `SUPABASE_SETUP.md` for details.

The default model is `gpt-4.1-mini`. Models such as `gpt-5-mini` may additionally require organization verification in the OpenAI platform.

## Installation

```bash
npm install
npm run dev
```

The app will then be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev`
- `npm run build`
- `npm start`

## Project Structure

```text
components/
  BigFiveTest.tsx
  BigFiveResults.tsx
  LanguageSelector.tsx
  Layout.tsx
  LocaleSwitcher.tsx
  LoginForm.tsx
  PersonalityBadge.tsx
contexts/
  AuthContext.tsx
  LocaleContext.tsx
lib/
  i18n.ts
  supabase.ts
  supabase-queries.ts
pages/
  index.tsx
  background.tsx
  community.tsx
  login.tsx
  profile.tsx
  results.tsx
  test.tsx
  test/full.tsx
```

## Usage

1. Open `/test`.
2. Choose the test language and complete all 120 questions.
3. Review your profile and interpretation on `/profile`.
4. Use the community section after signing in.
