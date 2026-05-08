import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase } from '../_lib/db';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const supabase = getSupabase();
    const sqlFiles = [
      'supabase_schema.sql',
      'syllabus_schema.sql',
      'olympiad_db_schema.sql',
      'omr_schema.sql',
      'analytics_schema.sql'
    ];

    const results = [];
    for (const fileName of sqlFiles) {
      try {
        const filePath = path.join(process.cwd(), fileName);
        if (fs.existsSync(filePath)) {
          const sql = fs.readFileSync(filePath, 'utf8');
          const { error } = await supabase.rpc('run_sql', { sql });
          results.push({ file: fileName, status: error ? 'error' : 'success', message: error ? error.message : 'OK' });
        } else {
          results.push({ file: fileName, status: 'skipped', message: 'File not found' });
        }
      } catch (e: any) {
        results.push({ file: fileName, status: 'exception', message: e.message });
      }
    }

    return res.status(200).json({ success: true, results });
  } catch (error: any) {
    console.error('[API Sync All] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
