<!-- First screen after the first login. The onboarding questions are added in step 2. -->
<script>
  import Rocco from '../components/Rocco.svelte';
  import { updateProfile } from '../lib/auth.js';
  import { go } from '../lib/router.js';
  import { t } from '../i18n/index.js';

  let busy = $state(false);
  let failed = $state(false);

  async function start() {
    busy = true;
    try {
      await updateProfile({ onboarding_done: true });
      go('/today');
    } catch {
      failed = true;
      busy = false;
    }
  }
</script>

<main class="screen center welcome">
  <Rocco name="promo-keep-going" width={260} />
  <h1>{$t('welcome.title')}</h1>
  <p>{$t('welcome.text')}</p>
  <p>{$t('welcome.text2')}</p>
  {#if failed}
    <p class="error" role="alert">{$t('errors.generic')}</p>
  {/if}
  <button class="btn btn-primary" type="button" onclick={start} disabled={busy}>{$t('welcome.start')}</button>
</main>

<style>
  .welcome {
    padding-bottom: 40px;
  }

  .welcome :global(.rocco) {
    margin-bottom: 20px;
  }

  .btn {
    margin-top: 12px;
  }
</style>
