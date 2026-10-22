<!-- Shown after adding a 4th recent new essential habit. Never blocks: it suggests
     choosing which habits are essential, and can always be closed. -->
<script>
  import Rocco from './Rocco.svelte';
  import Icon from './Icon.svelte';
  import TwoOptionSwitch from './TwoOptionSwitch.svelte';
  import { categories, habits, setPriority } from '../lib/api/habits.js';
  import { habitColor } from '../lib/appearance.js';
  import { recentNewHabits } from '../lib/recommendations.js';
  import { t } from '../i18n/index.js';

  let { onclose } = $props();

  let dialog;
  let errorKey = $state(null);

  // The list is fixed when the panel opens, so rows don't jump around while switching.
  const ids = recentNewHabits($habits).map((habit) => habit.id);
  let listed = $derived(ids.map((id) => $habits.find((habit) => habit.id === id)).filter(Boolean));

  $effect(() => {
    dialog.showModal();
  });

  async function choose(habit, priority) {
    errorKey = null;
    try {
      await setPriority(habit.id, priority);
    } catch {
      errorKey = 'errors.generic';
    }
  }
</script>

<dialog bind:this={dialog} onclose={onclose} aria-labelledby="essentials-title">
  <div class="intro">
    <Rocco name="rocco-checkin" width={84} />
    <div>
      <h2 id="essentials-title">{$t('essentials.title')}</h2>
      <p>{$t('essentials.text')}</p>
    </div>
  </div>

  <ul>
    {#each listed as habit (habit.id)}
      <li>
        <span class="name"><Icon name={habit.icon} color={habitColor(habit, $categories)} size={20} /> {habit.name}</span>
        <TwoOptionSwitch
          value={habit.priority}
          label={habit.name}
          small
          showHint={false}
          options={[
            { value: 'essential', label: $t('priority.essential') },
            { value: 'bonus', label: $t('priority.bonus') }
          ]}
          onchange={(priority) => choose(habit, priority)}
        />
      </li>
    {/each}
  </ul>

  {#if errorKey}
    <p class="error" role="alert">{$t(errorKey)}</p>
  {/if}

  <button class="btn btn-primary" type="button" onclick={() => dialog.close()}>{$t('essentials.done')}</button>
</dialog>

<style>
  dialog {
    width: min(440px, calc(100vw - 32px));
    max-height: calc(100vh - 32px);
    border: none;
    border-radius: var(--radius);
    padding: 20px;
    color: var(--color-ink);
    background: var(--color-surface);
  }

  dialog::backdrop {
    background: rgba(43, 58, 103, 0.35);
  }

  .intro {
    display: flex;
    gap: 14px;
    align-items: flex-start;
    margin-bottom: 8px;
  }

  .intro :global(.rocco) {
    margin: 0;
    border-radius: 16px;
    flex-shrink: 0;
  }

  h2 {
    font-size: 1.2rem;
    margin-bottom: 6px;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0 0 var(--space);
  }

  li {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    padding: 10px 0;
    border-top: 1px solid var(--color-line);
  }

  .name {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
  }
</style>
