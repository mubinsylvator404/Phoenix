import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://gkycpsiqzwtbnomrnpog.supabase.co';
  const supabaseKey = 
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.VITE_SUPABASE_ANON_KEY || 
    process.env.SUPABASE_ANON_KEY || 
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWNwc2lxend0Ym5vbXJucG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzQwNjYsImV4cCI6MjA4NzAxMDA2Nn0.ijOH4UnQ8k9ODCHRfd0bgqAR4DNAgK_pHVHK4kwy078';

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { method } = req;
    const { action, id } = req.query;

    if (method === 'GET') {
      if (action === 'keys' && id) {
        const { data, error } = await supabase.from('omr_answer_keys').select('*').eq('exam_id', id).order('question_number', { ascending: true });
        if (error) throw error;
        return res.status(200).json(data);
      }
      const { data, error } = await supabase.from('omr_exams').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.status(200).json(data);
    } 

    if (method === 'POST') {
      if (action === 'scan') {
        const { examId, extractedInfo, studentId } = req.body;
        const { data: exam, error: examError } = await supabase.from('omr_exams').select('*').eq('id', examId).single();
        if (examError) throw examError;

        const { data: keys, error: keysError } = await supabase.from('omr_answer_keys').select('*').eq('exam_id', examId).order('question_number', { ascending: true });
        if (keysError) throw keysError;

        const keyMap = new Map(keys.map(k => [k.question_number, k.correct_option]));
        let correctCount = 0, wrongCount = 0, blankCount = 0, totalScore = 0;

        const evaluatedAnswers = extractedInfo.answers.map((ans: any) => {
          const qNum = parseInt(ans.question);
          const correctOption = keyMap.get(qNum);
          const marked = ans.marked ? String(ans.marked).toUpperCase() : null;
          let status = 'BLANK';
          
          if (!marked || marked === 'NULL' || marked === 'NONE') { blankCount++; }
          else if (marked === correctOption) { status = 'CORRECT'; correctCount++; totalScore += Number(exam.marks_per_question || 1); }
          else { status = 'WRONG'; wrongCount++; totalScore -= Math.abs(Number(exam.negative_marks || 0)); }
          return { question: qNum, marked, correctOption, status };
        });

        const { data: savedResult, error: saveError } = await supabase.from('omr_results').insert({
          exam_id: examId, student_name: extractedInfo.student_name || "Unknown",
          student_roll: extractedInfo.student_roll || "N/A", set_code: extractedInfo.set_code || "A",
          total_score: totalScore, correct_count: correctCount, wrong_count: wrongCount, blank_count: blankCount,
          answers: evaluatedAnswers, student_id: studentId || null
        }).select().single();
        if (saveError) throw saveError;
        return res.status(200).json({ status: "success", result: savedResult });
      }

      // Create Exam
      const { title, total_questions, options_per_question, marks_per_question, negative_marks, answer_key } = req.body;
      const { data: exam, error: examError } = await supabase.from('omr_exams').insert({ title, total_questions, options_per_question, marks_per_question, negative_marks }).select().single();
      if (examError) throw examError;

      if (answer_key && Array.isArray(answer_key)) {
        const keysToInsert = answer_key.map((ans: string, index: number) => ({
          exam_id: exam.id, question_number: index + 1, correct_option: ans
        }));
        await supabase.from('omr_answer_keys').insert(keysToInsert);
      }
      return res.status(200).json({ status: "success", exam });
    }

    if (method === 'DELETE') {
      if (!id) return res.status(400).json({ error: "ID is required" });
      await supabase.from('omr_answer_keys').delete().eq('exam_id', id);
      await supabase.from('omr_results').delete().eq('exam_id', id);
      const { error } = await supabase.from('omr_exams').delete().eq('id', id);
      if (error) throw error;
      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ error: String(err) });
  }
}
