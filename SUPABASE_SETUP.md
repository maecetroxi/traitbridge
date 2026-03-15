# Supabase Setup-Anleitung

Diese Anleitung erklaert, wie du die Supabase-Datenbank fuer TraitBridge einrichtest.

## 1. Supabase-Projekt erstellen

1. Gehe zu `supabase.com` und erstelle ein neues Projekt.
2. Notiere dir die Project URL und den anon/public key aus `Settings > API`.

## 2. Umgebungsvariablen konfigurieren

Lege im Projektroot eine `.env.local` Datei an:

```env
NEXT_PUBLIC_SUPABASE_URL=deine-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-supabase-anon-key
```

## 3. Datenbankschema erstellen

1. Gehe im Supabase Dashboard zum SQL Editor.
2. Oeffne `supabase/migrations/001_initial_schema.sql`.
3. Fuehre den SQL-Code aus.

Es werden diese Tabellen erstellt:

- `personality_results`
- `questions`
- `answers`

## 4. Testen

1. Starte den Dev-Server mit `npm run dev`.
2. Registriere einen Benutzer unter `/login`.
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
