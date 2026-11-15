# Supabase V2 – ausgeführte Einrichtung

15. November 2026. Ziel: vorhandenes Projekt **TraitBridge**, `nhzcvrxhtwdmhjktpcsf`, Frankfurt.

Nach ausdrücklicher Freigabe für das aktive Projekt ausgeführt:

- Additive Migration `20261115134218_traitbridge_v2_private_beta.sql` angewendet; Datenbankhistorie bestätigt Version `20261115134218`.
- Edge Function `traitbridge-v2` veröffentlicht, **ACTIVE**, Version **1**, Function-ID `c31124ff-33bb-4b45-a326-ba4317e8f0a6`.
- Paket-SHA-256 laut Deployment: `9a6f2216362616d783e553817b65750840fdadc1d21489e5caf6eb917bec56f7`.
- Ausschliesslich das ausdrücklich bezeichnete vorhandene Eigentümerkonto für Beta und Moderation freigeschaltet. Keine E-Mail-Adresse oder Nutzer-ID wurde in die allgemeine Migration eingebaut.
- Vorhandene `.env.local` auf die Edge-URL und `TRAITBRIDGE_V2_ENABLED=true` gestellt; Schlüssel und Turnstile-Werte unverändert.
- Die gesondert freigegebene Löschung alter Fragen und Antworten ausgeführt. Beide Tabellen waren bereits leer; keine Konten oder Testergebnisse gelöscht.

## Nachgewiesene Zugriffsgrenzen

Zehn private Tabellen, jeweils RLS aktiviert. `anon` und `authenticated` haben weder Schema-USAGE noch EXECUTE auf `public.tb_v2`. `service_role` hat den erforderlichen Gateway-Zugriff. Ein tatsächlicher Gateway-Aufruf als Service-Rolle liefert für das eingeladene Konto den erwarteten leeren Anfangszustand. Ein Profil entsteht erst nach dem persönlichen Onboarding mit Einwilligung.

HTTPS-Prüfung der veröffentlichten Function:

| Prüfung                           | Ergebnis                  |
| --------------------------------- | ------------------------- |
| GET / Status                      | 200, `ready`              |
| POST ohne Bearer-Token            | 401, `AUTH_REQUIRED`      |
| POST mit gefälschtem Bearer-Token | 401, `AUTH_REQUIRED`      |
| PUT                               | 405, `METHOD_NOT_ALLOWED` |
| Direkter anonymer RPC-Aufruf      | 401                       |

Die Function prüft Auth selbst mit `getUser`; `verify_jwt=false` betrifft die vorgeschaltete Legacy-Prüfung, nicht den verpflichtenden Identitäts- und Beta-Zugriffsschutz im Anwendungscode. Der privilegierte Schlüssel bleibt ausschliesslich in Supabase. Die App benötigt ihn im Edge-Modus nicht.

## Security Advisors

Erneut ausgeführt. Die zehn INFO-Hinweise „RLS Enabled No Policy“ betreffen das absichtlich für Browserrollen vollständig unzugängliche Schema: Deny by default ist hier beabsichtigt. Dafür keine öffentlichen Freigabe-Policies hinzufügen. [Erläuterung](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).

Bestehende WARN-Hinweise bleiben zur bewussten Prüfung dokumentiert: GraphQL-Schema-Sichtbarkeit der alten öffentlichen Tabellen sowie der für angemeldete Nutzer per RLS auf eigene Ergebnisse begrenzten Tabelle, ausserdem deaktivierter Schutz gegen kompromittierte Passwörter. Der Produktablauf verwendet Magic Links. Es wurde keine Auth-Sicherheitsoption deaktiviert. [GraphQL-Sichtbarkeit](https://supabase.com/docs/guides/database/database-linter?lint=0026_pg_graphql_anon_table_exposed), [Passwortschutz](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection).

## Noch getrennt auszuführen

Die produktive Website wurde nicht neu veröffentlicht und kein Git-Push ausgeführt. Beim tatsächlichen Website-Wechsel kann die separate Migration `20261115134546_retire_legacy_community_writes.sql` die alten INSERT-/UPDATE-Rechte stilllegen. Sie ist aktuell nicht angewendet, damit die bisher veröffentlichte Website nicht vorzeitig unterbrochen wird.

Die E-Mail-Anmeldung und das bestätigte Eigentümerkonto sind im Projekt vorhanden. Ein neuer Magic-Link-Zustelltest, Kontrolle der tatsächlichen Callback-URLs und ein Test mit einem zweiten bewusst eingeladenen Nutzer bleiben vor weiteren Beta-Einladungen sinnvoll. Es wurden keine Testkonten, Testfragen oder Testantworten in Produktion erzeugt. Kein neuer kostenpflichtiger Projekt-/Branch-Tarif wurde angelegt; Edge-Aufrufe zählen zur normalen Supabase-Nutzung.
