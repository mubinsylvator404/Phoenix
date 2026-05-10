import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://gkycpsiqzwtbnomrnpog.supabase.co';
  const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWNwc2lxend0Ym5vbXJucG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzQwNjYsImV4cCI6MjA4NzAxMDA2Nn0.ijOH4UnQ8k9ODCHRfd0bgqAR4DNAgK_pHVHK4kwy078';
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const tables: any = {};
    const { data: sData, error: sError } = await supabase.from('students').select('*').limit(1);
    const studentCols = sData && sData.length > 0 ? Object.keys(sData[0]) : [];
    tables.students = { exists: !sError || sError.code !== '42P01', columns: { daily_attendance: studentCols.includes('daily_attendance'), updated_at: studentCols.includes('updated_at') } };
    
    return res.status(200).json({ status: 'ok', tables, timestamp: new Date().toISOString() });
  } catch (err: any) {
    return res.status(500).json({ error: String(err) });
  }
}
