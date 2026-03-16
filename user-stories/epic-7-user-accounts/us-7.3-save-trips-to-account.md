# US-7.3 — Save trips to account

**As a logged-in user**, I want my trips to be saved to my account, so that I can access them from any device.

## Acceptance criteria

- On login, trips are loaded from Supabase and merged with/replace localStorage data
- On any state change (new trip, edit, delete), data is synced to Supabase in addition to localStorage
- When logged out, app falls back to localStorage only
- A visible "Saved" or "Saving…" indicator is shown when a sync occurs
- If Supabase is unreachable, app continues to work with localStorage (graceful degradation)
