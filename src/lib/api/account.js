// "Export my data" and "Delete my account".

import { get } from 'svelte/store';
import { supabase } from '../supabase.js';
import { session } from '../auth.js';

// Every table holding the user's data. Each build step adds its tables here
// (categories, habits, habit_logs, items, checkins…) so the export is always complete.
const EXPORT_TABLES = ['profiles'];

// Builds a JSON file with everything we store about the user and downloads it.
// Row Level Security means each query only returns the user's own rows.
export async function exportMyData() {
  const user = get(session).user;
  const data = {
    app: 'Goatstep',
    exported_at: new Date().toISOString(),
    account: { email: user.email, created_at: user.created_at }
  };

  for (const table of EXPORT_TABLES) {
    const { data: rows, error } = await supabase.from(table).select('*');
    if (error) throw error;
    data[table] = rows;
  }

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `goatstep-export-${data.exported_at.slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Asks the server (supabase/functions/delete-account) to delete files and account.
// It has to run on the server because only the secret key may delete a login account.
export async function deleteMyAccount() {
  const { error } = await supabase.functions.invoke('delete-account', { method: 'POST' });
  if (error) throw error;
  // The account no longer exists: just forget the session on this device.
  await supabase.auth.signOut({ scope: 'local' });
}
