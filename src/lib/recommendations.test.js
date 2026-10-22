// Run with: npm test

import { describe, expect, it } from 'vitest';
import {
  tooManyNewAtOnce,
  heavyDays,
  flexibleMinutesPerWeek,
  heavyLoad,
  recentNewHabits,
  groupHeavyDays,
  consecutiveRuns
} from './recommendations.js';
import { frequencyLabel, weekdayOf } from './schedule.js';

const now = new Date('2026-10-22T12:00:00Z');
const daysAgo = (n) => new Date(now.getTime() - n * 86400000).toISOString();

function habit(fields = {}) {
  return {
    kind: 'in_progress',
    priority: 'essential',
    frequency_type: 'days',
    days: [1, 2, 3, 4, 5, 6, 7],
    times_per_week_min: null,
    times_per_week_max: null,
    minutes: null,
    paused_at: null,
    archived_at: null,
    created_at: daysAgo(1),
    ...fields
  };
}

describe('too many new habits at once', () => {
  it('stays quiet up to 3 recent essential new habits', () => {
    expect(tooManyNewAtOnce([habit(), habit(), habit()], now)).toBe(false);
  });

  it('speaks up at the 4th', () => {
    expect(tooManyNewAtOnce([habit(), habit(), habit(), habit()], now)).toBe(true);
  });

  it('ignores already-mine, bonus, paused and older habits', () => {
    const habits = [
      habit(),
      habit(),
      habit(),
      habit({ kind: 'already_mine' }),
      habit({ priority: 'bonus' }),
      habit({ paused_at: daysAgo(0) }),
      habit({ created_at: daysAgo(20) })
    ];
    expect(tooManyNewAtOnce(habits, now)).toBe(false);
  });

  it('lists recent new habits, bonus included, for the essentials panel', () => {
    const habits = [habit(), habit({ priority: 'bonus' }), habit({ kind: 'already_mine' })];
    expect(recentNewHabits(habits, now)).toHaveLength(2);
  });
});

describe('heavy days', () => {
  it('finds fixed days above 60 minutes', () => {
    const habits = [habit({ minutes: 40 }), habit({ minutes: 30, days: [1] })];
    expect(heavyDays(habits)).toEqual([{ day: 1, minutes: 70 }]);
  });

  it('does not count flexible, bonus or already-mine habits per day', () => {
    const habits = [
      habit({ minutes: 50 }),
      habit({ minutes: 50, priority: 'bonus' }),
      habit({ minutes: 50, kind: 'already_mine' }),
      habit({ minutes: 50, frequency_type: 'weekly', times_per_week_min: 3, times_per_week_max: 5 })
    ];
    expect(heavyDays(habits)).toEqual([]);
  });

  it('counts flexible habits in a weekly total, using the highest number of times', () => {
    const habits = [habit({ minutes: 60, frequency_type: 'weekly', times_per_week_min: 3, times_per_week_max: 5 })];
    expect(flexibleMinutesPerWeek(habits)).toBe(300);
    expect(heavyLoad(habits)).toBeNull(); // exactly 5 hours is fine

    habits.push(habit({ minutes: 10, frequency_type: 'weekly', times_per_week_min: 1, times_per_week_max: 1 }));
    expect(heavyLoad(habits)).toEqual({ days: [], weeklyMinutes: 310 });
  });
});

describe('grouping heavy days for the note', () => {
  it('puts days with the same total together, in weekday order', () => {
    const days = [
      { day: 1, minutes: 70 },
      { day: 3, minutes: 70 },
      { day: 6, minutes: 90 },
      { day: 7, minutes: 90 }
    ];
    expect(groupHeavyDays(days)).toEqual([
      { days: [1, 3], minutes: 70 },
      { days: [6, 7], minutes: 90 }
    ]);
  });

  it('gives one group when every day has the same total', () => {
    const days = [1, 2, 3, 4, 5, 6, 7].map((day) => ({ day, minutes: 70 }));
    expect(groupHeavyDays(days)).toEqual([{ days: [1, 2, 3, 4, 5, 6, 7], minutes: 70 }]);
  });

  it('finds runs of consecutive days', () => {
    expect(consecutiveRuns([7, 1, 2, 3, 4, 5])).toEqual([[1, 2, 3, 4, 5], [7]]);
    expect(consecutiveRuns([1, 3, 5])).toEqual([[1], [3], [5]]);
  });
});

describe('schedule helpers', () => {
  const t = (key, values = {}) => `${key}:${JSON.stringify(values)}`;

  it('describes frequencies', () => {
    expect(frequencyLabel(habit(), t, 'en')).toBe('frequency.everyDay:{}');
    expect(frequencyLabel(habit({ days: [5, 4, 3, 2, 1] }), t, 'en')).toBe('frequency.workdays:{}');
    expect(frequencyLabel(habit({ days: [1, 3, 5] }), t, 'en')).toBe('Mon, Wed, Fri');
    expect(
      frequencyLabel(habit({ frequency_type: 'weekly', times_per_week_min: 3, times_per_week_max: 5 }), t, 'en')
    ).toBe('frequency.rangePerWeek:{"min":3,"max":5}');
    expect(
      frequencyLabel(habit({ frequency_type: 'weekly', times_per_week_min: 1, times_per_week_max: 1 }), t, 'en')
    ).toBe('frequency.oncePerWeek:{"count":1}');
  });

  it('numbers weekdays from Monday = 1 to Sunday = 7', () => {
    expect(weekdayOf(new Date(2026, 9, 19))).toBe(1); // Monday 19 October 2026
    expect(weekdayOf(new Date(2026, 9, 25))).toBe(7); // Sunday 25 October 2026
  });
});
