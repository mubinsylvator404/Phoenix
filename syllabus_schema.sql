
-- SQL Migration Script for Syllabus Progress Tracking

-- 1. Create the syllabus_progress table
CREATE TABLE IF NOT EXISTS public.syllabus_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  batch TEXT NOT NULL,
  subject TEXT NOT NULL,
  chapter_name TEXT NOT NULL,
  teacher_name TEXT NOT NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Running', 'Finished')),
  total_lectures INTEGER,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.syllabus_progress ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Allow everyone to read (students need to see progress)
DROP POLICY IF EXISTS "Allow public read access" ON public.syllabus_progress;
CREATE POLICY "Allow public read access" 
ON public.syllabus_progress FOR SELECT 
USING (true);

-- Allow all operations for simpler synchronization through server-side proxy
DROP POLICY IF EXISTS "Allow authenticated insert" ON public.syllabus_progress;
CREATE POLICY "Allow public insert" 
ON public.syllabus_progress FOR INSERT 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update" ON public.syllabus_progress;
CREATE POLICY "Allow public update" 
ON public.syllabus_progress FOR UPDATE 
USING (true);

DROP POLICY IF EXISTS "Allow public delete" ON public.syllabus_progress;
CREATE POLICY "Allow public delete" 
ON public.syllabus_progress FOR DELETE 
USING (true);

-- 4. Create unique constraint to prevent duplicates and enable upserts on logical keys
ALTER TABLE public.syllabus_progress DROP CONSTRAINT IF EXISTS unique_syllabus_item;
ALTER TABLE public.syllabus_progress ADD CONSTRAINT unique_syllabus_item UNIQUE (batch, subject, chapter_name);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_syllabus_batch_subject ON public.syllabus_progress(batch, subject);
CREATE INDEX IF NOT EXISTS idx_syllabus_teacher ON public.syllabus_progress(teacher_name);
