# Epic 7: User Accounts

> Allow users to sign up, log in, and save their trips across devices using Supabase authentication.

---

## US-7.1 — Sign up

**As a new user**, I want to create an account with my email and password, so that I can save my trips and access them later.

**Acceptance criteria:**
- Sign-up form with email + password fields
- Validation: valid email format, password minimum length
- On success, user is logged in automatically and redirected to the app
- Error messages shown for duplicate email or weak password
- Uses Supabase Auth

**GitHub Issue:** #29

---

## US-7.2 — Login

**As a returning user**, I want to log in with my email and password, so that I can access my saved trips.

**Acceptance criteria:**
- Login form with email + password fields
- On success, session is persisted (user stays logged in on refresh)
- Error message shown for wrong credentials
- "Forgot password" link visible (can be a placeholder for MVP)
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

**GitHub Issue:** #31

---

## US-7.4 — Log out

**As a logged-in user**, I want to log out, so that my data is secure on shared devices.

**Acceptance criteria:**
- "Log out" button visible when authenticated
- On logout, session is cleared; app falls back to local (empty) state
- User is shown the login/sign-up screen

**GitHub Issue:** #32
