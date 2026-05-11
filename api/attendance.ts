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
        console.log(`[API/Attendance] Bulk upsert for ${updates.length} students`);
        const { error } = await supabase.from('students').upsert(updates.map((u: any) => ({
          id: u.id,
          daily_attendance: u.daily_attendance || u.dailyAttendance || {},
          attendance: u.attendance !== undefined ? u.attendance : 0,
          updated_at: new Date().toISOString()
        })));
        
        if (error) {
          console.error("[API/Attendance] Upsert Error:", error);
          return res.status(500).json({ success: false, error: error.message });
        }
        return res.status(200).json({ success: true, count: updates.length });
      }

      // Single update fallback
      const { id, studentId, daily_attendance, dailyAttendance, attendance } = body || {};
      const finalId = id || studentId;
      if (finalId) {
        const { error } = await supabase.from('students').upsert({
          id: finalId,
          daily_attendance: daily_attendance || dailyAttendance || {},
          attendance: attendance !== undefined ? attendance : 0,
          updated_at: new Date().toISOString()
        });
        if (error) throw error;
        return res.status(200).json({ success: true });
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
