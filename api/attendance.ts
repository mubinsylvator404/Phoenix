import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://gkycpsiqzwtbnomrnpog.supabase.co';
  const supabaseKey = 
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.VITE_SUPABASE_ANON_KEY || 
    process.env.SUPABASE_ANON_KEY || 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWNwc2lxend0Ym5vbXJucG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzQwNjYsImV4cCI6MjA4NzAxMDA2Nn0.ijOH4UnQ8k9ODCHRfd0bgqAR4DNAgK_pHVHK4kwy078';

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { method } = req;
    const { action } = req.query;

    if (method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') {
        try { body = JSON.parse(body); } catch (e) {}
      }

      const { updates } = body || {};
      
      // If we have updates array, it's a bulk sync
      if (updates && Array.isArray(updates)) {
        let successes = 0;
        let failures = 0;
        const failureDetails: any[] = [];

        for (const u of updates) {
          if (!u.id) continue;
          const { error } = await supabase.from('students').update({ 
            daily_attendance: u.daily_attendance, 
            attendance: u.attendance, 
            updated_at: new Date().toISOString() 
          }).eq('id', u.id);
          
          if (error) {
            failures++;
            failureDetails.push({ id: u.id, error: error.message });
          } else {
            successes++;
          }
        }
        return res.status(200).json({ success: failures === 0, successes, failures, failureDetails });
      }

      // Single update fallback
      const { id, daily_attendance, attendance } = body || {};
      if (id) {
        const { data, error } = await supabase.from('students').update({
          daily_attendance,
          attendance,
          updated_at: new Date().toISOString()
        }).eq('id', id).select();
        if (error) throw error;
        return res.status(200).json({ success: true, data });
      }

      return res.status(400).json({ success: false, error: 'Invalid payload' });
    }

    if (method === 'GET') {
      return res.status(200).json({ status: 'Attendance API active' });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: String(err) });
  }
}
