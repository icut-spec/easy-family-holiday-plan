# Epic 12: Advanced Features (Version 2)

> Powerful features to build after the MVP is live. These differentiate the product and create the foundation for a startup.

---

## US-12.1 — AI Trip Planner

**As a user**, I want to describe my trip in plain language and have the app generate a full itinerary automatically, so that planning takes minutes instead of hours.

**Example input:**
```
Destination: Paris
Duration: 3 days
Travelling with: 1 dog, 1 family
Budget: €1,000
```

**Example output:**
```
Day 1 — Tuileries Garden walk + picnic lunch
Day 2 — Musée d'Orsay + pet-friendly bistro dinner
Day 3 — Seine river walk + Marché aux Puces
```

**Acceptance criteria:**
- Input form: destination, duration, pet count, family size, budget, any preferences (free text)
- Calls OpenAI API (`gpt-4o` or equivalent) with a structured prompt
- Generated itinerary is inserted into the trip's existing itinerary (user can edit before saving)
- Loading state shown during generation
- Graceful error handling if API is unavailable or quota exceeded
- API key stored as a server-side secret (Edge Function or backend proxy — never exposed to the browser)

**GitHub Issue:** #57

---

## US-12.2 — Pet-Friendly Recommendation Engine

**As a user travelling with a pet**, I want the app to automatically recommend pet-friendly hotels, dog parks, and restaurants near my destination, so that I don't have to search for them manually.

**Acceptance criteria:**
- Recommendations surfaced on the Map page and as a dedicated "For your pet" section on the Trip Overview
- Categories: dog parks, pet-friendly hotels, pet-friendly restaurants
- Powered by Google Places API (Nearby Search with type filters) with a static fallback
- Each recommendation shows: name, distance from destination, rating (if available), and a Maps link
- Personalised by pet type (e.g. dog parks prioritised for dogs)
- Results cached per destination to avoid repeated API calls

**GitHub Issue:** #58

---

## US-12.3 — Weather-Based Activity Suggestions

**As a user**, I want the app to suggest activities based on the weather forecast for each day of my trip, so that my plans stay realistic.

**Example:**
```
Tomorrow: Rain forecast in Paris
Suggested: Musée du Louvre · Café de Flore · Le Bon Marché
```

**Acceptance criteria:**
- Integrates with a weather API (e.g. Open-Meteo, free tier) for the trip destination and dates
- Each itinerary day shows a weather icon and temperature range
- If rain or extreme weather is forecast, indoor activity suggestions are shown
- Suggestions are drawn from the existing Activities list (filtered by suitability)
- Weather data is cached for the trip duration; refreshes if dates change

**GitHub Issue:** #59

---

## US-12.4 — Travel Story Generator

**As a user**, after returning from a trip I want the app to generate a shareable travel story from my itinerary, photos, and notes, so that I can relive and share the experience.

**Example output:**
```
"Your Paris Travel Story — 3 days with 2 adults, 1 child, and Max the dog."

Day 1: You started with a morning walk through the Tuileries Garden...
Day 2: A visit to Musée d'Orsay, followed by a pet-friendly lunch...
```

**Acceptance criteria:**
- Triggered from a "Generate my travel story" button on the completed trip
- Uses OpenAI API to compose a narrative from: destination, dates, itinerary activities, notes, family composition
- Optional: user can attach photos (stored in Supabase Storage) that are referenced in the story
- Output is displayed in a styled "story" view and can be copied or shared via a public link
- API key handled server-side (same Edge Function pattern as AI Trip Planner)

**GitHub Issue:** #60

---

## US-12.5 — Startup Integrations (V2 Partnerships)

**As the product owner**, I want the app to integrate with pet-friendly travel services, so that the app becomes a platform and a potential revenue source.

**Unique selling point:**
> "The first travel planner designed for families travelling with pets."

**Target audience:** dog owners, families, road-trippers

**Planned integrations:**

| Partner type | Integration idea |
|---|---|
| Pet-friendly hotels | Affiliate links to BringFido, Petswelcome |
| Dog parks | Pull data from dog park APIs or OpenStreetMap |
| Pet insurance | Banner/link to travel pet insurance providers |
| Vet locator | Show nearest vets on the map using Google Places |

**Acceptance criteria:**
- Each integration is a separate, togglable feature flag
- Affiliate links are clearly marked as sponsored
- No integration collects user data beyond what the user has already entered
- Integration config (API keys, affiliate IDs) stored as environment variables

**GitHub Issue:** #61
