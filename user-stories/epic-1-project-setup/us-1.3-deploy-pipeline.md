# US-1.3 — GitHub Actions deploy pipeline

**As a developer**, I want a GitHub Actions workflow that builds the app and deploys it to GitHub Pages, injecting the API key from a repository secret at build time.

## Acceptance criteria

- `.github/workflows/deploy.yml` triggers on push to `main`
- Workflow runs `npm install` and `npm run build`
- `VITE_GOOGLE_MAPS_API_KEY`, `VITE_SUPABASE_URL`, and `VITE_SUPABASE_ANON_KEY` are injected as env vars during build from GitHub repository secrets
- Built output is deployed to GitHub Pages via `peaceiris/actions-gh-pages`
- A successful push to `main` results in the live site updating at the GitHub Pages URL
