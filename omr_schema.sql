-- OMR Exams Table
CREATE TABLE IF NOT EXISTS public.omr_exams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    total_questions INTEGER NOT NULL,
    options_per_question INTEGER DEFAULT 4,
    marks_per_question DECIMAL DEFAULT 1.0,
    negative_marks DECIMAL DEFAULT 0.0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT -- Admin/Teacher ID
);

-- OMR Answer Keys Table
CREATE TABLE IF NOT EXISTS public.omr_answer_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.omr_exams(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    correct_option TEXT NOT NULL, -- A, B, C, D
    UNIQUE(exam_id, question_number)
);

-- OMR Results Table
CREATE TABLE IF NOT EXISTS public.omr_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exam_id UUID REFERENCES public.omr_exams(id) ON DELETE CASCADE,
    student_name TEXT,
    student_roll TEXT,
    set_code TEXT,
    total_score DECIMAL,
    correct_count INTEGER,
    wrong_count INTEGER,
    blank_count INTEGER,
    detected_answers JSONB, -- Store the detected answers for analysis
    image_url TEXT, -- Optional: store the uploaded OMR image
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
