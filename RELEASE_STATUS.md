# TraitBridge – Einrichtungsstand

15. November 2026.

Supabase ist für V2 eingerichtet: additive Migration `20261115134218`, aktive Edge Function `traitbridge-v2` Version 1 und ausdrücklich freigegebener Eigentümerzugang für Beta/Moderation. Die lokale Edge-Anbindung ist aktiviert. Kein neuer kostenpflichtiger Tarif oder Branch wurde angelegt.

Zehn private Tabellen mit RLS, direkte Browserzugriffe gesperrt, Service-Gateway und initialer Eigentümer-Snapshot geprüft. HTTPS-Prüfungen bestätigen 200 für den Status und 401 für fehlende/gefälschte Anmeldung. Der Service-Schlüssel bleibt in Supabase.

Die freigegebene Löschung alter Fragen/Antworten betraf null bereits vorhandene Zeilen. Konten und Testergebnisse bleiben erhalten. Alte Seiten und Archivdateien sind aus dem aktuellen Projekt entfernt. Die gesonderte Stilllegung alter Schreibrechte erfolgt erst beim Website-Wechsel.

Die öffentliche Website wurde nicht neu veröffentlicht. Remote-Push und Website-Deployment sowie ein neuer Magic-Link-Zustelltest stehen noch aus. Details: [Deploymentprotokoll](docs/SUPABASE_DEPLOYMENT.md), [Einrichtung](docs/V2.md), [Roadmap](docs/V2_ROADMAP.md).
