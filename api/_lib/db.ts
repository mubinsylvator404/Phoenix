import { createClient } from '@supabase/supabase-js';

const getEnv = (name: string) => {
  const val = process.env[name];
  return val && val.trim().length > 0 ? val.trim() : null;
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL') || getEnv('SUPABASE_URL') || 'https://gkycpsiqzwtbnomrnpog.supabase.co';
const supabaseKey = 
  getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY') || 
  getEnv('SUPABASE_SERVICE_ROLE_KEY') || 
  getEnv('VITE_SUPABASE_ANON_KEY') || 
  getEnv('SUPABASE_ANON_KEY') || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWNwc2lxend0Ym5vbXJucG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzQwNjYsImV4cCI6MjA4NzAxMDA2Nn0.ijOH4UnQ8k9ODCHRfd0bgqAR4DNAgK_pHVHK4kwy078';

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function handleUpsert(table: string, body: any) {
  try {
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
