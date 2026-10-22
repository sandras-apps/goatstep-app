<script>
  import AuthLayout from '../components/AuthLayout.svelte';
  import { sendPasswordReset } from '../lib/auth.js';
  import { isConfigured } from '../lib/supabase.js';
  import { authErrorKey } from '../lib/errors.js';
  import { t } from '../i18n/index.js';

  let email = $state('');
  let busy = $state(false);
  let errorKey = $state(null);
  let sent = $state(false);

  async function submit(event) {
    event.preventDefault();
    busy = true;
    errorKey = null;
    const { error } = await sendPasswordReset(email);
    busy = false;
    // Same message whether the account exists or not, so nobody can test which emails are registered.
    if (error) errorKey = authErrorKey(error);
    else sent = true;
  }
</script>

<AuthLayout image="rocco-point" title={$t('forgot.title')}>
  {#if sent}
    <p class="notice" role="status">{$t('forgot.sent')}</p>
  {:else}
    <p>{$t('forgot.text')}</p>
    <form onsubmit={submit}>
      <div class="field">
        <label for="email">{$t('common.email')}</label>
        <input id="email" type="email" autocomplete="email" required bind:value={email} />
      </div>
      {#if errorKey}
        <p class="error" role="alert">{$t(errorKey)}</p>
      {/if}
      <button class="btn btn-primary" type="submit" disabled={busy || !isConfigured}>{$t('forgot.submit')}</button>
    </form>
  {/if}
  <p class="center back"><a href="#/login">{$t('forgot.backToLogin')}</a></p>
</AuthLayout>

<style>
  .back {
    margin-top: 20px;
  }
</style>
