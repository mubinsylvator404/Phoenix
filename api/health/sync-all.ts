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
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, error: 'Missing Supabase ENV' });
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
          
          if (error) {
            console.error(`[SchemaSync] Error in ${fileName}:`, error.message);
          }
          
          results.push({ 
            file: fileName, 
            status: error ? 'error' : 'success', 
            message: error ? error.message : 'OK' 
          });
        } else {
          console.warn(`[SchemaSync] File not found: ${fileName}`);
          results.push({ file: fileName, status: 'skipped', message: 'File not found' });
        }
      } catch (e: any) {
        console.error(`[SchemaSync] Exception while processing ${fileName}:`, e.message);
        results.push({ file: fileName, status: 'exception', message: e.message });
      }
    }

    console.log('[SchemaSync] Master sync complete.');
    return res.status(200).json({ 
      success: !results.some(r => r.status === 'error' && r.message && !r.message.includes('already exists')), 
      results 
    });
  } catch (error: any) {
    console.error('[API Sync All] Error:', error);
    return res.status(500).json({ success: false, error: error.message || String(error) });
  }
}
