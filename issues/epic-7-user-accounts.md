# Epic 7: User Accounts

> Allow users to sign up, log in, and save their trips across devices using Supabase authentication.
> UI design for auth screens is covered in **Epic 10** (US-10.4).
> Database schema for the users table is covered in **Epic 11** (US-11.1).

---

## US-7.1 — Sign up

**As a new user**, I want to create an account with my email and password, so that I can save my trips and access them later.

**Acceptance criteria:**
- Sign-up form with name, email, and password fields
- Validation: valid email format, password minimum 8 characters
- On success, user is logged in automatically and redirected to the dashboard
- Error messages shown for duplicate email or weak password
- Uses Supabase Auth
- "Continue with Google" OAuth option (see US-10.4 for UI)

**GitHub Issue:** #29

---

## US-7.2 — Login

**As a returning user**, I want to log in with my email and password, so that I can access my saved trips.

**Acceptance criteria:**
- Login form with email and password fields
- On success, session is persisted (user stays logged in on refresh)
- Error message shown for wrong credentials
- "Forgot password" link (placeholder for MVP; full flow in V2)
- "Continue with Google" OAuth option
- Uses Supabase Auth

**GitHub Issue:** #30

---

## US-7.3 — Save trips to account

**As a logged-in user**, I want my trips to be saved to my account, so that I can access them from any device.

**Acceptance criteria:**
- On login, app state is loaded from Supabase (not just localStorage)
- On any state change, data is synced to Supabase in addition to localStorage
- Logged-out users still use localStorage only (graceful degradation)
- A visible "Saved" / "Saving…" indicator when sync occurs
- See Epic 11 for full database schema

**GitHub Issue:** #31

---

## US-7.4 — Log out

**As a logged-in user**, I want to log out, so that my data is secure on shared devices.

**Acceptance criteria:**
- "Log out" button visible when authenticated (in header or user menu)
- On logout, session is cleared; app falls back to local (empty) state
- User is redirected to the landing page

**GitHub Issue:** #32
