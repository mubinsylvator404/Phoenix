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
    const { id } = req.query;

    if (method === 'GET') {
      if (id) {
        // Fetch specific exam keys or details
        const { data, error } = await supabase.from('omr_answer_keys').select('*').eq('exam_id', id).order('question_number', { ascending: true });
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase.from('omr_exams').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    } 
    
    if (method === 'POST') {
      const { title, total_questions, options_per_question, marks_per_question, negative_marks, answer_key } = req.body;
      if (!title) return res.status(400).json({ error: "Exam title is required" });

      const { data: exam, error: examError } = await supabase.from('omr_exams').insert({ title, total_questions, options_per_question, marks_per_question, negative_marks }).select().single();
      if (examError) throw examError;

      if (answer_key && Array.isArray(answer_key)) {
        const keysToInsert = answer_key.map((ans: string, index: number) => ({
          exam_id: exam.id,
          question_number: index + 1,
          correct_option: ans
        }));
        await supabase.from('omr_answer_keys').insert(keysToInsert);
      }
      return res.status(200).json({ status: "success", exam });
    }

    if (method === 'DELETE') {
       if (!id) return res.status(400).json({ error: "ID is required" });
       // Use RPC or individual deletes if cascade is not set
       await supabase.from('omr_answer_keys').delete().eq('exam_id', id);
       await supabase.from('omr_results').delete().eq('exam_id', id);
       const { error } = await supabase.from('omr_exams').delete().eq('id', id);
       if (error) throw error;
       return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    console.error('[OMR API Error]', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
}
