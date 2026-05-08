import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, error: 'Missing Supabase ENV' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { method } = req;

    switch (method) {
      case 'GET':
        const { data: getData, error: getError } = await supabase
          .from('olympiad_settings')
          .select('*')
          .eq('id', 'default')
          .single();
        
        if (getError && getError.code !== 'PGRST116') throw getError;
        return res.status(200).json({ success: true, data: getData || { id: 'default' } });

      case 'POST':
        const { data: postData, error: postError } = await supabase
          .from('olympiad_settings')
          .upsert({ id: 'default', ...req.body })
          .select()
          .single();
        
        if (postError) throw postError;
        return res.status(200).json({ success: true, data: postData });

      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('[SETTINGS API ERROR]', error);
    return res.status(500).json({ success: false, error: error.message || String(error) });
  }
}
