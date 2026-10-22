<!-- One habit in a list: icon in its goal's colour, name, how often, labels.
     Essential habits get a subtle accent (tinted icon tile, bolder name).
     "Already mine" is only a small label: those habits are never shown as lesser.
     Tapping the row opens the editor (unless linked = false). -->
<script>
  import Icon from './Icon.svelte';
  import { frequencyLabel } from '../lib/schedule.js';
  import { t, locale } from '../i18n/index.js';

  let { habit, color, goalName = '', linked = true, children } = $props();

  let essential = $derived(habit.priority === 'essential');
</script>

<li class="row" class:essential style="--accent: {color}">
  <svelte:element this={linked ? 'a' : 'div'} class="main" href={linked ? `#/habit/${habit.id}` : undefined}>
    <span class="badge-icon"><Icon name={habit.icon} {color} /></span>
    <span class="text">
      <span class="name">{habit.name}</span>
      <span class="details">
        {#if goalName}{goalName} ·&nbsp;{/if}{frequencyLabel(habit, $t, $locale)}{#if habit.minutes}&nbsp;· {$t('habitRow.minutes', { count: habit.minutes })}{/if}
      </span>
    </span>
    <span class="tags">
      {#if habit.kind === 'already_mine'}
        <span class="tag">{$t('habitRow.mine')}</span>
      {/if}
      {#if !essential}
        <span class="tag">{$t('habitRow.bonus')}</span>
      {/if}
    </span>
  </svelte:element>
  {@render children?.()}
</li>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 8px;
    border-top: 1px solid var(--color-line);
  }

  .row:first-child {
    border-top: none;
  }

  .main {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 0;
    text-decoration: none;
    color: inherit;
    font-weight: 500;
    min-width: 0;
  }

  .badge-icon {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border-radius: 12px;
    border: 1.5px solid color-mix(in srgb, var(--accent) 25%, transparent);
    background: var(--color-surface);
  }

  /* The subtle accent for essential habits. */
  .essential .badge-icon {
    border-color: transparent;
    background: color-mix(in srgb, var(--accent) 16%, var(--color-surface));
  }

  .text {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }

  .name {
    font-weight: 600;
    overflow-wrap: anywhere;
  }

  .essential .name {
    font-weight: 700;
  }

  .details {
    font-size: 0.875rem;
    color: var(--color-ink-soft);
  }

  .tags {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 4px;
  }

  .tag {
    font-size: 0.75rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 999px;
    border: 1px solid var(--color-line);
    color: var(--color-ink-soft);
    white-space: nowrap;
  }
</style>
