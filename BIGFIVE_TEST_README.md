# Big Five Test Implementation README

## Zweck

Dieses Dokument beschreibt, wie der Big-Five-Test im TraitBridge-Projekt implementiert ist, welche externen Quellen verwendet werden und in welchen Punkten die Implementierung mit dem Referenzprojekt `rubynor/bigfive-web` uebereinstimmt oder davon abweicht.

## Kurzfazit

- TraitBridge verwendet dasselbe Frageninventar-Grundmodell wie `bigfive-web`: das Johnson 120 IPIP-NEO-PI-R Inventar.
- TraitBridge verwendet dieselbe Fragenquelle ueber das NPM-Paket `@bigfive-org/questions`.
- TraitBridge verwendet dieselbe Grundidee fuer die Auswertung: Antworten werden auf 1-5 skaliert, reverse-keyed Items werden ueber `minus`-Choices invertiert, danach werden Rohsummen und Mittelwerte je Domain und Facette berechnet.
- Es gab eine relevante Abweichung zur GitHub-Vorlage bei den Schwellen fuer `low / neutral / high`:
  - `bigfive-web`: `low < 2.5`, `neutral 2.5 bis 3.5`, `high > 3.5`
  - vorher in TraitBridge ueber das installierte Paket: `low < 3.0`, `neutral = 3.0`, `high > 3.0`
- Diese Abweichung wurde in TraitBridge lokal korrigiert, damit die textliche Einordnung jetzt dem Referenzprojekt entspricht.

## Verwendete Quellen

### 1. Referenzprojekt

- GitHub: `rubynor/bigfive-web`
  - Fragenpaket: https://github.com/rubynor/bigfive-web/tree/master/packages/questions
  - Score-Paket: https://github.com/rubynor/bigfive-web/tree/master/packages/score
  - Results-Paket: https://github.com/rubynor/bigfive-web/tree/master/packages/results

### 2. Live-Seite

- https://bigfive-test.com/

### 3. Inventar / wissenschaftliche Grundlage

- IPIP / 30-facet NEO-PI-R proxy items:
  - https://ipip.ori.org/30facetneo-pi-ritems.htm
- Hintergrund zum IPIP:
  - https://ipip.ori.org/

## Wichtige begriffliche Praezisierung

TraitBridge benutzt nicht das proprietaere Originalinstrument `NEO PI-R` direkt, sondern das oeffentliche IPIP-basierte Johnson-120-Inventar, das die NEO-PI-R-Facettenstruktur abbildet. Inhaltlich ist die Formulierung "beruht auf IPIP NEO" korrekt. Streng gesprochen sollte man aber eher von `Johnson 120 IPIP-NEO-PI-R` oder `IPIP-basiertem Proxy zum NEO-PI-R` sprechen als vom proprietaeren Originaltest.

## Implementierungsablauf in TraitBridge

### 1. Fragen laden

Datei:

- `components/BigFiveTest.tsx`

Die Fragen werden mit `getItems(language)` aus `@bigfive-org/questions` geladen.

Dieses Paket liefert:

- 120 Items
- Zuordnung zu Domain (`O`, `C`, `E`, `A`, `N`)
- Zuordnung zu Facette (`1` bis `6` pro Domain)
- Kennzeichnung `keyed: plus` oder `keyed: minus`
- Antwortoptionen je Item

Wichtig:

- Bei `plus` ist die Antwortskala direkt `1 -> 5`
- Bei `minus` wird die Skala invertiert `5 -> 1`

Damit ist die Reverse-Codierung bereits im Fragenpaket selbst enthalten.

### 2. Antworten sammeln

TraitBridge speichert pro Frage genau den numerischen `score`, der aus der gewaehlten Antwortoption kommt.

Wichtig:

- Es wird nicht mehr der Text gespeichert.
- Es wird nicht mehr versehentlich ein String statt einer Zahl uebergeben.
- Dadurch funktionieren Summen und Mittelwerte korrekt.

### 3. Rohscores berechnen

TraitBridge nutzt `processAnswers(...)` aus `@bigfive-org/score`.

Das Ergebnis enthaelt je Domain:

- `score`: Rohsumme aller Itemwerte
- `count`: Anzahl der Items in dieser Domain
- `facet`: Rohsummen und Counts je Facette

TraitBridge berechnet daraus die sichtbaren Dimensionswerte als:

- `dimensionScore = score / count`

Das ergibt Werte auf der Skala `1.0 bis 5.0`.

### 4. Textliche Einordnung

Die textliche Auswertung wird ueber `@bigfive-org/results` erzeugt. Diese Bibliothek erwartet fuer jede Domain und Facette:

- Rohsumme
- Itemanzahl
- qualitative Klasse `low`, `neutral` oder `high`

Damit die textliche Ausgabe mit `bigfive-web` uebereinstimmt, setzt TraitBridge diese Klassifikation nun mit denselben Schwellen:

- `high`: Durchschnitt `> 3.5`
- `low`: Durchschnitt `< 2.5`
- `neutral`: sonst

Diese Logik wird in TraitBridge zentral in `lib/bigfive-results.ts` angewendet.

## Vergleich mit `bigfive-web`

### Frageninventar

Status: praktisch identisch

Begruendung:

- `bigfive-web` verwendet `@bigfive-org/questions`
- TraitBridge verwendet ebenfalls `@bigfive-org/questions`
- Paketbeschreibung im TraitBridge-Projekt:
  - "Module for returning Big Five Johnson 120 IPIP-NEO-PI-R items"
- Die deutsche Choice-Definition (`plus` / `minus`) stimmt mit der Referenz ueberein.

### Reverse-Codierung

Status: identisch

Begruendung:

- Im Fragenpaket werden `plus`- und `minus`-Items unterschiedlich skaliert.
- TraitBridge rendert die paketseitigen Antwortoptionen direkt pro Item.
- Dadurch folgt die Reverse-Codierung der Vorlage.

### Rohscore-Bildung

Status: identisch in der Grundlogik

Begruendung:

- Beide Systeme summieren die numerischen Antwortwerte pro Domain und Facette.
- Beide Systeme teilen fuer die sichtbaren 1-5-Werte durch `count`.

### Klassifikation `low / neutral / high`

Status: war abweichend, wurde korrigiert

Begruendung:

- Referenz `bigfive-web/packages/score/src/index.ts`:
  - `high` bei `avgScore > 3.5`
  - `low` bei `avgScore < 2.5`
  - sonst `neutral`
- Installiertes TraitBridge-Paket `@bigfive-org/score@1.0.0`:
  - `high` bei `avgScore > 3`
  - `low` bei `avgScore < 3`
  - sonst `neutral`

Folge der alten Abweichung:

- Werte wie `2.6 / 5` wurden bereits als `low` beschrieben.
- Das weicht von der Referenzlogik ab und fuehlt sich sprachlich zu hart an.

Korrektur:

- TraitBridge normalisiert die qualitative Einordnung jetzt lokal auf die `bigfive-web`-Schwellen.

### Endscore der Dimensionen

Status: uebereinstimmend

Begruendung:

- TraitBridge zeigt je Dimension den arithmetischen Mittelwert auf einer `1-5`-Skala an.
- Das entspricht der naheliegenden Ableitung aus `score / count` aus der Referenz-Score-Struktur.

## Lokale TraitBridge-Dateien

Die zentrale Implementierung liegt in:

- `components/BigFiveTest.tsx`
- `components/BigFiveResults.tsx`
- `pages/profile.tsx`
- `pages/test.tsx`
- `lib/bigfive-results.ts`

## Bekannte Grenzen

### 1. Alt-Daten

Bereits gespeicherte fehlerhafte Alt-Ergebnisse aus frueheren Builds koennen ungueltig sein. TraitBridge ignoriert solche Datensaetze jetzt defensiv statt daran zu crashen.

### 2. Textpaket ist generisch

Die textliche Ergebnisbibliothek liefert grobe kategoriale Texte (`low`, `neutral`, `high`). Sie liefert keine fein abgestufte Beschreibung fuer `2.6` gegenueber `2.9`. Wenn feinere textliche Rueckmeldungen gewuenscht sind, braucht das Projekt eine eigene Interpretationslogik.

### 3. Wissenschaftliche Formulierung

Die Formulierung "wissenschaftlich validierter IPIP-NEO-PI-R-Test" ist als Kurzform vertretbar, aber fachlich praeziser waere:

- "Johnson 120 IPIP-NEO-PI-R"
- oder "IPIP-basiertes 120-Item-Inventar nach Johnson zur Annaeherung an die NEO-PI-R-Facettenstruktur"

## Fazit

TraitBridge basiert funktional auf derselben Testfamilie wie `bigfive-web` und verwendet dasselbe Johnson-120-IPIP-NEO-PI-R-Frageninventar. Die Antwortlogik und Reverse-Codierung entsprechen der Vorlage. Die wesentliche gefundene Abweichung lag in den Schwellen fuer die textliche Einordnung; diese wurde auf die Referenzlogik angeglichen.
