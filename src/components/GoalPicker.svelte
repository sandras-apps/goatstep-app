<!-- Choose the goal of a habit: one of yours, a suggested one, a new one typed right here, or none.
     The choice is a text value, see lib/goalChoice.js. -->
<script>
  import { categories } from '../lib/api/habits.js';
  import { GOAL_SUGGESTIONS } from '../lib/appearance.js';
  import { t } from '../i18n/index.js';

  let { value = $bindable(''), newName = $bindable('') } = $props();

  const uid = $props.id();

  // Suggestions the user hasn't created yet.
  let ideas = $derived(
    GOAL_SUGGESTIONS.filter((idea) => !$categories.some((goal) => goal.name === $t(`goalSuggestions.${idea.key}`)))
  );
</script>

<div class="field">
  <label for="{uid}-goal">{$t('goalPicker.label')}</label>
  <select id="{uid}-goal" bind:value>
    {#if $categories.length > 0}
      <optgroup label={$t('goalPicker.yours')}>
        {#each $categories as goal (goal.id)}
          <option value="goal:{goal.id}">{goal.name}</option>
        {/each}
      </optgroup>
    {/if}
    {#if ideas.length > 0}
      <optgroup label={$t('goalPicker.ideas')}>
        {#each ideas as idea (idea.key)}
          <option value="idea:{idea.key}">{$t(`goalSuggestions.${idea.key}`)}</option>
        {/each}
      </optgroup>
    {/if}
    <option value="new">{$t('goalPicker.new')}</option>
    <option value="">{$t('goalPicker.none')}</option>
  </select>
</div>

{#if value === 'new'}
  <div class="field">
    <label for="{uid}-new">{$t('goalPicker.newName')}</label>
    <input id="{uid}-new" type="text" maxlength="60" placeholder={$t('goalEditor.namePlaceholder')} bind:value={newName} />
  </div>
{/if}
