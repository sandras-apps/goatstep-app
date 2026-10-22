<!-- A switch between two options (e.g. Essential / Bonus).
     Tapping the option that's already selected flips to the other one.
     options: [{ value, label, hint? }, { value, label, hint? }] -->
<script>
  let { value = $bindable(), options, label, onchange, showHint = true, small = false } = $props();

  let selected = $derived(options.find((option) => option.value === value));

  function tap(option) {
    const next = option.value === value ? options.find((other) => other.value !== value).value : option.value;
    value = next;
    onchange?.(next);
  }
</script>

<div class="switch-field">
  <div class="switch" class:small role="group" aria-label={label}>
    {#each options as option (option.value)}
      <button type="button" aria-pressed={option.value === value} onclick={() => tap(option)}>{option.label}</button>
    {/each}
  </div>
  {#if showHint && selected?.hint}
    <p class="hint">{selected.hint}</p>
  {/if}
</div>

<style>
  .switch {
    display: inline-flex;
    border: 1.5px solid var(--color-line);
    border-radius: 999px;
    padding: 3px;
    background: var(--color-surface);
    max-width: 100%;
  }

  button {
    border: none;
    background: none;
    font: inherit;
    font-weight: 600;
    color: var(--color-ink-soft);
    padding: 8px 16px;
    border-radius: 999px;
    cursor: pointer;
    min-height: 40px;
  }

  .small button {
    font-size: 0.875rem;
    padding: 5px 12px;
    min-height: 32px;
  }

  button[aria-pressed='true'] {
    background: var(--color-ink);
    color: var(--color-surface);
  }

  .hint {
    margin-top: 6px;
  }
</style>
