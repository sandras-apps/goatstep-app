// App-wide settings that are not secrets.

// Bump this when the Privacy Policy or Terms change, so we know what each user accepted.
export const TERMS_VERSION = '2026-10-draft';

export const PASSWORD_MIN_LENGTH = 8;

// Where email links (confirm, reset password) should bring people back to:
// http://localhost:5173/ while developing, the GitHub Pages address once published.
export function appUrl() {
  return window.location.origin + window.location.pathname;
}

// The symbols Supabase counts as "symbols" (letters like à or € don't count).
const PASSWORD_SYMBOLS = "!@#$%^&*()_+-=[]{};'\\:\"|<>?,./`~";

// Same rules as Supabase → Authentication → Password settings
// ("Lowercase, uppercase letters, digits and symbols", minimum 8).
// Each key has a text in en.json / it.json under "password".
export const PASSWORD_RULES = [
  { key: 'length', test: (password) => password.length >= PASSWORD_MIN_LENGTH },
  { key: 'lowercase', test: (password) => /[a-z]/.test(password) },
  { key: 'uppercase', test: (password) => /[A-Z]/.test(password) },
  { key: 'digit', test: (password) => /[0-9]/.test(password) },
  { key: 'symbol', test: (password) => [...password].some((char) => PASSWORD_SYMBOLS.includes(char)) }
];

export function isPasswordStrong(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
