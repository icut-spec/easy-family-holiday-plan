# US-8.1 — Create a named trip

**As a user**, I want to create a trip by entering a name, destination, dates, and the number of adults, children, and pets, so that I have a clear starting point for planning.

## Acceptance criteria

- Trip creation form includes:
  - Trip Name (e.g. "Summer in Paris") — required
  - Destination (text) — required
  - Start date and end date — required
  - Number of adults (stepper, minimum 1)
  - Number of children (stepper, minimum 0)
  - Number of pets (stepper, minimum 0) with pet type input
  - Holiday type selector (Beach, Mountains, City, Camping, Other)
  - Budget field (optional, numeric)
- On submit, a new trip record is created in state
- User is taken to the Trip Dashboard immediately after creation
- All field values are saved to state and synced to Supabase if logged in
