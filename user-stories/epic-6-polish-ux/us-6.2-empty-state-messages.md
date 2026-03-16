# US-6.2 — Empty state messages

**As a user**, I want helpful prompts when a section is empty, so that I always know what to do next.

## Acceptance criteria

- Each section shows a meaningful empty state when no data is present:
  - Trips list: "No trips yet. Start planning your first trip!"
  - Itinerary day: "No activities yet. Add your first one."
  - Packing list: shown before a trip type is selected
  - Map: shown if no destination is entered
- Empty states include a short instructional message and optionally a CTA button
- Empty states do not show error-like styling
