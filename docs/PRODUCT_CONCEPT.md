# TraitBridge V2 – Produktkonzept

Stand: 25. November 2026. „Umgesetzt“ bezeichnet den Funktionsstand der geschlossenen Beta im Entwicklungsbranch. „Offen“ bezeichnet die nächste Produktarbeit.

## Kernfunktionen

- **Umgesetzt:** Persönliche Fragen stellen und bis zu drei Antworten von echten Menschen erhalten. Passende Fragen anderer Nutzer beantworten oder überspringen. Das Matching berücksichtigt die für das Thema relevanten Big-Five-Eigenschaften sowie Interessen und Erfahrungen.
- **Umgesetzt:** Persönlicher Nachrichteneingang für eigene Fragen, Antworten und Benachrichtigungen. Big-Five-Test, persönliche Ergebnisse und Lerninhalte bleiben Teil der App.
- **Teilweise umgesetzt:** In „Entdecken“ können Beta-Mitglieder ausdrücklich freigegebene Fragen lesen. Eigene hilfreiche Erkenntnisse und Erfahrungen sollen künftig als eigenständige Beiträge veröffentlicht und dort gelesen werden können.

## Startseite und Navigation

- **Umgesetzt:** „Frage stellen“ und „Jemandem helfen“ stehen direkt auf der Startseite. Es gibt keine vorgeschaltete Auswahl eines Nutzungsmodus.
- **Offen:** Die Hauptnavigation soll **Start | Entdecken | Nachrichten | Ich** lauten. Derzeit ist „Entdecken“ ein Reiter auf Start. „Start“, „Nachrichten“ und „Ich“ stehen bereits in der Hauptnavigation.

## Registrierung

- **Im Entwicklungsstand umgesetzt:** E-Mail und Passwort mit Bestätigungslink und Passwortzurücksetzung. Der optionale Magic Link meldet bestehende Konten an. Vor dem Schreiben einer Frage oder Antwort sind Anmeldung, Beta-Freigabe und ein V2-Profil nötig. Der Einstieg führt nach der Anmeldung direkt zu „Frage stellen“ oder „Jemandem helfen“ zurück. Bestehende V2-Profile überspringen das Onboarding.
- **Umgesetzt:** Besucher können den Persönlichkeitstest freiwillig vor der Registrierung machen. Beim Einstieg kann ein geeignetes Kontoergebnis oder ein neuer, vollständig beantworteter Test aus demselben Browser nach bewusster Bestätigung übernommen werden. Pflicht sind ein geeignetes Ergebnis, Pseudonym, automatisch erstellter Blob-Avatar, Altersbestätigung und Einwilligungen. Interessen, Erfahrungsthemen und Avatar-Anpassungen sind später unter „Ich“ verfügbar.
- **Offen:** Tatsächliche E-Mail-Zustellung und Provider-Callbacks in einer freigegebenen Zielumgebung prüfen. Google und Apple sind vorbereitet und werden bis zur Einrichtung und Prüfung ausgeblendet. [Externe Einstellungen](AUTH_ONBOARDING.md)

## Entdecken

- **Umgesetzt:** Fragen sind standardmässig privat. Verfasser können ihre Frage bewusst für „Entdecken“ freigeben. Der Themenfilter ist vorhanden. Private Antworten werden nicht automatisch veröffentlicht.
- **Offen:** Eigenständige Erfahrungsbeiträge erstellen und lesen. Für den Feed zusätzlich die Auswahl „Ähnliche Persönlichkeiten“, „Andere Perspektiven“ und „Alle Beiträge“ anbieten.
- **Geplant:** „Entdecken“ soll perspektivisch öffentlich lesbar sein. Während der Testphase bleibt der Bereich Teil der geschlossenen Beta. In der ersten Version der Erfahrungsbeiträge gibt es keine öffentlichen Kommentare.
- **Offen:** Bei freigegebenen Beiträgen höchstens ein bis zwei auffällige Big-Five-Merkmale zeigen, sofern die Person ihre Anzeige freigegeben hat. Auf Wunsch alle fünf Eigenschaften aufklappen. Vereinfachte Ausprägungen statt exakter Testwerte verwenden.
- **Offen:** Freiwillige Aktionen „Hat mir geholfen“ und „Merken“ für Beiträge. Gemerkte Beiträge sollen später unter „Ich“ erscheinen. Das bestehende private „Danke“ gilt für Antworten.
- **Produktgrenzen:** Keine öffentlichen Like-Zahlen, Rankings, wissenschaftlich unbegründeten Kompatibilitätsprozente oder öffentlichen Profilseiten.

## Benachrichtigungen

- **Umgesetzt:** Benachrichtigungen in der App.
- **Geplant:** Optionale E-Mail-Benachrichtigungen mit persönlichen Einstellungen.

## Moderation

- **Umgesetzt:** Fragen und Antworten melden, Nutzer blockieren, Inhalte ausblenden und Konten für die Beta sperren. Die Moderationsübersicht ist nur für freigeschaltete Moderationskonten zugänglich. Schreiblimits und Schutz vor doppelten Fragen bieten grundlegenden Spamschutz.
- **Offen:** Beim Ausbau von „Entdecken“ dieselben Schutzmassnahmen auf eigenständige Erfahrungsbeiträge anwenden. Die Moderation blendet Inhalte derzeit aus. Eine endgültige Entfernung ist keine Aktion der Moderationsübersicht.
- **Produktentscheidung:** Menschliche Moderation mit einfachen Regeln genügt. Komplexe KI-Moderation ist nicht vorgesehen.

## Texte und Gestaltung

- **Umgesetzt:** Deutsch und Englisch sowie eine Oberfläche für Smartphone und Laptop.
- **Leitlinie:** Kurze, verständliche Beschriftungen und ein freundlicher, sachlicher Ton. Floskeln, unnötig emotionale Texte und überflüssige Erklärungen beim Überarbeiten streichen. Beide Sprachen und Gerätegrössen mitpflegen.

Die bestehende V2-Architektur und funktionierende Abläufe sind die Grundlage für die Weiterentwicklung. Technischer Stand und offene Betriebsprüfungen stehen in der [V2-Dokumentation](V2.md) und der [V2-Roadmap](V2_ROADMAP.md).
