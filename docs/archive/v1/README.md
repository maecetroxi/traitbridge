# TraitBridge V1 – historisches Archiv

Archiviert am **15. November 2026**. V1-Code: **`9ebaa32337f2159e94655c1beb7a400a6fc6a254`**.

- Unveränderter lokaler Archiv-Branch: `archive/v1`
- Annotierter Tag: `v1.0-archive`
- Ursprünglicher Ausgangsbranch: `agent/community-access-and-app-refresh`
- Dessen Ausgangscommit: `e867bda018e1eea41c7dbab0aa0681e01a4a0643`
- Entwicklungsbranch: `feature/traitbridge-v2`

Die vorgefundenen Änderungen (63 Dateien einschliesslich Löschungen und neuer Dateien) gehören zur bestehenden V1: Community-Zugang, Lernnavigation, Auth, Datenschutzseiten, Sicherheitsheader und Deployment-Dokumentation. Sie wurden vollständig im Archivcommit gesichert. Keine Änderung wurde verworfen. Der ursprüngliche Branch blieb auf seinem bisherigen Commit. Die Referenzen wurden **nicht gepusht**. Das bedarf der Freigabe des Eigentümers:

```sh
git push origin archive/v1
git push origin refs/tags/v1.0-archive
```

## Ursprüngliche Anwendung

Next.js 16.3.2 mit Pages Router, React 19.2.8, TypeScript 5.9.3, Supabase Auth/Postgres, Cloudflare Turnstile und den drei `@bigfive-org`-Paketen. Magic-Link-Anmeldung, IPIP-NEO-120 mit Zwischenspeicherung, zehnteilige grobe Kurzorientierung, lokale und kontogebundene Ergebnisse, öffentliche Community mit Antworten und groben öffentlichen Persönlichkeitsbändern, Lernartikel sowie Buch- und Filmempfehlungen auf Deutsch und Englisch. Eine frühere OpenAI-Compass-Funktion war in den vorgefundenen Änderungen bereits entfernt; ihre frühere Fassung ist im Ausgangscommit vorhanden.

`pages/` enthält Routen, `components/test/` den Test, `lib/` Scoring, Lerninhalte und Datenzugriffe, `contexts/` Auth/Sprache und `supabase/migrations/001` bis `006` das V1-Schema. Exakte Persönlichkeitsresultate sind privat, V1-Community-Beiträge bewusst öffentlich. V1 hat kein privates Nachrichtensystem und keine transaktionssicheren Antwortplätze.

## Visuelles Archiv

Unter `screenshots/desktop/` (1440 px) und `screenshots/mobile/` (390 px) liegen je elf PNGs: Start, Testübersicht, Kurztest, ausführliche Testfragen, Ergebnisse, Community, einzelne Frage, Lernen, Buchempfehlungen (in V1 bereits in der Medienbibliothek), Profil und Anmeldung. Die Bilder sind mit einem Archivbanner gekennzeichnet. Supabase-Anfragen wurden im Browser abgefangen; Profile, Frage, Antwort und Ergebnis sind ausschliesslich lokale Beispieldaten. `local@example.invalid` ist eine absichtlich ungültige Beispieladresse. Keine produktiven Daten wurden gelesen oder verändert.

## Lokal wiederherstellen

In einem separaten Checkout (nicht durch Verwerfen aktueller Arbeit):

```sh
git worktree add ../traitbridge-v1 archive/v1
cd ../traitbridge-v1
npm ci
# .env.example nach .env.local kopieren und eigene lokale Test-Konfiguration setzen
npm test
node node_modules/next/dist/bin/next dev --webpack
```

Node.js 22 verwenden. Für Auth und Community benötigt V1 eine eigene Supabase-Testumgebung mit Migrationen 001–006 und Turnstile-Konfiguration; nie ein Produktivschema nur zum Wiederherstellen verändern. Ohne Konfiguration bricht die V1-Supabase-Initialisierung ab.

## Prüfung und Einschränkungen

Alle **47 V1-Tests bestanden**. Der Produktionsbuild mit `next build --webpack` bestand. Der Standard-Turbopack-Build scheiterte in dieser Windows-Sandbox an einer verweigerten Junction-Erstellung, nicht an einem TypeScript-Fehler. Für die Screenshots wurde der bestandene lokale Produktionsbuild verwendet. Sie dokumentieren repräsentative Zustände, keine echten Interaktionen mehrerer Nutzer. V1-Meldungen erfolgten per E-Mail-Link; Blockieren und private V2-Nachrichten gab es noch nicht. Weitere damalige Einschränkungen stehen in `RELEASE_STATUS.md` des Archivcommits.
