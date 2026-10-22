<!-- Placeholder: categories and habits come in step 2. -->
<script>
  import Rocco from '../components/Rocco.svelte';
  import { t } from '../i18n/index.js';
</script>

<div class="screen">
  <h1>{$t('habits.title')}</h1>
  <div class="card center">
    <Rocco name="rocco-sprout" width={180} />
    <p>{$t('habits.placeholder')}</p>
  </div>
</div>
