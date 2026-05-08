
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Olympiad Events table
CREATE TABLE IF NOT EXISTS olympiad_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  subtitle TEXT,
  description TEXT,
  banner_image TEXT,
  date DATE,
  category TEXT,
  status TEXT CHECK (status IN ('Upcoming', 'Running', 'Completed')) DEFAULT 'Upcoming',
  registration_url TEXT,
  external_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure external_link column exists for old tables
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='olympiad_events' AND column_name='external_link') THEN
    ALTER TABLE olympiad_events ADD COLUMN external_link TEXT;
  END IF;
END $$;

-- Olympiad Speakers table
CREATE TABLE IF NOT EXISTS olympiad_speakers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  olympiad_id UUID REFERENCES olympiad_events(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  university TEXT,
  department TEXT,
  bio TEXT,
  image TEXT,
  topics TEXT[], -- Array of topics
  external_link TEXT, -- New field for speaker website/LinkedIn
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure external_link column exists for speakers
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='olympiad_speakers' AND column_name='external_link') THEN
    ALTER TABLE olympiad_speakers ADD COLUMN external_link TEXT;
  END IF;
END $$;

-- Olympiad Resources table (PDFs, drive links, results)
CREATE TABLE IF NOT EXISTS olympiad_resources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  olympiad_id UUID REFERENCES olympiad_events(id) ON DELETE CASCADE,
  category TEXT NOT NULL, -- e.g., 'Medical', 'Engineering', 'HSC'
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('Question Paper', 'Solution', 'Result', 'Merit List', 'Event Details')) NOT NULL,
  url TEXT NOT NULL,
  video_url TEXT, -- Optional associated video
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Olympiad Videos table (YouTube embedded videos)
CREATE TABLE IF NOT EXISTS olympiad_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  olympiad_id UUID REFERENCES olympiad_events(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Olympiad Settings (Hero Section)
CREATE TABLE IF NOT EXISTS olympiad_settings (
  id TEXT PRIMARY KEY,
  hero_title TEXT,
  hero_description TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE olympiad_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympiad_settings ENABLE ROW LEVEL SECURITY;

-- Policies for public reading
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read olympiad_events') THEN
        CREATE POLICY "Public read olympiad_events" ON olympiad_events FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read olympiad_speakers') THEN
        CREATE POLICY "Public read olympiad_speakers" ON olympiad_speakers FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read olympiad_resources') THEN
        CREATE POLICY "Public read olympiad_resources" ON olympiad_resources FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read olympiad_videos') THEN
        CREATE POLICY "Public read olympiad_videos" ON olympiad_videos FOR SELECT USING (true);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public read olympiad_settings') THEN
        CREATE POLICY "Public read olympiad_settings" ON olympiad_settings FOR SELECT USING (true);
    END IF;
END $$;

-- Policies for admin writing
-- Note: Replace 'your-admin-id' or use a check for admin role if applicable.
-- For simplicity in this environment, we often allow all authenticated if it's meant for the app.
-- But standard practice:
-- CREATE POLICY "Admin write olympiad_events" ON olympiad_events FOR ALL USING (auth.role() = 'service_role');
