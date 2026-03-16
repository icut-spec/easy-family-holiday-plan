# US-7.4 — Log out

**As a logged-in user**, I want to log out, so that my data is secure on shared devices.

## Acceptance criteria

- "Log out" button is visible when authenticated (in header or user menu)
- Clicking "Log out" calls `supabase.auth.signOut` and clears the session
- After logout, the app falls back to local (empty) state
- User is redirected to the landing page after logout
- No personal data remains visible after logout
