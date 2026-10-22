// Gentle recommendations: never limits, never blocks.
// All the numbers live here so they are easy to change later.
//
// Only *new* habits ("in_progress") that are *essential* and active (not paused) count:
// "Already mine" habits never count, and bonus habits are the ones that can wait.

import { isActive, isWeekly, WEEKDAYS } from './schedule.js';

// "Start with up to 3 new habits."
export const RECOMMENDED_NEW_HABITS = 3;
// "…created in a short time" = in the last 14 days.
export const RECENT_DAYS = 14;
// Fixed-day habits: a day feels heavy above this many planned minutes.
export const DAILY_MINUTES_LIMIT = 60;
// Flexible ("X times a week") habits: heavy above this many minutes a week (5 hours).
export const WEEKLY_FLEXIBLE_MINUTES_LIMIT = 300;

function countsForWarnings(habit) {
  return habit.kind === 'in_progress' && habit.priority === 'essential' && isActive(habit);
}

// New, active habits created in the last RECENT_DAYS days (essential and bonus),
// e.g. to show them in the "mark your essentials" panel.
export function recentNewHabits(habits, now = new Date()) {
  const since = now.getTime() - RECENT_DAYS * 24 * 60 * 60 * 1000;
  return habits.filter(
    (habit) => habit.kind === 'in_progress' && isActive(habit) && new Date(habit.created_at).getTime() >= since
  );
}

// True when more than 3 essential new habits were added recently.
export function tooManyNewAtOnce(habits, now = new Date()) {
  return recentNewHabits(habits, now).filter(countsForWarnings).length > RECOMMENDED_NEW_HABITS;
}

// Planned minutes of fixed-day habits on each weekday: { 1: 45, 2: 80, … }
export function minutesPerWeekday(habits) {
  const totals = Object.fromEntries(WEEKDAYS.map((day) => [day, 0]));
  for (const habit of habits) {
    if (!countsForWarnings(habit) || isWeekly(habit) || !habit.minutes) continue;
    for (const day of habit.days) totals[day] += habit.minutes;
  }
  return totals;
}

// Weekdays above the daily limit: [{ day: 2, minutes: 80 }, …]
export function heavyDays(habits) {
  const totals = minutesPerWeekday(habits);
  return WEEKDAYS.filter((day) => totals[day] > DAILY_MINUTES_LIMIT).map((day) => ({ day, minutes: totals[day] }));
}

// Puts heavy days with the same total together, in weekday order:
// [{ day: 1, minutes: 70 }, { day: 3, minutes: 70 }, { day: 6, minutes: 90 }]
//   → [{ days: [1, 3], minutes: 70 }, { days: [6], minutes: 90 }]
export function groupHeavyDays(days) {
  const groups = [];
  for (const { day, minutes } of days) {
    const group = groups.find((existing) => existing.minutes === minutes);
    if (group) group.days.push(day);
    else groups.push({ days: [day], minutes });
  }
  return groups;
}

// Splits weekdays into runs of consecutive days: [1, 2, 3, 4, 5, 7] → [[1, 2, 3, 4, 5], [7]]
export function consecutiveRuns(days) {
  const runs = [];
  for (const day of [...days].sort()) {
    const last = runs.at(-1);
    if (last && day === last.at(-1) + 1) last.push(day);
    else runs.push([day]);
  }
  return runs;
}

// Planned minutes a week of flexible habits, counting the highest number of times
// (e.g. "3–5 times a week, 60 min" → 300 min).
export function flexibleMinutesPerWeek(habits) {
  return habits
    .filter((habit) => countsForWarnings(habit) && isWeekly(habit) && habit.minutes)
    .reduce((total, habit) => total + habit.minutes * habit.times_per_week_max, 0);
}

// Everything the "heavy" note needs, or null when nothing is heavy.
export function heavyLoad(habits) {
  const days = heavyDays(habits);
  const weeklyMinutes = flexibleMinutesPerWeek(habits);
  const weeklyHeavy = weeklyMinutes > WEEKLY_FLEXIBLE_MINUTES_LIMIT;
  if (days.length === 0 && !weeklyHeavy) return null;
  return { days, weeklyMinutes: weeklyHeavy ? weeklyMinutes : null };
}
