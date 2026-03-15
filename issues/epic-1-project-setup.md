# Epic 1: Project Setup & Infrastructure

> Initialize the project, tooling, and deployment pipeline.

---

## US-1.1 — Project scaffold

**As a developer**, I want a Vite + TypeScript project initialized with a clean folder structure, so that I have a solid foundation to build on.

**GitHub Issue:** #1

**Files created:**
- `package.json`
- `tsconfig.json`
- `vite.config.ts`
- `src/types.ts`
- `src/components/TripSetup.ts` (stub)
- `src/components/FamilySetup.ts` (stub)
- `src/components/ActivitiesList.ts` (stub)
- `src/components/PackingList.ts` (stub)

---

## US-1.2 — Environment config

**As a developer**, I want a `.env` file with `VITE_GOOGLE_MAPS_API_KEY` (gitignored) and a `.env.example` committed, so that the API key is never accidentally exposed.

**GitHub Issue:** #2

**Files created:**
- `.gitignore`
- `.env.example`

---

## US-1.3 — GitHub Actions deploy pipeline

**As a developer**, I want a GitHub Actions workflow that builds the app and deploys it to GitHub Pages, injecting the API key from a repository secret at build time.

**GitHub Issue:** #3

**Files created:**
- `.github/workflows/deploy.yml`

---

## US-1.4 — Base layout & navigation

**As a user**, I want a clean single-page layout with tab navigation between the 4 sections (Trip Setup, Family, Activities, Packing List), so that I can move between them easily.

**GitHub Issue:** #4

**Files created:**
- `index.html`
- `src/main.ts`
- `src/styles/main.css`

---

## US-1.5 — LocalStorage persistence

**As a user**, I want my plan to be saved automatically in the browser, so that I don't lose my data if I close or refresh the page.

**GitHub Issue:** #5

**Files created:**
- `src/store.ts`
