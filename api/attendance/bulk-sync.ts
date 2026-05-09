import { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure request is POST
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  console.log('[AttendanceBulkSync] Handling request...');

  try {
    const { updates } = req.body;

    if (!updates || !Array.isArray(updates)) {
      console.error('[AttendanceBulkSync] Invalid updates payload:', updates);
      return res.status(400).json({ success: false, error: 'Invalid updates payload' });
    }

    const supabase = getSupabase();
    if (!supabase) {
      console.error('[AttendanceBulkSync] Supabase connection failed - check env vars');
      return res.status(500).json({ success: false, error: 'Database connection failed' });
    }

    let failures = 0;
    const failureDetails: any[] = [];

    console.log(`[AttendanceBulkSync] Processing ${updates.length} updates...`);

    for (const u of updates) {
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
        console.error(`[AttendanceBulkSync] Failed to update student ${u.id}:`, error);
      }
    }

    if (failures > 0) {
      console.warn(`[AttendanceBulkSync] Finished with ${failures} failures.`);
      return res.status(200).json({ 
        success: failures === 0, 
        failures, 
        failureDetails 
      });
    }

    console.log('[AttendanceBulkSync] Successfully updated all records.');
    return res.status(200).json({ success: true, failures: 0 });

  } catch (err: any) {
    console.error('[AttendanceBulkSync] UNEXPECTED ERROR:', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal Server Error' 
    });
  }
}
