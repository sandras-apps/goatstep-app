<!-- "How often": specific days or a number of times a week, plus minutes.
     The same fields everywhere a habit is created or edited. -->
<script>
  import TwoOptionSwitch from './TwoOptionSwitch.svelte';
  import { WEEKDAYS, weekdayNames } from '../lib/schedule.js';
  import { t, locale } from '../i18n/index.js';

  let {
    frequencyType = $bindable(),
    days = $bindable(),
    timesMin = $bindable(),
    timesMax = $bindable(),
    minutes = $bindable()
  } = $props();

  // Unique ids, so this component can appear more than once on a page.
  const uid = $props.id();

  let dayNames = $derived(weekdayNames($locale));
  let dayLongNames = $derived(weekdayNames($locale, 'long'));

  function toggleDay(day) {
    if (days.includes(day)) {
      if (days.length > 1) days = days.filter((d) => d !== day); // at least one day
    } else {
      days = [...days, day].sort();
    }
  }

  function changeMin() {
    if (timesMax < timesMin) timesMax = timesMin;
  }

  function changeMax() {
    if (timesMin > timesMax) timesMin = timesMax;
  }
</script>

<div class="field">
  <p class="label">{$t('habitEditor.howOften')}</p>
  <TwoOptionSwitch
    bind:value={frequencyType}
    label={$t('habitEditor.howOften')}
    options={[
      { value: 'days', label: $t('frequency.daysOption'), hint: $t('frequency.daysHint') },
      { value: 'weekly', label: $t('frequency.weeklyOption'), hint: $t('frequency.weeklyHint') }
    ]}
  />
</div>

{#if frequencyType === 'days'}
  <div class="field" role="group" aria-label={$t('habitEditor.whichDays')}>
    <div class="days">
      {#each WEEKDAYS as day}
        <button
          type="button"
          class="day"
          aria-pressed={days.includes(day)}
          aria-label={dayLongNames[day - 1]}
          onclick={() => toggleDay(day)}>{dayNames[day - 1]}</button
        >
      {/each}
    </div>
  </div>
{:else}
  <div class="field">
    <div class="times">
      <label for="{uid}-min">{$t('frequency.from')}</label>
      <select id="{uid}-min" bind:value={timesMin} onchange={changeMin}>
        {#each WEEKDAYS as n}<option value={n}>{n}</option>{/each}
      </select>
      <label for="{uid}-max">{$t('frequency.to')}</label>
      <select id="{uid}-max" bind:value={timesMax} onchange={changeMax}>
        {#each WEEKDAYS as n}<option value={n}>{n}</option>{/each}
      </select>
      <span>{$t('frequency.timesAWeek')}</span>
    </div>
    <p class="hint">{$t('frequency.rangeHint')}</p>
  </div>
{/if}

<div class="field">
  <label for="{uid}-minutes">{$t('habitEditor.minutes')}</label>
  <input id="{uid}-minutes" class="minutes" type="number" min="1" max="600" inputmode="numeric" bind:value={minutes} />
  <p class="hint">{$t('habitEditor.minutesHint')}</p>
</div>

<style>
  .label {
    font-weight: 600;
    margin: 0 0 6px;
  }

  .days {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 4px;
  }

  .day {
    min-height: 44px;
    border: 1.5px solid var(--color-line);
    border-radius: var(--radius-sm);
    background: var(--color-surface);
    font: inherit;
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--color-ink);
    cursor: pointer;
    padding: 0;
  }

  .day[aria-pressed='true'] {
    background: var(--color-ink);
    border-color: var(--color-ink);
    color: var(--color-surface);
  }

  .times {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  .times label {
    margin: 0;
    font-weight: 500;
  }

  .times select {
    width: auto;
    min-width: 64px;
  }

  .minutes {
    max-width: 140px;
  }
</style>
