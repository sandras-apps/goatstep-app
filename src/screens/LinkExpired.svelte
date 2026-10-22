<!-- Shown when someone opens an old or already-used email link, logged in or not:
     we say so instead of silently letting them into the app. -->
<script>
  import Rocco from '../components/Rocco.svelte';
  import { linkResult, session } from '../lib/auth.js';
  import { go } from '../lib/router.js';
  import { t } from '../i18n/index.js';

  function askForNewLink() {
    linkResult.set(null);
    go('/forgot');
  }

  function leave() {
    linkResult.set(null);
    go($session ? '/today' : '/login');
  }
</script>

<main class="screen center">
  <Rocco name="rocco-tired" width={200} />
  <h1>{$t('links.expiredTitle')}</h1>
  <p>{$t('links.expired')}</p>
  <div class="actions">
    <button class="btn btn-primary" type="button" onclick={askForNewLink}>{$t('links.newLink')}</button>
    <button class="btn btn-secondary" type="button" onclick={leave}>
      {$session ? $t('links.backToAccount') : $t('links.goToLogin')}
    </button>
  </div>
</main>

<style>
  .actions {
    display: grid;
    gap: 10px;
  }
</style>
