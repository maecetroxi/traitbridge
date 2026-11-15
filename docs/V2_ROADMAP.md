# TraitBridge V2 – nächste Schritte

## Vor der ersten geschlossenen Beta

- Den V2-Entwicklungsbranch nach Freigabe auf GitHub veröffentlichen. Keine Force-Pushes.
- Supabase-Schema, Edge Function und Eigentümer-Beta-/Moderationszugang sind nach ausdrücklicher Freigabe eingerichtet. RLS, Zugriffsrechte, Security Advisors und die lokale Edge-Anbindung sind geprüft.
- Alte Datenbank-Schreibzugriffe erst beim tatsächlichen Website-Wechsel stilllegen. Die alten Seiten und Archivdateien wurden aus dem aktuellen Projekt entfernt; die ausdrücklich freigegebene Löschung alter Fragen und Antworten wurde ausgeführt; die Tabellen waren bereits leer.
- Mit mindestens zwei bewusst eingeladenen echten Konten Magic-Link-Zustellung, Session-Erneuerung, Sperrung und vollständige Kontolöschung prüfen. Dabei konkrete Callback-URLs und Turnstile kontrollieren. Die vorhandene Konfiguration blieb erhalten; die lokale QA ersetzt keinen tatsächlichen Auth-Zustelltest.
- Mit dem freigeschalteten Moderationskonto `/moderation` durchspielen und tatsächliche Zuständigkeit/Erreichbarkeit festlegen. Keine Rund-um-die-Uhr-Hilfe versprechen.
- Datenschutztexte, Einwilligungsversion, Volljährigkeitsbestätigung, Aufbewahrung, Umgang mit Meldungen und Impressum fachlich/rechtlich abnehmen. Die bestehenden redaktionellen Lücken in `LEARNING_CONTENT_GAPS.md` prüfen.
- Wenige volljährige Personen gezielt einladen und den vollständigen Ablauf auf echten iOS-/Android-Geräten sowie mit Tastatur/Screenreader testen. Die installierbare Darstellung braucht insbesondere einen echten Safari-/Chrome-Gerätetest.

## Vor einem öffentlichen Release

- Betriebserfahrung der Beta auswerten: Werden private Fragen richtig verstanden? Wie viele Angebote bleiben offen? Können Nutzer die Vermittlung einfach pausieren? Keine öffentlichen Rankings einführen.
- Unabhängige Sicherheitsprüfung für Gateway, Auth, Zugriffsgrenzen, Berichte und Löschungen. Produktionsnahe Last-/Missbrauchstests sowie Proxy-/Rate-Limit-Konfiguration prüfen. Den gemeinsamen Transaktionslock nur bei gemessenem Bedarf aufteilen.
- Moderationskapazität, Eskalation bei gefährdenden Inhalten, Support und Reaktionszeiten verbindlich organisieren. Bis dahin bleibt das Produkt geschlossen.
- Auth- und GraphQL-Advisor-Hinweise bewusst behandeln, Logs ohne Nachrichtentexte betreiben, Backup-/Wiederherstellung und Datenaufbewahrung im tatsächlichen Hosting kontrollieren.
- Für öffentlichen Zugang explizit entscheiden, ob „Entdecken“ weiter nur angemeldeten Personen zugänglich bleibt. Niemals private Antworttexte ohne weitere Freigabe veröffentlichen.

## Danach – nur bei tatsächlichem Bedarf

- **Mini-IPIP:** deutsche Fassung, Ursprung, unabhängige Validierung und Übersetzungsrechte klären; neue Instrumentversion mit eigenen Scoringtests einführen. Keine automatische Gleichsetzung mit alten Kurztest-/NEO-Ergebnissen.
- **E-Mail-Benachrichtigungen:** Anbieter/Kosten prüfen; minimale Inhalte, Outbox, Wiederholungen und Präferenzen. Später freiwillige Push-Nachrichten.
- **Matching:** Grenzen und Themengewichte mit echten, datensparsamen Beta-Erfahrungen überarbeiten. Im Moment werden bis zu 200 offene Kandidaten berücksichtigt; bei Wachstum faire Pagination ergänzen. Gegensätzliche Perspektiven wären eine bewusst wählbare zusätzliche Strategie.
- **Avatar:** weitere SVG-Details nur bei Nachfrage. Ein Selfie bleibt freiwillig und ist gegenwärtig nicht implementiert; keine Gesichtsanalyse für Persönlichkeit.
- **Lernen:** redaktionelle Übungen weiter fachlich prüfen und Quellen präzisieren. Kein Ausbau zu einer KI-Selbsthilfe-App.

Nicht Bestandteil dieses Stands: native Apps, öffentliche Rankings, Antwortpunkte, KI-generierte Ratschläge, KI-Persona, Selfie-Upload, Push, Antwort-E-Mails und vollautomatische Inhaltsmoderation.
