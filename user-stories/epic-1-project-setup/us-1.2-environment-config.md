# US-1.2 — Environment config

**As a developer**, I want a `.env` file with `VITE_GOOGLE_MAPS_API_KEY` (gitignored) and a `.env.example` committed, so that the API key is never accidentally exposed.

## Acceptance criteria

- `.env` is listed in `.gitignore` and never committed
- `.env.example` is committed with placeholder values for all required env vars
- App builds and runs without a `.env` file present (graceful fallback)
