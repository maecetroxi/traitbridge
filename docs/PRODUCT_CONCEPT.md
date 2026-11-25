# TraitBridge V2 – Produktkonzept

Stand: 25. November 2026. „Umgesetzt“ bezeichnet den Funktionsstand der geschlossenen Beta im Entwicklungsbranch. „Offen“ bezeichnet die nächste Produktarbeit.

## Kernfunktionen

- **Umgesetzt:** Persönliche Fragen stellen und bis zu drei Antworten von echten Menschen erhalten. Passende Fragen anderer Nutzer beantworten oder überspringen. Das Matching berücksichtigt die für das Thema relevanten Big-Five-Eigenschaften sowie Interessen und Erfahrungen.
- **Umgesetzt:** Persönlicher Nachrichteneingang für eigene Fragen, Antworten und Benachrichtigungen. Big-Five-Test, persönliche Ergebnisse und Lerninhalte bleiben Teil der App.
- **Umgesetzt:** In „Entdecken“ lesen Beta-Mitglieder ausdrücklich freigegebene Fragen und veröffentlichen eigenständige Erfahrungen, Erkenntnisse und Tipps als Text.

## Startseite und Navigation

- **Umgesetzt:** „Frage stellen“ und „Jemandem helfen“ stehen direkt auf der Startseite. Freigeschaltete Mitglieder mit Profil sehen das Frageformular und, falls verfügbar, eine passende Frage. Gäste melden sich vor dem Schreiben an und gelangen zur gewählten Aktion zurück.
- **Umgesetzt:** **Start | Entdecken | Nachrichten | Ich** sind direkt erreichbar. Auf dem Smartphone steht die Navigation unten, auf dem Laptop oben. Der aktive Bereich und die Zahl ungelesener Nachrichten sind sichtbar.
- **Umgesetzt:** „Nachrichten“ bündelt eigene Fragen, erhaltene und geschriebene Antworten sowie Benachrichtigungen. „Ich“ bündelt das Profil, Persönlichkeitsergebnisse, Merkliste, eigene Erfahrungen, Lerninhalte, Buchempfehlungen und Kontoeinstellungen.

## Registrierung

- **Im Entwicklungsstand umgesetzt:** E-Mail und Passwort mit Bestätigungslink und Passwortzurücksetzung. Der optionale Magic Link meldet bestehende Konten an. Vor dem Schreiben einer Frage oder Antwort sind Anmeldung, Beta-Freigabe und ein V2-Profil nötig. Der Einstieg führt nach der Anmeldung direkt zu „Frage stellen“ oder „Jemandem helfen“ zurück. Bestehende V2-Profile überspringen das Onboarding.
- **Umgesetzt:** Besucher können den Persönlichkeitstest freiwillig vor der Registrierung machen. Beim Einstieg kann ein geeignetes Kontoergebnis oder ein neuer, vollständig beantworteter Test aus demselben Browser nach bewusster Bestätigung übernommen werden. Pflicht sind ein geeignetes Ergebnis, Pseudonym, automatisch erstellter Blob-Avatar, Altersbestätigung und Einwilligungen. Interessen, Erfahrungsthemen und Avatar-Anpassungen sind später unter „Ich“ verfügbar.
- **Offen:** Tatsächliche E-Mail-Zustellung und Provider-Callbacks in einer freigegebenen Zielumgebung prüfen. Google und Apple sind vorbereitet und werden bis zur Einrichtung und Prüfung ausgeblendet. [Externe Einstellungen](AUTH_ONBOARDING.md)

## Entdecken

- **Umgesetzt:** Fragen sind standardmässig privat. Verfasser können sie bewusst freigeben und die Freigabe zurückziehen. Private Antworten erscheinen nie im Feed. Erfahrungen lassen sich mit optionalem Titel und ausgewähltem oder vorgeschlagenem Thema veröffentlichen, bearbeiten und löschen.
- **Umgesetzt:** Filter für alle Beiträge, Erfahrungen, Fragen und Themen. Neueste Beiträge zuerst. Karten zeigen Pseudonym, Blob-Avatar, Beitragsart, Thema und Text.
- **Umgesetzt:** „Alle Persönlichkeiten“, „Ähnlich wie ich“ und „Andere Perspektiven“ lassen sich mit Thema und Beitragsart kombinieren. Die Filter vergleichen grobe Stufen zu den für das Thema relevanten Merkmalen. Die Zuordnung ändert die chronologische Reihenfolge nicht.
- **Geplant:** „Entdecken“ soll perspektivisch öffentlich lesbar sein. Während der Testphase bleibt der Bereich Teil der geschlossenen Beta. In der ersten Version der Erfahrungsbeiträge gibt es keine öffentlichen Kommentare.
- **Umgesetzt:** Wer die Anzeige unter „Ich“ freigibt, zeigt auf freigegebenen Beiträgen bis zu zwei deutlich ausgeprägte Merkmale. Aufklappen zeigt alle fünf als tief, mittel oder hoch. Der Kurztest erhält einen Hinweis zur groben Einordnung. Standardmässig bleibt das Profil privat. Ohne Freigabe bleiben Beiträge im allgemeinen Feed und fallen aus den Persönlichkeitsfiltern. Ein Widerruf gilt auch für vorhandene und gemerkte Beiträge.
- **Umgesetzt:** Freiwilliges „Hat mir geholfen“ für Erfahrungen und „Merken“ für Fragen und Erfahrungen. Beide Aktionen lassen sich zurücknehmen. „Ich“ zeigt die eigene Merkliste. Das bestehende private „Danke“ gilt für Antworten.
- **Produktgrenzen:** Keine öffentlichen Like-Zahlen, Rankings, wissenschaftlich unbegründeten Kompatibilitätsprozente oder öffentlichen Profilseiten.

## Benachrichtigungen

- **Umgesetzt:** Benachrichtigungen in der App.
- **Geplant:** Optionale E-Mail-Benachrichtigungen mit persönlichen Einstellungen.

## Moderation

- **Umgesetzt:** Fragen und Antworten melden, Nutzer blockieren, Inhalte ausblenden und Konten für die Beta sperren. Die Moderationsübersicht ist nur für freigeschaltete Moderationskonten zugänglich. Schreiblimits und Schutz vor doppelten Fragen bieten grundlegenden Spamschutz.
- **Umgesetzt:** Erfahrungen melden, Personen blockieren und Inhalte über dieselbe Moderationsübersicht ausblenden. Feed und Merkliste berücksichtigen Sperren. Veröffentlichungslimits und Schutz vor wiederholtem Text gelten auch nach Löschung.
- **Umgesetzt:** Berechtigte Moderatoren sehen unter „Ich“ die Zahl offener Meldungen. In der Übersicht bearbeiten sie gemeldete Fragen, Antworten und Erfahrungen. Sie können Inhalte ausblenden, Meldungen ohne Massnahme abschliessen und den Beta-Zugang eines Kontos sperren. In der aktuellen Moderation erfasste Massnahmen können mit dem vorherigen Status rückgängig gemacht werden. [Anleitung für Betreiber](MODERATION.md)
- **Produktentscheidung:** Menschliche Moderation mit einfachen Regeln genügt. Komplexe KI-Moderation ist nicht vorgesehen.

## Texte und Gestaltung

- **Umgesetzt:** Deutsch und Englisch sowie eine Oberfläche für Smartphone und Laptop. Kurze Beschriftungen und kompakte Filter lassen mehr Platz für Fragen und Beiträge. [Aktuelle V2-Galerie](screenshots/v2/uebersicht/README.md)
- **Leitlinie:** Kurze, verständliche Beschriftungen und ein freundlicher, sachlicher Ton. Floskeln, unnötig emotionale Texte und überflüssige Erklärungen beim Überarbeiten streichen. Beide Sprachen und Gerätegrössen mitpflegen.

Die bestehende V2-Architektur und funktionierende Abläufe sind die Grundlage für die Weiterentwicklung. Technischer Stand und offene Betriebsprüfungen stehen in der [V2-Dokumentation](V2.md) und der [V2-Roadmap](V2_ROADMAP.md).
