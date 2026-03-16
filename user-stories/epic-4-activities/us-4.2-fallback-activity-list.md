# US-4.2 — Fallback activity list

**As a user**, I want to see a hardcoded list of activities if the Places API is unavailable or the API key is missing, so that the app is still useful without an API key.

## Acceptance criteria

- Fallback list is shown when `VITE_GOOGLE_MAPS_API_KEY` is missing or the API returns an error
- Fallback activities are relevant to the selected holiday type
- No error message or broken UI is shown to the user; fallback appears seamlessly

| Type | Fallback Activities |
|---|---|
| Beach | Snorkeling, Beach volleyball, Sunset walk, Sandcastle building |
| Mountains | Hiking, Cable car ride, Mountain biking, Stargazing |
| City | Museum visit, City walking tour, Local food market, Zoo |
| Camping | Campfire night, Nature trail, Bird watching, Kayaking |
| Other | Picnic in the park, Cycling, Swimming, Board games night |
