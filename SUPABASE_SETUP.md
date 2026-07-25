# Supabase Setup-Anleitung

Diese Anleitung erklaert, wie du die Supabase-Datenbank fuer TraitBridge einrichtest.

## Community-Zugang

Fragen und Antworten sind ohne Anmeldung lesbar. Zum Erstellen von Fragen oder Antworten ist ein dauerhaftes Konto erforderlich. Die Anmeldung funktioniert passwortlos ueber einen einmaligen E-Mail-Link.

Einmalige Einstellungen im Supabase-Dashboard:

1. `Authentication` oeffnen.
2. Unter `Sign In / Providers` sicherstellen, dass E-Mail-Anmeldungen aktiviert sind.
3. Unter `URL Configuration` die lokale und die produktive Web-App-URL als erlaubte Redirect URLs eintragen.
4. `Anonymous Sign-Ins` werden fuer die Community nicht benoetigt und koennen deaktiviert werden.

Die RLS-Regeln pruefen serverseitig, dass anonyme Auth-Nutzer keine Community-Inhalte veroeffentlichen koennen.

## 1. Supabase-Projekt erstellen

1. Gehe zu `supabase.com` und erstelle ein neues Projekt.
2. Notiere dir die Project URL und den anon/public key aus `Settings > API`.

## 2. Umgebungsvariablen konfigurieren

Lege im Projektroot eine `.env.local` Datei an:

```env
NEXT_PUBLIC_SUPABASE_URL=deine-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-supabase-anon-key
OPENAI_API_KEY=dein-serverseitiger-openai-api-key
# Optional; Standard ist gpt-4.1-mini
OPENAI_MODEL=gpt-4.1-mini
```

`OPENAI_API_KEY` darf niemals mit `NEXT_PUBLIC_` beginnen, weil er ausschließlich in der serverseitigen API-Route verwendet wird.

## 3. Datenbankschema erstellen

1. Gehe im Supabase Dashboard zum SQL Editor.
2. Oeffne `supabase/migrations/001_initial_schema.sql`.
3. Fuehre den SQL-Code aus.
4. Oeffne danach `supabase/migrations/002_public_community_read_registered_write.sql`.
5. Fuehre auch diesen SQL-Code aus.

Es werden diese Tabellen erstellt:

- `personality_results`
- `questions`
- `answers`

## 4. Testen

1. Starte den Dev-Server mit `npm run dev`.
2. Fordere unter `/login` einen Anmeldelink an und oeffne ihn aus der E-Mail.
3. Fuehre den Big-Five-Test durch.
4. Pruefe im Supabase Table Editor, ob die Daten gespeichert wurden.

## Datenbankstruktur

### `personality_results`

- `id`: UUID
- `user_id`: UUID
- `scores`: JSONB
- `calculated_scores`: JSONB
- `variant`: TEXT (`full`)
- `language`: TEXT (`de` als Standard)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

## Hinweise

- Supabase ist der primaere Speicherort fuer eingeloggte Benutzer.
- Lokale Daten werden nur noch als Fallback geladen.
- RLS sollte sicherstellen, dass Benutzer nur ihre eigenen Resultate sehen.
