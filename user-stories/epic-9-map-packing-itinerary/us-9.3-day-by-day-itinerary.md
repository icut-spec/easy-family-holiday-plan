# US-9.3 — Day-by-day itinerary

**As a user**, I want to build a day-by-day itinerary for my trip, so that everyone knows the plan for each day.

## Acceptance criteria

- Itinerary is auto-scaffolded with one section per trip day based on start and end dates
- Each day section shows the date as a heading (e.g. "Day 1 — Mon 12 Jul")
- User can add activities to a day: time (HH:MM) + activity name
- Activities are listed in time order within each day
- Each activity has:
  - Up/Down reorder buttons (first item's Up and last item's Down are disabled)
  - Delete button
- Reordering swaps times to preserve the overall sort order
- All itinerary data is persisted to state
