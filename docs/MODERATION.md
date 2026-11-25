# Moderation in der V2-Beta

1. Unter **Ich → Moderation** steht die Zahl offener Meldungen. **Offen** zeigt die ältesten Meldungen zuerst. Jede Karte enthält die Beitragsart, den Inhalt, das Pseudonym der verfassenden Person, den Meldegrund und den Meldezeitpunkt.
2. **Inhalt ausblenden** entzieht den betroffenen Inhalt der bisherigen Zielgruppe. Weitere offene Meldungen zum selben Inhalt werden ebenfalls abgeschlossen. **Ohne Massnahme abschliessen** bearbeitet nur die ausgewählte Meldung. **Konto sperren** entzieht dem Konto den Beta-Zugang. Ausblenden und Sperren benötigen eine Bestätigung.
3. Unter **Abgeschlossen** erscheinen die letzten 25 bearbeiteten Meldungen mit Ergebnis. Unter **Ausgeblendet** und **Gesperrte Konten** können hier erfasste Massnahmen rückgängig gemacht werden. Die ursprüngliche Sichtbarkeit bleibt erhalten. Eine geschlossene Frage bleibt geschlossen, private Inhalte bleiben privat. Ältere Sperren ohne gespeicherten Ausgangsstatus und gelöschte Inhalte sind in diesen Listen nicht wiederherstellbar.

Die Warteschlange zeigt bis zu 100 offene Meldungen und zählt auch weitere offene Meldungen. Die Zahl unter „Ich“ wird beim Öffnen und bei sichtbarer App alle 60 Sekunden aktualisiert. Handlungsbedarf wird in der App angezeigt. Entscheidungen erfolgen manuell.

## Technische Einrichtung

Die [additive Migration](../supabase/migrations/20261125165424_v2_moderation_workflow.sql) speichert Meldungsentscheidungen und den vorherigen Zustand. Der Gateway prüft für jede Moderationsabfrage und -aktion eine aktive Beta-Mitgliedschaft mit Moderatorrolle. Das private Schema und die RPC-Funktion sind aus Browserrollen nicht erreichbar. Eine Kontolöschung entzieht dem Konto die Möglichkeit zur Wiederfreigabe.

Migration nach Assessment, Erfahrungsbeiträgen und Persönlichkeitsfreigabe anwenden. Danach das aktualisierte Edge-Paket und die Web-App gemeinsam ausrollen. Die Prüfung im gehosteten Zielprojekt steht aus. [Entdecken und Reihenfolge](DISCOVER.md)
