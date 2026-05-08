import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  process.env.VITE_SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL;

const supabaseKey =
  process.env.VITE_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_ROLE_KEY;

export function getSupabase() {
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase ENV variables');
    return null;
  }
  return createClient(supabaseUrl, supabaseKey);
}

export async function handleUpsert(table: string, payload: any) {
  const supabase = getSupabase();
  if (!supabase) {
    throw new Error('Supabase not initialized');
  }

  // Remove temp frontend IDs
  const tempPrefixes = ['e', 'temp-', 'speaker-', 'resource-', 'video-'];
  if (payload.id && typeof payload.id === 'string' && tempPrefixes.some(p => payload.id.startsWith(p))) {
    delete payload.id;
  }

  const { data, error } = await supabase
    .from(table)
    .upsert(payload, { onConflict: 'id' })
    .select()
    .single();

  if (error) {
    console.error(`[UPSERT ERROR] ${table}:`, error);
    throw error;
  }
  return data;
}
