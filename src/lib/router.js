// Tiny router: the screen is chosen by the part of the address after "#",
// e.g. https://…/goatstep-app/#/today → "/today".
// Using "#" means GitHub Pages never shows a 404 when the page is refreshed.

import { readable } from 'svelte/store';

function currentPath() {
  return window.location.hash.replace(/^#/, '') || '/';
}

export const route = readable(currentPath(), (set) => {
  const update = () => set(currentPath());
  window.addEventListener('hashchange', update);
  return () => window.removeEventListener('hashchange', update);
});

export function go(path) {
  window.location.hash = path;
}
