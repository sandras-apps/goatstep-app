<!-- Shows one of the Rocco images from public/rocco/ (made by `npm run images`).
     name = file name without extension, e.g. "rocco-wave" or "promo-focus-today". -->
<script>
  let { name, width = 180, alt = '' } = $props();

  let src = $derived(`${import.meta.env.BASE_URL}rocco/${name}.webp`);
</script>

<img {src} {alt} {width} class="rocco" />

<style>
  .rocco {
    display: block;
    height: auto;
    margin: 0 auto;
    /* Softens the square edge until transparent images arrive. */
    border-radius: 24px;
  }
</style>
