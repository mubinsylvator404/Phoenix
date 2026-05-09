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
    const { method } = req;

    if (method === 'GET') {
      const { batch, subject } = req.query;
      const { data, error } = await supabase
        .from("syllabus_progress")
        .select("*")
        .eq("batch", batch as string)
        .eq("subject", subject as string);

      if (error) throw error;
      return res.status(200).json(data || []);
    } 
    
    if (method === 'POST') {
      let payload = req.body;
      if (!payload.id || (typeof payload.id === 'string' && payload.id.startsWith("temp-"))) {
        delete payload.id;
      }
      
      const { data, error } = await supabase
        .from("syllabus_progress")
        .upsert(payload, { onConflict: "batch,subject,chapter_name" })
        .select();

      if (error) throw error;
      return res.status(200).json(data ? data[0] : null);
    }

    if (method === 'DELETE') {
      const { id } = req.query;
      const { error } = await supabase.from("syllabus_progress").delete().eq("id", id as string);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[Syllabus API Error]', err);
    return res.status(500).json({ 
      success: false, 
      error: err.message || 'Internal Server Error',
      details: err.code === '42P01' ? 'Table missing. Run Master Sync.' : undefined
    });
  }
}
