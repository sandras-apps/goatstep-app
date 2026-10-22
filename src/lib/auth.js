// Who is logged in, and their profile row.
//
// session: undefined = still checking, null = logged out, object = logged in
// profile: undefined = loading, null = not found, object = the profiles row

import { writable, get } from 'svelte/store';
import { supabase, isConfigured } from './supabase.js';
import { appUrl, TERMS_VERSION } from './config.js';
import { locale } from '../i18n/index.js';

export const session = writable(undefined);
export const profile = writable(undefined);
export const recoveryMode = writable(false); // true after opening a "reset password" link
export const linkResult = writable(null); // 'confirmed' | 'expired', after opening an email link

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

// Email links look like  …/?token_hash=abc&type=email  (or type=recovery).
// See supabase/email-templates/. This works even if the link is opened on another device.
async function handleEmailLink() {
  const params = new URLSearchParams(window.location.search);
  const tokenHash = params.get('token_hash');
  const type = params.get('type');
  if (!tokenHash || !type) return;

  // Remove the token from the address bar straight away.
  window.history.replaceState(null, '', window.location.pathname + window.location.hash);

  const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
  if (error) {
    linkResult.set('expired');
  } else if (type === 'recovery') {
    recoveryMode.set(true);
  } else {
    linkResult.set('confirmed');
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
  if (!result.error) recoveryMode.set(false);
  return result;
}

export function logOut() {
  return supabase.auth.signOut();
}
