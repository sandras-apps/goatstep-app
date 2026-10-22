<!-- Shown after opening the "reset password" link from the email. -->
<script>
  import AuthLayout from '../components/AuthLayout.svelte';
  import { setNewPassword } from '../lib/auth.js';
  import { isPasswordStrong } from '../lib/config.js';
  import { authErrorKey } from '../lib/errors.js';
  import { go } from '../lib/router.js';
  import { t } from '../i18n/index.js';

  let password = $state('');
  let repeated = $state('');
  let busy = $state(false);
  let errorKey = $state(null);

  async function submit(event) {
    event.preventDefault();
    errorKey = null;
    if (password !== repeated) {
      errorKey = 'reset.mismatch';
      return;
    }
    if (!isPasswordStrong(password)) {
      errorKey = 'errors.weakPassword';
      return;
    }
    busy = true;
    const { error } = await setNewPassword(password);
    busy = false;
    if (error) errorKey = authErrorKey(error);
    else go('/today');
  }
</script>

<AuthLayout image="rocco-base" title={$t('reset.title')}>
  <form onsubmit={submit}>
    <div class="field">
      <label for="password">{$t('reset.newPassword')}</label>
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
      <label for="repeated">{$t('reset.confirmPassword')}</label>
      <input id="repeated" type="password" autocomplete="new-password" required bind:value={repeated} />
    </div>
    {#if errorKey}
      <p class="error" role="alert">{$t(errorKey)}</p>
    {/if}
    <button class="btn btn-primary" type="submit" disabled={busy}>{$t('reset.submit')}</button>
  </form>
</AuthLayout>
