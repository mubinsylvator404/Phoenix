import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) return res.status(500).json({ success: false, error: 'Missing Supabase ENV' });

    const supabase = createClient(supabaseUrl, supabaseKey);
    const { method } = req;
    const { olympiad_id, id } = req.query;

    switch (method) {
      case 'GET':
        let query = supabase.from('olympiad_speakers').select('*');
        if (olympiad_id) query = query.eq('olympiad_id', olympiad_id);
        const { data: getData, error: getError } = await query;
        if (getError) throw getError;
        return res.status(200).json({ success: true, data: getData || [] });

      case 'POST':
        const body = req.body;
        if (body.id && String(body.id).includes('speaker-')) delete body.id;
        const { data: postData, error: postError } = await supabase.from('olympiad_speakers').upsert(body).select().single();
        if (postError) throw postError;
        return res.status(200).json({ success: true, data: postData });

      case 'DELETE':
        if (!id) return res.status(400).json({ success: false, error: 'Missing ID' });
        const { error: delError } = await supabase.from('olympiad_speakers').delete().eq('id', id);
        if (delError) throw delError;
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error: any) {
    console.error('[SPEAKERS API ERROR]', error);
    return res.status(500).json({ success: false, error: error.message || String(error) });
  }
}
