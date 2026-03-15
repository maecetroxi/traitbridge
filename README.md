# OCEAN Community - Big Five Persoenlichkeitstest

Eine Web-Anwendung fuer Big Five Persoenlichkeitstests mit Community-Funktion. Die App ermoeglicht es Nutzern, einen wissenschaftlich fundierten Persoenlichkeitstest durchzufuehren, ihre Ergebnisse zu analysieren und sich in der Community auszutauschen.

## Features

- Big Five Persoenlichkeitstest mit vollstaendiger Auswertung
- Detaillierte Ergebnisse fuer die fuenf Persoenlichkeitsdimensionen (OCEAN)
- Community-Plattform fuer Fragen und Antworten
- Mehrsprachigkeit fuer den Test
- Lokale Datenspeicherung als Fallback

## Technologie-Stack

- Next.js
- TypeScript
- `@bigfive-org/questions`
- `@bigfive-org/results`
- `@bigfive-org/score`

## Installation

```bash
npm install
npm run dev
```

Die App ist danach unter `http://localhost:3000` erreichbar.

## Verfuegbare Scripts

- `npm run dev`
- `npm run build`
- `npm start`

## Projektstruktur

```text
components/
  BigFiveTest.tsx
  BigFiveResults.tsx
  PersonalityBadge.tsx
  LanguageSelector.tsx
  Layout.tsx
pages/
  index.tsx
  test.tsx
  test/full.tsx
  results.tsx
  community.tsx
  profile.tsx
```

## Verwendung

1. Starte den Big-Five-Test ueber `/test`.
2. Waehle die Sprache und beantworte alle 120 Fragen.
3. Sieh dir dein Profil und die Auswertung an.
4. Nutze anschliessend die Community.
