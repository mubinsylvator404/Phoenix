import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, error: 'Missing Supabase ENV', details: { hasUrl: !!supabaseUrl, hasKey: !!supabaseKey } });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const sqlFiles = [
      'supabase_schema.sql',
      'syllabus_schema.sql',
      'olympiad_db_schema.sql',
      'omr_schema.sql',
      'analytics_schema.sql'
    ];

    const results = [];
    console.log(`[SchemaSync] Starting master sync across ${sqlFiles.length} files...`);

    for (const fileName of sqlFiles) {
      try {
        const filePath = path.join(process.cwd(), fileName);
        if (fs.existsSync(filePath)) {
          const sql = fs.readFileSync(filePath, 'utf8');
          console.log(`[SchemaSync] Running SQL from ${fileName}`);
          const { error } = await supabase.rpc('run_sql', { sql });
          
          results.push({ 
            file: fileName, 
            status: error ? 'error' : 'success', 
            message: error ? error.message : 'OK',
            code: error ? error.code : null
          });
        } else {
          // Try alternate path for Vercel
          const altPath = path.join(process.cwd(), '..', fileName);
          if (fs.existsSync(altPath)) {
             const sql = fs.readFileSync(altPath, 'utf8');
             const { error } = await supabase.rpc('run_sql', { sql });
             results.push({ file: fileName, status: error ? 'error' : 'success', message: error ? error.message : 'OK' });
          } else {
             results.push({ file: fileName, status: 'skipped', message: 'File not found locally. Please ensure SQL files are in root.' });
          }
        }
      } catch (e: any) {
        results.push({ file: fileName, status: 'exception', message: e.message });
      }
    }

    // Explicitly add attendance and updated_at columns if missing
    try {
      await supabase.rpc('run_sql', { 
        sql: `
          ALTER TABLE students ADD COLUMN IF NOT EXISTS daily_attendance JSONB DEFAULT '{}';
          ALTER TABLE students ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        ` 
      });
    } catch (e) {}

    return res.status(200).json({ 
      success: !results.some(r => r.status === 'error' && r.message && !r.message.includes('already exists')), 
      results 
    });
  } catch (error: any) {
    console.error('[API Sync All] Error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error during sync', details: String(error) });
  }
}
