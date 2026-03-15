# Epic 4: Activities

> Show recommended activities near the destination, with Maps integration.

---

## US-4.1 — Fetch activities from Places API

**As a user**, I want the app to automatically suggest 2–4 real activities near my destination based on my holiday type, so that I get relevant and local recommendations.

**GitHub Issue:** #15

**Notes:**
- Uses Google Maps JavaScript API + Places library (loaded in browser, no CORS issue)
- API key stored in `.env` as `VITE_GOOGLE_MAPS_API_KEY`
- Query format: `<activity type> near <destination>` (e.g. `beach activities near Bali`)
- Results limited to 4 per holiday type

| Holiday Type | Query sent to Places API |
|---|---|
| Beach | `beach activities near <destination>` |
| Mountains | `mountain hiking near <destination>` |
| City | `city sightseeing near <destination>` |
| Camping | `camping sites near <destination>` |
| Other | `family activities near <destination>` |

---

## US-4.2 — Fallback activity list

**As a user**, I want to see a hardcoded list of activities if the Places API is unavailable or the API key is missing, so that the app is still useful without an API key.

**GitHub Issue:** #16

**Fallback activities per holiday type (2–4 each):**

| Type | Activities |
|---|---|
| Beach | Snorkeling, Beach volleyball, Sunset walk, Sandcastle building |
| Mountains | Hiking, Cable car ride, Mountain biking, Stargazing |
| City | Museum visit, City walking tour, Local food market, Zoo |
| Camping | Campfire night, Nature trail, Bird watching, Kayaking |
| Other | Picnic in the park, Cycling, Swimming, Board games night |

---

## US-4.3 — Pet-friendly activity filtering

**As a user**, I want activities to be filtered by pet-friendliness when the pet-friendly toggle is on, so that I only see options suitable for my pets.

**GitHub Issue:** #17

---

## US-4.4 — Open in Google Maps per activity

**As a user**, I want each activity card to have an "Open in Google Maps" link that searches for that activity near my destination, so that I can instantly see where it is on the map.

**GitHub Issue:** #18

**Link format:**
```
https://www.google.com/maps/search/<activity+name>+<destination>
```

---

## US-4.5 — Activity cards UI

**As a user**, I want each activity displayed as a card with a name, short description, pet-friendly badge, and Maps link, so that the information is easy to scan.

**GitHub Issue:** #19
