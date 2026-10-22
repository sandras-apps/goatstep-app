// Who is logged in, and their profile row.
//
// session: undefined = still checking, null = logged out, object = logged in
// profile: undefined = loading, null = not found, object = the profiles row

import { writable, get } from 'svelte/store';
import { supabase, isConfigured } from './supabase.js';
import { appUrl, TERMS_VERSION } from './config.js';
import { go } from './router.js';
import { locale } from '../i18n/index.js';

export const session = writable(undefined);
export const profile = writable(undefined);
export const recoveryMode = writable(false); // true after opening a "reset password" link
export const linkResult = writable(null); // 'confirmed' | 'expired', after opening an email link

// Reads the email-link result and clears it, so its message is shown only once.
export function takeLinkResult() {
  const result = get(linkResult);
  linkResult.set(null);
  return result;
}

export async function initAuth() {
  if (!isConfigured) {
    session.set(null);
    return;
  }

  await handleEmailLink();

  const { data } = await supabase.auth.getSession();
  setSession(data.session);

  supabase.auth.onAuthStateChange((_event, newSession) => {
    // Supabase recommends not calling it again from inside this callback, so wait a tick.
    setTimeout(() => setSession(newSession), 0);
  });
}

// Email links (confirm sign-up, reset password) bring people back in one of two shapes:
//  - Supabase's default emails: …/#access_token=…&refresh_token=…&type=signup (or type=recovery),
//    or …/#error=…&error_code=otp_expired when the link is too old or already used
//  - our own templates (supabase/email-templates/, once custom SMTP is set up):
//    …/?token_hash=…&type=email (or type=recovery)
// Both work even if the link is opened on another device than the one used to sign up.
async function handleEmailLink() {
  const query = new URLSearchParams(window.location.search);
  const hash = window.location.hash.slice(1);
  // "#/today" is a normal page address; anything else after "#" comes from Supabase.
  const fragment = new URLSearchParams(hash.startsWith('/') ? '' : hash);

  const tokenHash = query.get('token_hash');
  const accessToken = fragment.get('access_token');
  const linkError = query.get('error') ?? fragment.get('error');
  if (!tokenHash && !accessToken && !linkError) return;

  const type = query.get('type') ?? fragment.get('type');

  // Remove the tokens from the address bar (and browser history) straight away.
  window.history.replaceState(null, '', window.location.pathname);

  let error = linkError;
  if (tokenHash) {
    ({ error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type }));
  } else if (accessToken) {
    ({ error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: fragment.get('refresh_token')
    }));
  }

  if (error) {
    // If someone is already logged in on this browser (e.g. in another tab), App.svelte
    // shows this message on its own screen instead of letting them straight in.
    linkResult.set('expired');
    go('/login');
  } else if (type === 'recovery') {
    recoveryMode.set(true);
  } else {
    linkResult.set('confirmed');
    go('/today');
  }
}

function setSession(newSession) {
  const previousUserId = get(session)?.user?.id;
  session.set(newSession);

  if (!newSession) {
    profile.set(undefined);
  } else if (newSession.user.id !== previousUserId) {
    loadProfile(newSession.user.id);
  }
}

async function loadProfile(userId) {
  profile.set(undefined);
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) console.error('Could not load profile', error);
  profile.set(data ?? null);
  if (data) locale.set(data.language);
}

// Only the columns the database lets the app change: display_name, language, timezone, onboarding_done.
export async function updateProfile(changes) {
  const userId = get(session).user.id;
  const { data, error } = await supabase.from('profiles').update(changes).eq('id', userId).select().single();
  if (error) throw error;
  profile.set(data);
  return data;
}

export function signUp({ email, password }) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: appUrl(),
      // Read by the database when it creates the profile (supabase/migrations/0001_profiles.sql).
      data: {
        terms_accepted: true,
        terms_version: TERMS_VERSION,
        language: get(locale),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
      }
    }
  });
}

export function logIn({ email, password }) {
  return supabase.auth.signInWithPassword({ email, password });
}

export function resendConfirmation(email) {
  return supabase.auth.resend({ type: 'signup', email, options: { emailRedirectTo: appUrl() } });
}

export function sendPasswordReset(email) {
  return supabase.auth.resetPasswordForEmail(email, { redirectTo: appUrl() });
}

export async function setNewPassword(password) {
  const result = await supabase.auth.updateUser({ password });
  if (result.error) return result;

  // Log out every other device and browser that was using the old password.
  // (They are fully out within an hour at most, when their current access expires.)
  const { error } = await supabase.auth.signOut({ scope: 'others' });
  if (error) console.error('Could not sign out other sessions', error);

  recoveryMode.set(false);
  return result;
}

export function logOut() {
  linkResult.set(null);
  return supabase.auth.signOut();
}
