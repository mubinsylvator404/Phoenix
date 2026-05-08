import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: "Method Not Allowed" });
  }

  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(500).json({ success: false, error: 'Missing Supabase ENV' });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const possiblePaths = [
      path.join(process.cwd(), 'olympiad_db_schema.sql'),
      path.join(process.cwd(), 'api', 'olympiad_db_schema.sql')
    ];
    
    let sql = "";
    for (const p of possiblePaths) {
      if (fs.existsSync(p)) {
        sql = fs.readFileSync(p, 'utf8');
        break;
      }
    }

    if (!sql) {
      sql = `
        CREATE TABLE IF NOT EXISTS olympiad_events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title TEXT NOT NULL,
          description TEXT,
          date DATE,
          status TEXT DEFAULT 'Upcoming',
          banner_image TEXT,
          registration_url TEXT,
          external_link TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        );

        -- Explicitly ensure external_link exists for events
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='olympiad_events' AND column_name='external_link') THEN
            ALTER TABLE olympiad_events ADD COLUMN external_link TEXT;
          END IF;
          -- Also ensure subtitle/subtitle for hero if needed
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='olympiad_events' AND column_name='subtitle') THEN
            ALTER TABLE olympiad_events ADD COLUMN subtitle TEXT;
          END IF;
        END $$;

        CREATE TABLE IF NOT EXISTS olympiad_speakers (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          olympiad_id UUID REFERENCES olympiad_events(id) ON DELETE CASCADE,
          name TEXT NOT NULL,
          university TEXT,
          department TEXT,
          bio TEXT,
          image TEXT,
          topics TEXT[],
          external_link TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        );

        -- Explicitly ensure external_link exists for speakers
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='olympiad_speakers' AND column_name='external_link') THEN
            ALTER TABLE olympiad_speakers ADD COLUMN external_link TEXT;
          END IF;
        END $$;

        CREATE TABLE IF NOT EXISTS olympiad_resources (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          olympiad_id UUID REFERENCES olympiad_events(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          type TEXT,
          url TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS olympiad_videos (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          olympiad_id UUID REFERENCES olympiad_events(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          url TEXT,
          created_at TIMESTAMPTZ DEFAULT now()
        );

        CREATE TABLE IF NOT EXISTS olympiad_settings (
          id TEXT PRIMARY KEY,
          hero_title TEXT,
          hero_description TEXT,
          updated_at TIMESTAMPTZ DEFAULT now()
        );

        -- Enable RLS and add basic policies
        ALTER TABLE olympiad_events ENABLE ROW LEVEL SECURITY;
        ALTER TABLE olympiad_speakers ENABLE ROW LEVEL SECURITY;
        ALTER TABLE olympiad_resources ENABLE ROW LEVEL SECURITY;
        ALTER TABLE olympiad_videos ENABLE ROW LEVEL SECURITY;
        ALTER TABLE olympiad_settings ENABLE ROW LEVEL SECURITY;

        -- Allow ALL to simplify (can be hardened later)
        DO $$ 
        BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public all olympiad_events') THEN
            CREATE POLICY "Public all olympiad_events" ON olympiad_events FOR ALL USING (true) WITH CHECK (true);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public all olympiad_speakers') THEN
            CREATE POLICY "Public all olympiad_speakers" ON olympiad_speakers FOR ALL USING (true) WITH CHECK (true);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public all olympiad_resources') THEN
            CREATE POLICY "Public all olympiad_resources" ON olympiad_resources FOR ALL USING (true) WITH CHECK (true);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public all olympiad_videos') THEN
            CREATE POLICY "Public all olympiad_videos" ON olympiad_videos FOR ALL USING (true) WITH CHECK (true);
          END IF;
          IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public all olympiad_settings') THEN
            CREATE POLICY "Public all olympiad_settings" ON olympiad_settings FOR ALL USING (true) WITH CHECK (true);
          END IF;
        END $$;

        -- Reload PostgREST schema cache
        NOTIFY pgrst, 'reload schema';
        
        -- Secondary reload method via pg_temp or similar if needed, 
        -- but NOTIFY is standard for Supabase.
      `;
    }

    const { error } = await supabase.rpc('run_sql', { sql });
    if (error) throw error;
    
    return res.status(200).json({ success: true, message: "Olympiad schema synced successfully." });
  } catch (error: any) {
    console.error('[API Sync Olympiad] Error:', error);
    return res.status(500).json({ success: false, error: error.message || String(error) });
  }
}
