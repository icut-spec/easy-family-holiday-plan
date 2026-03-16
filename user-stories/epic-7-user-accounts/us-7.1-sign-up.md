# US-7.1 — Sign up

**As a new user**, I want to create an account with my email and password, so that I can save my trips and access them later.

## Acceptance criteria

- Sign-up form includes: name, email, and password fields
- Email must be in a valid format; error shown if not
- Password must be at least 8 characters; error shown if not
- On successful sign-up, user is automatically logged in and redirected to the trips dashboard
- Error message shown for duplicate email (e.g. "An account with this email already exists")
- Error message shown for weak password
- Uses Supabase Auth (`supabase.auth.signUp`)
- "Continue with Google" OAuth button is present
