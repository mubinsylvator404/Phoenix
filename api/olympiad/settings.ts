import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        const { data: getData, error: getError } = await supabase
          .from('olympiad_settings')
          .select('*')
          .eq('id', 'default')
          .single();
        
        if (getError && getError.code !== 'PGRST116') throw getError; // PGRST116 is no rows found
        return res.status(200).json(getData || { id: 'default' });

      case 'POST':
        const { data: postData, error: postError } = await supabase
          .from('olympiad_settings')
          .upsert({ id: 'default', ...req.body })
          .select();
        
        if (postError) throw postError;
        return res.status(200).json(postData ? postData[0] : {});

      default:
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('[API Olympiad Settings] Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}
