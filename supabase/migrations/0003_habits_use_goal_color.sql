-- 0003_habits_use_goal_color.sql — Step 2, after testing
-- Habits no longer have their own colour: they show the colour of their goal
-- (habits without a goal use a neutral colour). Only goals keep a `color` column.
-- Run once in Supabase → SQL Editor → New query → paste → Run.

-- The app's permissions on this column disappear together with it.
alter table public.habits drop column color;
