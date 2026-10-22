<!-- First visit, three short screens (2 and 3 can be skipped):
     1. Rocco's welcome  2. routines you already have  3. first new habits
     In 2 and 3 each habit gets its own goal (yours, a suggested one or a new one) and its own "how often". -->
<script>
  import { onMount } from 'svelte';
  import Rocco from '../components/Rocco.svelte';
  import HabitRow from '../components/HabitRow.svelte';
  import HabitQuickAdd from '../components/HabitQuickAdd.svelte';
  import GentleNote from '../components/GentleNote.svelte';
  import EssentialsPanel from '../components/EssentialsPanel.svelte';
  import { updateProfile, takeLinkResult } from '../lib/auth.js';
  import { categories, habits, ensureHabitsLoaded } from '../lib/api/habits.js';
  import { habitColor } from '../lib/appearance.js';
  import { RECOMMENDED_NEW_HABITS, tooManyNewAtOnce } from '../lib/recommendations.js';
  import { go } from '../lib/router.js';
  import { t } from '../i18n/index.js';

  // True only right after clicking the confirmation link (shown once, then forgotten).
  const justConfirmed = takeLinkResult() === 'confirmed';

  let step = $state(1);
  let busy = $state(false);
  let errorKey = $state(null);
  let hasRoutines = $state(null); // step 2: null = not answered yet
  let showEssentials = $state(false);

  // What was added on each screen, to show it under the form.
  let addedIds = $state({ 2: [], 3: [] });
  let added = $derived(addedIds[step]?.map((id) => $habits.find((habit) => habit.id === id)).filter(Boolean) ?? []);

  let manyNew = $derived(tooManyNewAtOnce($habits));

  onMount(() => {
    ensureHabitsLoaded().catch(() => (errorKey = 'errors.generic'));
  });

  function remember(habit) {
    addedIds[step] = [...addedIds[step], habit.id];
  }

  function goalName(habit) {
    return $categories.find((goal) => goal.id === habit.category_id)?.name ?? $t('habits.other');
  }

  async function finish() {
    busy = true;
    errorKey = null;
    try {
      await updateProfile({ onboarding_done: true });
      go('/habits');
    } catch {
      errorKey = 'errors.generic';
      busy = false;
    }
  }

  // Same gentle check as when adding a habit anywhere else: never a block.
  function start() {
    if (manyNew) showEssentials = true;
    else finish();
  }
</script>

<main class="screen onboarding">
  <p class="progress" aria-label={$t('onboarding.progress', { step, total: 3 })}>
    {#each [1, 2, 3] as dot}<span class:on={dot <= step}></span>{/each}
  </p>

  {#if errorKey}
    <p class="error" role="alert">{$t(errorKey)}</p>
  {/if}

  {#if step === 1}
    <div class="center">
      {#if justConfirmed}
        <p class="notice" role="status">{$t('links.confirmed')}</p>
      {/if}
      <Rocco name="promo-keep-going" width={260} />
      <h1>{$t('welcome.title')}</h1>
      <p>{$t('welcome.text')}</p>
      <p>{$t('welcome.text2')}</p>
      <button class="btn btn-primary" type="button" onclick={() => (step = 2)}>{$t('welcome.start')}</button>
    </div>
  {:else if step === 2}
    <Rocco name="rocco-wave" width={160} />
    <h1 class="center">{$t('onboarding.routinesTitle')}</h1>
    <p class="center">{$t('onboarding.routinesText')}</p>

    {#if hasRoutines === null}
      <div class="actions">
        <button class="btn btn-primary" type="button" onclick={() => (hasRoutines = true)}>{$t('onboarding.yes')}</button>
        <button class="btn btn-secondary" type="button" onclick={() => (step = 3)}>{$t('onboarding.notNow')}</button>
      </div>
    {:else}
      {#if added.length > 0}
        <section class="card">
          <h2>{$t('onboarding.addedSoFar')}</h2>
          <ul class="list">
            {#each added as habit (habit.id)}
              <HabitRow {habit} color={habitColor(habit, $categories)} goalName={goalName(habit)} linked={false} />
            {/each}
          </ul>
        </section>
      {/if}
      <HabitQuickAdd kind="already_mine" onadded={remember} />
      <div class="actions">
        <button class="btn btn-primary" type="button" onclick={() => (step = 3)}>{$t('onboarding.continue')}</button>
        {#if added.length === 0}
          <button class="btn-link" type="button" onclick={() => (step = 3)}>{$t('onboarding.skip')}</button>
        {/if}
      </div>
    {/if}
  {:else}
    <Rocco name="rocco-sprout" width={160} />
    <h1 class="center">{$t('onboarding.goalTitle')}</h1>
    <p class="center">{$t('onboarding.goalText')}</p>
    <p class="center hint">{$t('habits.recommendation', { count: RECOMMENDED_NEW_HABITS })}</p>

    {#if added.length > 0}
      <section class="card">
        <h2>{$t('onboarding.addedSoFar')}</h2>
        <ul class="list">
          {#each added as habit (habit.id)}
            <HabitRow {habit} color={habitColor(habit, $categories)} goalName={goalName(habit)} linked={false} />
          {/each}
        </ul>
      </section>
    {/if}

    {#if manyNew}
      <GentleNote image="rocco-point">
        <p>{$t('essentials.text')}</p>
      </GentleNote>
    {/if}

    <HabitQuickAdd kind="in_progress" onadded={remember} />
    <p class="hint center">{$t('onboarding.habitsLater')}</p>

    <div class="actions">
      <button class="btn btn-primary" type="button" disabled={busy} onclick={start}>{$t('onboarding.done')}</button>
      {#if added.length === 0}
        <button class="btn-link" type="button" disabled={busy} onclick={finish}>{$t('onboarding.later')}</button>
      {/if}
    </div>
  {/if}
</main>

{#if showEssentials}
  <EssentialsPanel onclose={finish} />
{/if}

<style>
  .onboarding {
    padding-bottom: 40px;
  }

  .progress {
    display: flex;
    justify-content: center;
    gap: 6px;
    margin-bottom: 20px;
  }

  .progress span {
    width: 28px;
    height: 6px;
    border-radius: 999px;
    background: var(--color-line);
  }

  /* Progress done = mint (its fixed meaning: completed). */
  .progress span.on {
    background: var(--color-mint);
  }

  .list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .actions {
    display: grid;
    gap: 10px;
    margin-top: 12px;
  }
</style>
