// The one connection to Supabase, shared by the whole app.
// The URL and public key come from .env.local (see .env.example and README.md).

import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const publicKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Lets the app still open (with a friendly message) before Supabase is set up.
export const isConfigured = Boolean(url && publicKey);

export const supabase = isConfigured
  ? createClient(url, publicKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        // Email links are handled by lib/auth.js, because the "#" part of the address
        // is also used by our router (#/today) and the two must not get mixed up.
        detectSessionInUrl: false
      }
    })
  : null;
