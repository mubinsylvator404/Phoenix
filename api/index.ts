import app from '../server.js';

console.log("[Vercel] api/index.ts initialized");

export default (req: any, res: any) => {
  try {
    return app(req, res);
  } catch (err) {
    console.error("[Vercel] Error in Express handler:", err);
    res.status(500).json({ error: "Internal Server Error in Handler", message: err instanceof Error ? err.message : String(err) });
  }
};
