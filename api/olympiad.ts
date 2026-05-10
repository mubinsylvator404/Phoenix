import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  const { action, id, type } = req.query;
  const { method } = req;

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://gkycpsiqzwtbnomrnpog.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const supabase = createClient(supabaseUrl, supabaseKey);

  const tableMap = {
    events: 'olympiad_events',
    resources: 'olympiad_resources',
    settings: 'olympiad_settings',
    speakers: 'olympiad_speakers',
    videos: 'olympiad_videos'
  };

  const table = tableMap[type as keyof typeof tableMap] || 'olympiad_events';

  try {
    if (method === 'GET') {
      const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json({ success: true, data: data || [] });
    }

    if (method === 'POST') {
      const body = req.body;
      if (body.id && (String(body.id).startsWith('e') || String(body.id).startsWith('temp-'))) delete body.id;
      const { data, error } = await supabase.from(table).upsert(body).select().single();
      if (error) throw error;
      return res.status(200).json({ success: true, data });
    }

    if (method === 'DELETE') {
      if (!id) return res.status(400).json({ success: false, error: 'Missing ID' });
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message || String(error) });
  }
}
