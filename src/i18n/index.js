// Tiny translation helper.
// All visible texts live in en.json / it.json. To add Spanish later:
// create es.json with the same keys and add it to `dictionaries` and `languages`.
//
// In a component:  {$t('login.title')}   or with values:  {$t('today.hello', { name })}

import { writable, derived } from 'svelte/store';
import en from './en.json';
import it from './it.json';

const dictionaries = { en, it };
const STORAGE_KEY = 'goatstep.locale';

export const languages = [
  { code: 'en', name: 'English' },
  { code: 'it', name: 'Italiano' }
];

function startingLocale() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved in dictionaries) return saved;
  } catch {
    // Storage can be blocked (private mode): fall back to the browser language.
  }
  return navigator.language?.startsWith('it') ? 'it' : 'en';
}

export const locale = writable(startingLocale());

locale.subscribe((code) => {
  document.documentElement.lang = code;
  try {
    localStorage.setItem(STORAGE_KEY, code);
  } catch {
    // Not important if it can't be remembered.
  }
});

// Finds "login.title" inside { login: { title: "..." } }
function lookup(dictionary, key) {
  return key.split('.').reduce((node, part) => node?.[part], dictionary);
}

export const t = derived(locale, (code) => (key, values = {}) => {
  const text = lookup(dictionaries[code], key) ?? lookup(dictionaries.en, key) ?? key;
  return text.replace(/\{(\w+)\}/g, (match, name) => values[name] ?? match);
});
