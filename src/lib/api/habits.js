// Goals ("categories" in the database) and habits: loading and saving.
// The screens read the two stores below; every change goes through these functions
// so the stores always match the database.

import { writable, get } from 'svelte/store';
import { supabase } from '../supabase.js';
import { session } from '../auth.js';

export const categories = writable([]);
export const habits = writable([]);

let loadedForUser = null;

// Loads goals and habits once per logged-in user.
export async function ensureHabitsLoaded() {
  const userId = get(session)?.user?.id;
  if (!userId || loadedForUser === userId) return;
  loadedForUser = userId;
  try {
    const [goalsResult, habitsResult] = await Promise.all([
      supabase.from('categories').select('*').is('archived_at', null).order('position').order('created_at'),
      supabase.from('habits').select('*').is('archived_at', null).order('position').order('created_at')
    ]);
    if (goalsResult.error) throw goalsResult.error;
    if (habitsResult.error) throw habitsResult.error;
    categories.set(goalsResult.data);
    habits.set(habitsResult.data);
  } catch (error) {
    loadedForUser = null;
    throw error;
  }
}

// Forget everything when someone logs out.
session.subscribe((current) => {
  if (!current) {
    loadedForUser = null;
    categories.set([]);
    habits.set([]);
  }
});

function nextPosition(rows) {
  return rows.reduce((max, row) => Math.max(max, row.position), -1) + 1;
}

function replaceIn(store, row) {
  store.update((rows) => rows.map((existing) => (existing.id === row.id ? row : existing)));
}

// --- Goals -------------------------------------------------------------------

const GOAL_FIELDS = ['name', 'icon', 'color', 'why'];

function pick(fields, allowed) {
  return Object.fromEntries(allowed.filter((key) => key in fields).map((key) => [key, fields[key]]));
}

export async function createGoal(fields) {
  const row = { ...pick(fields, GOAL_FIELDS), position: nextPosition(get(categories)) };
  const { data, error } = await supabase.from('categories').insert(row).select().single();
  if (error) throw error;
  categories.update((rows) => [...rows, data]);
  return data;
}

export async function updateGoal(id, fields) {
  const { data, error } = await supabase.from('categories').update(pick(fields, GOAL_FIELDS)).eq('id', id).select().single();
  if (error) throw error;
  replaceIn(categories, data);
  return data;
}

// The goal's habits stay, without a goal (the database does this, we mirror it here).
export async function deleteGoal(id) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
  categories.update((rows) => rows.filter((row) => row.id !== id));
  habits.update((rows) => rows.map((row) => (row.category_id === id ? { ...row, category_id: null } : row)));
}

// --- Habits ------------------------------------------------------------------

const HABIT_FIELDS = [
  'category_id',
  'kind',
  'priority',
  'name',
  'icon',
  'why',
  'minimal_version',
  'frequency_type',
  'days',
  'times_per_week_min',
  'times_per_week_max',
  'minutes'
];

export async function createHabit(fields) {
  const row = { ...pick(fields, HABIT_FIELDS), position: nextPosition(get(habits)) };
  const { data, error } = await supabase.from('habits').insert(row).select().single();
  if (error) throw error;
  habits.update((rows) => [...rows, data]);
  return data;
}

async function changeHabit(id, changes) {
  const { data, error } = await supabase.from('habits').update(changes).eq('id', id).select().single();
  if (error) throw error;
  replaceIn(habits, data);
  return data;
}

export function updateHabit(id, fields) {
  return changeHabit(id, pick(fields, HABIT_FIELDS));
}

export function setPriority(id, priority) {
  return changeHabit(id, { priority });
}

// Paused: hidden from Today and the calendar, history and materials kept.
export function pauseHabit(id) {
  return changeHabit(id, { paused_at: new Date().toISOString() });
}

export function resumeHabit(id) {
  return changeHabit(id, { paused_at: null });
}

// "It's part of me now": from "in progress" to "already mine".
export function graduateHabit(id) {
  return changeHabit(id, { kind: 'already_mine', graduated_at: new Date().toISOString() });
}

export async function deleteHabit(id) {
  const { error } = await supabase.from('habits').delete().eq('id', id);
  if (error) throw error;
  habits.update((rows) => rows.filter((row) => row.id !== id));
}
