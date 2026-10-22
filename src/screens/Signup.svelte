<script>
  import AuthLayout from '../components/AuthLayout.svelte';
  import { signUp, resendConfirmation } from '../lib/auth.js';
  import { isConfigured } from '../lib/supabase.js';
  import { isPasswordStrong } from '../lib/config.js';
  import { authErrorKey } from '../lib/errors.js';
  import { t } from '../i18n/index.js';

  let email = $state('');
  let password = $state('');
  let accepted = $state(false); // never pre-ticked (GDPR)
  let busy = $state(false);
  let errorKey = $state(null);
  let sent = $state(false);
  let resent = $state(false);

  async function submit(event) {
    event.preventDefault();
    errorKey = null;
    if (!isPasswordStrong(password)) {
      errorKey = 'errors.weakPassword';
      return;
    }
    busy = true;
    const { error } = await signUp({ email, password });
    busy = false;
    // If email confirmation is off in Supabase, the user is logged in straight away
    // and App.svelte moves on by itself.
    if (error) errorKey = authErrorKey(error);
    else sent = true;
  }

  async function resend() {
    const { error } = await resendConfirmation(email);
    if (error) errorKey = authErrorKey(error);
    else resent = true;
  }
</script>

{#if sent}
  <AuthLayout image="rocco-point" title={$t('signup.checkTitle')}>
    <p>{$t('signup.checkText', { email })}</p>
    <p class="hint">{$t('signup.checkSpam')}</p>
    {#if errorKey}
      <p class="error" role="alert">{$t(errorKey)}</p>
    {/if}
    {#if resent}
      <p class="notice" role="status">{$t('signup.resent')}</p>
    {:else}
      <button class="btn btn-secondary" type="button" onclick={resend}>{$t('signup.resend')}</button>
    {/if}
    <p class="center back"><a href="#/login">{$t('forgot.backToLogin')}</a></p>
  </AuthLayout>
{:else}
  <AuthLayout image="rocco-wave" title={$t('signup.title')} subtitle={$t('signup.subtitle')}>
    <form onsubmit={submit}>
      <div class="field">
        <label for="email">{$t('common.email')}</label>
        <input id="email" type="email" autocomplete="email" required bind:value={email} />
      </div>
      <div class="field">
        <label for="password">{$t('common.password')}</label>
        <input
          id="password"
          type="password"
          autocomplete="new-password"
          required
          aria-describedby="password-hint"
          bind:value={password}
        />
        <p class="hint" id="password-hint">{$t('signup.passwordHint')}</p>
      </div>
      <div class="field">
        <label class="checkbox">
          <input type="checkbox" required bind:checked={accepted} />
          <span>
            {$t('signup.acceptBefore')}
            <a href="#/privacy" target="_blank">{$t('signup.privacyLink')}</a>
            {$t('signup.and')}
            <a href="#/terms" target="_blank">{$t('signup.termsLink')}</a>
          </span>
        </label>
      </div>

      {#if errorKey}
        <p class="error" role="alert">{$t(errorKey)}</p>
      {/if}

      <button class="btn btn-primary" type="submit" disabled={busy || !accepted || !isConfigured}>
        {$t('signup.submit')}
      </button>
    </form>

    <p class="center back">
      {$t('signup.haveAccount')} <a href="#/login">{$t('signup.loginLink')}</a>
    </p>
  </AuthLayout>
{/if}

<style>
  .back {
    margin-top: 20px;
  }
</style>
