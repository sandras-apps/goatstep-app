<!-- Create or edit a goal. Deleting it keeps its habits (they move to "No goal"). -->
<script>
  import { onMount } from 'svelte';
  import AppearancePicker from '../components/AppearancePicker.svelte';
  import { categories, ensureHabitsLoaded, createGoal, updateGoal, deleteGoal } from '../lib/api/habits.js';
  import { DEFAULT_GOAL_ICON, DEFAULT_COLOR, nextGoalColor } from '../lib/appearance.js';
  import { go } from '../lib/router.js';
  import { t } from '../i18n/index.js';

  let { params = {} } = $props();

  let isNew = $derived(!params.id);
  let ready = $state(false);
  let missing = $state(false);

  let name = $state('');
  let why = $state('');
  let icon = $state(DEFAULT_GOAL_ICON);
  let color = $state(DEFAULT_COLOR);

  let busy = $state(false);
  let errorKey = $state(null);
  let confirmingDelete = $state(false);

  onMount(async () => {
    try {
      await ensureHabitsLoaded();
    } catch {
      errorKey = 'errors.generic';
    }
    if (!params.id) {
      color = nextGoalColor($categories);
    } else {
      const goal = $categories.find((row) => row.id === params.id);
      if (!goal) {
        missing = true;
      } else {
        name = goal.name;
        why = goal.why ?? '';
        icon = goal.icon;
        color = goal.color;
      }
    }
    ready = true;
  });

  async function save(event) {
    event.preventDefault();
    busy = true;
    errorKey = null;
    const fields = { name: name.trim(), why: why.trim() || null, icon, color };
    try {
      if (isNew) await createGoal(fields);
      else await updateGoal(params.id, fields);
      go('/habits');
    } catch {
      errorKey = 'errors.generic';
      busy = false;
    }
  }

  async function remove() {
    busy = true;
    try {
      await deleteGoal(params.id);
      go('/habits');
    } catch {
      errorKey = 'errors.generic';
      busy = false;
    }
  }
</script>

<div class="screen">
  <p><a href="#/habits">← {$t('common.back')}</a></p>
  <h1>{isNew ? $t('goalEditor.newTitle') : $t('goalEditor.editTitle')}</h1>

  {#if !ready}
    <p class="hint">{$t('common.loading')}</p>
  {:else if missing}
    <p class="notice">{$t('goalEditor.missing')}</p>
  {:else}
    <form class="card" onsubmit={save}>
      <div class="field">
        <label for="name">{$t('goalEditor.name')}</label>
        <input id="name" type="text" maxlength="60" required placeholder={$t('goalEditor.namePlaceholder')} bind:value={name} />
      </div>
      <div class="field">
        <label for="why">{$t('goalEditor.why')}</label>
        <textarea id="why" rows="2" maxlength="500" placeholder={$t('goalEditor.whyPlaceholder')} bind:value={why}></textarea>
      </div>

      <AppearancePicker bind:icon bind:color />

      {#if errorKey}
        <p class="error" role="alert">{$t(errorKey)}</p>
      {/if}
      <button class="btn btn-primary" type="submit" disabled={busy || !name.trim()}>{$t('common.save')}</button>
    </form>

    {#if !isNew}
      <section class="card">
        {#if !confirmingDelete}
          <button class="btn-link" type="button" onclick={() => (confirmingDelete = true)}>{$t('goalEditor.delete')}</button>
        {:else}
          <p>{$t('goalEditor.deleteText')}</p>
          <div class="actions">
            <button class="btn btn-secondary" type="button" onclick={remove} disabled={busy}>{$t('goalEditor.deleteConfirm')}</button>
            <button class="btn-link" type="button" onclick={() => (confirmingDelete = false)}>{$t('common.cancel')}</button>
          </div>
        {/if}
      </section>
    {/if}
  {/if}
</div>

<style>
  .actions {
    display: grid;
    gap: 8px;
  }
</style>
