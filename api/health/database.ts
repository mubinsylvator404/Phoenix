import { createClient } from '@supabase/supabase-js';

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
    const tables: any = {};
    
    // Check Students
    const { data: sData, error: sError } = await supabase.from('students').select('*').limit(1);
    const studentCols = sData && sData.length > 0 ? Object.keys(sData[0]) : [];
    tables.students = {
      exists: !sError || sError.code !== '42P01',
      columns: { 
        daily_attendance: studentCols.includes('daily_attendance'),
        updated_at: studentCols.includes('updated_at')
      }
    };

    // Check Olympiad
    const { error: oError } = await supabase.from('olympiad_events').select('*').limit(1);
    tables.olympiad_events = { exists: !oError || oError.code !== '42P01' };

    // Check Syllabus
    const { error: syError } = await supabase.from('syllabus_progress').select('*').limit(1);
    tables.syllabus_progress = { exists: !syError || syError.code !== '42P01' };

    return res.status(200).json({ tables, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ error: String(err) });
  }
}
