import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: "Method Not Allowed" });

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://gkycpsiqzwtbnomrnpog.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWNwc2lxend0Ym5vbXJucG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzQwNjYsImV4cCI6MjA4NzAxMDA2Nn0.ijOH4UnQ8k9ODCHRfd0bgqAR4DNAgK_pHVHK4kwy078';
    const supabase = createClient(supabaseUrl, supabaseKey);

    const sqlFiles = ['supabase_schema.sql', 'syllabus_schema.sql', 'olympiad_db_schema.sql', 'omr_schema.sql', 'analytics_schema.sql'];
    const results = [];

    for (const fileName of sqlFiles) {
      try {
        let filePath = path.join(process.cwd(), fileName);
        if (!fs.existsSync(filePath)) filePath = path.join(process.cwd(), '..', fileName);
        
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

    try { await supabase.rpc('run_sql', { sql: "ALTER TABLE students ADD COLUMN IF NOT EXISTS daily_attendance JSONB DEFAULT '{}'; ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();" }); } catch (e) {}

    return res.status(200).json({ success: !results.some(r => r.status === 'error' && !r.message.includes('already exists')), results });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: String(error) });
  }
}
