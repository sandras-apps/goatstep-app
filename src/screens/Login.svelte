<script>
  import AuthLayout from '../components/AuthLayout.svelte';
  import { logIn, resendConfirmation, linkResult } from '../lib/auth.js';
  import { isConfigured } from '../lib/supabase.js';
  import { authErrorKey } from '../lib/errors.js';
  import { go } from '../lib/router.js';
  import { t } from '../i18n/index.js';

  let email = $state('');
  let password = $state('');
  let busy = $state(false);
  let errorKey = $state(null);
  let resent = $state(false);

  async function submit(event) {
    event.preventDefault();
    busy = true;
    errorKey = null;
    const { error } = await logIn({ email, password });
    busy = false;
    if (error) errorKey = authErrorKey(error);
    else go('/today');
  }

  async function resend() {
    const { error } = await resendConfirmation(email);
    if (error) errorKey = authErrorKey(error);
    else resent = true;
  }
</script>

<AuthLayout image="promo-focus-today" title={$t('login.title')} subtitle={$t('login.subtitle')}>
  {#if $linkResult === 'confirmed'}
    <p class="notice" role="status">{$t('links.confirmed')}</p>
  {:else if $linkResult === 'expired'}
    <p class="notice" role="status">{$t('links.expired')}</p>
  {/if}

  <form onsubmit={submit}>
    <div class="field">
      <label for="email">{$t('common.email')}</label>
      <input id="email" type="email" autocomplete="email" required bind:value={email} />
    </div>
    <div class="field">
      <label for="password">{$t('common.password')}</label>
      <input id="password" type="password" autocomplete="current-password" required bind:value={password} />
    </div>

    {#if errorKey}
      <p class="error" role="alert">{$t(errorKey)}</p>
      {#if errorKey === 'errors.emailNotConfirmed'}
        {#if resent}
          <p class="notice" role="status">{$t('login.resent')}</p>
        {:else}
          <p><button type="button" class="btn-link" onclick={resend}>{$t('login.resend')}</button></p>
        {/if}
      {/if}
    {/if}

    <button class="btn btn-primary" type="submit" disabled={busy || !isConfigured}>{$t('login.submit')}</button>
  </form>

  <p class="center links">
    <a href="#/forgot">{$t('login.forgot')}</a>
  </p>
  <p class="center">
    {$t('login.noAccount')} <a href="#/signup">{$t('login.signupLink')}</a>
  </p>
</AuthLayout>

<style>
  .links {
    margin-top: 20px;
  }
</style>
