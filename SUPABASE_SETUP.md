# Supabase Setup-Anleitung

Diese Anleitung erklärt, wie du die Supabase-Datenbank für TraitBridge einrichtest.

## 1. Supabase-Projekt erstellen

1. Gehe zu [supabase.com](https://supabase.com) und erstelle ein neues Projekt
2. Notiere dir die **Project URL** und den **anon/public key** aus den Settings > API

## 2. Umgebungsvariablen konfigurieren

Erstelle eine `.env.local` Datei im Projektroot:

```env
NEXT_PUBLIC_SUPABASE_URL=deine-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=dein-supabase-anon-key
```

## 3. Datenbankschema erstellen

1. Gehe im Supabase Dashboard zu **SQL Editor**
2. Öffne die Datei `supabase/migrations/001_initial_schema.sql`
3. Kopiere den gesamten SQL-Code
4. Füge ihn in den SQL Editor ein und führe ihn aus

Dies erstellt:
- **personality_results**: Tabelle für Big-Five-Testergebnisse
- **questions**: Tabelle für Community-Fragen
- **answers**: Tabelle für Antworten auf Fragen
- **Row Level Security (RLS)**: Policies für sicheren Datenzugriff
- **Trigger**: Automatische Aktualisierung von `updated_at` Feldern

## 4. Row Level Security (RLS) überprüfen

Die RLS-Policies sind bereits im SQL-Script enthalten. Sie stellen sicher, dass:
- Benutzer nur ihre eigenen Testresultate sehen können
- Alle authentifizierten Benutzer Fragen und Antworten sehen können
- Benutzer nur ihre eigenen Inhalte erstellen, bearbeiten und löschen können

## 5. E-Mail-Authentifizierung aktivieren

1. Gehe zu **Authentication > Providers** im Supabase Dashboard
2. Stelle sicher, dass **Email** aktiviert ist
3. Optional: Konfiguriere E-Mail-Templates für bessere UX

## 6. Testen

1. Starte den Dev-Server: `npm run dev`
2. Registriere einen neuen Benutzer unter `/login`
3. Führe einen Big-Five-Test durch
4. Prüfe im Supabase Dashboard unter **Table Editor**, ob die Daten gespeichert wurden

## Datenbankstruktur

### personality_results
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key zu auth.users)
- `scores`: JSONB (Big-Five-Scores: O, C, E, A, N)
- `calculated_scores`: JSONB (Vollständige Scores für Interpretationen)
- `variant`: TEXT ('quick' oder 'full')
- `language`: TEXT (Standard: 'de')
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### questions
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key zu auth.users)
- `title`: TEXT
- `body`: TEXT
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

### answers
- `id`: UUID (Primary Key)
- `question_id`: UUID (Foreign Key zu questions)
- `user_id`: UUID (Foreign Key zu auth.users)
- `body`: TEXT
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

## Wichtige Hinweise

- **Backup**: Die Daten werden jetzt in Supabase gespeichert, nicht mehr nur lokal
- **Migration**: Bestehende localStorage-Daten werden als Fallback geladen, wenn keine Supabase-Daten vorhanden sind
- **Sicherheit**: RLS stellt sicher, dass Benutzer nur auf ihre eigenen Daten zugreifen können
- **Performance**: Indizes wurden für schnelle Abfragen erstellt

## Troubleshooting

### "relation does not exist"
- Stelle sicher, dass das SQL-Script vollständig ausgeführt wurde
- Prüfe im SQL Editor, ob die Tabellen erstellt wurden

### "new row violates row-level security policy"
- Prüfe, ob der Benutzer eingeloggt ist
- Stelle sicher, dass die RLS-Policies korrekt erstellt wurden

### "permission denied"
- Prüfe, ob die Umgebungsvariablen korrekt gesetzt sind
- Stelle sicher, dass der anon key korrekt ist

