# Supabase – TraitBridge V2

Das vorhandene Projekt **TraitBridge** (`nhzcvrxhtwdmhjktpcsf`) ist eingerichtet: Migration `20261115134218`, aktive Edge Function `traitbridge-v2` Version 1 und Eigentümerzugang für Beta/Moderation. Weitere Konten sind nicht automatisch zugelassen.

Die lokale `.env.local` ist aktiviert; vorhandene öffentliche Schlüssel und Turnstile-Werte bleiben erhalten:

```env
SUPABASE_V2_FUNCTION_URL=https://nhzcvrxhtwdmhjktpcsf.supabase.co/functions/v1/traitbridge-v2
TRAITBRIDGE_V2_ENABLED=true
```

Der privilegierte Schlüssel bleibt in Supabase. `SUPABASE_SERVICE_ROLE_KEY` wird im Next.js-Hosting im Edge-Modus nicht benötigt. Für den späteren Website-Deploy die beiden obigen Variablen im Hosting setzen; `.env.local` niemals hochladen oder committen.

## Erster Einstieg

Die E-Mail-Anmeldung ist im Projekt aktiviert und das vorhandene Eigentümerkonto bestätigt. Nach Anmeldung unter `/login` das Onboarding selbst abschliessen: Test, Avatar, Volljährigkeit und Einwilligung. Erst dadurch entsteht das persönliche V2-Profil. Anschliessend sind Fragen, Nachrichten und die Moderationsfunktionen unter `/moderation` verfügbar.

Ein neuer Magic-Link-Zustelltest wurde nicht durchgeführt und keine Test-E-Mail versendet. Die vorhandene Site-/Rücksprung-Konfiguration wurde nicht ersetzt. Für lokale Anmeldung müssen die verwendeten Adressen `http://localhost:3000/login` bzw. `http://127.0.0.1:3000/login` erlaubt sein; für Produktion die tatsächlichen `https://traitbridge.com/login`-Adressen. Bei fehlgeleiteten Links diese konkreten Callback-URLs und Turnstile im Dashboard prüfen.

## Daten und Sicherheit

Zehn Tabellen im privaten Schema `tb_private`, jeweils mit RLS. Browserrollen können weder das Schema nutzen noch den internen RPC-Gateway aufrufen. Die Edge Function prüft jeden Datenzugriff mit Auth `getUser` und Beta-Mitgliedschaft. Exakte Persönlichkeitswerte bleiben privat.

Die ausdrücklich freigegebene Löschung alter Fragen und Antworten wurde ausgeführt; die alten Tabellen waren bereits leer. Konten und Testergebnisse wurden nicht gelöscht. Alte Schreibrechte werden erst beim Website-Wechsel stillgelegt; die gesonderte Cutover-Migration ist noch nicht angewendet.

[Deploymentprotokoll und echte HTTPS-/Rechteprüfungen](docs/SUPABASE_DEPLOYMENT.md) · [Architektur und Betrieb](docs/V2.md) · [Roadmap](docs/V2_ROADMAP.md).
