import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  // Always set JSON content type
  res.setHeader('Content-Type', 'application/json');

  // Ensure request is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  // Debug log for Vercel logs
  console.log('[AttendanceBulkSync] Incoming request...');

  try {
    const { updates } = req.body || {};

    if (!updates || !Array.isArray(updates)) {
      console.error('[AttendanceBulkSync] Invalid updates payload');
      return res.status(400).json({ success: false, error: 'Invalid updates payload. Expected "updates" array.' });
    }

    // Inline Supabase initialization for stability
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = 
      process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
      process.env.SUPABASE_SERVICE_ROLE_KEY || 
      process.env.VITE_SUPABASE_ANON_KEY || 
      process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('[AttendanceBulkSync] Missing Supabase ENV variables');
      return res.status(500).json({ 
        success: false, 
        error: 'Database configuration missing on server.',
        details: { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey }
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    
    let successes = 0;
    let failures = 0;
    const failureDetails: any[] = [];

    console.log(`[AttendanceBulkSync] Processing ${updates.length} updates...`);

    for (const u of updates) {
      try {
        if (!u.id) {
          failures++;
          failureDetails.push({ error: 'Missing student ID' });
          continue;
        }

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
          console.error(`[AttendanceBulkSync] Failed update for ID ${u.id}:`, error.message);
        } else {
          successes++;
        }
      } catch (innerErr: any) {
        failures++;
        failureDetails.push({ id: u.id, error: String(innerErr) });
      }
    }

    console.log(`[AttendanceBulkSync] Done. Successes: ${successes}, Failures: ${failures}`);

    return res.status(200).json({ 
      success: failures === 0, 
      processed: updates.length,
      successes,
      failures, 
      failureDetails: failures > 0 ? failureDetails : undefined 
    });

  } catch (err: any) {
    console.error('[AttendanceBulkSync] CRITICAL ERROR:', err);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal Server Error',
      details: String(err)
    });
  }
}
