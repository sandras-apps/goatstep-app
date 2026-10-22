<!-- The password rules, shown before typing. Each rule gets a tick as soon as it's met. -->
<script>
  import { PASSWORD_RULES } from '../lib/config.js';
  import { t } from '../i18n/index.js';

  let { password, id } = $props();
</script>

<div {id} class="rules">
  <p>{$t('password.intro')}</p>
  <ul>
    {#each PASSWORD_RULES as rule}
      {@const met = rule.test(password)}
      <li class:met>
        <span class="mark" aria-hidden="true">
          {#if met}
            <svg viewBox="0 0 16 16"><path d="M3.5 8.5l3 3 6-7" /></svg>
          {/if}
        </span>
        <span>{$t(`password.${rule.key}`)}</span>
        <span class="visually-hidden">{met ? $t('password.met') : $t('password.notMet')}</span>
      </li>
    {/each}
  </ul>
</div>

<style>
  .rules {
    font-size: 0.875rem;
    color: var(--color-ink-soft);
    margin-top: 8px;
  }

  p {
    margin: 0 0 4px;
  }

  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    gap: 4px;
  }

  li {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  li.met {
    color: var(--color-ink);
  }

  .mark {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    border-radius: 50%;
    border: 1.5px solid var(--color-line);
    display: grid;
    place-items: center;
  }

  /* Mint = completed, with a night-blue tick for contrast. */
  li.met .mark {
    background: var(--color-mint);
    border-color: var(--color-mint);
  }

  svg {
    width: 12px;
    height: 12px;
    fill: none;
    stroke: var(--color-ink);
    stroke-width: 2.4;
    stroke-linecap: round;
    stroke-linejoin: round;
  }
</style>
