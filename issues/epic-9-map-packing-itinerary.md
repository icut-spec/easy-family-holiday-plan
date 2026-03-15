# Epic 9: Map, Packing List & Itinerary

> Pet-friendly map pins via Google Maps API, an enhanced adaptive packing list, and a day-by-day itinerary builder.

---

## US-9.1 — Pet-friendly map

**As a user travelling with pets**, I want to see a map of pet-friendly places near my destination — parks, restaurants, and veterinarians — so that I can plan pet-safe activities.

**Acceptance criteria:**
- Embedded Google Maps centred on the trip destination
- Pins for three categories:
  - 🌳 Parks (green pins)
  - 🍽️ Pet-friendly restaurants (orange pins)
  - 🏥 Veterinarians (red pins)
- Clicking a pin shows the place name, address, and a "Get Directions" link
- Uses Google Maps JavaScript API + Places API (Nearby Search)
- Falls back to a static list if API key is missing

**GitHub Issue:** #37

---

## US-9.2 — Enhanced packing list categories

**As a user**, I want the packing list to include Family and Pets categories with relevant default items, so that I don't forget essentials for everyone.

**Acceptance criteria:**
- **Family** category includes: clothes, passports, chargers
- **Pets** category includes: food, leash, toys (in addition to existing: carrier, vet records)
- Existing category logic (kids, beach, mountains, etc.) is preserved
- New seed items are merged without removing previously checked items

**GitHub Issue:** #38

---

## US-9.3 — Day-by-day itinerary

**As a user**, I want to build a day-by-day itinerary for my trip, so that everyone knows the plan for each day.

**Acceptance criteria:**
- Itinerary is auto-scaffolded with one entry per trip day (based on start/end dates)
- Each day shows the date as a heading
- User can add activities to a day: time + activity name (e.g. "10:00 Park Walk")
- Activities can be reordered (drag or up/down buttons) and deleted
- All itinerary data is persisted to state

**GitHub Issue:** #39

---

## US-9.4 — Itinerary activity suggestions

**As a user**, I want activity suggestions when building my itinerary, so that I don't have to think of everything from scratch.

**Acceptance criteria:**
- When adding an activity to a day, a dropdown shows suggestions from the Activities tab (fetched/fallback)
- Selecting a suggestion auto-fills the activity name
- User can still type a custom activity name
- Pet-friendly suggestions are prioritised if `trip.petFriendly` is true

**GitHub Issue:** #40
