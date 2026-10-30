import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import apiRouter from './backend/routes/api.ts';
import { initializeDatabase } from './backend/config/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Security Headers & Cross-Origin
app.use(
  helmet({
    contentSecurityPolicy: false, // Vite inline scripts and styles
    crossOriginEmbedderPolicy: false,
  })
);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'NexusAI Enterprise Platform',
    gemini_key_configured: !!process.env.GEMINI_API_KEY
  });
});

// Mount Central API Routes
app.use('/api', apiRouter);

// Central API Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Unhandled Server Exception:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Enterprise Server Error',
    requestId: req.headers['x-request-id'] || undefined
  });
});

async function startServer() {
  // Initialize Database & Seed Records
  await initializeDatabase();

  if (!isProduction) {
    // Mount Vite middleware in development
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('⚡ Vite dev server middleware mounted.');
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log(`📦 Serving production build from ${distPath}`);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 NexusAI Enterprise Server active on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error('FATAL: Server startup failed:', error);
  process.exit(1);
});
