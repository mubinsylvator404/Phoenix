import { createClient } from '@supabase/supabase-js';

// This file handles /api/attendance base path (e.g. for bulk updates or listing)
export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = 
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.VITE_SUPABASE_ANON_KEY || 
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ success: false, error: 'Database configuration missing' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    if (req.method === 'POST') {
      // Re-use logic from bulk-sync for convenience if POST hits here
      const { updates } = req.body || {};
      if (!updates || !Array.isArray(updates)) {
        return res.status(400).json({ success: false, error: 'Invalid payload' });
      }

      let failures = 0;
      for (const u of updates) {
        const { error } = await supabase.from('students').update({ 
          daily_attendance: u.daily_attendance, 
          attendance: u.attendance, 
          updated_at: new Date().toISOString() 
        }).eq('id', u.id);
        if (error) failures++;
      }

      return res.status(200).json({ success: failures === 0, failures });
    } else if (req.method === 'GET') {
      // Return a simple health/status
      return res.status(200).json({ status: 'Attendance API active', timestamp: new Date().toISOString() });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: String(err) });
  }
}
