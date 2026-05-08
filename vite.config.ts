import path from 'path';
import { fileURLToPath } from 'url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    
    // Ensure we pick up system env vars (like those in Vercel)
    const GEMINI_KEY = env.VITE_GEMINI_API_KEY || env.GEMINI_API_KEY || env.VITE_GOOGLE_AI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || process.env.VITE_GOOGLE_AI_API_KEY || process.env.API_KEY || "";

    return {
      base: '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.GEMINI_API_KEY': JSON.stringify(GEMINI_KEY),
        'process.env.VITE_GOOGLE_AI_API_KEY': JSON.stringify(GEMINI_KEY),
        'process.env.VITE_GEMINI_API_KEY': JSON.stringify(GEMINI_KEY),
        'process.env.API_KEY': JSON.stringify(GEMINI_KEY),
        // Also inject into import.meta.env for extra stability
        'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(GEMINI_KEY),
        'import.meta.env.VITE_GOOGLE_AI_API_KEY': JSON.stringify(GEMINI_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
