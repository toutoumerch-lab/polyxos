import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import contactsRouter from './routes/contacts.js';
import auditsRouter from './routes/audits.js';
import brandRouter from './routes/brand.js';
import servicesRouter from './routes/services.js';
import portfolioRouter from './routes/portfolio.js';
import technologiesRouter from './routes/technologies.js';
import settingsRouter from './routes/settings.js';
import analyticsRouter from './routes/analytics.js';
import { seedDatabase } from './scripts/seedData.js';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
  ],
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));

// Serve uploaded brand assets (public/brand/) as static files
app.use('/brand', express.static(path.join(__dirname, '..', 'public', 'brand')));
// Serve uploaded portfolio assets as static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

// Request logger (dev only)
if (process.env.NODE_ENV !== 'production') {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
  });
}

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Polyxos API',
    version: '1.0.0',
  });
});

app.use('/api/contacts',     contactsRouter);
app.use('/api/audits',       auditsRouter);
app.use('/api/brand',        brandRouter);
app.use('/api/services',     servicesRouter);
app.use('/api/portfolio',    portfolioRouter);
app.use('/api/technologies', technologiesRouter);
app.use('/api/settings',     settingsRouter);
app.use('/api/analytics',    analyticsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: 'Internal server error.' });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 Polyxos API Server');
  console.log(`   Local:   http://localhost:${PORT}`);
  console.log(`   Health:  http://localhost:${PORT}/api/health`);
  console.log('');
  
  // Seed the database with default website values if empty
  seedDatabase();
});
