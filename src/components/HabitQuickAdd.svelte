<!-- Quick way to add a habit (onboarding): name, goal, how often. Everything else can be added later
     in the habit editor. kind: 'in_progress' (new habit) or 'already_mine'. -->
<script>
  import GoalPicker from './GoalPicker.svelte';
  import FrequencyFields from './FrequencyFields.svelte';
  import { categories, createHabit } from '../lib/api/habits.js';
  import { goalIdForChoice, choiceForGoal } from '../lib/goalChoice.js';
  import { ALL_DAYS, frequencyColumns } from '../lib/schedule.js';
  import { DEFAULT_HABIT_ICON } from '../lib/appearance.js';
  import { t } from '../i18n/index.js';

  let { kind, onadded } = $props();

  const uid = $props.id();

  let name = $state('');
  let goalChoice = $state('');
  let newGoalName = $state('');
  let frequencyType = $state('days');
  let days = $state([...ALL_DAYS]);
  let timesMin = $state(3);
  let timesMax = $state(3);
  let minutes = $state('');

  let busy = $state(false);
  let errorKey = $state(null);

  async function add(event) {
    event.preventDefault();
    busy = true;
    errorKey = null;
    try {
      const categoryId = await goalIdForChoice(goalChoice, newGoalName, $t);
      const goal = $categories.find((row) => row.id === categoryId);
      const habit = await createHabit({
        name: name.trim(),
        kind,
        priority: 'essential',
        category_id: categoryId,
        icon: goal?.icon ?? DEFAULT_HABIT_ICON,
        ...frequencyColumns({ frequencyType, days, timesMin, timesMax, minutes })
      });

      // Ready for the next one: same goal (now an existing one), fresh fields.
      goalChoice = choiceForGoal(categoryId);
      newGoalName = '';
      name = '';
      frequencyType = 'days';
      days = [...ALL_DAYS];
      timesMin = 3;
      timesMax = 3;
      minutes = '';
      onadded?.(habit);
    } catch {
      errorKey = 'errors.generic';
    }
    busy = false;
  }
</script>

<form class="card" onsubmit={add}>
  <div class="field">
    <label for="{uid}-name">{$t(kind === 'already_mine' ? 'quickAdd.routineName' : 'quickAdd.habitName')}</label>
    <input
      id="{uid}-name"
      type="text"
      maxlength="80"
      required
      placeholder={$t(kind === 'already_mine' ? 'quickAdd.routinePlaceholder' : 'quickAdd.habitPlaceholder')}
      bind:value={name}
    />
  </div>

  <GoalPicker bind:value={goalChoice} bind:newName={newGoalName} />

  <FrequencyFields bind:frequencyType bind:days bind:timesMin bind:timesMax bind:minutes />

  {#if errorKey}
    <p class="error" role="alert">{$t(errorKey)}</p>
  {/if}
  <button class="btn btn-secondary" type="submit" disabled={busy || !name.trim() || (goalChoice === 'new' && !newGoalName.trim())}>
    + {$t(kind === 'already_mine' ? 'quickAdd.addRoutine' : 'quickAdd.addHabit')}
  </button>
</form>
