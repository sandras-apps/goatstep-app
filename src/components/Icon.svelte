<!-- Draws a goal or habit icon by its name (see lib/appearance.js). -->
<script>
  import { ICONS } from '../lib/appearance.js';

  let { name, color = 'currentColor', size = 22 } = $props();

  let Component = $derived(ICONS[name] ?? ICONS.sparkles);
</script>

<Component {size} {color} strokeWidth={2} aria-hidden="true" />
