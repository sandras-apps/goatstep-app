// delete-account — Step 1: account
// Deletes everything belonging to the logged-in user:
//   1. their files in Storage (bucket "materials", folder named with their user id)
//   2. their login account → every table row goes with it ("on delete cascade")
//
// It runs on Supabase's servers because deleting an account needs the secret
// service_role key, which must never be in the app. Supabase provides it here automatically.

import { createClient } from 'npm:@supabase/supabase-js@2';

const BUCKET = 'materials';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
};

function reply(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return reply({ error: 'Use POST' }, 405);

  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

  // Who is asking? Only the logged-in user can delete their own account.
  const token = (req.headers.get('Authorization') ?? '').replace('Bearer ', '');
  const { data: userData, error: userError } = await admin.auth.getUser(token);
  if (userError || !userData.user) return reply({ error: 'Not logged in' }, 401);
  const userId = userData.user.id;

  try {
    await deleteFolder(admin, userId);
  } catch (error) {
    // Stop here: never delete the account while files would be left behind.
    console.error('File deletion failed', error);
    return reply({ error: 'Could not delete files, account kept. Please try again.' }, 500);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(userId);
  if (deleteError) {
    console.error('Account deletion failed', deleteError);
    return reply({ error: 'Could not delete account. Please try again.' }, 500);
  }

  return reply({ deleted: true });
});

// Deletes every file under "<folder>/", including sub-folders.
async function deleteFolder(admin: ReturnType<typeof createClient>, folder: string) {
  const storage = admin.storage.from(BUCKET);
  const { data: entries, error } = await storage.list(folder, { limit: 1000 });

  // The bucket is created in a later step: until then there is nothing to delete.
  if (error && /not found/i.test(error.message)) return;
  if (error) throw error;

  const files: string[] = [];
  for (const entry of entries ?? []) {
    const fullPath = `${folder}/${entry.name}`;
    if (entry.id === null) await deleteFolder(admin, fullPath); // folders have no id
    else files.push(fullPath);
  }

  if (files.length > 0) {
    const { error: removeError } = await storage.remove(files);
    if (removeError) throw removeError;
  }

  // More than 1000 entries: list again until the folder is empty.
  if ((entries ?? []).length === 1000) await deleteFolder(admin, folder);
}
