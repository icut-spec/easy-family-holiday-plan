# US-4.1 — Fetch activities from Places API

**As a user**, I want the app to automatically suggest 2–4 real activities near my destination based on my holiday type, so that I get relevant and local recommendations.

## Acceptance criteria

- Google Maps JavaScript API + Places library is loaded in the browser
- A text search query is built from the holiday type and destination (e.g. `beach activities near Bali`)
- Up to 4 results are displayed per holiday type
- Results update when the destination or holiday type changes
- API key is read from `VITE_GOOGLE_MAPS_API_KEY` environment variable
- If the API call fails, the fallback list (US-4.2) is shown instead

| Holiday Type | Query |
|---|---|
| Beach | `beach activities near <destination>` |
| Mountains | `mountain hiking near <destination>` |
| City | `city sightseeing near <destination>` |
| Camping | `camping sites near <destination>` |
| Other | `family activities near <destination>` |
