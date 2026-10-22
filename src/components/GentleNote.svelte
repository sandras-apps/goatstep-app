<!-- A gentle note with a small Rocco on the side. Used for the soft warnings. -->
<script>
  import Rocco from './Rocco.svelte';

  let { image = 'rocco-checkin', children } = $props();
</script>

<div class="gentle notice" role="status">
  <div class="rocco-side"><Rocco name={image} width={64} /></div>
  <div class="body">
    {@render children()}
  </div>
</div>

<style>
  .gentle {
    display: flex;
    gap: 12px;
    align-items: flex-start;
  }

  .rocco-side :global(.rocco) {
    margin: 0;
    border-radius: 14px;
  }

  .body {
    flex: 1;
    min-width: 0;
  }

  .body :global(p:last-child) {
    margin-bottom: 0;
  }
</style>
