import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, handleUpsert } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  const { method } = req;
  const { id } = req.query;

  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: "Supabase environment variables are missing."
      });
    }

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
        const postData = await handleUpsert('olympiad_events', req.body);
        return res.status(200).json({
          success: true,
          data: postData
        });

      case 'DELETE':
        if (!id) return res.status(400).json({ success: false, error: "Missing event ID" });
        const { error: delError } = await supabase
          .from('olympiad_events')
          .delete()
          .eq('id', id as string);
        
        if (delError) throw delError;
        return res.status(200).json({
          success: true
        });

      default:
        res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
        return res.status(405).json({
          success: false,
          error: `Method ${method} Not Allowed`
        });
    }
  } catch (error: any) {
    console.error('[API Olympiad Events] Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error"
    });
  }
}
