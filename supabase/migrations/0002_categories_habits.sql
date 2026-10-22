-- 0002_categories_habits.sql — Step 2: goals (categories) and habits
-- Run once in Supabase → SQL Editor → New query → paste → Run.
--
-- Same rules as 0001: RLS on, grants only to `authenticated`, nothing to `anon`.
-- No limits: there is no rule here that refuses a goal or a habit.

-- 1. Goals ("categories" in the database) ------------------------------------

create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(btrim(name)) between 1 and 60),
  icon        text not null default 'target' check (char_length(icon) <= 40),
  color       text not null default '#2B3A67' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  why         text check (char_length(why) <= 500),
  position    integer not null default 0,
  archived_at timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  -- Lets habits point to "this goal of this same user" (see the habits table).
  unique (id, user_id)
);

comment on table public.categories is 'Goals that group habits. Later each one can be linked to a dream.';

create index categories_user_id_idx on public.categories (user_id);

-- 2. Habits ------------------------------------------------------------------

create table public.habits (
  id                 uuid primary key default gen_random_uuid(),
  user_id            uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id        uuid,
  kind               text not null default 'in_progress' check (kind in ('already_mine', 'in_progress')),
  priority           text not null default 'essential' check (priority in ('essential', 'bonus')),
  name               text not null check (char_length(btrim(name)) between 1 and 80),
  icon               text not null default 'sparkles' check (char_length(icon) <= 40),
  color              text not null default '#2B3A67' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  why                text check (char_length(why) <= 500),
  minimal_version    text check (char_length(minimal_version) <= 200),

  -- How often:
  --   'days'   → on fixed weekdays, listed in `days` (1 = Monday … 7 = Sunday)
  --   'weekly' → any days, between times_per_week_min and times_per_week_max times a week
  frequency_type     text not null default 'days' check (frequency_type in ('days', 'weekly')),
  days               smallint[] not null default '{1,2,3,4,5,6,7}'
                     check (cardinality(days) between 1 and 7 and days <@ '{1,2,3,4,5,6,7}'::smallint[]),
  times_per_week_min smallint check (times_per_week_min between 1 and 7),
  times_per_week_max smallint check (times_per_week_max between 1 and 7),

  minutes            smallint check (minutes between 1 and 600),
  reminder_time      time,
  position           integer not null default 0,
  graduated_at       timestamptz,
  paused_at          timestamptz,
  archived_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  -- A habit can only belong to a goal of the same user.
  -- If the goal is deleted, the habit stays and simply has no goal.
  foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete set null (category_id),

  constraint weekly_frequency_complete check (
    frequency_type = 'days'
    or (times_per_week_min is not null
        and times_per_week_max is not null
        and times_per_week_min <= times_per_week_max)
  )
);

comment on table public.habits is 'One routine. kind: already_mine / in_progress. priority: essential / bonus.';

create index habits_user_id_idx on public.habits (user_id);
create index habits_category_id_idx on public.habits (category_id);

-- 3. Row Level Security: each user sees and changes only their own rows -------

alter table public.categories enable row level security;
alter table public.habits enable row level security;

create policy "Users can read their own goals"
  on public.categories for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own goals"
  on public.categories for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own goals"
  on public.categories for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own goals"
  on public.categories for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can read their own habits"
  on public.habits for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add their own habits"
  on public.habits for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can update their own habits"
  on public.habits for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users can delete their own habits"
  on public.habits for delete to authenticated
  using ((select auth.uid()) = user_id);

-- 4. What the app may do -------------------------------------------------------
-- id, user_id, created_at and updated_at are always filled in by the database.

revoke all on public.categories from anon, authenticated;
revoke all on public.habits from anon, authenticated;

grant select, delete on public.categories to authenticated;
grant insert (name, icon, color, why, position)
  on public.categories to authenticated;
grant update (name, icon, color, why, position, archived_at)
  on public.categories to authenticated;

grant select, delete on public.habits to authenticated;
grant insert (category_id, kind, priority, name, icon, color, why, minimal_version,
              frequency_type, days, times_per_week_min, times_per_week_max,
              minutes, reminder_time, position)
  on public.habits to authenticated;
grant update (category_id, kind, priority, name, icon, color, why, minimal_version,
              frequency_type, days, times_per_week_min, times_per_week_max,
              minutes, reminder_time, position, graduated_at, paused_at, archived_at)
  on public.habits to authenticated;

-- 5. Keep updated_at current (function from 0001) ------------------------------

create trigger categories_set_updated_at
  before update on public.categories
  for each row execute function public.set_updated_at();

create trigger habits_set_updated_at
  before update on public.habits
  for each row execute function public.set_updated_at();
