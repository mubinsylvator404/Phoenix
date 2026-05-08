import { createClient } from '@supabase/supabase-js';

const getEnv = (name: string) => {
  const val = process.env[name];
  return val && val.trim().length > 0 ? val.trim() : null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
const supabaseKey = 
  getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY') || 
  getEnv('SUPABASE_SERVICE_ROLE_KEY') || 
  getEnv('VITE_SUPABASE_ANON_KEY') || 
  getEnv('SUPABASE_ANON_KEY');

// Lazy initialization to prevent top-level crashes
let supabaseClient: any = null;

export function getSupabase() {
  if (supabaseClient) return supabaseClient;
  
  const url = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL');
  const key = 
    getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY') || 
    getEnv('SUPABASE_SERVICE_ROLE_KEY') || 
    getEnv('VITE_SUPABASE_ANON_KEY') || 
    getEnv('SUPABASE_ANON_KEY');

  if (!url || !key) {
    console.error('[Supabase] Missing credentials');
    return null;
  }
  
  try {
    supabaseClient = createClient(url, key);
    return supabaseClient;
  } catch (err) {
    console.error('[Supabase] Init Error:', err);
    return null;
  }
}

export async function handleUpsert(table: string, body: any) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      throw new Error("Database connection could not be established. Check environment variables.");
    }
    if (!body || typeof body !== 'object') {
      throw new Error("Invalid request body");
    }
    const payload = { ...body };
    
    // Remove temporary frontend IDs
    const tempPrefixes = ['e', 'temp-', 'speaker-', 'resource-', 'video-'];
    if (payload.id && typeof payload.id === 'string' && tempPrefixes.some(p => payload.id.startsWith(p))) {
      delete payload.id;
    }

    const { data, error } = await supabase.from(table).upsert(payload, { onConflict: 'id' }).select();
    
    if (error) {
      console.error(`[Supabase] ${table} Upsert Error:`, error);
      throw error;
    }
    
    return data ? data[0] : {};
  } catch (error: any) {
    console.error(`[Supabase] ${table} Exception:`, error);
    throw error;
  }
}
