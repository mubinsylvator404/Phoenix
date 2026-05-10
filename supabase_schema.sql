-- Core Schema for Phoenix Edu Care

-- 1. Students Table
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT,
    batch TEXT,
    subjects JSONB DEFAULT '[]',
    is_verified BOOLEAN DEFAULT FALSE,
    join_date TEXT,
    own_phone TEXT,
    guardian_phone TEXT,
    ssc_roll TEXT,
    ssc_reg TEXT,
    attendance NUMERIC DEFAULT 0,
    daily_attendance JSONB DEFAULT '{}',
    average_score NUMERIC DEFAULT 0,
    course_fee_status TEXT DEFAULT 'Due',
    monthly_fee_status TEXT DEFAULT 'Due',
    fee_records JSONB DEFAULT '[]',
    subject_payments JSONB DEFAULT '{}',
    subject_payment_types JSONB DEFAULT '{}',
    subject_enrollment_dates JSONB DEFAULT '{}',
    monthly_payments JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Teachers Table
CREATE TABLE IF NOT EXISTS public.teachers (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    password TEXT,
    subject TEXT,
    qualification TEXT,
    experience TEXT,
    academic_background TEXT,
    image TEXT,
    profile_type TEXT DEFAULT 'text',
    profile_content TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT,
    description TEXT,
    thumbnail TEXT,
    payment_type TEXT DEFAULT 'Monthly',
    classes_per_week INTEGER DEFAULT 3,
    assigned_teachers JSONB DEFAULT '[]',
    sub_subjects JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Exams Table
CREATE TABLE IF NOT EXISTS public.exams (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    subject TEXT,
    date TEXT,
    total_marks INTEGER DEFAULT 100,
    batch TEXT DEFAULT 'All',
    marks JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Assignments Table
CREATE TABLE IF NOT EXISTS public.assignments (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    subject TEXT,
    batch TEXT,
    due_date TEXT,
    total_marks INTEGER,
    created_at TEXT
);

-- 6. Video Classes Table
CREATE TABLE IF NOT EXISTS public.video_classes (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    subject TEXT,
    batch TEXT,
    youtube_url TEXT,
    thumbnail TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Reviews Table
CREATE TABLE IF NOT EXISTS public.reviews (
    id UUID PRIMARY KEY,
    user_name TEXT NOT NULL,
    user_type TEXT NOT NULL,
    rating INTEGER,
    comment TEXT NOT NULL,
    created_at TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    hsc_batch TEXT,
    student_name TEXT,
    relation TEXT
);

-- 8. Notices Table
CREATE TABLE IF NOT EXISTS public.notices (
    id UUID PRIMARY KEY,
    title TEXT NOT NULL,
    content TEXT,
    faculty_id TEXT,
    created_at TEXT
);

-- 9. Site Config Table
CREATE TABLE IF NOT EXISTS public.site_config (
    id SERIAL PRIMARY KEY,
    admin_profile JSONB,
    footer_data JSONB,
    home_data JSONB,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. Chatbot Knowledge Table
CREATE TABLE IF NOT EXISTS public.chatbot_knowledge (
    id UUID PRIMARY KEY,
    question TEXT,
    answer TEXT,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. Helper Function to run SQL (for master sync)
-- This requires elevated permissions to create, but we include it for completeness
-- The user might need to run this manually once in Supabase SQL editor if RPC fails.
CREATE OR REPLACE FUNCTION public.run_sql(sql text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
  RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;
