# Course Calendar Feature - Implementierungsplan

## Überblick

Das Course Calendar Feature erweitert das bestehende Yoga-Kurs-Management-System um eine interaktive Kalenderansicht, die Trainern und Teilnehmern eine übersichtliche Darstellung aller Kurse und Events bietet.

## Funktionale Anforderungen

### Kernfunktionen

- **Kalenderansicht**: Monatliche, wöchentliche und tägliche Ansichten
- **Event-Darstellung**: Kurse und Events in verschiedenen Farben
- **Interaktive Details**: Klick auf Events zeigt Details und Teilnehmerlisten
- **Filteroptionen**: Nach Trainer, Kurstyp, Status filtern
- **Responsive Design**: Mobile und Desktop-optimiert

### Benutzerrollen

- **Trainer**: Vollzugriff auf eigene Kurse/Events, Teilnehmerverwaltung
- **Studenten**: Nur Ansicht verfügbarer Kurse/Events
- **Admin**: Vollzugriff auf alle Kalendereinträge

## Technische Architektur

### Frontend-Komponenten

```typescript
// Hauptkomponenten
src/app/intern/calendar/
├── page.tsx                    // Kalender-Hauptseite
├── _components/
│   ├── CalendarView.tsx        // Haupt-Kalenderkomponente
│   ├── EventModal.tsx          // Event-Details Modal
│   ├── CalendarFilters.tsx     // Filter-Komponenten
│   ├── EventCard.tsx           // Event-Darstellung
│   └── CalendarNavigation.tsx  // Navigation (Monat/Woche/Tag)
```

### Backend-Erweiterungen

```typescript
// API Endpoints
src/app/api/calendar/
├── events/
│   ├── route.ts               // GET /api/calendar/events
│   └── [eventId]/
│       └── route.ts           // GET/PUT/DELETE /api/calendar/events/[id]
├── courses/
│   └── route.ts               // GET /api/calendar/courses
└── ical/
    └── route.ts               // GET /api/calendar/ical (iCal Export)
```

## Datenbankschema-Erweiterungen

### Neue Tabellen

```sql
-- Kalender-spezifische Events (zusätzlich zu bestehenden Courses/Events)
CREATE TABLE calendar_events (
  calendar_event_id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  start_datetime TEXT NOT NULL,
  end_datetime TEXT NOT NULL,
  all_day INTEGER DEFAULT 0,
  event_type TEXT DEFAULT 'custom', -- 'course', 'event', 'custom', 'break'
  course_id INTEGER,
  event_id INTEGER,
  trainer_id INTEGER NOT NULL,
  color TEXT DEFAULT '#3B82F6',
  location TEXT,
  is_recurring INTEGER DEFAULT 0,
  recurrence_rule TEXT, -- RRULE format
  parent_event_id INTEGER, -- For recurring events
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES Courses(course_id),
  FOREIGN KEY (event_id) REFERENCES Events(event_id),
  FOREIGN KEY (trainer_id) REFERENCES Trainers(trainer_id)
);

-- Kalender-Einstellungen pro Benutzer
CREATE TABLE calendar_settings (
  setting_id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id TEXT NOT NULL,
  default_view TEXT DEFAULT 'month', -- 'month', 'week', 'day'
  timezone TEXT DEFAULT 'Europe/Berlin',
  show_weekends INTEGER DEFAULT 1,
  start_hour INTEGER DEFAULT 6,
  end_hour INTEGER DEFAULT 22,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);
```

### Schema-Updates

```sql
-- Erweitere bestehende Courses Tabelle
ALTER TABLE Courses ADD COLUMN recurring_pattern TEXT;
ALTER TABLE Courses ADD COLUMN recurring_end_date TEXT;
ALTER TABLE Courses ADD COLUMN calendar_color TEXT DEFAULT '#10B981';

-- Erweitere bestehende Events Tabelle
ALTER TABLE Events ADD COLUMN recurring_pattern TEXT;
ALTER TABLE Events ADD COLUMN recurring_end_date TEXT;
ALTER TABLE Events ADD COLUMN calendar_color TEXT DEFAULT '#F59E0B';
```

## Implementierungsschritte

### Phase 1: Grundlegende Kalenderansicht (3-4 Tage)

#### 1.1 Datenbankmigrationen

```typescript
// src/lib/db/migrations/add_calendar_tables.ts
export async function up(db: Database) {
  // Erstelle calendar_events Tabelle
  // Erstelle calendar_settings Tabelle
  // Füge Spalten zu bestehenden Tabellen hinzu
}
```

#### 1.2 API Endpoints

```typescript
// src/app/api/calendar/events/route.ts
export async function GET(request: Request) {
  // Parameter: start_date, end_date, trainer_id, event_type
  // Rückgabe: Vereinheitlichte Event-Liste aus Courses, Events, calendar_events
}

export async function POST(request: Request) {
  // Erstelle neues Kalender-Event
}
```

#### 1.3 Basis-Kalenderkomponente

```typescript
// src/app/intern/calendar/_components/CalendarView.tsx
import { useState, useEffect } from "react";

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  type: "course" | "event" | "custom";
  color: string;
  trainer?: string;
}

export function CalendarView() {
  // Implementiere Basis-Kalenderlogik
  // Verwende native HTML/CSS Grid für Kalender-Layout
}
```

### Phase 2: Event-Management (2-3 Tage)

#### 2.1 Event-Details Modal

```typescript
// src/app/intern/calendar/_components/EventModal.tsx
export function EventModal({ event, onClose, onUpdate, onDelete }) {
  // Zeige Event-Details
  // Teilnehmerliste (falls Kurs/Event)
  // Bearbeitungsoptionen für Trainer
}
```

#### 2.2 Event-Erstellung/Bearbeitung

```typescript
// src/app/intern/calendar/_components/EventForm.tsx
export function EventForm({ event, onSave, onCancel }) {
  // Formular für Event-Erstellung
  // Unterstützung für wiederkehrende Events
  // Trainer-Zuordnung
}
```

### Phase 3: Erweiterte Funktionen (2-3 Tage)

#### 3.1 Filter und Suche

```typescript
// src/app/intern/calendar/_components/CalendarFilters.tsx
export function CalendarFilters({ onFilterChange }) {
  // Filter nach Trainer
  // Filter nach Event-Typ
  // Datumsbereich-Auswahl
  // Suchfunktion
}
```

#### 3.2 Verschiedene Kalenderansichten

```typescript
// Monatansicht (Standard)
// Wochenansicht
// Tagesansicht
// Agenda-Ansicht (Liste)
```

#### 3.3 iCal Export

```typescript
// src/app/api/calendar/ical/route.ts
export async function GET(request: Request) {
  // Generiere iCal-Format für externe Kalender
  // Unterstütze Trainer-spezifische Exports
}
```

### Phase 4: Integration und Optimierung (1-2 Tage)

#### 4.1 Navigation Integration

```typescript
// Füge Kalender-Link zu src/app/intern/page.tsx hinzu
<Link href="/intern/calendar" className="...">
  <h3>Kalender</h3>
  <p>Übersicht aller Kurse und Events</p>
</Link>
```

#### 4.2 Performance-Optimierungen

- Lazy Loading für große Datenbereiche
- Caching von Kalender-Daten
- Optimierte Datenbankabfragen

#### 4.3 Mobile Responsiveness

- Touch-Gesten für Navigation
- Optimierte Darstellung auf kleinen Bildschirmen

## Benutzeroberfläche Design

### Kalender-Layout

```css
.calendar-container {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100vh;
}

.calendar-header {
  /* Navigation, Filter, Ansichts-Umschalter */
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 1px;
  background: #e5e7eb;
}

.calendar-day {
  background: white;
  min-height: 120px;
  padding: 8px;
}

.event-item {
  background: var(--event-color);
  border-radius: 4px;
  padding: 2px 6px;
  margin: 1px 0;
  font-size: 12px;
  cursor: pointer;
}
```

### Farbschema

- **Kurse**: Grün (#10B981)
- **Events**: Orange (#F59E0B)
- **Custom Events**: Blau (#3B82F6)
- **Pausen/Blockiert**: Grau (#6B7280)

## API-Spezifikation

### GET /api/calendar/events

```typescript
interface CalendarEventResponse {
  events: Array<{
    id: string;
    title: string;
    start: string; // ISO 8601
    end: string;
    type: "course" | "event" | "custom";
    color: string;
    trainer: {
      id: number;
      name: string;
    };
    participants?: number;
    maxParticipants?: number;
    location?: string;
    description?: string;
  }>;
}
```

### POST /api/calendar/events

```typescript
interface CreateEventRequest {
  title: string;
  start: string;
  end: string;
  type: "custom";
  description?: string;
  location?: string;
  color?: string;
  isRecurring?: boolean;
  recurrenceRule?: string;
}
```

## Testing-Strategie

### Unit Tests

```typescript
// src/app/intern/calendar/_components/__tests__/
├── CalendarView.test.tsx
├── EventModal.test.tsx
└── CalendarFilters.test.tsx
```

### Integration Tests

```typescript
// cypress/e2e/calendar.cy.ts
describe("Calendar Feature", () => {
  it("should display monthly calendar view", () => {
    // Test Kalender-Darstellung
  });

  it("should create new calendar event", () => {
    // Test Event-Erstellung
  });

  it("should filter events by trainer", () => {
    // Test Filter-Funktionalität
  });
});
```

### API Tests

```typescript
// Test alle Calendar API Endpoints
// Test Datenbankintegrität
// Test Berechtigungen
```

## Sicherheitsüberlegungen

### Autorisierung

- Trainer können nur eigene Events bearbeiten
- Studenten haben nur Lesezugriff
- Admin hat Vollzugriff

### Datenvalidierung

```typescript
// Validiere Datumsformate
// Prüfe Event-Überschneidungen
// Validiere Trainer-Zuordnungen
```

### Rate Limiting

- Begrenze API-Aufrufe pro Benutzer
- Verhindere Spam bei Event-Erstellung

## Performance-Überlegungen

### Datenbankoptimierung

```sql
-- Indizes für häufige Abfragen
CREATE INDEX idx_calendar_events_trainer_date ON calendar_events(trainer_id, start_datetime);
CREATE INDEX idx_courses_trainer_date ON Courses(trainer_id, start_date);
CREATE INDEX idx_events_trainer_date ON Events(trainer_id, start_date);
```

### Frontend-Optimierung

- Virtualisierung für große Kalender-Bereiche
- Debouncing für Filter-Eingaben
- Memoization für Event-Berechnungen

## Deployment-Checkliste

### Datenbankmigrationen

- [ ] Backup der aktuellen Datenbank
- [ ] Ausführung der Schema-Updates
- [ ] Datenvalidierung nach Migration

### Code-Deployment

- [ ] Feature-Flag für schrittweise Einführung
- [ ] Monitoring für neue API-Endpoints
- [ ] Performance-Überwachung

### Benutzer-Kommunikation

- [ ] Ankündigung des neuen Features
- [ ] Benutzerhandbuch/Tutorial
- [ ] Support-Dokumentation

## Zukünftige Erweiterungen

### Phase 2 Features

- **Drag & Drop**: Events per Drag & Drop verschieben
- **Bulk-Operationen**: Mehrere Events gleichzeitig bearbeiten
- **Benachrichtigungen**: E-Mail/Push-Benachrichtigungen für Events
- **Kalender-Synchronisation**: Sync mit Google Calendar, Outlook
- **Wartelisten-Integration**: Wartelisten-Status im Kalender anzeigen

### Integration mit externen Systemen

- **Zoom/Teams Integration**: Automatische Meeting-Links
- **Payment Integration**: Zahlungsstatus im Kalender
- **Marketing Integration**: Newsletter-Kampagnen basierend auf Events

## Ressourcenschätzung

### Entwicklungszeit

- **Gesamt**: 8-12 Entwicklungstage
- **Frontend**: 5-7 Tage
- **Backend**: 2-3 Tage
- **Testing**: 1-2 Tage

### Technische Abhängigkeiten

- Keine neuen externen Bibliotheken erforderlich
- Nutzt bestehende Next.js/React/SQLite-Stack
- Kompatibel mit aktueller Authentifizierung

### Wartungsaufwand

- **Niedrig**: Nutzt bewährte Technologien
- **Skalierbar**: Kann mit wachsender Benutzerbasis erweitert werden
- **Erweiterbar**: Modulare Architektur für zukünftige Features

---
