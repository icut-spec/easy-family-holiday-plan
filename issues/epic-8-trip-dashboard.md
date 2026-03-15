# Epic 8: Trip Creation & Dashboard

> Users create named trips with full family context and are taken to a rich dashboard with itinerary, map, packing list, and budget sections.

---

## US-8.1 — Create a named trip

**As a user**, I want to create a trip by entering a name, destination, dates, and the number of adults, children, and pets, so that I have a clear starting point for planning.

**Acceptance criteria:**
- Trip creation form with fields:
  - Trip Name (e.g. "Summer in Paris")
  - Destination (text, e.g. "Paris")
  - Start date / End date
  - Number of adults (stepper, min 1)
  - Number of children (stepper, min 0)
  - Number of pets + pet type (e.g. "1 dog")
- On submit, a new trip record is created and the user is taken to the Trip Dashboard
- All fields are saved to state (and Supabase if logged in)

**GitHub Issue:** #33

---

## US-8.2 — Trip Dashboard layout

**As a user**, after creating a trip I want to see a dashboard with four sections — Itinerary, Map, Packing List, and Budget — so that I can plan every aspect of the trip from one place.

**Acceptance criteria:**
- Dashboard is the landing view after trip creation
- Four clearly labelled sections/tabs: Itinerary, Map, Packing List, Budget
- Trip name and destination shown prominently at the top
- Back button or "My Trips" link to return to the trips list

**GitHub Issue:** #34

---

## US-8.3 — My Trips list

**As a user**, I want to see a list of all my saved trips, so that I can switch between them or start planning a new one.

**Acceptance criteria:**
- Trips list screen shows each trip as a card: name, destination, date range, family summary
- "New Trip" button to create another trip
- Tapping a trip card opens its dashboard
- Empty state: "No trips yet. Create your first trip!"

**GitHub Issue:** #35

---

## US-8.4 — Budget tracker

**As a user**, I want to set a total budget for the trip and track expenses per category, so that I can stay within my spending limit.

**Acceptance criteria:**
- Total budget field (€, pre-filled from Trip Setup if already set)
- Expense categories: Accommodation, Transport, Food, Activities, Other
- User can add expense line items with amount and label
- Running total shown vs budget; visual indicator when over budget
- All budget data persisted to state

**GitHub Issue:** #36
