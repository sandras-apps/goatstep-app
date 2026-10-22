<!-- Choose an icon, and for goals also a colour (habits use their goal's colour). -->
<script>
  import Icon from './Icon.svelte';
  import { ICONS, COLORS } from '../lib/appearance.js';
  import { t } from '../i18n/index.js';

  let { icon = $bindable(), color = $bindable(), chooseColor = true } = $props();

  const uid = $props.id();
</script>

{#if chooseColor}
  <fieldset class="group">
    <legend>{$t('appearance.color')}</legend>
    <div class="colors">
      {#each COLORS as option}
        <label class="color" style="--swatch: {option.value}" title={$t(`colors.${option.key}`)}>
          <input type="radio" name="{uid}-color" value={option.value} bind:group={color} />
          <span class="visually-hidden">{$t(`colors.${option.key}`)}</span>
        </label>
      {/each}
    </div>
  </fieldset>
{/if}

<fieldset class="group">
  <legend>{$t('appearance.icon')}</legend>
  <div class="icons">
    {#each Object.keys(ICONS) as name}
      <label class="icon">
        <input type="radio" name="{uid}-icon" value={name} bind:group={icon} />
        <span class="visually-hidden">{name}</span>
        <Icon {name} color={icon === name ? 'var(--color-surface)' : color} size={22} />
      </label>
    {/each}
  </div>
</fieldset>

<style>
  .group {
    border: none;
    padding: 0;
    margin: 0 0 var(--space);
  }

  legend {
    font-weight: 600;
    margin-bottom: 8px;
    padding: 0;
  }

  .colors {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .color {
    position: relative;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: var(--swatch);
    cursor: pointer;
    margin: 0;
  }

  .color:has(input:checked) {
    box-shadow: 0 0 0 3px var(--color-surface), 0 0 0 5px var(--color-ink);
  }

  .icons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(44px, 1fr));
    gap: 6px;
  }

  .icon {
    display: grid;
    place-items: center;
    height: 44px;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--color-line);
    cursor: pointer;
    margin: 0;
  }

  .icon:has(input:checked) {
    background: var(--color-ink);
    border-color: var(--color-ink);
  }

  /* Hide the real radio buttons but keep them usable with the keyboard. */
  input[type='radio'] {
    position: absolute;
    opacity: 0;
    width: 1px;
    height: 1px;
  }

  label:has(input:focus-visible) {
    outline: 3px solid var(--color-ink);
    outline-offset: 2px;
  }
</style>
