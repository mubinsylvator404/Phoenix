
-- SQL Migration Script for Admin Analytics Dashboard

-- 1. Create the user_analytics table
CREATE TABLE IF NOT EXISTS public.user_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id TEXT NOT NULL,
  user_name TEXT,
  user_role TEXT,
  city TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.user_analytics ENABLE ROW LEVEL SECURITY;

-- 3. Create policies
-- Allow everyone to insert (for tracking)
CREATE POLICY "Allow public insert" 
ON public.user_analytics FOR INSERT 
WITH CHECK (true);

-- Allow admins to read all data
-- (Note: Replace 'admin_role_check' with your actual admin verification logic if needed)
CREATE POLICY "Allow admin read access" 
ON public.user_analytics FOR SELECT 
USING (true); -- For simplicity in this demo, allowing read. In production, restrict to admins.

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_analytics_created_at ON public.user_analytics(created_at);
CREATE INDEX IF NOT EXISTS idx_user_analytics_user_id ON public.user_analytics(user_id);
