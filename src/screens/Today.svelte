<!-- Placeholder: the real Today screen comes in step 3. -->
<script>
  import Rocco from '../components/Rocco.svelte';
  import { t } from '../i18n/index.js';

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'today.morning' : hour < 18 ? 'today.afternoon' : 'today.evening';
</script>

<div class="screen">
  <h1>{$t(greeting)}</h1>
  <div class="card center">
    <Rocco name="rocco-point" width={180} />
    <p>{$t('today.placeholder')}</p>
  </div>
</div>
