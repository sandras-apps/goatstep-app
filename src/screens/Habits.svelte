<!-- Habits tab: goals with their habits, "Other habits" (no goal) at the bottom, paused habits. -->
<script>
  import { onMount } from 'svelte';
  import Rocco from '../components/Rocco.svelte';
  import Icon from '../components/Icon.svelte';
  import HabitRow from '../components/HabitRow.svelte';
  import HeavyNote from '../components/HeavyNote.svelte';
  import { categories, habits, ensureHabitsLoaded, resumeHabit } from '../lib/api/habits.js';
  import { NEUTRAL_COLOR, habitColor } from '../lib/appearance.js';
  import { isActive } from '../lib/schedule.js';
  import { RECOMMENDED_NEW_HABITS } from '../lib/recommendations.js';
  import { t } from '../i18n/index.js';

  let loading = $state(true);
  let errorKey = $state(null);

  onMount(async () => {
    try {
      await ensureHabitsLoaded();
    } catch {
      errorKey = 'errors.generic';
    }
    loading = false;
  });

  // Essential first, then bonus; inside each, in the order they were added.
  // "Already mine" habits are mixed in like any other.
  function sorted(list) {
    return [...list].sort((a, b) => (a.priority === b.priority ? a.position - b.position : a.priority === 'essential' ? -1 : 1));
  }

  let active = $derived($habits.filter(isActive));
  let paused = $derived($habits.filter((habit) => habit.paused_at && !habit.archived_at));
  let otherHabits = $derived(sorted(active.filter((habit) => !habit.category_id)));
  let hasNewHabits = $derived(active.some((habit) => habit.kind === 'in_progress'));
  let isEmpty = $derived($categories.length === 0 && $habits.length === 0);

  function habitsOf(goalId) {
    return sorted(active.filter((habit) => habit.category_id === goalId));
  }

  async function resume(habit) {
    errorKey = null;
    try {
      await resumeHabit(habit.id);
    } catch {
      errorKey = 'errors.generic';
    }
  }
</script>

<div class="screen">
  <h1>{$t('habits.title')}</h1>

  {#if errorKey}
    <p class="error" role="alert">{$t(errorKey)}</p>
  {/if}

  {#if loading}
    <p class="hint">{$t('common.loading')}</p>
  {:else if isEmpty}
    <div class="card center">
      <Rocco name="rocco-sprout" width={180} />
      <p>{$t('habits.empty')}</p>
      <p class="hint">{$t('habits.recommendation', { count: RECOMMENDED_NEW_HABITS })}</p>
      <a class="btn btn-primary" href="#/goal/new">{$t('habits.newGoal')}</a>
    </div>
  {:else}
    <HeavyNote />

    {#if !hasNewHabits}
      <p class="notice">{$t('habits.recommendation', { count: RECOMMENDED_NEW_HABITS })}</p>
    {/if}

    {#each $categories as goal (goal.id)}
      {@const goalHabits = habitsOf(goal.id)}
      <section class="card goal" style="--goal: {goal.color}">
        <header>
          <span class="goal-icon"><Icon name={goal.icon} color={goal.color} size={24} /></span>
          <h2>{goal.name}</h2>
          <a class="edit" href="#/goal/{goal.id}">{$t('habits.editGoal')}<span class="visually-hidden"> {goal.name}</span></a>
        </header>
        {#if goal.why}
          <p class="why">{goal.why}</p>
        {/if}
        {#if goalHabits.length > 0}
          <ul class="list">
            {#each goalHabits as habit (habit.id)}
              <HabitRow {habit} color={goal.color} />
            {/each}
          </ul>
        {/if}
        <a class="add" href="#/habit/new?goal={goal.id}">+ {$t('habits.addHabit')}</a>
      </section>
    {/each}

    {#if otherHabits.length > 0}
      <section class="card goal other" style="--goal: {NEUTRAL_COLOR}">
        <header><h2>{$t('habits.other')}</h2></header>
        <ul class="list">
          {#each otherHabits as habit (habit.id)}
            <HabitRow {habit} color={NEUTRAL_COLOR} />
          {/each}
        </ul>
      </section>
    {/if}

    <div class="actions">
      <a class="btn btn-primary" href="#/goal/new">+ {$t('habits.newGoal')}</a>
      <a class="btn btn-secondary" href="#/habit/new">+ {$t('habits.addHabit')}</a>
    </div>

    {#if paused.length > 0}
      <details class="card paused">
        <summary>{$t('habits.paused', { count: paused.length })}</summary>
        <p class="hint">{$t('habits.pausedHint')}</p>
        <ul class="list">
          {#each paused as habit (habit.id)}
            <HabitRow {habit} color={habitColor(habit, $categories)}>
              <button class="btn-link" type="button" onclick={() => resume(habit)}>{$t('habits.resume')}</button>
            </HabitRow>
          {/each}
        </ul>
      </details>
    {/if}
  {/if}
</div>

<style>
  /* The goal's colour, soft: a coloured left edge and a faint tint. */
  .goal {
    border-left: 5px solid var(--goal);
    background: color-mix(in srgb, var(--goal) 5%, var(--color-surface));
  }

  .goal.other {
    border-left-color: var(--color-line);
    background: var(--color-surface);
  }

  .goal header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .goal h2 {
    flex: 1;
    margin: 0;
    overflow-wrap: anywhere;
  }

  .goal-icon {
    display: grid;
    place-items: center;
  }

  .edit {
    font-size: 0.875rem;
  }

  .why {
    color: var(--color-ink-soft);
    font-style: italic;
    margin: 8px 0 0;
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 8px 0 0;
  }

  .add {
    display: inline-block;
    margin-top: 8px;
    padding: 6px 0;
  }

  .actions {
    display: grid;
    gap: 10px;
    margin-bottom: var(--space);
  }

  .paused summary {
    font-weight: 700;
    cursor: pointer;
  }

  .paused .hint {
    margin-top: 8px;
  }
</style>
