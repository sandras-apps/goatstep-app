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

// Finds which pattern matches the address and reads its values:
//   matchRoute('/habit/42', ['/habit/:id'])          → { pattern: '/habit/:id', params: { id: '42' } }
//   matchRoute('/habit/new?goal=7', ['/habit/new'])  → { pattern: '/habit/new', params: { goal: '7' } }
// Patterns are tried in order, so put '/habit/new' before '/habit/:id'.
export function matchRoute(fullPath, patterns) {
  const [path, queryString = ''] = fullPath.split('?');
  const query = Object.fromEntries(new URLSearchParams(queryString));
  const parts = path.split('/').filter(Boolean);

  for (const pattern of patterns) {
    const patternParts = pattern.split('/').filter(Boolean);
    if (patternParts.length !== parts.length) continue;

    const params = { ...query };
    const matches = patternParts.every((part, index) => {
      if (part.startsWith(':')) {
        params[part.slice(1)] = decodeURIComponent(parts[index]);
        return true;
      }
      return part === parts[index];
    });
    if (matches) return { pattern, params };
  }
  return null;
}
