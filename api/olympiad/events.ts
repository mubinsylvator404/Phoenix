import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, handleUpsert } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Ensure headers for JSON
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { method } = req;
  const { id } = req.query;

  try {
    const supabase = getSupabase();
    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: "Supabase configuration is missing or invalid."
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
        if (!id) {
          return res.status(400).json({
            success: false,
            error: "Missing event ID"
          });
        }
        const { error: delError } = await supabase
          .from('olympiad_events')
          .delete()
          .eq('id', id as string);
        
        if (delError) throw delError;
        return res.status(200).json({
          success: true,
          message: "Event deleted successfully"
        });

      default:
        return res.status(405).json({
          success: false,
          error: `Method ${method} Not Allowed`
        });
    }
  } catch (error: any) {
    console.error('[API Olympiad Events] Crash:', error);
    return res.status(500).json({
      success: false,
      error: error.message || "Internal Server Error"
    });
  }
}
