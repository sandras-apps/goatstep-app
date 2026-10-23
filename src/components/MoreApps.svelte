<!-- "Enjoying it?" share button and "More apps by Sandra", at the bottom of the You screen.
     The share button opens the phone's own share menu: the app sends nothing, the person chooses.
     Where there is no share menu (most computers), the message and link are copied. -->
<script>
  import { t, locale } from '../i18n/index.js';

  const APP_URL = 'https://sandras-apps.github.io/goatstep-app/';

  // The same list lives in every one of Sandra's apps. Only apps with live: true
  // are shown: flip the flag when an app is out for everyone.
  // "Free, no account" is written only where it is true of that app.
  const OTHER_APPS = [
    {
      id: 'inward', name: 'Inward', url: 'https://sandras-apps.github.io/inward-app/', live: true,
      it: 'Una domanda profonda al giorno, da scrivere sul tuo diario di carta. Gratis, senza account.',
      en: 'One deep question a day, to answer in your own paper journal. Free, no account.'
    },
    {
      id: 'quota', name: 'Quota', url: 'https://sandras-apps.github.io/quota-app/', live: false,
      it: 'Ti dice quanto puoi spendere oggi; se un giorno risparmi, il giorno dopo hai di più. Gratis, senza account.',
      en: 'Tells you how much you can spend today; save a little and tomorrow you have more. Free, no account.'
    },
    {
      id: 'easy-recipes', name: 'Easy Recipes', url: 'https://sandras-apps.github.io/easy-recipes/', live: true,
      it: 'Ricette semplici con le dosi dentro ogni passaggio e i timer già pronti. Gratis, senza account.',
      en: 'Simple recipes with the amounts inside every step and timers ready to go. Free, no account.'
    },
    { id: 'goatstep', name: 'Goatstep', url: APP_URL, live: false, it: '', en: '' },
    { id: 'moontick', name: 'MoonTick', url: 'https://getmoontick.com/', live: false, it: '', en: '' }
  ];

  const apps = OTHER_APPS.filter((app) => app.live && app.id !== 'goatstep');

  let message = $state('');

  async function share() {
    message = '';
    const text = $t('more.shareMessage');
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Goatstep', text, url: APP_URL });
      } catch {
        // Closing the share menu is fine: nothing to say.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text} ${APP_URL}`);
      message = $t('more.copied');
    } catch {
      message = `${$t('more.copyFailed')} ${APP_URL}`;
    }
  }
</script>

<section class="card">
  <h2>{$t('more.shareTitle')}</h2>
  <p>{$t('more.shareText')}</p>
  <button class="btn btn-secondary" type="button" onclick={share}>{$t('more.shareButton')}</button>
  {#if message}
    <p class="note" role="status">{message}</p>
  {/if}
</section>

{#if apps.length}
  <section class="card">
    <h2>{$t('more.title')}</h2>
    <p>{$t('more.text')}</p>
    <ul class="apps">
      {#each apps as app (app.id)}
        <li>
          <a href={app.url} target="_blank" rel="noopener">{app.name}</a>
          <span>{app[$locale] || app.en}</span>
        </li>
      {/each}
    </ul>
  </section>
{/if}

<style>
  .apps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .apps li {
    display: flex;
    flex-direction: column;
    gap: 0.15rem;
  }

  .apps a {
    font-weight: 600;
  }

  .apps span,
  .note {
    color: var(--color-ink-soft);
    margin: 0;
  }
</style>
