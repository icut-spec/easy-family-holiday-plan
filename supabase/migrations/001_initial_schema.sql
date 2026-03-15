-- ============================================================
-- Migration: 001_initial_schema
-- Creates: users, trips, activities, packing_items, budget
-- Enables RLS on all tables with per-user policies
-- ============================================================

-- ============================================================
-- US-11.1: users table
-- Mirrors auth.users; auto-populated by trigger on sign-up
-- ============================================================
create table if not exists public.users (
  id          uuid        primary key references auth.users (id) on delete cascade,
  name        text        not null default '',
  email       text        not null unique,
  created_at  timestamptz not null default now()
);

alter table public.users enable row level security;

-- Users can only read and update their own profile row
create policy "users: read own row"
  on public.users for select
  using (auth.uid() = id);

create policy "users: update own row"
  on public.users for update
  using (auth.uid() = id);

-- Trigger: create a profile row automatically when a new auth user signs up
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.users (id, email, name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', '')
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ============================================================
-- US-11.2: trips table
-- ============================================================
create table if not exists public.trips (
  id           uuid        primary key default gen_random_uuid(),
  user_id      uuid        not null references public.users (id) on delete cascade,
  title        text        not null,
  destination  text        not null,
  start_date   date        not null,
  end_date     date        not null,
  adults       int         not null default 1 check (adults >= 1),
  children     int         not null default 0 check (children >= 0),
  pets         int         not null default 0 check (pets >= 0),
  pet_type     text,
  budget       numeric     not null default 0,
  holiday_type text        not null default 'other',
  pet_friendly boolean     not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists trips_user_id_idx on public.trips (user_id);

alter table public.trips enable row level security;

create policy "trips: read own rows"
  on public.trips for select
  using (auth.uid() = user_id);

create policy "trips: insert own rows"
  on public.trips for insert
  with check (auth.uid() = user_id);

create policy "trips: update own rows"
  on public.trips for update
  using (auth.uid() = user_id);

create policy "trips: delete own rows"
  on public.trips for delete
  using (auth.uid() = user_id);


-- ============================================================
-- US-11.3: activities table (itinerary entries)
-- ============================================================
create table if not exists public.activities (
  id          uuid        primary key default gen_random_uuid(),
  trip_id     uuid        not null references public.trips (id) on delete cascade,
  title       text        not null,
  date        date        not null,
  time        time,
  location    text,
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists activities_trip_id_idx on public.activities (trip_id);

alter table public.activities enable row level security;

-- RLS via join to trips (only activities of the user's own trips)
create policy "activities: read own trip rows"
  on public.activities for select
  using (
    exists (
      select 1 from public.trips
      where trips.id = activities.trip_id
        and trips.user_id = auth.uid()
    )
  );

create policy "activities: insert own trip rows"
  on public.activities for insert
  with check (
    exists (
      select 1 from public.trips
      where trips.id = activities.trip_id
        and trips.user_id = auth.uid()
    )
  );

create policy "activities: update own trip rows"
  on public.activities for update
  using (
    exists (
      select 1 from public.trips
      where trips.id = activities.trip_id
        and trips.user_id = auth.uid()
    )
  );

create policy "activities: delete own trip rows"
  on public.activities for delete
  using (
    exists (
      select 1 from public.trips
      where trips.id = activities.trip_id
        and trips.user_id = auth.uid()
    )
  );


-- ============================================================
-- US-11.4: packing_items table
-- ============================================================
create table if not exists public.packing_items (
  id          uuid        primary key default gen_random_uuid(),
  trip_id     uuid        not null references public.trips (id) on delete cascade,
  item_name   text        not null,
  category    text        not null default 'Custom',
  checked     boolean     not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists packing_items_trip_id_idx on public.packing_items (trip_id);

alter table public.packing_items enable row level security;

create policy "packing_items: read own trip rows"
  on public.packing_items for select
  using (
    exists (
      select 1 from public.trips
      where trips.id = packing_items.trip_id
        and trips.user_id = auth.uid()
    )
  );

create policy "packing_items: insert own trip rows"
  on public.packing_items for insert
  with check (
    exists (
      select 1 from public.trips
      where trips.id = packing_items.trip_id
        and trips.user_id = auth.uid()
    )
  );

create policy "packing_items: update own trip rows"
  on public.packing_items for update
  using (
    exists (
      select 1 from public.trips
      where trips.id = packing_items.trip_id
        and trips.user_id = auth.uid()
    )
  );

create policy "packing_items: delete own trip rows"
  on public.packing_items for delete
  using (
    exists (
      select 1 from public.trips
      where trips.id = packing_items.trip_id
        and trips.user_id = auth.uid()
    )
  );


-- ============================================================
-- US-11.5: budget table
-- ============================================================
create table if not exists public.budget (
  id          uuid        primary key default gen_random_uuid(),
  trip_id     uuid        not null references public.trips (id) on delete cascade,
  category    text        not null,
  amount      numeric     not null,
  description text        not null default '',
  created_at  timestamptz not null default now()
);

create index if not exists budget_trip_id_idx on public.budget (trip_id);

alter table public.budget enable row level security;

create policy "budget: read own trip rows"
  on public.budget for select
  using (
    exists (
      select 1 from public.trips
      where trips.id = budget.trip_id
        and trips.user_id = auth.uid()
    )
  );

create policy "budget: insert own trip rows"
  on public.budget for insert
  with check (
    exists (
      select 1 from public.trips
      where trips.id = budget.trip_id
        and trips.user_id = auth.uid()
    )
  );

create policy "budget: update own trip rows"
  on public.budget for update
  using (
    exists (
      select 1 from public.trips
      where trips.id = budget.trip_id
        and trips.user_id = auth.uid()
    )
  );

create policy "budget: delete own trip rows"
  on public.budget for delete
  using (
    exists (
      select 1 from public.trips
      where trips.id = budget.trip_id
        and trips.user_id = auth.uid()
    )
  );
