# TraitBridge V2

Persönliche Fragen, echte menschliche Erfahrungen und eine Vermittlung über relevante Big-Five-Ähnlichkeiten. Eine zweisprachige, responsive Next.js-App mit drei Bereichen: **Start**, **Nachrichten**, **Ich**.

V2 ist für eine **geschlossene Beta ab 18** vorbereitet. Der Kern braucht keine OpenAI-API. Neue private Fragen sind von der bisherigen öffentlichen V1-Community getrennt. V1 wurde vor der Entwicklung mit allen vorgefundenen Änderungen archiviert.

## Dokumentation

- [V1-Archiv, Commit, Screenshots und Wiederherstellung](docs/archive/v1/README.md)
- [V2: Funktionen, Architektur, Datenbank, Einrichtung und Kosten](docs/V2.md)
- [Prüfergebnisse und Grenzen der Prüfung](docs/V2_VALIDATION.md)
- [Roadmap und Schritte vor Beta/öffentlichem Release](docs/V2_ROADMAP.md)

## Lokal starten

Node.js 22 verwenden. `.env.example` nach `.env.local` kopieren und eigene Werte einsetzen. Keine echten Zugangsdaten committen.

```sh
npm ci
npm run dev
```

Magic-Link-Login und Tests verwenden die bestehende Supabase-Konfiguration. Für den privaten V2-Austausch zusätzlich die neue Migration **zuerst in Staging** anwenden, das ausschliesslich serverseitige `SUPABASE_SERVICE_ROLE_KEY` setzen, ausgewählte Konten in `tb_private.beta_members` einladen und erst dann `TRAITBRIDGE_V2_ENABLED=true` aktivieren. Die ausführliche Anleitung steht in [docs/V2.md](docs/V2.md). Ohne Freischaltung bleiben die privaten Schreibfunktionen geschlossen; die Oberfläche zeigt dies verständlich an.

```sh
npm test
npm run typecheck
npm run build
npm run audit:prod
npm start
```

## Enthalten

- Kurzes Onboarding mit bestehender zehnteiliger, ausdrücklich grober Orientierung
- Vollständiger IPIP-NEO-120 mit Entwurfsfortschritt und Ergebnissen
- Reproduzierbarer, veränderbarer SVG-Avatar ohne Generierungskosten
- Deterministisches, themenbezogenes Matching mit gestufter Suche
- Private Fragen, freiwilliges Entdecken und persönlicher Nachrichtenaustausch
- Transaktionssichere Reservierungen und höchstens drei Zustellungen pro Frage
- Freiwilliges Danke, In-App-Benachrichtigungen, Melden und Blockieren
- Geschützte Moderationsoberfläche, Inhalts- und Beta-Kontosperren
- Eigene Inhalte und Konto löschen, Vermittlung pausieren
- Bestehende Lerninhalte, wissenschaftliche Hintergründe, Buch- und Filmempfehlungen
- Deutscher und englischer Inhalt, adaptive Desktop-/Tablet-/Mobilansichten und PWA-Manifest

## Technische Grundlage

Next.js Pages Router, React, TypeScript und Supabase Auth/Postgres. V2 verarbeitet private Daten ausschliesslich über eine authentifizierte Next.js-API und ein serverexklusives SQL-Gateway; Browserrollen können die neuen Tabellen nicht direkt lesen. PGlite und Playwright dienen nur der Entwicklung. Alle Abhängigkeiten sind fest versioniert. Webpack wird wegen einer reproduzierten Turbopack-Junction-Einschränkung in der Windows-Sandbox verwendet.

Bestehende V1-Deployment-Unterlagen bleiben in `HOSTINGER_DEPLOYMENT.md`, `SUPABASE_SETUP.md` und `RELEASE_STATUS.md` nachvollziehbar. Sie beschreiben den bisherigen Betrieb und ersetzen nicht die V2-Cutover-Anleitung. Es wurde weder ein Remote-Push noch eine produktive Migration oder V2-Veröffentlichung ausgeführt.
