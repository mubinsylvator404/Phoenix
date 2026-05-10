import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import cors from "cors";

console.log("Server initializing...");

// Supabase configuration (using existing credentials or ENV)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://gkycpsiqzwtbnomrnpog.supabase.co';
const supabaseKey = 
  process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 
  process.env.SUPABASE_SERVICE_ROLE_KEY || 
  process.env.VITE_SUPABASE_ANON_KEY || 
  process.env.SUPABASE_ANON_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdreWNwc2lxend0Ym5vbXJucG9nIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MzQwNjYsImV4cCI6MjA4NzAxMDA2Nn0.ijOH4UnQ8k9ODCHRfd0bgqAR4DNAgK_pHVHK4kwy078';

const isServiceRole = !!(process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = createClient(supabaseUrl, supabaseKey);

// ES Module __dirname and __filename fix
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

  // --- Production setup: Path detection ---
  const getDistPath = () => {
    const paths = [
      path.join(process.cwd(), 'dist'),
      path.join(__dirname, 'dist'),
      path.join(__dirname, '..', 'dist')
    ];
    
    console.log(`[Server] Checking dist paths in order: ${JSON.stringify(paths)}`);
    for (const p of paths) {
      if (fs.existsSync(p)) {
        console.log(`[Server] Found dist at: ${p}`);
        return p;
      }
    }
    console.warn(`[Server] Could not find dist directory, defaulting to ${paths[0]}`);
    return paths[0]; // Default fallback
  };

  const isProd = process.env.NODE_ENV === "production" || !!process.env.VERCEL;
  const distPath = getDistPath();
  const indexPath = path.join(distPath, 'index.html');
  
  // In environments like Cloud Run (K_SERVICE), we might want to default to production 
  // but ONLY if the build directory actually exists. 
  const isEffectiveProd = isProd || (!!process.env.K_SERVICE && fs.existsSync(distPath));
  
  console.log(`[Server] Environment: ${isProd ? 'Production' : 'Development'} (Effective: ${isEffectiveProd ? 'Prod' : 'Dev'})`);
  console.log(`[Server] Dist path: ${distPath} (exists: ${fs.existsSync(distPath)})`);
  console.log(`[Server] Index path: ${indexPath} (exists: ${fs.existsSync(indexPath)})`);
  console.log(`[Server] Working dir: ${process.cwd()}`);
  console.log(`[Server] __dirname: ${__dirname}`);


// Multer setup for OMR scans
const upload = multer({ storage: multer.memoryStorage() });

// Middlewares
const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Path normalization middleware for Vercel
// Vercel sometimes strips the /api prefix when routing to api/index.ts
app.use((req, res, next) => {
  if (req.url.startsWith('/api/')) return next();
  
  const apiPaths = ['/olympiad', '/health', '/students', '/syllabus', '/analytics', '/location', '/omr', '/teachers', '/video-classes', '/attendance'];
  // Only normalize to /api/ if it's likely an API call (not a browser navigation to a page)
  const isPageNavigation = req.headers.accept?.includes('text/html');
  
  if (apiPaths.some(p => req.url.startsWith(p)) && !isPageNavigation) {
    const oldUrl = req.url;
    req.url = '/api' + req.url;
    console.log(`[Server] Normalized path: ${oldUrl} -> ${req.url}`);
    // Clear cached parsed URL to force Express to re-evaluate req.path
    (req as any)._parsedUrl = undefined;
  }
  next();
});

// Debug middleware to see what's actually hitting the server
app.use((req, res, next) => {
  if (req.url.startsWith('/api')) {
    console.log(`[API Request] ${req.method} ${req.url}`);
  }
  next();
});

app.get(["/api/ping", "/ping"], (req, res) => {
  res.json({ 
    status: "pong", 
    timestamp: new Date().toISOString(),
    env: {
      isProd,
      isEffectiveProd,
      hasSupabaseUrl: !!supabaseUrl,
      supabaseUrl: supabaseUrl.substring(0, 15) + "..."
    }
  });
});

// diagnostics
app.get("/api/health/ping", (req, res) => res.json({ status: "pong", time: new Date().toISOString() }));

// --- 1. CRITICAL SYNC & HEALTH ROUTES ---
  // More permissive matching for sync-all
  app.post(["/api/health/sync-all", "/api/sync"], async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      console.log(`[SchemaSync] Master sync requested via ${req.originalUrl}`);
      const results: any[] = [];
      
      const sqlFiles = [
        'supabase_schema.sql',
        'syllabus_schema.sql',
        'olympiad_db_schema.sql',
        'omr_schema.sql',
        'analytics_schema.sql'
      ];

      for (const fileName of sqlFiles) {
        try {
          const filePath = path.join(process.cwd(), fileName);
          if (fs.existsSync(filePath)) {
            const sql = fs.readFileSync(filePath, 'utf8');
            const { error: sqlError } = await supabase.rpc('run_sql', { sql });
            
            results.push({ 
              file: fileName, 
              status: sqlError ? 'error' : 'success', 
              message: sqlError ? sqlError.message : 'OK',
              code: sqlError ? sqlError.code : null
            });
          } else {
            results.push({ file: fileName, status: 'skipped', message: 'File not found' });
          }
        } catch (e: any) {
          results.push({ file: fileName, status: 'exception', message: e.message });
        }
      }

      // Add special column sync
      try {
         const { error: colError } = await supabase.rpc('run_sql', { 
           sql: "ALTER TABLE students ADD COLUMN IF NOT EXISTS daily_attendance JSONB DEFAULT '{}';" 
         });
         results.push({ 
           file: 'students_patch', 
           status: colError ? 'error' : 'success', 
           message: colError ? colError.message : 'Added daily_attendance column' 
         });
      } catch (e: any) {
         results.push({ file: 'students_patch', status: 'error', message: e.message });
      }

      const hasCriticalError = results.some(r => r.status === 'error' && r.code !== '42P07' && r.code !== '42701');
      const isRpcMissing = results.some(r => r.status === 'error' && r.message && r.message.includes('does not exist'));

      return res.json({ 
        success: !hasCriticalError,
        isRpcMissing,
        results,
        tip: isRpcMissing ? "CRITICAL: The 'run_sql' RPC is missing in your Supabase project. Please add it via the SQL Editor." : undefined
      });
    } catch (err: any) {
      console.error("[MasterSync] Critical sync error:", err);
      return res.status(500).json({ 
        error: "Master Sync Error", 
        details: err.message,
        tip: "Check if 'run_sql' exists in Supabase. If not, create it manually via SQL editor."
      });
    }
  });

  // Secondary sync route for legacy calls
  app.post("/health/sync-all", (req, res) => {
    res.redirect(307, "/api/health/sync-all");
  });

  app.post("/api/health/sync-schema", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      console.log("[SchemaSync] Student Table sync request...");
      const { error } = await supabase.rpc('run_sql', { 
        sql: "ALTER TABLE students ADD COLUMN IF NOT EXISTS daily_attendance JSONB DEFAULT '{}';" 
      });
      if (error) throw error;
      return res.json({ success: true, message: "Student schema synced successfully." });
    } catch (err: any) {
      return res.status(500).json({ error: "Sync Error", details: err.message });
    }
  });

  app.post("/api/health/sync-schema-olympiad", async (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    try {
      const possiblePaths = [
        path.join(process.cwd(), 'olympiad_db_schema.sql'),
        path.join(__dirname, 'olympiad_db_schema.sql')
      ];
      let sql = "";
      for (const p of possiblePaths) {
        if (fs.existsSync(p)) { sql = fs.readFileSync(p, 'utf8'); break; }
      }
      if (!sql) return res.status(404).json({ error: "SQL file not found" });
      
      const { error } = await supabase.rpc('run_sql', { sql });
      if (error) {
        const isMissingRpc = error.message && error.message.includes("does not exist");
        return res.status(403).json({ 
          error: isMissingRpc ? "RPC_MISSING" : "SQL_ERROR", 
          message: isMissingRpc ? "The 'run_sql' RPC is missing." : error.message,
          sql: sql
        });
      }
      
      // Explicitly reload schema after schema changes
      await supabase.rpc('run_sql', { sql: "NOTIFY pgrst, 'reload schema';" });
      
      res.json({ success: true, message: "Olympiad tables synced successfully." });
    } catch (err: any) {
      res.status(500).json({ error: "Olympiad Sync Error", details: err.message });
    }
  });

  app.get("/api/health/database", async (req, res) => {
    try {
      const tables: any = {};
      const { data: sData, error: sError } = await supabase.from('students').select('*').limit(1);
      const studentCols = sData ? (sData.length > 0 ? Object.keys(sData[0]) : []) : [];
      tables.students = {
        exists: !sError || sError.code !== '42P01',
        columns: { daily_attendance: studentCols.includes('daily_attendance') }
      };
      const { error: oError } = await supabase.from('olympiad_events').select('*').limit(1);
      tables.olympiad_events = { exists: !oError || oError.code !== '42P01' };
      res.json({ tables, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // Helper for Olympiad Upserts
  const handleUpsert = async (table: string, body: any, res: express.Response) => {
    const bodyPreview = JSON.stringify(body).substring(0, 100);
    console.log(`[Olympiad] POST ${table}:`, bodyPreview);
    res.setHeader('Content-Type', 'application/json');
    try {
      if (!body || typeof body !== 'object') {
        return res.status(400).json({ error: "Invalid request body" });
      }
      const payload = { ...body };
      if (payload.id && typeof payload.id === 'string' && (payload.id.startsWith('e') || payload.id.startsWith('temp-') || payload.id.startsWith('speaker-') || payload.id.startsWith('resource-') || payload.id.startsWith('video-'))) {
        delete payload.id;
      }
      const { data, error } = await supabase.from(table).upsert(payload, { onConflict: 'id' }).select();
      if (error) {
        console.error(`[Olympiad] ${table} Save Error:`, error);
        
        // Check for missing table error (PostgREST code 42P01)
        if (error.code === '42P01') {
          return res.status(404).json({ 
            error: "Table not found", 
            tableMissing: true, 
            details: `The database table '${table}' does not exist. Please run 'Master Database Restore' in the Admin Dashboard.`,
            originalError: error.message
          });
        }
        
        return res.status(500).json({ 
          error: error.message, 
          details: error.details,
          code: error.code
        });
      }
      return res.json(data ? data[0] : {});
    } catch (error: any) {
      console.error(`[Olympiad] ${table} Exception:`, error);
      if (!res.headersSent) res.status(500).json({ error: error.message });
    }
  };

  // --- 2. CONSOLIDATED OLYMPIAD API ---
  app.all("/api/olympiad", async (req, res) => {
    const { action, id, type } = req.query;
    const { method } = req;
    
    const tableMap = {
      events: 'olympiad_events',
      resources: 'olympiad_resources',
      settings: 'olympiad_settings',
      speakers: 'olympiad_speakers',
      videos: 'olympiad_videos'
    };

    const table = tableMap[type as keyof typeof tableMap] || 'olympiad_events';

    try {
      if (method === 'GET') {
        const query = supabase.from(table).select('*');
        
        // Handle tables without created_at
        if (table !== 'olympiad_settings') {
          query.order('created_at', { ascending: false });
        }
        
        const { data, error } = await query;
        if (error) throw error;
        return res.json({ success: true, data: data || [] });
      }

      if (method === 'POST') {
        const body = req.body;
        // Strip dummy IDs
        if (body.id && (String(body.id).startsWith('e') || String(body.id).startsWith('temp-'))) {
          delete body.id;
        }
        
        // Ensure settings have a fixed ID if not provided
        if (table === 'olympiad_settings' && !body.id) {
          body.id = 'default';
        }

        const { data, error } = await supabase.from(table).upsert(body).select();
        if (error) throw error;
        return res.json({ success: true, data: data ? data[0] : null });
      }

      if (method === 'DELETE') {
        if (!id) return res.status(400).json({ success: false, error: 'Missing ID' });
        const { error } = await supabase.from(table).delete().eq('id', id);
        if (error) throw error;
        return res.json({ success: true });
      }

      return res.status(405).json({ success: false, error: 'Method not allowed' });
    } catch (error: any) {
      console.error(`[Olympiad API Error] ${method} ${table}:`, error);
      return res.status(500).json({ 
        success: false, 
        error: error.message || String(error),
        details: error.details || 'Internal server error'
      });
    }
  });

  // --- 3. STUDENT & ATTENDANCE ROUTES ---
  app.post("/api/students/sync", async (req, res) => {
    console.log("[API/Attendance] Individual sync requested for:", req.body.studentId);
    try {
      const { studentId, dailyAttendance, otherData } = req.body;
      if (!studentId) {
        return res.status(400).json({ success: false, error: "Missing studentId" });
      }

      const updatePayload: any = { ...otherData };
      if (dailyAttendance) updatePayload.daily_attendance = dailyAttendance;
      updatePayload.updated_at = new Date().toISOString();
      
      const { error } = await supabase.from('students').update(updatePayload).eq('id', studentId);
      if (error) {
        console.error(`[API/Attendance] Supabase Sync Error for ${studentId}:`, error);
        throw error;
      }
      
      res.json({ success: true });
    } catch (err: any) { 
      console.error("[API/Attendance] Sync Crash:", err);
      res.status(500).json({ success: false, error: err.message, details: "Internal Server Error during individual sync" }); 
    }
  });

  // --- 3. CONSOLIDATED ATTENDANCE API ---
  app.all("/api/attendance", async (req, res) => {
    const { method, query, body } = req;
    const action = query.action;

    try {
      if (method === 'GET') {
        const { data, error } = await supabase.from('students').select('*', { head: true, count: 'exact' });
        return res.json({ connected: !error, count: data?.length || 0 });
      }

      if (method === 'POST') {
        if (action === 'bulk-sync' || req.path.includes('bulk-sync')) {
          const { updates } = body;
          if (!updates || !Array.isArray(updates)) return res.status(400).json({ error: "Invalid updates" });
          const { error } = await supabase.from('students').upsert(updates).select();
          if (error) throw error;
          return res.json({ success: true, count: updates.length });
        }
        // Single update
        const { studentId, dailyAttendance, otherData } = body;
        const { error } = await supabase.from('students').upsert({ id: studentId, daily_attendance: dailyAttendance, ...otherData, updated_at: new Date().toISOString() });
        if (error) throw error;
        return res.json({ success: true });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.all("/api/students/sync", (req, res) => res.redirect(307, '/api/attendance'));
  app.all("/api/students/bulk-sync", (req, res) => res.redirect(307, '/api/attendance?action=bulk-sync'));
  app.all("/api/sync/attendance", (req, res) => res.redirect(307, '/api/attendance?action=bulk-sync'));

  // --- 4. CONSOLIDATED SYLLABUS API ---
  app.all("/api/syllabus", async (req, res) => {
    const { method, body, query } = req;
    const { batch, subject, id, action } = query;

    try {
      if (method === 'GET') {
        if (action === 'health' || req.path.includes('/health')) {
          const { data, error } = await supabase.from('syllabus_progress').select('*').limit(1);
          return res.json({ status: error ? "error" : "connected", error: error?.message });
        }
        const { data, error } = await supabase.from('syllabus_progress').select("*").eq("batch", batch).eq("subject", subject);
        if (error) {
          if (error.code === '42P01') return res.json({ error: "Table missing", tableMissing: true, data: [] });
          throw error;
        }
        return res.json(data || []);
      }

      if (method === 'POST') {
        let payload = body;
        if (payload.id && String(payload.id).startsWith("temp-")) delete payload.id;
        const { data, error } = await supabase.from("syllabus_progress").upsert(payload, { onConflict: "batch,subject,chapter_name" }).select();
        if (error) throw error;
        return res.json(data ? data[0] : null);
      }

      if (method === 'DELETE') {
        const targetId = id || body.id;
        if (!targetId) return res.status(400).json({ error: "Missing ID" });
        const { error } = await supabase.from("syllabus_progress").delete().eq("id", targetId);
        if (error) throw error;
        return res.json({ success: true });
      }
      return res.status(405).json({ error: 'Method not allowed' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.all("/api/syllabus/health", (req, res) => res.redirect(307, '/api/syllabus?action=health'));

app.get("/api/analytics", async (req, res) => {
  try {
    const { days = '7' } = req.query;
    const daysNum = parseInt(days as string);
    
    const now = new Date();
    const startDate = new Date();
    startDate.setDate(now.getDate() - daysNum);

    // Fetch real student count for Total Users
    const { count: studentCount, error: studentError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });

    // Fetch all analytics data for the period
    const { data: allData, error } = await supabase
      .from('user_analytics')
      .select('*')
      .order('created_at', { ascending: false });

    if (error && error.code !== 'PGRST116') {
      if (error.message?.includes('does not exist')) {
        return res.json(getExampleAnalyticsData(daysNum));
      }
      throw error;
    }

    if (!allData || allData.length === 0) {
      return res.json(getExampleAnalyticsData(daysNum));
    }

    // Process data
    const totalUsers = studentCount || allData.length;
    const todayStr = now.toISOString().split('T')[0];
    const activeToday = new Set(allData.filter(d => d.created_at && d.created_at.startsWith(todayStr)).map(d => d.user_id)).size;
    
    const last7DaysDate = new Date();
    last7DaysDate.setDate(now.getDate() - 7);
    const newLast7Days = allData.filter(d => d.created_at && new Date(d.created_at) >= last7DaysDate).length;

    // Filter by requested range for charts
    const filteredData = allData.filter(d => d.created_at && new Date(d.created_at) >= startDate);

    // Recent Activity (Real Users)
    const recentActivity = allData.slice(0, 10).map(d => ({
      id: d.id,
      userName: d.user_name || 'Guest User',
      userId: d.user_id,
      role: d.user_role || 'GUEST',
      city: d.city,
      country: d.country,
      timestamp: d.created_at
    }));

    // Top Cities
    const cityCounts: Record<string, number> = {};
    filteredData.forEach(d => {
      if (d.city) cityCounts[d.city] = (cityCounts[d.city] || 0) + 1;
    });
    const topCities = Object.entries(cityCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Top Countries
    const countryCounts: Record<string, number> = {};
    filteredData.forEach(d => {
      if (d.country) countryCounts[d.country] = (countryCounts[d.country] || 0) + 1;
    });
    const topCountries = Object.entries(countryCounts)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Growth Data (last X days)
    const growthMap: Record<string, number> = {};
    for (let i = 0; i <= daysNum; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      growthMap[d.toISOString().split('T')[0]] = 0;
    }
    filteredData.forEach(d => {
      if (d.created_at) {
        const dateStr = d.created_at.split('T')[0];
        if (growthMap[dateStr] !== undefined) {
          growthMap[dateStr]++;
        }
      }
    });
    const growthData = Object.entries(growthMap)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    res.json({
      totalUsers,
      activeToday,
      newLast7Days,
      topCities,
      topCountries,
      growthData,
      recentActivity
    });
  } catch (error) {
    console.error("Analytics API error:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

function getExampleAnalyticsData(days: number) {
  return {
    totalUsers: 1250,
    activeToday: 85,
    newLast7Days: 142,
    topCities: [
      { name: "Dhaka", count: 450 },
      { name: "Chittagong", count: 210 },
      { name: "Sylhet", count: 120 },
      { name: "Rajshahi", count: 95 },
      { name: "Khulna", count: 75 }
    ],
    topCountries: [
      { name: "Bangladesh", count: 1100 },
      { name: "USA", count: 50 },
      { name: "UK", count: 30 },
      { name: "Canada", count: 20 },
      { name: "Others", count: 50 }
    ],
    growthData: Array.from({ length: days }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (days - i));
      return {
        date: d.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 20) + 5
      };
    }),
    recentActivity: [
      { id: '1', userName: 'Abdullah Al Mubin', userId: 'user-123', role: 'ADMIN', city: 'Dhaka', country: 'Bangladesh', timestamp: new Date().toISOString() },
      { id: '2', userName: 'Guest User', userId: 'anonymous', role: 'GUEST', city: 'Chittagong', country: 'Bangladesh', timestamp: new Date().toISOString() }
    ]
  };
}

app.get("/api/location", async (req, res) => {
  try {
    // Detect IP from headers
    const forwarded = req.headers["x-forwarded-for"];
    let ip = typeof forwarded === "string" ? forwarded.split(",")[0] : req.socket.remoteAddress;

    if (!ip || ip === "::1" || ip === "127.0.0.1") {
      ip = "check";
    }

    const apiKey = process.env.IPSTACK_KEY;
    
    if (!apiKey) {
      return res.json({ 
        status: "error", 
        message: "Welcome to Phoenix Edu Care" 
      });
    }

    const response = await fetch(`http://api.ipstack.com/${ip}?access_key=${apiKey}`);
    const data = await response.json();

    if (data.error) {
      // Fallback to ip-api.com if ipstack rate limit is exceeded
      try {
        const fallbackResponse = await fetch(`http://ip-api.com/json/${ip === 'check' ? '' : ip}`);
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.status === 'success') {
          const city = fallbackData.city;
          const country = fallbackData.country;
          let message = "Welcome to Phoenix Edu Care";

          if (city && country) {
            message = `Welcome to Phoenix Edu Care from ${city}, ${country}`;
          } else if (country) {
            message = `Welcome to Phoenix Edu Care from ${country}`;
          }

          return res.json({
            status: "success",
            city,
            country,
            ip: ip === "check" ? fallbackData.query : ip,
            message
          });
        }
      } catch (fallbackError) {
        // Ignore fallback error and return default message
      }

      return res.json({
        status: "success",
        city: null,
        country: null,
        ip: ip === "check" ? "unknown" : ip,
        message: "Welcome to Phoenix Edu Care"
      });
    }

    const city = data.city;
    const country = data.country_name;
    let message = "Welcome to Phoenix Edu Care";

    if (city && country) {
      message = `Welcome to Phoenix Edu Care from ${city}, ${country}`;
    } else if (country) {
      message = `Welcome to Phoenix Edu Care from ${country}`;
    }

    res.json({
      status: "success",
      city,
      country,
      ip: ip === "check" ? data.ip : ip,
      message
    });
  } catch (error) {
    console.error("Location detection error:", error);
    res.status(200).json({ 
      status: "error", 
      message: "Welcome to Phoenix Edu Care",
      details: error instanceof Error ? error.message : "Unknown error"
    });
  }
});

// --- Static Asset Serving (Production) is handled near the bottom ---

// --- CONSOLIDATED OMR API ---
app.all("/api/omr", async (req, res) => {
  const { method } = req;
  const { action, id } = req.query;
  const RID = Math.random().toString(36).substring(7);
  console.log(`[OMR Unified][${RID}] ${method} ${req.url}`);

  try {
    if (method === 'GET') {
      if (action === 'keys' && id) {
        const { data, error } = await supabase.from('omr_answer_keys').select('*').eq('exam_id', id).order('question_number', { ascending: true });
        if (error) throw error;
        return res.json(data);
      }
      const { data, error } = await supabase.from('omr_exams').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return res.json(data);
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
        return res.json({ status: "success", result: savedResult });
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
      return res.json({ status: "success", exam });
    }

    if (method === 'DELETE') {
      const targetId = id || (req.params as any).id; // Support both
      if (!targetId) return res.status(400).json({ error: "ID is required" });
      
      await supabase.from('omr_answer_keys').delete().eq('exam_id', targetId);
      await supabase.from('omr_results').delete().eq('exam_id', targetId);
      const { error } = await supabase.from('omr_exams').delete().eq('id', targetId);
      if (error) throw error;
      return res.json({ status: "success", message: "Exam deleted" });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (err: any) {
    return res.status(500).json({ status: "error", error: err.message || String(err) });
  }
});







  // --- Static Asset Serving & SPA Fallback ---
  // 1. Vite middleware for development (Only if not effective production and NOT on Vercel)
  if (!isEffectiveProd && !process.env.VERCEL) {
    try {
      console.log("[Server] Development mode. Initializing Vite middleware...");
      const { createServer: createViteServer } = await import("vite");
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: "spa",
      });
      app.use(vite.middlewares);
    } catch (e) {
      console.warn("[Server] Vite dev server failed to start, falling back to basic dev view:", e);
    }
  }

  // 2. Static files for production
  if (isEffectiveProd && fs.existsSync(distPath)) {
    console.log(`[Server] Serving static files from: ${distPath}`);
    app.use(express.static(distPath, {
      index: 'index.html', // Let express handle the index normally
      extensions: ['html', 'js', 'css', 'png', 'jpg', 'jpeg', 'svg', 'ico']
    }));

    // Explicitly serve index.html for root if needed
    app.get('/', (req, res) => {
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }
      res.status(404).send('Index not found');
    });
  }

  // 3. Fallback for SPAs
  app.get('*all', (req, res, next) => {
    // Skip if it's an API request
    if (req.path.startsWith('/api/')) return next();
    
    // Skip if it's a file request (has a dot and is not .html)
    if (req.path.includes('.') && !req.path.endsWith('.html')) {
      return next();
    }

    // In production, serve index.html from dist
    if (isEffectiveProd && fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }

    // Default to the source index if available or a minimal fallback
    const rootIndex = path.join(process.cwd(), 'index.html');
    if (fs.existsSync(rootIndex)) {
      return res.sendFile(rootIndex);
    }

    // Otherwise, serve a basic HTML that loads the React entry point
    res.status(200).set({ 'Content-Type': 'text/html' }).send(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Phoenix Edu Care</title>
        </head>
        <body>
          <div id="root"></div>
          <script type="module" src="${isEffectiveProd ? '/index.js' : '/index.tsx'}"></script>
        </body>
      </html>
    `);
  });

  // FINAL CATCH-ALL for any missed API requests or non-GET requests
  // This prevents HTML responses for failed POST/PUT/DELETE calls
  app.all(/(.*)/, (req, res, next) => {
    if (res.headersSent) return;
    
    // Improved detection for API requests or requests that should never return HTML
    const isApiRequest = req.path.startsWith('/api/') || 
                         req.url.startsWith('/api/') || 
                         req.method !== 'GET' ||
                         req.headers.accept?.includes('application/json');

    if (isApiRequest) {
      console.warn(`[Server] Unhandled API route: ${req.method} ${req.url} (Path: ${req.path})`);
      return res.status(404).json({
        error: "Route not found",
        method: req.method,
        path: req.path,
        url: req.url,
        tip: "Ensure the database schema is synced in the Admin Dashboard and the endpoint is correctly defined."
      });
    }
    next();
  });

  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Error Caught:", err);
    res.status(err.status || 500).json({
      error: err.message || "Internal Server Error",
      details: err.details || null
    });
  });

  const PORT = Number(process.env.PORT) || 3000;

  // Start listening if not on Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }

// Global process handlers
process.on('unhandledRejection', (reason) => {
  console.error('[Process] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
});

export default app;
