import type { VercelRequest, VercelResponse } from '@vercel/node';
import { supabase, handleUpsert } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure headers for JSON
  res.setHeader('Content-Type', 'application/json');

  const { method } = req;
  const { id } = req.query;

  try {
    switch (method) {
      case 'GET':
        const { data: getData, error: getError } = await supabase
          .from('olympiad_events')
          .select('*')
          .order('date', { ascending: false });
        
        if (getError) throw getError;
        return res.status(200).json(getData || []);

      case 'POST':
        const postData = await handleUpsert('olympiad_events', req.body);
        return res.status(200).json(postData);

      case 'DELETE':
        if (!id) return res.status(400).json({ error: "Missing event ID" });
        const { error: delError } = await supabase
          .from('olympiad_events')
          .delete()
          .eq('id', id as string);
        
        if (delError) throw delError;
        return res.status(200).json({ success: true });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({ error: `Method ${method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('[API Olympiad Events] Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message,
      code: error.code
    });
  }
}
