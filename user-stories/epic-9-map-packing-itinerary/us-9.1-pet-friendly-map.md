# US-9.1 — Pet-friendly map

**As a user travelling with pets**, I want to see a map of pet-friendly places near my destination — parks, restaurants, and veterinarians — so that I can plan pet-safe activities.

## Acceptance criteria

- Google Maps is embedded and centred on `trip.destination`
- Three categories of pins are shown:
  - Green pins — Parks / dog parks
  - Orange pins — Pet-friendly restaurants
  - Red pins — Veterinarians
- Clicking a pin shows a popup with: place name, address, and a "Get Directions" link
- "Get Directions" opens Google Maps directions in a new tab
- Uses Google Maps JavaScript API + Places API (text search)
- Falls back to a static curated list if `VITE_GOOGLE_MAPS_API_KEY` is missing or the API fails
- Map and sidebar list are shown side by side on desktop; stacked on mobile
