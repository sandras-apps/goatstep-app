<!-- Bottom menu: Today · Habits · Dreams (soon) · You -->
<script>
  import { route } from '../lib/router.js';
  import { t } from '../i18n/index.js';

  const items = [
    { path: '/today', label: 'nav.today', icon: 'M12 3v2M12 19v2M5 12H3M21 12h-2M6.3 6.3 4.9 4.9M19.1 19.1l-1.4-1.4M6.3 17.7l-1.4 1.4M19.1 4.9l-1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z' },
    { path: '/habits', label: 'nav.habits', icon: 'M9 6h11M9 12h11M9 18h11M4 6l1 1 2-2M4 12l1 1 2-2M4 18l1 1 2-2' },
    { path: '/dreams', label: 'nav.dreams', icon: 'M12 3l2.5 5.5L20 9.3l-4 4 1 5.7-5-2.8-5 2.8 1-5.7-4-4 5.5-.8L12 3Z', soon: true },
    { path: '/you', label: 'nav.you', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0' }
  ];
</script>

<nav aria-label={$t('nav.label')}>
  {#each items as item}
    <a href="#{item.path}" aria-current={$route === item.path ? 'page' : undefined} class:soon={item.soon}>
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={item.icon} />
      </svg>
      <span>{$t(item.label)}</span>
      {#if item.soon}
        <small>{$t('nav.soon')}</small>
      {/if}
    </a>
  {/each}
</nav>

<style>
  nav {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    justify-content: space-around;
    height: calc(var(--nav-height) + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background: var(--color-surface);
    border-top: 1px solid var(--color-line);
  }

  a {
    position: relative;
    flex: 1;
    max-width: 120px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    font-size: 0.8rem;
    font-weight: 600;
    text-decoration: none;
    color: var(--color-ink-soft);
  }

  a[aria-current='page'] {
    color: var(--color-ink);
  }

  a[aria-current='page'] svg {
    stroke-width: 2.4;
  }

  svg {
    width: 26px;
    height: 26px;
    fill: none;
    stroke: currentColor;
    stroke-width: 1.8;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  small {
    position: absolute;
    top: 6px;
    right: 12%;
    font-size: 0.62rem;
    padding: 1px 6px;
    border-radius: 999px;
    background: var(--color-bg);
    color: var(--color-ink-soft);
  }
</style>
