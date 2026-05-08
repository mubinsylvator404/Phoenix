import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({
        success: false,
        error: 'Missing Supabase environment variables'
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { method } = req;
    const { id } = req.query;

    switch (method) {
      case 'GET':
        const { data: getData, error: getError } = await supabase
          .from('olympiad_events')
          .select('*')
          .order('date', { ascending: false });
        
        if (getError) throw getError;
        return res.status(200).json({
          success: true,
          data: getData || []
        });

      case 'POST':
        const body = req.body;
        // Clean temp IDs
        if (body.id && (String(body.id).startsWith('e') || String(body.id).startsWith('temp-'))) {
          delete body.id;
        }
        
        const { data: postData, error: postError } = await supabase
          .from('olympiad_events')
          .upsert(body)
          .select()
          .single();
          
        if (postError) throw postError;
        return res.status(200).json({
          success: true,
          data: postData
        });

      case 'DELETE':
        if (!id) return res.status(400).json({ success: false, error: 'Missing ID' });
        const { error: delError } = await supabase
          .from('olympiad_events')
          .delete()
          .eq('id', id);
          
        if (delError) throw delError;
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ success: false, error: `Method ${method} not allowed` });
    }
  } catch (error: any) {
    console.error('[EVENTS API ERROR]', error);
    return res.status(500).json({
      success: false,
      error: error.message || String(error)
    });
  }
}
