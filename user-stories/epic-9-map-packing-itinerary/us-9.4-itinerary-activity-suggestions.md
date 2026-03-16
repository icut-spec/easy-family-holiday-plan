# US-9.4 — Itinerary activity suggestions

**As a user**, I want activity suggestions when building my itinerary, so that I don't have to think of everything from scratch.

## Acceptance criteria

- When adding an activity to a day, a `<datalist>` dropdown shows activity suggestions
- Suggestions are drawn from the Activities tab (Places API results or fallback list)
- Selecting a suggestion auto-fills the activity name input
- User can still type any custom activity name freely
- If `trip.petFriendly` is true, pet-friendly suggestions are listed first
