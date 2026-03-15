# Epic 11: Database & Backend (Supabase)

> Define and implement the full database schema using Supabase (PostgreSQL). All app data — users, trips, activities, packing items, and budget — is stored and queried via Supabase.

---

## Database Schema Overview

```
users          → managed by Supabase Auth
trips          → one per planned trip, belongs to a user
activities     → itinerary entries, belong to a trip
packing_items  → packing list entries, belong to a trip
budget         → expense entries, belong to a trip
```

---

## US-11.1 — Users table

**As a developer**, I want a `users` table that stores profile data for each authenticated user, so that the app can personalise the experience and link all data to the right person.

**Schema:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key, matches Supabase Auth `auth.users.id` |
| `name` | `text` | Display name |
| `email` | `text` | Unique, from Auth |
| `created_at` | `timestamptz` | Default: `now()` |

**Acceptance criteria:**
- Table created via Supabase migration
- Row-level security (RLS) enabled: users can only read/write their own row
- Profile row auto-created on sign-up via a Supabase database trigger or Edge Function

**GitHub Issue:** #51

---

## US-11.2 — Trips table

**As a developer**, I want a `trips` table that stores all trip metadata, so that each user's trips are persisted to the database.

**Schema:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | Foreign key → `users.id` |
| `title` | `text` | e.g. "Summer in Paris" |
| `destination` | `text` | e.g. "Paris" |
| `start_date` | `date` | |
| `end_date` | `date` | |
| `adults` | `int` | Min 1 |
| `children` | `int` | Min 0 |
| `pets` | `int` | Min 0 |
| `pet_type` | `text` | e.g. "dog" |
| `budget` | `numeric` | Total budget in € |
| `holiday_type` | `text` | beach / mountains / city / camping / other |
| `pet_friendly` | `boolean` | Default false |
| `created_at` | `timestamptz` | Default: `now()` |

**Acceptance criteria:**
- Table created via Supabase migration
- RLS: users can only read/write their own trips (`user_id = auth.uid()`)
- Indexed on `user_id` for fast list queries

**GitHub Issue:** #52

---

## US-11.3 — Activities table

**As a developer**, I want an `activities` table that stores itinerary entries for each trip, so that day-by-day plans are persisted.

**Schema:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `trip_id` | `uuid` | Foreign key → `trips.id` |
| `title` | `text` | e.g. "Park Walk" |
| `date` | `date` | Which day of the trip |
| `time` | `time` | e.g. "10:00" |
| `location` | `text` | Optional place name or address |
| `notes` | `text` | Optional free-text notes |
| `created_at` | `timestamptz` | Default: `now()` |

**Acceptance criteria:**
- Table created via Supabase migration
- RLS: users can only access activities belonging to their own trips
- Ordered by `date`, `time` in default queries

**GitHub Issue:** #53

---

## US-11.4 — Packing items table

**As a developer**, I want a `packing_items` table that stores all packing list entries per trip, so that checked/custom items are persisted per user per trip.

**Schema:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `trip_id` | `uuid` | Foreign key → `trips.id` |
| `item_name` | `text` | e.g. "Passports / ID" |
| `category` | `text` | e.g. "Documents", "Pets", "Custom" |
| `checked` | `boolean` | Default false |
| `created_at` | `timestamptz` | Default: `now()` |

**Acceptance criteria:**
- Table created via Supabase migration
- RLS: users can only access packing items belonging to their own trips
- Supports bulk upsert for syncing the client-side packing list

**GitHub Issue:** #54

---

## US-11.5 — Budget table

**As a developer**, I want a `budget` table that stores expense entries per trip, so that spending data is persisted and queryable.

**Schema:**

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `trip_id` | `uuid` | Foreign key → `trips.id` |
| `category` | `text` | Hotel / Food / Transport / Activities / Other |
| `amount` | `numeric` | In € |
| `description` | `text` | e.g. "Hotel Lutetia" |
| `created_at` | `timestamptz` | Default: `now()` |

**Acceptance criteria:**
- Table created via Supabase migration
- RLS: users can only access budget rows belonging to their own trips
- Sum of `amount` grouped by `category` used for budget overview query

**GitHub Issue:** #55

---

## US-11.6 — Supabase client integration

**As a developer**, I want a typed Supabase client set up in the codebase, so that all database operations use a consistent, type-safe interface.

**Acceptance criteria:**
- `@supabase/supabase-js` installed as a dependency
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars documented in `.env.example`
- `src/lib/supabase.ts` exports an initialised Supabase client
- TypeScript types generated from the database schema (`supabase gen types typescript`)
- Client gracefully handles missing env vars (offline/local mode falls back to localStorage)

**GitHub Issue:** #56
