# OCEAN Community – Big Five Persönlichkeitstest

Eine moderne Web-Anwendung für Big Five Persönlichkeitstests mit integrierter Community-Funktion. Die App ermöglicht es Nutzern, einen wissenschaftlich fundierten Persönlichkeitstest durchzuführen, ihre Ergebnisse zu analysieren und sich in einer lokalen Community auszutauschen.

## 🌟 Features

- **Big Five Persönlichkeitstest**: Vollständiger und Quick-Test verfügbar
- **Detaillierte Ergebnisse**: Visualisierung der fünf Persönlichkeitsdimensionen (OCEAN)
- **Community-Plattform**: Fragen stellen und Antworten geben zu persönlichkeitsbezogenen Themen
- **Mehrsprachigkeit**: Unterstützung für verschiedene Sprachen
- **Lokale Datenspeicherung**: Alle Daten bleiben im Browser (localStorage)
- **Moderne UI**: Schlichtes und benutzerfreundliches Design

## 🚀 Technologie-Stack

- **Framework**: [Next.js](https://nextjs.org/) (React)
- **Sprache**: TypeScript
- **Big Five Packages**:
  - `@bigfive-org/questions` - Fragenkatalog
  - `@bigfive-org/results` - Ergebnisdarstellung
  - `@bigfive-org/score` - Auswertungslogik

## 📋 Voraussetzungen

- Node.js (Version 18 oder höher)
- npm oder yarn

## 🛠️ Installation

1. Repository klonen:
```bash
git clone https://github.com/dein-username/bigfive-community-app-v2.git
cd bigfive-community-app-v2
```

2. Abhängigkeiten installieren:
```bash
npm install
```

3. Entwicklungsserver starten:
```bash
npm run dev
```

4. App im Browser öffnen:
```
http://localhost:3000
```

## 📜 Verfügbare Scripts

- `npm run dev` - Startet den Entwicklungsserver
- `npm run build` - Erstellt eine Produktionsversion
- `npm start` - Startet den Produktionsserver

## 📁 Projektstruktur

```
bigfive-community-app-v2/
├── components/          # React-Komponenten
│   ├── BigFiveTest.tsx      # Test-Komponente
│   ├── BigFiveResults.tsx   # Ergebnisse-Komponente
│   ├── PersonalityBadge.tsx # Persönlichkeits-Badge
│   ├── LanguageSelector.tsx # Sprachauswahl
│   └── Layout.tsx           # Layout-Komponente
├── pages/               # Next.js Seiten
│   ├── index.tsx            # Startseite
│   ├── test/               # Test-Seiten
│   │   ├── full.tsx         # Vollständiger Test
│   │   └── quick.tsx        # Quick-Test
│   ├── results.tsx          # Ergebnisse-Seite
│   └── community.tsx        # Community-Seite
├── public/              # Statische Dateien
│   └── data/
│       └── translations.json  # Übersetzungen
└── styles/              # CSS-Dateien
    └── globals.css
```

## 🎯 Verwendung

### 1. Test durchführen
- Navigiere zur Startseite und klicke auf "Big-Five-Test starten"
- Wähle zwischen Quick-Test oder vollständigem Test
- Beantworte die Fragen ehrlich
- Die Ergebnisse werden automatisch gespeichert

### 2. Ergebnisse ansehen
- Nach dem Test werden deine Ergebnisse angezeigt
- Die fünf Dimensionen (Offenheit, Gewissenhaftigkeit, Extraversion, Verträglichkeit, Neurotizismus) werden visualisiert
- Erhalte kurze Erklärungen zu deinen Werten

### 3. Community nutzen
- Stelle Fragen zu persönlichkeitsbezogenen Themen
- Beantworte Fragen anderer Nutzer
- Alle Daten bleiben lokal in deinem Browser

## 🔒 Datenschutz

- **Lokale Speicherung**: Alle Daten werden ausschließlich im Browser (localStorage) gespeichert
- **Keine Server-Kommunikation**: Keine Daten werden an externe Server gesendet
- **Anonymität**: Keine Registrierung oder persönliche Daten erforderlich

## 🧪 Entwicklung

Das Projekt verwendet TypeScript für Typsicherheit und Next.js für Server-Side Rendering und Routing.

### Wichtige Komponenten

- **BigFiveTest**: Verwaltet den Testablauf und die Beantwortung der Fragen
- **BigFiveResults**: Zeigt die Testergebnisse visuell an
- **CommunityPage**: Verwaltet Fragen und Antworten in der Community

## 📝 Lizenz

Dieses Projekt ist privat und nicht für die öffentliche Nutzung bestimmt.

## 🤝 Beitragen

Beiträge sind willkommen! Bitte erstelle einen Pull Request oder öffne ein Issue für Vorschläge.

## 📧 Kontakt

Bei Fragen oder Anregungen kannst du ein Issue im Repository erstellen.

---

**Hinweis**: Dies ist eine Demo-Plattform. Für produktive Nutzung sollten zusätzliche Features wie Backend-Integration, Authentifizierung und erweiterte Community-Funktionen implementiert werden.
