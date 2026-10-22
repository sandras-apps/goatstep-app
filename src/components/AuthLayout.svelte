<!-- Shared frame for the screens you see before logging in. -->
<script>
  import Rocco from './Rocco.svelte';
  import { isConfigured } from '../lib/supabase.js';
  import { t } from '../i18n/index.js';

  let { image, title, subtitle = '', children } = $props();
</script>

<main class="screen auth">
  <Rocco name={image} width={220} />
  <h1 class="center">{title}</h1>
  {#if subtitle}
    <p class="center subtitle">{subtitle}</p>
  {/if}

  {#if !isConfigured}
    <p class="notice" role="status">{$t('setup.notConfigured')}</p>
  {/if}

  <div class="card">
    {@render children()}
  </div>
</main>

<style>
  .auth {
    padding-bottom: 40px;
  }

  .auth :global(.rocco) {
    margin-bottom: 16px;
  }

  .subtitle {
    color: var(--color-ink-soft);
  }
</style>
