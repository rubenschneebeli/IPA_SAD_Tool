# Fehler-, Leer- und Validierungszustände – SAD Tool

## Übersicht

Das SAD Tool behandelt Fehlerzustände, Leerzustände und Formulareingaben konsistent im gesamten Frontend. Dieses Dokument beschreibt alle implementierten Zustände, wo sie ausgelöst werden und wie sie dem Benutzer angezeigt werden.

---

## 1. Ladezustand (Spinner)

Während asynchrone Daten vom Backend geladen werden, wird ein Spinner mit dem Text `Loading...` angezeigt.

| Seite | Auslöser | Anzeige |
|---|---|---|
| Template-Übersicht | Beim Laden aller Templates beim Seitenaufruf | Spinner + `Loading...` |
| Dokument-Übersicht | Beim Laden aller Dokumente beim Seitenaufruf | Spinner + `Loading...` |
| Dokument-Editor | Beim Laden eines bestehenden Dokuments oder Templates | Spinner + `Loading...` (Vollseite) |

**Implementierung:** Der `loading`-State wird auf `true` gesetzt, bevor der API-Call startet, und in `finally` auf `false` zurückgesetzt — unabhängig davon ob der Aufruf erfolgreich war oder fehlgeschlagen ist.

**Button-Zustände während Speichern:**

| Seite | Button-Text während Speichern |
|---|---|
| Template-Editor | `Saving...` (Button deaktiviert) |
| Dokument-Editor | `Saving...` (Button deaktiviert) |
| Login | `Signing you in...` (Button deaktiviert) |

---

## 2. Leerzustände (Empty States)

Wenn die geladene Liste leer ist (keine Einträge vorhanden), wird ein informativer Text angezeigt statt einer leeren Seite.

| Seite | Meldung |
|---|---|
| Template-Übersicht | `There are no Templates yet, create a new Template` |
| Dokument-Übersicht | `There are no Documents yet, create a new Document` |

**Verhalten:** Der Leerzustand wird nur angezeigt, wenn das Laden abgeschlossen ist (`loading === false`) und die Liste leer ist (`list.length === 0`). Während des Ladens wird stattdessen der Spinner angezeigt.

---

## 3. Fehlerzustände (Error States)

### 3.1 API-Fehler beim Laden

Wenn der Backend-Server nicht erreichbar ist oder ein HTTP-Fehler auftritt, wird eine Fehlermeldung als roter Text oberhalb der Inhalte eingeblendet.

| Seite | Fehlermeldung | Auslöser |
|---|---|---|
| Template-Übersicht | `Failed to load templates.` | GET `/api/templates` schlägt fehl |
| Dokument-Übersicht | `Failed to load documents.` | GET `/api/documents` schlägt fehl |
| Template-Editor | `Failed to load template.` | GET `/api/templates/{id}` schlägt fehl |
| Dokument-Editor | `Failed to load document.` | GET `/api/documents/{id}` schlägt fehl |
| Dokument-Editor (neu) | `Failed to load template.` | GET `/api/templates/{id}` beim Anlegen schlägt fehl |

### 3.2 API-Fehler beim Speichern

| Seite | Fehlermeldung | Auslöser |
|---|---|---|
| Template-Editor | `Failed to save.` | POST/PUT schlägt fehl |
| Dokument-Editor | `Failed to save.` | POST/PUT schlägt fehl |

### 3.3 API-Fehler beim Löschen

| Seite | Fehlermeldung | Auslöser |
|---|---|---|
| Template-Übersicht | `Delete failed.` | DELETE schlägt fehl |
| Dokument-Übersicht | `Delete failed.` | DELETE schlägt fehl |

### 3.4 Authentifizierungsfehler

| Seite | Fehlermeldung | Auslöser |
|---|---|---|
| Login | `Username or password is not correct` | HTTP 401 vom Backend |

**Besonderheit beim Dokument-Editor:** Tritt ein Fehler beim initialen Laden auf (kein Dokument vorhanden), wird die gesamte Seite durch die Fehlermeldung ersetzt (`if (error && !doc && !html)`). Tritt ein Fehler erst beim Speichern auf, bleibt der Editor geöffnet und die Meldung erscheint unterhalb des Formulars.

### 3.5 Erfolgsmeldung nach Speichern

Nach erfolgreichem Speichern im Dokument-Editor erscheint ein kurzes Toast-Element:

| Anzeige | Dauer | Auslöser |
|---|---|---|
| `✓ Saved` | 2 Sekunden | Erfolgreiches PUT auf bestehendes Dokument |

---

## 4. Formularvalidierung

### 4.1 Browser-Native Validierung (`required`)

Pflichtfelder werden mit dem HTML-Attribut `required` markiert. Der Browser verhindert das Absenden des Formulars und zeigt eine native Fehlermeldung an.

| Seite | Feld | Validierung |
|---|---|---|
| Login | Username | `required` — Feld darf nicht leer sein |
| Login | Password | `required` — Feld darf nicht leer sein |
| Template-Editor | Title | `required` — Feld darf nicht leer sein |
| Dokument-Editor | Title | `required` — Feld darf nicht leer sein |

### 4.2 Backend-Validierung (`@NotBlank` / `@NotNull`)

Zusätzlich zur Frontend-Validierung werden alle Eingaben serverseitig mit Jakarta Validation geprüft.

| Endpoint | Feld | Constraint | Fehlermeldung |
|---|---|---|---|
| POST/PUT `/api/templates` | `title` | `@NotBlank` | `Title cannot be empty` |
| POST/PUT `/api/templates` | `htmlContent` | `@NotBlank` | `Content cannot be empty` |
| POST `/api/documents` | `title` | `@NotBlank` | `Title cannot be empty` |
| POST `/api/documents` | `templateId` | `@NotNull` | `Template ID cannot be empty` |
| PUT `/api/documents/{id}` | `title` | `@NotBlank` | `Title cannot be empty` |
| PUT `/api/documents/{id}` | `htmlContent` | `@NotBlank` | `HTML content cannot be empty` |

Bei einem Validierungsfehler antwortet das Backend mit HTTP `400 Bad Request`. Das Frontend zeigt in diesem Fall die generische Meldung `Failed to save.`.

### 4.3 Löschen-Bestätigung

Um versehentliches Löschen zu verhindern, wird kein Popup-Dialog verwendet. Stattdessen wird der Löschen-Button inline durch zwei Bestätigungs-Buttons ersetzt:

| Button | Aktion |
|---|---|
| `✓` | Löschen bestätigen |
| `✗` | Abbrechen, ursprünglicher Zustand wird wiederhergestellt |

Dieses Muster ist auf der Template-Übersicht und der Dokument-Übersicht identisch implementiert.

---

## 5. Zusammenfassung

| Zustand | Mechanismus | Wo sichtbar |
|---|---|---|
| Laden | Spinner + `Loading...` | Übersichtsseiten, Editoren |
| Leer | Informativer Text | Übersichtsseiten |
| API-Fehler | Roter Fehlertext | Alle Seiten |
| Speichern erfolgreich | `✓ Saved` Toast (2s) | Dokument-Editor |
| Pflichtfeld leer | Browser-native Meldung | Login, Template-Editor, Dokument-Editor |
| Backend-Validierung | HTTP 400, Frontend zeigt `Failed to save.` | Editoren |
| Löschen bestätigen | Inline ✓/✗ Buttons | Template-Übersicht, Dokument-Übersicht |
