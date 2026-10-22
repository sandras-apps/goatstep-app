-- 0001_profiles.sql — Step 1: account
-- One profile row per user, created automatically when someone signs up.
-- Run once in Supabase → SQL Editor → New query → paste → Run.

-- 1. The table ---------------------------------------------------------------

create table public.profiles (
  id                uuid primary key references auth.users (id) on delete cascade,
  display_name      text check (char_length(display_name) <= 60),
  language          text not null default 'en' check (language in ('en', 'it')),
  timezone          text not null default 'Europe/Rome',
  onboarding_done   boolean not null default false,
  terms_accepted_at timestamptz not null,
  terms_version     text not null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table public.profiles is 'One row per user. Created by handle_new_user() at sign-up.';

-- 2. Row Level Security: each user sees and edits only their own row ----------

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No insert or delete policy on purpose: rows are created by the trigger below
-- and deleted together with the account.

-- 3. Which columns the app may change ----------------------------------------
-- The terms acceptance date and version can never be rewritten from the app.

revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;
grant update (display_name, language, timezone, onboarding_done) on public.profiles to authenticated;

-- 4. Keep updated_at current -------------------------------------------------

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 5. Create the profile at sign-up -------------------------------------------
-- The app sends terms_accepted, terms_version, language and timezone with the sign-up.
-- If the terms were not accepted, the sign-up is refused.

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  tz text := meta ->> 'timezone';
begin
  if coalesce(meta ->> 'terms_accepted', '') <> 'true' then
    raise exception 'The Privacy Policy and Terms must be accepted to sign up';
  end if;

  if tz is null or not exists (select 1 from pg_catalog.pg_timezone_names where name = tz) then
    tz := 'Europe/Rome';
  end if;

  insert into public.profiles (id, language, timezone, terms_accepted_at, terms_version)
  values (
    new.id,
    case when meta ->> 'language' in ('en', 'it') then meta ->> 'language' else 'en' end,
    tz,
    now(),
    coalesce(meta ->> 'terms_version', 'unknown')
  );

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
