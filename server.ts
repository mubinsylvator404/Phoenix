import express from "express";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import multer from 'multer';
import cors from "cors";
import { GoogleGenAI } from "@google/genai";

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

// CJS / ESM compatibility for paths
const _filename = (typeof import.meta !== 'undefined' && import.meta.url) 
  ? fileURLToPath(import.meta.url) 
  : '';

const _dirname = _filename 
  ? path.dirname(_filename) 
  : process.cwd();

const app = express();

async function startServer() {
  // --- Production setup: Path detection ---
  const getDistPath = () => {
    const paths = [
      path.join(process.cwd(), 'dist'),
      path.join(_dirname, 'dist'),
      path.join(_dirname, '..', 'dist')
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
  console.log(`[Server] __dirname (using _dirname): ${_dirname}`);


// Multer setup for OMR scans
const upload = multer({ storage: multer.memoryStorage() });

// Middlewares
// (Already defined app above)
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

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

  // --- 1. HEALTH CHECK ---
  app.get("/api/health/database", async (req, res) => {
    try {
      const { error: oError } = await supabase.from('olympiad_settings').select('id').limit(1);
      res.json({ 
        status: "ok", 
        database: { 
          olympiad_settings: !oError || oError.code !== '42P01' 
        } 
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Endpoints to sync database schemas (e.g. from Admin Dashboard)
  app.post("/api/health/sync-schema", async (req, res) => {
    try {
      const sqlPath = path.join(process.cwd(), 'supabase_schema.sql');
      if (!fs.existsSync(sqlPath)) {
        return res.status(404).json({ error: "SCHEMA_NOT_FOUND", message: "supabase_schema.sql not found on server" });
      }
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        console.warn("[Schema Sync] exec_sql RPC failed, returning sql for manual execution:", error);
        return res.status(400).json({ 
          error: "RPC_MISSING", 
          message: "The 'exec_sql' RPC is not defined in your Supabase database. You can copy the SQL script below and run it in your Supabase Dashboard SQL Editor.", 
          sql 
        });
      }
      return res.json({ success: true, message: "Schema synchronized successfully via RPC!" });
    } catch (err: any) {
      return res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
    }
  });

  app.post("/api/health/sync-schema-olympiad", async (req, res) => {
    try {
      const sqlPath = path.join(process.cwd(), 'olympiad_db_schema.sql');
      if (!fs.existsSync(sqlPath)) {
        return res.status(404).json({ error: "SCHEMA_NOT_FOUND", message: "olympiad_db_schema.sql not found on server" });
      }
      const sql = fs.readFileSync(sqlPath, 'utf8');
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      if (error) {
        console.warn("[Olympiad Schema Sync] exec_sql RPC failed, returning sql for manual execution:", error);
        return res.status(400).json({ 
          error: "RPC_MISSING", 
          message: "The 'exec_sql' RPC is not defined in your Supabase database. You can copy the SQL script below and run it in your Supabase Dashboard SQL Editor.", 
          sql 
        });
      }
      return res.json({ success: true, message: "Olympiad schema synchronized successfully via RPC!" });
    } catch (err: any) {
      return res.status(500).json({ error: "INTERNAL_ERROR", message: err.message });
    }
  });

  // --- CHATBOT API (Secure Gemini Proxy) ---
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { query, imageBase64, systemPrompt } = req.body;
      const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;

      if (!geminiKey) {
        console.error("[Chatbot API] No GEMINI_API_KEY or GOOGLE_GENERATIVE_AI_API_KEY found in process.env");
        return res.status(500).json({ error: "Gemini API key is not configured on the server. Please set GEMINI_API_KEY in the settings." });
      }

      const ai = new GoogleGenAI({ 
        apiKey: geminiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
      
      let requestContents: any;
      if (imageBase64) {
        const [mime, data] = imageBase64.split(',');
        requestContents = {
          parts: [
            { text: query || "Analyze this image." },
            {
              inlineData: {
                mimeType: mime.split(':')[1].split(';')[0],
                data: data
              }
            }
          ]
        };
      } else {
        requestContents = query;
      }

      let result;
      // Primary model (Gemini 3.5 Flash is highly versatile and recommended for Q&A)
      try {
        result = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: requestContents,
          config: {
            systemInstruction: systemPrompt
          }
        });
      } catch (innerError: any) {
        console.warn("[Chatbot API] Primary model (gemini-3.5-flash) failed, trying fallback 1 (gemini-flash-latest):", innerError.message);
        // Fallback 1: Try general stable alias 'gemini-flash-latest'
        try {
          result = await ai.models.generateContent({
            model: "gemini-flash-latest",
            contents: requestContents,
            config: {
              systemInstruction: systemPrompt
            }
          });
        } catch (fallback1Error: any) {
          console.warn("[Chatbot API] Fallback 1 (gemini-flash-latest) failed, trying fallback 2 (gemini-3.1-flash-lite):", fallback1Error.message);
          // Fallback 2: Try lightweight 'gemini-3.1-flash-lite'
          try {
            result = await ai.models.generateContent({
              model: "gemini-3.1-flash-lite",
              contents: requestContents,
              config: {
                systemInstruction: systemPrompt
              }
            });
          } catch (fallback2Error: any) {
            console.warn("[Chatbot API] Fallback 2 (gemini-3.1-flash-lite) failed, trying fallback 3 (gemini-3-flash-preview):", fallback2Error.message);
            // Fallback 3: Try 'gemini-3-flash-preview'
            try {
              result = await ai.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: requestContents,
                config: {
                  systemInstruction: systemPrompt
                }
              });
            } catch (fallback3Error: any) {
              console.warn("[Chatbot API] Fallback 3 (gemini-3-flash-preview) failed, trying fallback 4 (gemini-2.0-flash):", fallback3Error.message);
              // Fallback 4: Try 'gemini-2.0-flash' as a last resort
              try {
                result = await ai.models.generateContent({
                  model: "gemini-2.0-flash",
                  contents: requestContents,
                  config: {
                    systemInstruction: systemPrompt
                  }
                });
              } catch (fallback4Error: any) {
                console.error("[Chatbot API] All models failed. Final error:", fallback4Error.message);
                throw fallback4Error;
              }
            }
          }
        }
      }

      let text = result.text || "I am here to help with your studies. Could you please rephrase your question?";
      // Bolding is now supported on the frontend
      // text = text.replace(/\*\*/g, ''); 

      return res.json({ success: true, text });
    } catch (error: any) {
      console.error("[Chatbot API Error]:", error);
      const errorMessage = error.message || String(error);
      
      const isRateLimit = errorMessage.includes("429") || errorMessage.includes("Quota") || errorMessage.includes("RESOURCE_EXHAUSTED");
      const isHighDemand = errorMessage.includes("503") || errorMessage.includes("demand") || errorMessage.includes("UNAVAILABLE");

      if (isRateLimit || isHighDemand) {
        // More descriptive error for users
        let msg = "Daily AI quota reached for this key. Please try again tomorrow or use a different API key.";
        
        if (isHighDemand) {
          msg = "The AI is currently experiencing very high demand. Please try again in 5-10 minutes.";
        } else if (errorMessage.includes("PerMinute")) {
          msg = "The AI is temporarily busy. Please wait about 30-60 seconds and try again.";
        }
        
        return res.status(isHighDemand ? 503 : 429).json({ error: msg });
      }
      
      return res.status(500).json({ error: errorMessage });
    }
  });

  app.get("/api/health", (req, res) => res.json({ status: "ok" }));

  // --- LOCAL FILE FALLBACK DB HELPERS ---
  const getLocalFallbackPath = (table: string) => {
    return path.join(process.cwd(), `local_db_fallback_${table}.json`);
  };

  const readLocalFallback = (table: string): any[] => {
    const filePath = getLocalFallbackPath(table);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      console.error(`[Local DB Fallback] Error reading JSON file for ${table}:`, e);
      return [];
    }
  };

  const writeLocalFallback = (table: string, data: any[]) => {
    const filePath = getLocalFallbackPath(table);
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (e) {
      console.error(`[Local DB Fallback] Error writing JSON file for ${table}:`, e);
    }
  };

  const isTableNotFoundError = (error: any) => {
    if (!error) return false;
    const code = String(error.code || '');
    const msg = String(error.message || '');
    return code === 'PGRST205' || code === '42P01' || msg.includes("Could not find the table") || msg.includes("does not exist") || msg.includes("relation");
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
      videos: 'olympiad_videos',
      participants: 'olympiad_participants'
    };

    const table = tableMap[type as keyof typeof tableMap] || 'olympiad_events';

    try {
      if (method === 'GET') {
        let queryResult;
        try {
          const query = supabase.from(table).select('*');
          
          // Handle tables without created_at
          if (table !== 'olympiad_settings') {
            query.order('created_at', { ascending: false });
          }
          
          queryResult = await query;
        } catch (queryErr) {
          console.warn(`[Olympiad GET Catch] Table ${table} select caught error, falling back locally:`, queryErr);
          queryResult = { error: queryErr, data: null };
        }

        if (queryResult.error && isTableNotFoundError(queryResult.error)) {
          console.log(`[Olympiad GET Fallback] Detected missing table ${table}, serving from local JSON store`);
          let localData = readLocalFallback(table);
          if (table !== 'olympiad_settings') {
            localData.sort((a, b) => {
              const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
              const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
              return dateB - dateA;
            });
          }
          return res.json({ success: true, data: localData });
        } else if (queryResult.error) {
          console.error(`[Olympiad GET Error] ${table}:`, queryResult.error);
          throw queryResult.error;
        }
        
        return res.json({ success: true, data: queryResult.data || [] });
      }

      if (method === 'POST') {
        const body = req.body;
        if (!body || Object.keys(body).length === 0) {
          console.warn("[Olympiad POST] Empty body received");
          return res.status(400).json({ success: false, error: 'Empty request body' });
        }

        // Strip dummy IDs
        if (body.id && (String(body.id).startsWith('e') || String(body.id).startsWith('temp-'))) {
          delete body.id;
        }
        
        // Ensure settings have a fixed ID if not provided
        if (table === 'olympiad_settings' && !body.id) {
          body.id = 'default';
        }

        // Handle possible NOT NULL category column constraint inside the live database for olympiad_resources
        if (table === 'olympiad_resources') {
          body.category = 'Olympiad';
        }

        console.log(`[Olympiad POST] Saving to ${table}:`, JSON.stringify(body));

        let upsertResult;
        try {
          upsertResult = await supabase.from(table).upsert(body).select();
        } catch (upsertErr) {
          console.warn(`[Olympiad POST Catch] Table ${table} upsert caught error, falling back locally:`, upsertErr);
          upsertResult = { error: upsertErr, data: null };
        }

        if (upsertResult.error && isTableNotFoundError(upsertResult.error)) {
          console.log(`[Olympiad POST Fallback] Detected missing table ${table}, saving to local JSON store`);
          const localData = readLocalFallback(table);
          
          if (!body.id) {
            body.id = 'fallback-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now();
          }
          if (!body.created_at) {
            body.created_at = new Date().toISOString();
          }

          const existingIdx = localData.findIndex(item => item.id === body.id);
          if (existingIdx !== -1) {
            localData[existingIdx] = { ...localData[existingIdx], ...body };
          } else {
            localData.push(body);
          }
          
          writeLocalFallback(table, localData);
          return res.json({ success: true, data: body });
        } else if (upsertResult.error) {
          const error = upsertResult.error;
          console.error(`[Olympiad DB Error] ${table}:`, JSON.stringify(error));
          
          // If specific columns fail, try saving without them for settings
          if (table === 'olympiad_settings' && error.code === '42703') {
            const basicFields = { 
              id: body.id || 'default', 
              hero_title: body.hero_title, 
              hero_description: body.hero_description 
            };
            console.warn("[Olympiad] Retrying with basic fields due to missing columns:", error.message);
            const { data: retryData, error: retryError } = await supabase.from(table).upsert(basicFields).select();
            if (retryError) {
              console.error("[Olympiad Retry Error]:", retryError);
              throw retryError;
            }
            return res.json({ 
              success: true, 
              data: retryData ? retryData[0] : null, 
              warning: "Some advanced fields were not saved. Please verify database columns.",
              originalError: error.message 
            });
          }

          // Fallback if the database does not have the "category" column (code 42703 is undefined_column)
          if (table === 'olympiad_resources' && error.code === '42703' && 'category' in body) {
            console.warn("[Olympiad] Retrying resource save without 'category' column due to undefined_column error");
            const newBody = { ...body };
            delete newBody.category;
            const { data: retryData, error: retryError } = await supabase.from(table).upsert(newBody).select();
            if (retryError) {
              console.error("[Olympiad Resource Retry Error]:", retryError);
              throw retryError;
            }
            return res.json({ success: true, data: retryData ? retryData[0] : null });
          }

          throw error;
        }
        
        const data = upsertResult.data;
        if (!data || data.length === 0) {
           console.warn("[Olympiad POST] Upsert succeeded but returned no data");
           return res.json({ success: true, data: body });
        }

        return res.json({ success: true, data: data[0] });
      }

      if (method === 'DELETE') {
        const { olympiad_id } = req.query;
        if (id === 'all' && olympiad_id) {
          let deleteResult;
          try {
            deleteResult = await supabase.from(table).delete().eq('olympiad_id', olympiad_id);
          } catch (delErr) {
            deleteResult = { error: delErr };
          }
          if (deleteResult.error && isTableNotFoundError(deleteResult.error)) {
            let localData = readLocalFallback(table);
            localData = localData.filter(item => item.olympiad_id !== olympiad_id);
            writeLocalFallback(table, localData);
            return res.json({ success: true });
          } else if (deleteResult.error) {
            throw deleteResult.error;
          }
          return res.json({ success: true });
        }

        if (!id) return res.status(400).json({ success: false, error: 'Missing ID' });
        
        let deleteResult;
        try {
          deleteResult = await supabase.from(table).delete().eq('id', id);
        } catch (delErr) {
          console.warn(`[Olympiad DELETE Catch] Table ${table} delete caught error, falling back locally:`, delErr);
          deleteResult = { error: delErr };
        }

        if (deleteResult.error && isTableNotFoundError(deleteResult.error)) {
          console.log(`[Olympiad DELETE Fallback] Detected missing table ${table}, deleting from local JSON store`);
          let localData = readLocalFallback(table);
          localData = localData.filter(item => item.id !== id);
          writeLocalFallback(table, localData);
          return res.json({ success: true });
        } else if (deleteResult.error) {
          throw deleteResult.error;
        }
        
        return res.json({ success: true });
      }

      return res.status(405).json({ success: false, error: 'Method not allowed' });
    } catch (error: any) {
      console.error(`[Olympiad API Error Detail] ${method} ${table}:`, JSON.stringify(error));
      return res.status(500).json({ 
        success: false, 
        error: error.message || String(error),
        details: error.details || error.hint || 'Internal server error'
      });
    }
  });

  // --- Google Sheets Sync endpoint for Olympiad Certificates ---
  app.post("/api/olympiad-sync-sheet", async (req, res) => {
    try {
      const { sheetUrl, olympiadId } = req.body;
      if (!sheetUrl) return res.status(400).json({ success: false, error: "Missing sheetUrl" });
      if (!olympiadId) return res.status(400).json({ success: false, error: "Missing olympiadId" });

      // Extract Spreadsheet ID from Google Sheet URL
      let spreadsheetId = sheetUrl;
      if (sheetUrl.includes("docs.google.com/spreadsheets")) {
        const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (match) spreadsheetId = match[1];
      }

      // Export sheet as CSV directly to extract cellular information easily without Auth hurdles
      const exportUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
      console.log(`[Olympiad Sheet Sync] Fetching spreadsheet from export: ${exportUrl}`);
      
      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch spreadsheet. Please ensure the sheet is shared as "Anyone with the link can view" under Google Sheets share options.`);
      }

      const csvText = await response.text();
      // Simple custom CSV parser supporting multiline blocks or cells with quotes
      const rows = parseCSVText(csvText);
      
      if (rows.length < 2) {
        return res.status(422).json({ success: false, error: "Spreadsheet contains no data rows or column fields" });
      }

      // Clean header values and search map index placement
      const headers = rows[0].map(h => h.trim().toLowerCase());
      
      const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('student') || h.includes('নাম') || h.includes('ফুল নাম'));
      const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('mobile') || h.includes('contact') || h.includes('ফোন') || h.includes('মোবাইল'));
      const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail') || h.includes('ইমেইল'));
      const rollIdx = headers.findIndex(h => h.includes('roll') || h.includes('reg') || h.includes('id') || h.includes('রোল') || h.includes('আইডি'));
      const statusIdx = headers.findIndex(h => h.includes('status') || h.includes('type') || h.includes('অবস্থা') || h.includes('টাইপ') || h.includes('পদবী'));
      const rankIdx = headers.findIndex(h => h.includes('rank') || h.includes('place') || h.includes('position') || h.includes('র‍্যাংক') || h.includes('স্থান'));
      const instIdx = headers.findIndex(h => h.includes('institution') || h.includes('school') || h.includes('college') || h.includes('প্রতিষ্ঠান') || h.includes('স্কুল') || h.includes('university') || h.includes('ভার্সিটি'));
      const certCodeIdx = headers.findIndex(h => h.includes('cert') || h.includes('code') || h.includes('certificate') || h.includes('সার্টিফিকেট'));
      const classIdx = headers.findIndex(h => h.includes('class') || h.includes('শ্রেণী') || h.includes('শ্রেণি'));
      const groupIdx = headers.findIndex(h => h.includes('group') || h.includes('গ্রুপ'));

      if (nameIdx === -1) {
        return res.status(422).json({ success: false, error: "Could not find a 'Name' or 'Student' column in the header row" });
      }

      // Load current participants for this event to avoid changing pre-existing certificate_ids
      let existingParticipants: any[] = [];
      try {
        const { data } = await supabase.from('olympiad_participants').select('*').eq('olympiad_id', olympiadId);
        if (data) {
          existingParticipants = data;
        }
      } catch (e) {
        console.warn("[Olympiad Sync ID Stability] Could not query database for existing participants:", e);
      }
      if (existingParticipants.length === 0) {
        existingParticipants = readLocalFallback('olympiad_participants').filter((p: any) => p.olympiad_id === olympiadId);
      }

      const existingCertMap = new Map<string, string>();
      existingParticipants.forEach((p: any) => {
        if (p.certificate_id) {
          const k1 = `${p.name || ''}_${p.roll || ''}_${p.phone || ''}`.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          const k2 = `${p.name || ''}_${p.roll || ''}`.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          const k3 = `${p.name || ''}_${p.phone || ''}`.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
          if (k1) existingCertMap.set(k1, p.certificate_id);
          if (k2) existingCertMap.set(k2, p.certificate_id);
          if (k3) existingCertMap.set(k3, p.certificate_id);
        }
      });

      const generateStableId = (name: string, roll: string, phone: string): string => {
        const normName = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const normRoll = roll.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const normPhone = phone.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        
        const seed = `${olympiadId}-${normName}-${normRoll}-${normPhone}`;
        let hash = 0;
        for (let j = 0; j < seed.length; j++) {
          const char = seed.charCodeAt(j);
          hash = (hash << 5) - hash + char;
          hash = hash & hash;
        }
        const codeNum = 100000 + (Math.abs(hash) % 900000);
        return `PSO-${new Date().getFullYear()}-${codeNum}`;
      };

      const participantsToInsert = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row[nameIdx] || !row[nameIdx].trim()) continue;

        const studName = row[nameIdx].trim();
        const studPhone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx].trim() : '';
        const studRoll = rollIdx !== -1 && row[rollIdx] ? row[rollIdx].trim() : String(100 + i);

        // Check pre-existing map first to ensure stability!
        const lookupK1 = `${studName}_${studRoll}_${studPhone}`.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const lookupK2 = `${studName}_${studRoll}`.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        const lookupK3 = `${studName}_${studPhone}`.trim().toLowerCase().replace(/[^a-z0-9]/g, '');

        let customCode = '';
        if (certCodeIdx !== -1 && row[certCodeIdx] && row[certCodeIdx].trim()) {
          customCode = row[certCodeIdx].trim();
        } else if (existingCertMap.has(lookupK1)) {
          customCode = existingCertMap.get(lookupK1)!;
        } else if (existingCertMap.has(lookupK2)) {
          customCode = existingCertMap.get(lookupK2)!;
        } else if (existingCertMap.has(lookupK3)) {
          customCode = existingCertMap.get(lookupK3)!;
        } else {
          customCode = generateStableId(studName, studRoll, studPhone);
        }

        // Intelligent status construction combining class and group
        let statusVal = 'Contestant';
        if (statusIdx !== -1 && row[statusIdx]) {
          statusVal = row[statusIdx].trim();
        } else {
          const classVal = classIdx !== -1 && row[classIdx] ? `Class ${row[classIdx].trim()}` : '';
          const groupVal = groupIdx !== -1 && row[groupIdx] ? `Group ${row[groupIdx].trim()}` : '';
          if (classVal && groupVal) {
            statusVal = `Contestant (${classVal}, ${groupVal})`;
          } else if (classVal) {
            statusVal = `Contestant (${classVal})`;
          } else if (groupVal) {
            statusVal = `Contestant (${groupVal})`;
          }
        }

        participantsToInsert.push({
          olympiad_id: olympiadId,
          name: studName,
          phone: studPhone || null,
          email: emailIdx !== -1 && row[emailIdx] ? row[emailIdx].trim() : null,
          roll: studRoll,
          status: statusVal,
          rank: rankIdx !== -1 && row[rankIdx] ? row[rankIdx].trim() : null,
          institution: instIdx !== -1 && row[instIdx] ? row[instIdx].trim() : null,
          certificate_id: customCode
        });
      }

      console.log(`[Olympiad Sheet Sync] Parsed ${participantsToInsert.length} participants to import`);

      // Avoid duplication by deleting older references of this event ID first
      let deleteError = null;
      try {
        const resDel = await supabase.from('olympiad_participants').delete().eq('olympiad_id', olympiadId);
        deleteError = resDel.error;
      } catch (delErr) {
        deleteError = delErr;
      }

      let isSheetLocalFallback = false;
      if (deleteError && isTableNotFoundError(deleteError)) {
        isSheetLocalFallback = true;
        console.log("[Olympiad Sync delete fallback] Table 'olympiad_participants' missing; switching directly to local store fallback");
        let localData = readLocalFallback('olympiad_participants');
        localData = localData.filter(p => p.olympiad_id !== olympiadId);
        
        // Add parsed student rows
        for (let i = 0; i < participantsToInsert.length; i++) {
          const participant = participantsToInsert[i];
          if (!participant.id) {
            participant.id = 'fallback-part-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now() + '-' + i;
          }
          localData.push(participant);
        }
        writeLocalFallback('olympiad_participants', localData);
      } else if (deleteError) {
        console.warn("[Olympiad Sync deleteWarning]:", deleteError);
      }

      let insertedCount = participantsToInsert.length;

      if (!isSheetLocalFallback) {
        // Upsert/Insert records in bulk
        let bulkResult;
        try {
          bulkResult = await supabase.from('olympiad_participants').insert(participantsToInsert).select();
        } catch (insertErr) {
          bulkResult = { error: insertErr, data: null };
        }

        if (bulkResult.error) {
          if (isTableNotFoundError(bulkResult.error)) {
            console.log("[Olympiad Sync insert fallback] Table 'olympiad_participants' missing; saving to local store");
            let localData = readLocalFallback('olympiad_participants');
            localData = localData.filter(p => p.olympiad_id !== olympiadId);
            
            for (let i = 0; i < participantsToInsert.length; i++) {
              const participant = participantsToInsert[i];
              participant.id = 'fallback-part-' + Math.random().toString(36).substr(2, 9) + '-' + Date.now() + '-' + i;
              localData.push(participant);
            }
            writeLocalFallback('olympiad_participants', localData);
          } else {
            console.error("[Olympiad Bulk Insert Error]:", bulkResult.error);
            throw bulkResult.error;
          }
        } else {
          insertedCount = bulkResult.data?.length || participantsToInsert.length;
        }
      }

      return res.json({ 
        success: true, 
        count: insertedCount,
        message: `Successfully synchronized ${insertedCount} participants from spreadsheet!` 
      });

    } catch (err: any) {
      console.error("[Olympiad Sheet Sync Server error]:", err);
      return res.status(500).json({ success: false, error: err.message || "Spreadsheet sync failed" });
    }
  });

  // Custom parser helper to safely read cells and characters enclosed in quotes
  function parseCSVText(text: string): string[][] {
    const lines = text.split(/\r?\n/);
    const rows: string[][] = [];
    
    for (let line of lines) {
      if (!line.trim()) continue;
      const row: string[] = [];
      let insideQuote = false;
      let currentCell = "";
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          insideQuote = !insideQuote;
        } else if (char === ',' && !insideQuote) {
          row.push(currentCell.replace(/^"|"$/g, '').trim());
          currentCell = "";
        } else {
          currentCell += char;
        }
      }
      row.push(currentCell.replace(/^"|"$/g, '').trim());
      rows.push(row);
    }
    return rows;
  }

  // --- 3. DIRECT ATTENDANCE API ---
  app.post("/api/attendance", async (req, res) => {
    const { query, body } = req;
    const action = query.action;
    
    console.log(`[API/Attendance] Direct save request. Action: ${action}`);

    try {
      if (action === 'save') {
        const { batch, subject, teacher, lecture_date, students, attendance_status, updates } = body;
        
        if (!lecture_date) {
          return res.status(400).json({ success: false, error: "lecture_date is required" });
        }

        console.log(`[API/Attendance] Saving to Supabase: ${lecture_date} for ${batch}`);

        // 1. Save log to 'attendance' table
        const { error: logError } = await supabase.from('attendance').insert({
          batch: batch || 'All',
          subject: subject || 'General',
          teacher: teacher || 'Unknown',
          lecture_date,
          students: students || [],
          attendance_status: attendance_status || {},
          created_at: new Date().toISOString()
        });

        if (logError) {
          console.error("[API/Attendance] Log Save Error:", logError);
        }

        // 2. Direct upsert to 'students' table for aggregated stats
        if (updates && Array.isArray(updates)) {
          // Clean updates and filter out records missing required NOT NULL fields (id, name, email)
          const validUpdates = updates
            .filter((u: any) => u.id && u.name && u.email)
            .map((u: any) => ({
              id: u.id,
              name: u.name,
              email: u.email,
              batch: u.batch || 'All',
              daily_attendance: u.daily_attendance || u.dailyAttendance || {},
              attendance: u.attendance !== undefined ? u.attendance : 0,
              updated_at: new Date().toISOString()
            }));
          
          const invalidCount = updates.length - validUpdates.length;
          if (invalidCount > 0) {
            console.warn(`[API/Attendance] Warning: ${invalidCount} student records skipped due to missing ID, Name or Email`);
          }

          if (validUpdates.length > 0) {
            console.log(`[API/Attendance] Upserting ${validUpdates.length} valid student stats to Supabase...`);
            const { error: studentError } = await supabase.from('students').upsert(validUpdates);
            if (studentError) {
              console.error("[API/Attendance] SUPABASE UPSERT ERROR:", studentError);
              // Log the first failing record if possible for debugging
              if (validUpdates.length > 0) {
                console.log("[API/Attendance] Sample failing record:", JSON.stringify(validUpdates[0]));
              }
              return res.status(500).json({ success: false, error: `Student database sync failed: ${studentError.message}` });
            }
          } else {
            console.warn("[API/Attendance] No valid student updates identified in payload after filtering");
          }
        }

        return res.json({ success: true, message: "Attendance saved successfully" });
      }

      return res.status(400).json({ success: false, error: "Invalid action" });
    } catch (err: any) {
      console.error("[API/Attendance] Server Error:", err);
      return res.status(500).json({ success: false, error: String(err.message || err) });
    }
  });

  app.get("/api/attendance", async (req, res) => {
    const { data, error } = await supabase.from('students').select('*', { count: 'exact' });
    return res.json({ connected: !error, count: data?.length || 0 });
  });

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
  if (isEffectiveProd && fs.existsSync(distPath) && !process.env.VERCEL) {
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
  // Skip this on Vercel as vercel.json rewrites handle it natively
  if (!process.env.VERCEL) {
    app.use((req, res, next) => {
      // Only handle GET requests that don't start with /api
      if (req.method !== 'GET' || req.path.startsWith('/api')) {
        return next();
      }

      // Skip if it looks like a file request (has a dot in the suffix but isn't .html)
      // We check the last segment to distinguish between /foo.bar (file) and /foo/bar (nested path)
      const lastSegment = req.path.split('/').pop() || '';
      if (lastSegment.includes('.') && !lastSegment.endsWith('.html')) {
        return next();
      }

      console.log(`[Server] SPA Fallback for path: ${req.path}`);

      // Try sending index.html from dist first, then from root
      // In Vercel, dist might be the build output but sometimes we need to serve root index.html
      if (fs.existsSync(indexPath)) {
        return res.sendFile(indexPath);
      }

      const rootIndex = path.join(process.cwd(), 'index.html');
      if (fs.existsSync(rootIndex)) {
        return res.sendFile(rootIndex);
      }

      next();
    });
  }

  // FINAL CATCH-ALL for any missed API requests or non-GET requests
  // This prevents HTML responses for failed POST/PUT/DELETE calls
  app.all(/^\/api(\/.*)?$/, (req, res) => {
    if (res.headersSent) return;
    console.log(`[Server] 404 Catch-all (API): ${req.method} ${req.url}`);
    res.status(404).json({ error: "API Route Not Found", path: req.path });
  });

  // Final catch-all for any other unhandled routes (everything else is a 404)
  app.use((req, res) => {
    if (res.headersSent) return;
    console.log(`[Server] 404 Catch-all (Final): ${req.method} ${req.url}`);
    if (req.path.startsWith('/api')) {
        res.status(404).json({ error: "Not Found", path: req.path });
    } else {
        res.status(404).send("Not Found");
    }
  });
  // Global Error Handler
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Error Caught:", err);
    if (res.headersSent) return next(err);
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
}

startServer().catch(err => {
  console.error("Failed to start server:", err);
});

// Global process handlers
process.on('unhandledRejection', (reason) => {
  console.error('[Process] Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[Process] Uncaught Exception:', err);
});

export default app;
