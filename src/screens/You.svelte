<!-- Account: language, export my data, log out, delete my account. -->
<script>
  import { session, profile, updateProfile, logOut } from '../lib/auth.js';
  import { exportMyData, deleteMyAccount } from '../lib/api/account.js';
  import { go } from '../lib/router.js';
  import { t, locale, languages } from '../i18n/index.js';

  let exporting = $state(false);
  let errorKey = $state(null);

  let showDelete = $state(false);
  let understood = $state(false);
  let deleting = $state(false);

  async function changeLanguage(event) {
    const language = event.target.value;
    locale.set(language);
    try {
      await updateProfile({ language });
    } catch {
      errorKey = 'errors.generic';
    }
  }

  async function runExport() {
    exporting = true;
    errorKey = null;
    try {
      await exportMyData();
    } catch {
      errorKey = 'errors.exportFailed';
    }
    exporting = false;
  }

  async function runLogout() {
    await logOut();
    go('/login');
  }

  async function runDelete() {
    deleting = true;
    errorKey = null;
    try {
      await deleteMyAccount();
      go('/signup');
    } catch {
      errorKey = 'errors.deleteFailed';
      deleting = false;
    }
  }
</script>

<div class="screen">
  <h1>{$t('you.title')}</h1>

  {#if errorKey}
    <p class="error" role="alert">{$t(errorKey)}</p>
  {/if}

  <section class="card">
    <h2>{$t('you.account')}</h2>
    <p class="email">{$session?.user.email}</p>
    <div class="field">
      <label for="language">{$t('you.language')}</label>
      <select id="language" value={$profile?.language ?? $locale} onchange={changeLanguage}>
        {#each languages as language}
          <option value={language.code}>{language.name}</option>
        {/each}
      </select>
    </div>
    <button class="btn btn-secondary" type="button" onclick={runLogout}>{$t('you.logout')}</button>
  </section>

  <section class="card">
    <h2>{$t('you.data')}</h2>
    <p>{$t('you.exportText')}</p>
    <button class="btn btn-secondary" type="button" onclick={runExport} disabled={exporting}>
      {exporting ? $t('you.exporting') : $t('you.export')}
    </button>
  </section>

  <section class="card">
    <h2>{$t('you.legal')}</h2>
    <p><a href="#/privacy">{$t('legal.privacy')}</a></p>
    <p><a href="#/terms">{$t('legal.terms')}</a></p>
    <p><a href="#/cookies">{$t('legal.cookies')}</a></p>
  </section>

  <section class="card">
    <h2>{$t('you.deleteTitle')}</h2>
    <p>{$t('you.deleteText')}</p>
    {#if !showDelete}
      <button class="btn-link" type="button" onclick={() => (showDelete = true)}>{$t('you.deleteStart')}</button>
    {:else}
      <div class="field">
        <label class="checkbox">
          <input type="checkbox" bind:checked={understood} />
          <span>{$t('you.deleteCheckbox')}</span>
        </label>
      </div>
      <div class="actions">
        <button class="btn btn-danger" type="button" onclick={runDelete} disabled={!understood || deleting}>
          {deleting ? $t('you.deleting') : $t('you.deleteConfirm')}
        </button>
        <button class="btn btn-secondary" type="button" onclick={() => ((showDelete = false), (understood = false))}>
          {$t('you.deleteCancel')}
        </button>
      </div>
    {/if}
  </section>
</div>

<style>
  .email {
    color: var(--color-ink-soft);
    word-break: break-all;
  }

  .actions {
    display: grid;
    gap: 10px;
  }

  /* Not coral: coral is for positive main actions only. */
  .btn-danger {
    background: var(--color-ink);
    color: var(--color-surface);
    font-size: 1rem;
  }
</style>
