# Supabase Setup-Anleitung

Diese Anleitung erklaert, wie du die Supabase-Datenbank fuer TraitBridge einrichtest.

## Community-Zugang

Fragen, Erfahrungen und Perspektiven sind ohne Anmeldung lesbar. Zum Schreiben sind ein dauerhaftes Konto, ein Kurz- oder Volltest und ein öffentlich freigegebenes Community-Profil erforderlich. Die Anmeldung funktioniert passwortlos über einen einmaligen E-Mail-Link.

Einmalige Einstellungen im Supabase-Dashboard:

1. `Authentication` oeffnen.
2. Unter `Sign In / Providers` sicherstellen, dass E-Mail-Anmeldungen aktiviert sind.
3. Unter `URL Configuration` die produktive `Site URL` auf `https://traitbridge.com` setzen.
4. Unter `Redirect URLs` exakt `https://traitbridge.com/login` eintragen. Die App sendet absichtlich keine Query-Parameter in der Callback-URL; das eigentliche Rücksprungziel wird lokal und nur als geprüfter relativer Pfad gespeichert.
5. Zusätzlich `https://www.traitbridge.com/login`, `http://localhost:3000/login` und `http://127.0.0.1:3000/login` erlauben. Keine Wildcards verwenden.
6. `Anonymous Sign-Ins` deaktivieren; TraitBridge verwendet nur dauerhafte E-Mail-Konten.

Die RLS-Regeln pruefen serverseitig, dass anonyme Auth-Nutzer keine Community-Inhalte veroeffentlichen koennen.

## 1. Supabase-Projekt erstellen

1. Gehe zu `supabase.com` und erstelle ein neues Projekt.
2. Notiere dir die Project URL und den anon/public key aus `Settings > API`.

## 2. Umgebungsvariablen konfigurieren

Lege im Projektroot eine `.env.local` Datei an:

```env
NEXT_PUBLIC_SITE_URL=https://traitbridge.com
NEXT_PUBLIC_SUPABASE_URL=deine-supabase-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=dein-supabase-publishable-key
```

## 3. Datenbankschema erstellen

1. Gehe im Supabase Dashboard zum SQL Editor.
2. Oeffne `supabase/migrations/001_initial_schema.sql`.
3. Fuehre den SQL-Code aus.
4. Oeffne danach `supabase/migrations/002_public_community_read_registered_write.sql`.
5. Fuehre auch diesen SQL-Code aus.
6. Oeffne danach `supabase/migrations/003_community_categories.sql`.
7. Fuehre auch diese Migration aus. Sie kann bei Bedarf sicher erneut ausgefuehrt werden.
8. Oeffne danach `supabase/migrations/004_short_test_and_community_profiles.sql`.
9. Fuehre die Migration aus, um Kurztests, Beitragstypen, öffentliche OCEAN-Profile und die zugehörigen RLS-Regeln zu aktivieren.

Es werden diese Tabellen erstellt:

- `personality_results`
- `questions`
- `answers`
- `community_profiles`

Migration `003_community_categories.sql` ergaenzt:

- die Pflichtspalte `questions.category`
- den Standardwert `other` fuer bestehende und neue Fragen
- eine feste, kleine Kategorienliste per Check-Constraint
- einen Index auf `questions.category`

Bestehende Fragen werden automatisch der Kategorie `other` zugeordnet. Die Antwortanzahl wird aus der bestehenden `answers`-Relation gelesen; dafuer ist keine zusaetzliche Spalte noetig.

Migration `004_short_test_and_community_profiles.sql` ergänzt:

- `short` als zulässige Testvariante
- `questions.post_type` mit `question` und `experience`
- öffentliche Community-Anzeigenamen und ausschließlich die Stufen `low`, `middle`, `high`
- Schreibregeln, die ein Testergebnis und Community-Profil voraussetzen

Bestehende Beiträge erhalten automatisch `post_type = 'question'` und bleiben auch ohne öffentliches Profil lesbar.

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
- `variant`: TEXT (`full` oder `short`)
- `language`: TEXT (`de` als Standard)
- `created_at`: TIMESTAMPTZ
- `updated_at`: TIMESTAMPTZ

## Hinweise

- Supabase ist der primaere Speicherort fuer eingeloggte Benutzer.
- Lokale Daten werden nur noch als Fallback geladen.
- RLS sollte sicherstellen, dass Benutzer nur ihre eigenen Resultate sehen.
- Community-Fragen und -Antworten sind mit Migration `002` fuer `anon` und `authenticated` lesbar.
- Schreiben, Aendern und Loeschen ist durch RLS auf dauerhafte Benutzer und deren eigene Inhalte begrenzt.
- Nach Migration `003` im Table Editor stichprobenartig pruefen, ob bestehende Fragen `category = 'other'` erhalten haben.
- Nach Migration `004` prüfen, ob bestehende Beiträge `post_type = 'question'` erhalten haben.
- Die App fragt keine E-Mail-Adressen fuer Community-Ansichten ab.

## Migrationen 005 und 006

Nach Migration `004` sind auch diese beiden Migrationen in numerischer Reihenfolge erforderlich:

1. `supabase/migrations/005_data_api_grants_and_rls_hardening.sql`
2. `supabase/migrations/006_optimize_community_rls_auth_calls.sql`

Migration `005` vergibt die Data-API-Rechte explizit: Besucher duerfen nur Community-Inhalte und oeffentliche Profile lesen. Testresultate bleiben fuer `anon` vollstaendig gesperrt. Migration `006` wertet Auth-Informationen in den Community-Richtlinien einmal pro Anfrage statt einmal pro Zeile aus.

## Produktionscheck

- Security- und Performance-Advisors nach jeder Schemaaenderung pruefen.
- SSL Enforcement, Account-MFA und bei Bedarf Network Restrictions im Dashboard aktivieren.
- Fuer Magic-Link-E-Mails einen eigenen SMTP-Anbieter und angemessene Auth-Rate-Limits konfigurieren.
- Magic Links sind nur einmal verwendbar. Microsoft Safe Links und andere E-Mail-Sicherheitsfilter können Links vorab öffnen. Falls dies in den Auth-Protokollen als `otp_expired` vor dem Nutzerklick erscheint, die Vorlage auf einen E-Mail-OTP mit `{{ .Token }}` umstellen und in der App eine Code-Eingabe ergänzen; Link-Tracking beim SMTP-Anbieter deaktivieren.
- Der GitHub-Workflow `.github/workflows/supabase-keepalive.yml` fuehrt dreimal taeglich eine minimale, externe und rein lesende Data-API-Anfrage aus, um das Inaktivitaets-Pausenrisiko des Free-Projekts zu reduzieren.
- Dafuer muessen im GitHub-Repository die Secrets `SUPABASE_URL` und `SUPABASE_PUBLISHABLE_KEY` vorhanden sein. Den Workflow nach dem Merge auf den Standard-Branch einmal manuell ausfuehren und danach regelmaessig kontrollieren.
- Fuer garantierte Verfuegbarkeit bleibt ein geeigneter kostenpflichtiger Supabase-Plan erforderlich; der Keepalive reduziert das Pausenrisiko, ist aber keine Verfuegbarkeitszusage.
- Nach erfolgreicher Umstellung auf den Publishable Key den alten Legacy-`anon`-Key im Dashboard deaktivieren.
