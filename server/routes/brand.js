import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import pool from '../db.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const router = express.Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localBrandDir = path.join(__dirname, '..', '..', 'public', 'brand');

// ─── Cloudinary Configuration ─────────────────────────────────────────────────
const useCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// ─── Storage Configuration ────────────────────────────────────────────────────
let storage;
if (useCloudinary) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      const type = req.params.type; // 'logo' or 'favicon'
      return {
        folder: 'polyxos/brand',
        public_id: type, // overwrites the same image on cloudinary
        allowed_formats: ['png', 'jpg', 'jpeg', 'svg', 'webp', 'ico'],
      };
    },
  });
} else {
  if (!fs.existsSync(localBrandDir)) fs.mkdirSync(localBrandDir, { recursive: true });
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, localBrandDir),
    filename: (req, _file, cb) => {
      cb(null, req.params.type === 'favicon' ? 'favicon.png' : 'logo.png');
    },
  });
}

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ─── In-memory brand cache (avoids hitting FS/DB on every page load) ──────────
let _brandCache = null;
let _brandCacheTs = 0;
const BRAND_CACHE_TTL = 60_000; // 60 seconds

// ─── GET /api/brand ───────────────────────────────────────────────────────────
router.get('/', async (req, res) => {
  // Serve from memory cache if fresh
  if (_brandCache && (Date.now() - _brandCacheTs) < BRAND_CACHE_TTL) {
    res.set('Cache-Control', 'public, max-age=60');
    return res.json(_brandCache);
  }

  try {
    let logoExists = false;
    let faviconExists = false;
    let logoUrl = null;
    let faviconUrl = null;

    if (useCloudinary) {
      const result = await pool.query("SELECT key, value FROM settings WHERE key IN ('logo', 'favicon')");
      result.rows.forEach(row => {
        if (row.key === 'logo')    { logoExists = !!row.value;    logoUrl    = row.value; }
        if (row.key === 'favicon') { faviconExists = !!row.value; faviconUrl = row.value; }
      });
    } else {
      const logoPath    = path.join(localBrandDir, 'logo.png');
      const faviconPath = path.join(localBrandDir, 'favicon.png');
      logoExists    = fs.existsSync(logoPath);
      faviconExists = fs.existsSync(faviconPath);
      if (logoExists)    logoUrl    = `/brand/logo.png?t=${Date.now()}`;
      if (faviconExists) faviconUrl = `/brand/favicon.png?t=${Date.now()}`;
    }

    const payload = {
      success: true,
      data: {
        logo:    { exists: logoExists,    url: logoUrl,    size: null },
        favicon: { exists: faviconExists, url: faviconUrl, size: null },
      },
    };

    // Cache the result
    _brandCache   = payload;
    _brandCacheTs = Date.now();

    res.set('Cache-Control', 'public, max-age=60');
    res.json(payload);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ─── POST /api/brand/:type ────────────────────────────────────────────────────
router.post('/:type', (req, res) => {
  const { type } = req.params;
  if (!['logo', 'favicon'].includes(type)) return res.status(400).json({ success: false, error: 'Invalid type.' });

  upload.single('image')(req, res, async (err) => {
    if (err) return res.status(400).json({ success: false, error: err.message });
    if (!req.file) return res.status(400).json({ success: false, error: 'No image file.' });

    // Bust server-side cache so next GET reflects the new asset
    _brandCache = null;
    _brandCacheTs = 0;

    try {
      // req.file.path is the secure URL from Cloudinary when using multer-storage-cloudinary
      const url = useCloudinary ? req.file.path : `/brand/${type === 'favicon' ? 'favicon' : 'logo'}.png?t=${Date.now()}`;
      
      if (useCloudinary) {
        // Save URL to DB so frontend knows where to fetch it
        await pool.query(
          `INSERT INTO settings (key, value) VALUES ($1, $2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
          [type, url]
        );
      }

      res.json({
        success: true,
        data: { url, filename: req.file.filename || req.file.originalname, size: req.file.size }
      });
    } catch (dbErr) {
      res.status(500).json({ success: false, error: dbErr.message });
    }
  });
});

// ─── DELETE /api/brand/:type ──────────────────────────────────────────────────
router.delete('/:type', async (req, res) => {
  const { type } = req.params;
  // Bust server-side cache so next GET reflects the deletion
  _brandCache = null;
  _brandCacheTs = 0;
  try {
    if (useCloudinary) {
      await cloudinary.uploader.destroy(`polyxos/brand/${type}`);
      await pool.query('DELETE FROM settings WHERE key = $1', [type]);
    } else {
      const filePath = path.join(localBrandDir, type === 'favicon' ? 'favicon.png' : 'logo.png');
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ success: true, message: 'Deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
