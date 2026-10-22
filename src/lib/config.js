// App-wide settings that are not secrets.

// Bump this when the Privacy Policy or Terms change, so we know what each user accepted.
export const TERMS_VERSION = '2026-10-draft';

export const PASSWORD_MIN_LENGTH = 8;

// Where email links (confirm, reset password) should bring people back to:
// http://localhost:5173/ while developing, the GitHub Pages address once published.
export function appUrl() {
  return window.location.origin + window.location.pathname;
}

// At least 8 characters, with at least one letter and one number.
// Supabase checks the same rule on the server (see README.md).
export function isPasswordStrong(password) {
  return password.length >= PASSWORD_MIN_LENGTH && /[a-zA-Z]/.test(password) && /\d/.test(password);
}
