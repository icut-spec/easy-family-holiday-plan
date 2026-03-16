# US-4.3 — Pet-friendly activity filtering

**As a user**, I want activities to be filtered by pet-friendliness when the pet-friendly toggle is on, so that I only see options suitable for my pets.

## Acceptance criteria

- When the pet-friendly toggle (US-3.4) is enabled, only pet-friendly activities are shown
- Pet-friendly status is either derived from the Places API result or hardcoded for fallback items
- Toggling the filter updates the list immediately without a page reload
