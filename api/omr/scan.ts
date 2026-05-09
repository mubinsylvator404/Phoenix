import { createClient } from '@supabase/supabase-js';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
  const supabaseKey = 
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
    process.env.SUPABASE_SERVICE_ROLE_KEY || 
    process.env.VITE_SUPABASE_ANON_KEY || 
    process.env.SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return res.status(500).json({ error: 'Database configuration missing' });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { examId, extractedInfo, studentId } = req.body;
    if (!examId || !extractedInfo) {
      return res.status(400).json({ error: "Exam ID and extracted information are required" });
    }

    const { data: exam, error: examError } = await supabase.from('omr_exams').select('*').eq('id', examId).single();
    if (examError) throw examError;

    const { data: keys, error: keysError } = await supabase.from('omr_answer_keys').select('*').eq('exam_id', examId).order('question_number', { ascending: true });
    if (keysError) throw keysError;

    const keyMap = new Map(keys.map(k => [k.question_number, k.correct_option]));
    let correctCount = 0;
    let wrongCount = 0;
    let blankCount = 0;
    let totalScore = 0;

    const { answers: rawAnswers, student_name, student_roll, set_code } = extractedInfo;
    if (!Array.isArray(rawAnswers)) throw new Error("Invalid answers format");

    const evaluatedAnswers = rawAnswers.map((ans: any) => {
      const qNum = parseInt(ans.question);
      const correctOption = keyMap.get(qNum);
      const marked = ans.marked ? String(ans.marked).toUpperCase() : null;
      let status = 'BLANK';
      
      if (!marked || marked === 'NULL' || marked === 'NONE') { blankCount++; }
      else if (marked === correctOption) { status = 'CORRECT'; correctCount++; totalScore += Number(exam.marks_per_question || 1); }
      else { status = 'WRONG'; wrongCount++; totalScore -= Math.abs(Number(exam.negative_marks || 0)); }

      return { question: qNum, marked, correctOption, status };
    });

    const insertPayload: any = {
      exam_id: examId,
      student_name: student_name || "Unknown",
      student_roll: student_roll || "N/A",
      set_code: set_code || "A",
      total_score: totalScore,
      correct_count: correctCount,
      wrong_count: wrongCount,
      blank_count: blankCount,
      answers: evaluatedAnswers,
      student_id: studentId || null
    };

    const { data: savedResult, error: saveError } = await supabase.from('omr_results').insert(insertPayload).select().single();
    if (saveError) {
       // Retry without student_id if column missing
       delete insertPayload.student_id;
       const { data: retryData, error: retryError } = await supabase.from('omr_results').insert(insertPayload).select().single();
       if (retryError) throw retryError;
       return res.status(200).json({ status: "success", result: retryData });
    }

    return res.status(200).json({ status: "success", result: savedResult });
  } catch (err: any) {
    console.error('[OMR Scan Error]', err);
    return res.status(500).json({ error: String(err) });
  }
}
