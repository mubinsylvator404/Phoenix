import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // Always set JSON content type first
  res.setHeader('Content-Type', 'application/json');

  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    let body = req.body;
    if (body && typeof body === 'string') {
      try { body = JSON.parse(body); } catch (e) { console.error('JSON parse fail'); }
    }

    const { updates } = body || {};
    if (!updates || !Array.isArray(updates)) {
      return res.status(400).json({ success: false, error: 'Invalid updates payload' });
    }

    // Direct Supabase Init with Fallbacks
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://gkycpsiqzwtbnomrnpog.supabase.co';
    const supabaseKey = 
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.VITE_SUPABASE_ANON_KEY || 
      process.env.SUPABASE_ANON_KEY || 
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWNwc2lxend0Ym5vbXJucG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzQwNjYsImV4cCI6MjA4NzAxMDA2Nn0.ijOH4UnQ8k9ODCHRfd0bgqAR4DNAgK_pHVHK4kwy078';

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let successes = 0;
    let failures = 0;
    const failureDetails: any[] = [];

    // Chunk size limit to avoid timeouts if needed, but for now sequential
    for (const u of updates) {
      if (!u.id) continue;
      try {
        const { error } = await supabase
          .from('students')
          .update({ 
            daily_attendance: u.daily_attendance, 
            attendance: u.attendance, 
            updated_at: new Date().toISOString() 
          })
          .eq('id', u.id);
        
        if (error) {
          failures++;
          failureDetails.push({ id: u.id, error: error.message });
        } else {
          successes++;
        }
      } catch (inner: any) {
        failures++;
        failureDetails.push({ id: u.id, error: String(inner) });
      }
    }

    return res.status(200).json({ 
      success: failures === 0, 
      processed: updates.length,
      successes,
      failures, 
      failureDetails: failures > 0 ? failureDetails : undefined 
    });

  } catch (err: any) {
    console.error('[AttendanceBulkSync] Error:', err);
    return res.status(500).json({ success: false, error: 'Internal Server Error', details: String(err) });
  }
}
