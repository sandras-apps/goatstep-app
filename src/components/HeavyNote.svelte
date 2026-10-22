<!-- A soft note, with a small Rocco, when some days (or the week) look full of new essential habits.
     Days with the same total are grouped: "Every day looks full (70 min)",
     "Some days look full: Monday to Friday (70 min) and Sunday (90 min)".
     Closing it hides it until the numbers change. -->
<script>
  import GentleNote from './GentleNote.svelte';
  import { habits } from '../lib/api/habits.js';
  import { heavyLoad, groupHeavyDays, consecutiveRuns } from '../lib/recommendations.js';
  import { weekdayNames } from '../lib/schedule.js';
  import { t, locale } from '../i18n/index.js';

  const STORAGE_KEY = 'goatstep.heavyNoteClosed';

  let load = $derived(heavyLoad($habits));
  // A short "fingerprint" of the numbers: if they change, the note can come back.
  let fingerprint = $derived(JSON.stringify(load));
  let closedFor = $state(readClosed());

  let daysText = $derived.by(() => {
    if (!load || load.days.length === 0) return '';
    const groups = groupHeavyDays(load.days);
    if (load.days.length === 7 && groups.length === 1) return $t('heavy.everyDay', { minutes: groups[0].minutes });

    const list = new Intl.ListFormat($locale, { type: 'conjunction' });
    const names = weekdayNames($locale, 'long');
    const describe = (group) => {
      // 3 or more days in a row become a range: "Monday to Friday".
      const parts = consecutiveRuns(group.days).flatMap((run) =>
        run.length >= 3
          ? [$t('heavy.range', { from: names[run[0] - 1], to: names[run.at(-1) - 1] })]
          : run.map((day) => names[day - 1])
      );
      return `${list.format(parts)} (${group.minutes} min)`;
    };
    const text = list.format(groups.map(describe));
    return $t(load.days.length === 7 ? 'heavy.everyDayGroups' : 'heavy.days', { groups: text });
  });

  // e.g. 350 min → "5.8" in English, "5,8" in Italian.
  let weeklyHours = $derived(
    load?.weeklyMinutes
      ? new Intl.NumberFormat($locale, { maximumFractionDigits: 1 }).format(load.weeklyMinutes / 60)
      : null
  );

  function readClosed() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch {
      return null;
    }
  }

  function close() {
    closedFor = fingerprint;
    try {
      localStorage.setItem(STORAGE_KEY, fingerprint);
    } catch {
      // Not remembered after a reload: not a problem.
    }
  }
</script>

{#if load && closedFor !== fingerprint}
  <GentleNote image="rocco-checkin">
    {#if daysText}
      <p>{daysText}</p>
    {/if}
    {#if weeklyHours}
      <p>{$t('heavy.week', { hours: weeklyHours })}</p>
    {/if}
    <p>{$t('heavy.suggestion')}</p>
    <p><button class="btn-link" type="button" onclick={close}>{$t('heavy.close')}</button></p>
  </GentleNote>
{/if}
