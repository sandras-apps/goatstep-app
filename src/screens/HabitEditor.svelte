<!-- Create or edit a habit. When editing: pause/resume, "it's part of me now", delete.
     Habits have no colour of their own: they show their goal's colour. -->
<script>
  import { onMount, untrack } from 'svelte';
  import AppearancePicker from '../components/AppearancePicker.svelte';
  import EssentialsPanel from '../components/EssentialsPanel.svelte';
  import GoalPicker from '../components/GoalPicker.svelte';
  import FrequencyFields from '../components/FrequencyFields.svelte';
  import TwoOptionSwitch from '../components/TwoOptionSwitch.svelte';
  import {
    categories,
    habits,
    ensureHabitsLoaded,
    createHabit,
    updateHabit,
    pauseHabit,
    resumeHabit,
    graduateHabit,
    deleteHabit
  } from '../lib/api/habits.js';
  import { goalIdForChoice, choiceForGoal } from '../lib/goalChoice.js';
  import { DEFAULT_HABIT_ICON, NEUTRAL_COLOR, GOAL_SUGGESTIONS } from '../lib/appearance.js';
  import { ALL_DAYS, frequencyColumns } from '../lib/schedule.js';
  import { tooManyNewAtOnce } from '../lib/recommendations.js';
  import { go } from '../lib/router.js';
  import { t } from '../i18n/index.js';

  let { params = {} } = $props();

  // App.svelte creates a fresh copy of this screen for every address,
  // so reading the address values once, at the start, is all it needs.
  const start = untrack(() => ({ ...params }));
  const habitId = start.id;
  const isNew = !habitId;

  let ready = $state(false);
  let missing = $state(false);
  let current = $derived($habits.find((habit) => habit.id === habitId));

  // Form fields
  let name = $state('');
  let goalChoice = $state('');
  let newGoalName = $state('');
  let kind = $state(start.kind === 'already_mine' ? 'already_mine' : 'in_progress');
  let priority = $state('essential');
  let frequencyType = $state('days');
  let days = $state([...ALL_DAYS]);
  let timesMin = $state(3);
  let timesMax = $state(3);
  let minutes = $state('');
  let why = $state('');
  let minimalVersion = $state('');
  let icon = $state(DEFAULT_HABIT_ICON);

  let busy = $state(false);
  let errorKey = $state(null);
  let confirmingDelete = $state(false);
  let showEssentials = $state(false);

  // The icons are drawn in the colour of the chosen goal.
  let previewColor = $derived.by(() => {
    if (goalChoice.startsWith('goal:')) {
      return $categories.find((goal) => `goal:${goal.id}` === goalChoice)?.color ?? NEUTRAL_COLOR;
    }
    if (goalChoice.startsWith('idea:')) {
      return GOAL_SUGGESTIONS.find((idea) => `idea:${idea.key}` === goalChoice)?.color ?? NEUTRAL_COLOR;
    }
    return NEUTRAL_COLOR;
  });

  onMount(async () => {
    try {
      await ensureHabitsLoaded();
    } catch {
      errorKey = 'errors.generic';
    }

    if (isNew) {
      if ($categories.some((goal) => goal.id === start.goal)) goalChoice = choiceForGoal(start.goal);
    } else if (!current) {
      missing = true;
    } else {
      name = current.name;
      goalChoice = choiceForGoal(current.category_id);
      kind = current.kind;
      priority = current.priority;
      frequencyType = current.frequency_type;
      days = [...current.days];
      timesMin = current.times_per_week_min ?? 3;
      timesMax = current.times_per_week_max ?? timesMin;
      minutes = current.minutes ?? '';
      why = current.why ?? '';
      minimalVersion = current.minimal_version ?? '';
      icon = current.icon;
    }
    ready = true;
  });

  async function fields() {
    return {
      name: name.trim(),
      category_id: await goalIdForChoice(goalChoice, newGoalName, $t),
      kind,
      priority,
      ...frequencyColumns({ frequencyType, days, timesMin, timesMax, minutes }),
      why: why.trim() || null,
      minimal_version: minimalVersion.trim() || null,
      icon
    };
  }

  async function run(action, after = '/habits') {
    busy = true;
    errorKey = null;
    try {
      await action();
      go(after);
    } catch {
      errorKey = 'errors.generic';
      busy = false;
    }
  }

  async function save(event) {
    event.preventDefault();
    if (!isNew) return run(async () => updateHabit(habitId, await fields()));

    busy = true;
    errorKey = null;
    try {
      const created = await createHabit(await fields());
      // A gentle check, never a block: the habit is already saved.
      if (created.kind === 'in_progress' && created.priority === 'essential' && tooManyNewAtOnce($habits)) {
        showEssentials = true;
      } else {
        go('/habits');
      }
    } catch {
      errorKey = 'errors.generic';
      busy = false;
    }
  }
</script>

<div class="screen">
  <p><a href="#/habits">← {$t('common.back')}</a></p>
  <h1>{isNew ? $t('habitEditor.newTitle') : $t('habitEditor.editTitle')}</h1>

  {#if !ready}
    <p class="hint">{$t('common.loading')}</p>
  {:else if missing}
    <p class="notice">{$t('habitEditor.missing')}</p>
  {:else}
    {#if current?.paused_at}
      <p class="notice">{$t('habitEditor.pausedNotice')}</p>
    {/if}

    <form onsubmit={save}>
      <section class="card">
        <div class="field">
          <label for="name">{$t('habitEditor.name')}</label>
          <input id="name" type="text" maxlength="80" required placeholder={$t('habitEditor.namePlaceholder')} bind:value={name} />
        </div>

        <GoalPicker bind:value={goalChoice} bind:newName={newGoalName} />

        <div class="field">
          <p class="label">{$t('habitEditor.kind')}</p>
          <TwoOptionSwitch
            bind:value={kind}
            label={$t('habitEditor.kind')}
            options={[
              { value: 'in_progress', label: $t('kind.in_progress'), hint: $t('kind.in_progressHint') },
              { value: 'already_mine', label: $t('kind.already_mine'), hint: $t('kind.already_mineHint') }
            ]}
          />
        </div>

        <div class="field">
          <p class="label">{$t('habitEditor.priority')}</p>
          <TwoOptionSwitch
            bind:value={priority}
            label={$t('habitEditor.priority')}
            options={[
              { value: 'essential', label: $t('priority.essential'), hint: $t('priority.essentialHint') },
              { value: 'bonus', label: $t('priority.bonus'), hint: $t('priority.bonusHint') }
            ]}
          />
        </div>
      </section>

      <section class="card">
        <FrequencyFields bind:frequencyType bind:days bind:timesMin bind:timesMax bind:minutes />
      </section>

      <section class="card">
        <div class="field">
          <label for="why">{$t('habitEditor.why')}</label>
          <textarea id="why" rows="2" maxlength="500" placeholder={$t('habitEditor.whyPlaceholder')} bind:value={why}></textarea>
        </div>
        <div class="field">
          <label for="minimal">{$t('habitEditor.minimal')}</label>
          <input id="minimal" type="text" maxlength="200" placeholder={$t('habitEditor.minimalPlaceholder')} bind:value={minimalVersion} />
          <p class="hint">{$t('habitEditor.minimalHint')}</p>
        </div>
      </section>

      <section class="card">
        <AppearancePicker bind:icon color={previewColor} chooseColor={false} />
        <p class="hint">{$t('habitEditor.colorFromGoal')}</p>
      </section>

      {#if errorKey}
        <p class="error" role="alert">{$t(errorKey)}</p>
      {/if}
      <button
        class="btn btn-primary save"
        type="submit"
        disabled={busy || !name.trim() || (goalChoice === 'new' && !newGoalName.trim())}>{$t('common.save')}</button
      >
    </form>

    {#if !isNew && current}
      <section class="card more">
        {#if current.paused_at}
          <button class="btn btn-secondary" type="button" disabled={busy} onclick={() => run(() => resumeHabit(habitId))}>
            {$t('habitEditor.resume')}
          </button>
        {:else}
          <button class="btn btn-secondary" type="button" disabled={busy} onclick={() => run(() => pauseHabit(habitId))}>
            {$t('habitEditor.pause')}
          </button>
          <p class="hint">{$t('habitEditor.pauseHint')}</p>
        {/if}

        {#if current.kind === 'in_progress'}
          <button class="btn btn-secondary" type="button" disabled={busy} onclick={() => run(() => graduateHabit(habitId))}>
            {$t('habitEditor.graduate')}
          </button>
          <p class="hint">{$t('habitEditor.graduateHint')}</p>
        {/if}

        {#if !confirmingDelete}
          <button class="btn-link" type="button" onclick={() => (confirmingDelete = true)}>{$t('habitEditor.delete')}</button>
        {:else}
          <p>{$t('habitEditor.deleteText')}</p>
          {#if !current.paused_at}
            <button class="btn btn-secondary" type="button" disabled={busy} onclick={() => run(() => pauseHabit(habitId))}>
              {$t('habitEditor.pauseInstead')}
            </button>
          {/if}
          <button class="btn btn-secondary" type="button" disabled={busy} onclick={() => run(() => deleteHabit(habitId))}>
            {$t('habitEditor.deleteConfirm')}
          </button>
          <button class="btn-link" type="button" onclick={() => (confirmingDelete = false)}>{$t('common.cancel')}</button>
        {/if}
      </section>
    {/if}
  {/if}
</div>

{#if showEssentials}
  <EssentialsPanel onclose={() => go('/habits')} />
{/if}

<style>
  .label {
    font-weight: 600;
    margin: 0 0 6px;
  }

  .save {
    margin-bottom: var(--space);
  }

  .more {
    display: grid;
    gap: 6px;
  }

  .more .hint {
    margin: 0 0 8px;
  }
</style>
