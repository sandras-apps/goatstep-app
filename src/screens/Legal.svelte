<!-- Privacy Policy, Terms and Cookie Policy. The real texts (EN + IT) are written in the legal step. -->
<script>
  import { route } from '../lib/router.js';
  import { t } from '../i18n/index.js';

  const pages = { '/privacy': 'privacy', '/terms': 'terms', '/cookies': 'cookies' };
  let page = $derived(pages[$route] ?? 'privacy');
</script>

<div class="screen">
  <p><button type="button" class="btn-link" onclick={() => history.back()}>← {$t('common.back')}</button></p>
  <h1>{$t(`legal.${page}`)}</h1>
  <p class="notice">{$t('legal.draft')}</p>
</div>
