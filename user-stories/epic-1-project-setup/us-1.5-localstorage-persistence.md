# US-1.5 — LocalStorage persistence

**As a user**, I want my plan to be saved automatically in the browser, so that I don't lose my data if I close or refresh the page.

## Acceptance criteria

- All app state is saved to `localStorage` under the key `efhp-state` on every change
- On page load, state is restored from `localStorage` if present
- Clearing `localStorage` resets the app to its default empty state
- No data loss on browser refresh
