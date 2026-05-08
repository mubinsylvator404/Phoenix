import type { VercelRequest, VercelResponse } from '@vercel/node';
import { getSupabase, handleUpsert } from '../_lib/db';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  const { method } = req;
  const { olympiad_id, id } = req.query;

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
        let query = supabase.from('olympiad_resources').select('*');
        if (olympiad_id) query = query.eq('olympiad_id', olympiad_id as string);
        const { data: getData, error: getError } = await query;
        if (getError) throw getError;
        return res.status(200).json({ success: true, data: getData || [] });

      case 'POST':
        const postData = await handleUpsert('olympiad_resources', req.body);
        return res.status(200).json({ success: true, data: postData });

      case 'DELETE':
        if (!id) return res.status(400).json({ success: false, error: "Missing ID" });
        const { error: delError } = await supabase.from('olympiad_resources').delete().eq('id', id as string);
        if (delError) throw delError;
        return res.status(200).json({ success: true });

      default:
        return res.status(405).json({ success: false, error: `Method ${method} Not Allowed` });
    }
  } catch (error: any) {
    console.error('[API Olympiad Resources] Error:', error);
    return res.status(500).json({ success: false, error: error.message || "Internal Server Error" });
  }
}
