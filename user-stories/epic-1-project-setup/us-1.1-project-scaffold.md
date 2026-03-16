# US-1.1 — Project scaffold

**As a developer**, I want a Vite + TypeScript project initialized with a clean folder structure, so that I have a solid foundation to build on.

## Acceptance criteria

- `package.json` configured with Vite and TypeScript
- `tsconfig.json` with `noUnusedLocals` and `noUnusedParameters` set to true
- `vite.config.ts` present and valid
- `src/types.ts` defines shared TypeScript types
- Component stubs created: `TripSetup`, `FamilySetup`, `ActivitiesList`, `PackingList`
- Project builds without errors (`npm run build`)
