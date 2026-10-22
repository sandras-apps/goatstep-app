<script>
  import Rocco from '../components/Rocco.svelte';
  import { t } from '../i18n/index.js';
</script>

<div class="screen">
  <h1>{$t('dreams.title')}</h1>
  <div class="card center">
    <Rocco name="rocco-sleep" width={180} />
    <p>{$t('dreams.text')}</p>
  </div>
</div>
