# US-7.2 — Login

**As a returning user**, I want to log in with my email and password, so that I can access my saved trips.

## Acceptance criteria

- Login form includes: email and password fields
- On successful login, session is persisted (user stays logged in on browser refresh)
- Error message shown for wrong credentials (e.g. "Invalid email or password")
- "Forgot password" link is present (placeholder for MVP)
- "Continue with Google" OAuth button is present
- Uses Supabase Auth (`supabase.auth.signInWithPassword`)
- Redirects to trips dashboard on success
