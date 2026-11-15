# TraitBridge – Einrichtungsstand

15. November 2026.

Der V2-Code und die Supabase-Anbindung sind lokal vorbereitet. Alte Community-Seiten und Archivdateien wurden auf Wunsch aus dem aktuellen Projekt entfernt. Tests, Lerninhalte und bestehende Kontodaten bleiben erhalten.

Die additive Datenbankmigration und die Edge Function sind **noch nicht im aktiven Supabase-Projekt angewendet**. Die automatische Freigabeprüfung hat diese Produktionsschritte bis zu einer ausdrücklichen Freigabe zurückgewiesen. Es wurde keine kostenpflichtige Umgebung angelegt.

Die Einrichtung erfolgt auf dem vorhandenen Projekt TraitBridge. Der Service-Schlüssel kann in Supabase bleiben; Next.js verwendet die gesicherte Edge-Anbindung. Alte Datenbank-Schreibrechte werden erst beim tatsächlichen Website-Wechsel stillgelegt.

Details: [Einrichtung](docs/V2.md), [Prüfungen](docs/V2_VALIDATION.md), [Roadmap](docs/V2_ROADMAP.md).
