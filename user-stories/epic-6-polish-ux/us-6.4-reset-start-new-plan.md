# US-6.4 — Reset / start new plan

**As a user**, I want a "Start New Plan" button that clears all data, so that I can plan a new trip from scratch.

## Acceptance criteria

- "Start New Plan" or "Reset" button is accessible from the main navigation or settings
- Clicking the button shows a confirmation prompt before clearing data
- On confirmation, all state is cleared from both `localStorage` and the UI
- User is returned to the landing/trips list page after reset
