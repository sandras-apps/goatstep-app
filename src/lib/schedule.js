// When a habit happens.
//
// frequency_type 'days'   → on fixed weekdays: days = [1, 3, 5] means Monday, Wednesday, Friday
// frequency_type 'weekly' → any days, times_per_week_min…times_per_week_max times a week
//                           (shown every day on Today until the weekly target is reached)
//
// Weekdays are numbered 1 = Monday … 7 = Sunday, like in the database.

export const WEEKDAYS = [1, 2, 3, 4, 5, 6, 7];
export const ALL_DAYS = WEEKDAYS;
export const WORKDAYS = [1, 2, 3, 4, 5];

// 1 = Monday … 7 = Sunday (JavaScript's getDay() starts the week on Sunday = 0).
export function weekdayOf(date) {
  return date.getDay() === 0 ? 7 : date.getDay();
}

// The "How often" form fields (components/FrequencyFields.svelte) → database columns.
export function frequencyColumns({ frequencyType, days, timesMin, timesMax, minutes }) {
  const weekly = frequencyType === 'weekly';
  return {
    frequency_type: frequencyType,
    days,
    times_per_week_min: weekly ? timesMin : null,
    times_per_week_max: weekly ? timesMax : null,
    minutes: minutes ? Number(minutes) : null
  };
}

export function isActive(habit) {
  return !habit.paused_at && !habit.archived_at;
}

export function isWeekly(habit) {
  return habit.frequency_type === 'weekly';
}

// Short weekday names in the user's language, Monday first: ['Mon', 'Tue', …] / ['lun', 'mar', …]
export function weekdayNames(locale, style = 'short') {
  const monday = new Date(2024, 0, 1); // 1 January 2024 was a Monday
  return WEEKDAYS.map((day) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + day - 1);
    return date.toLocaleDateString(locale, { weekday: style });
  });
}

// Describes how often, e.g. "Every day", "Mon, Wed, Fri", "3–5 times a week".
// `t` is the translation function, `locale` the language code.
export function frequencyLabel(habit, t, locale) {
  if (isWeekly(habit)) {
    const min = habit.times_per_week_min;
    const max = habit.times_per_week_max;
    if (min === max) return t(min === 1 ? 'frequency.oncePerWeek' : 'frequency.timesPerWeek', { count: min });
    return t('frequency.rangePerWeek', { min, max });
  }

  const days = [...habit.days].sort();
  if (days.length === 7) return t('frequency.everyDay');
  if (days.join() === WORKDAYS.join()) return t('frequency.workdays');
  const names = weekdayNames(locale);
  return days.map((day) => names[day - 1]).join(', ');
}
