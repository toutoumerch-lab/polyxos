import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import pool from '../db.js';
import { requireAdminAuth } from '../auth.js';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const localUploadsDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'portfolio');

// ─── Cloudinary / Local Multer Setup ──────────────────────────────────────────
const useCloudinary = !!process.env.CLOUDINARY_CLOUD_NAME;

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

let storage;
if (useCloudinary) {
  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
      return {
        folder: 'polyxos/portfolio',
        allowed_formats: ['png', 'jpg', 'jpeg', 'svg', 'webp'],
      };
    },
  });
} else {
  if (!fs.existsSync(localUploadsDir)) {
    fs.mkdirSync(localUploadsDir, { recursive: true });
  }
  storage = multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, localUploadsDir),
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname) || '.png';
      cb(null, `project-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });
}

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Max 10MB
});

// ─── GET /api/portfolio ───────────────────────────────────────────────────────
// Fetch project items with search, category filtering, and admin show-all mode
router.get('/', async (req, res) => {
  try {
    const { category, search, all } = req.query;
    let query = 'SELECT * FROM portfolio_projects';
    const conditions = [];
    const params = [];
    let paramIndex = 1;

    // Filter by active / all status
    if (all !== 'true') {
      // (Optionally add an active field to projects, but we will default to display all projects)
    }

    if (category) {
      conditions.push(`category = $${paramIndex}`);
      params.push(category);
      paramIndex++;
    }

    if (search) {
      conditions.push(`(title ILIKE $${paramIndex} OR description ILIKE $${paramIndex} OR $${paramIndex} = ANY(tags))`);
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY display_order ASC, completion_date DESC, id DESC';

    const result = await pool.query(query, params);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('GET /api/portfolio error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch portfolio projects.' });
  }
});

// ─── POST /api/portfolio ──────────────────────────────────────────────────────
// Create new project
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const {
      title, category, description, cover_image, gallery_images,
      tags, live_url, github_url, completion_date, featured, display_order
    } = req.body;

    if (!title || !category || !description || !cover_image) {
      return res.status(400).json({ success: false, error: 'Title, category, description, and cover image are required.' });
    }

    const result = await pool.query(
      `INSERT INTO portfolio_projects (
        title, category, description, cover_image, gallery_images,
        tags, live_url, github_url, completion_date, featured, display_order
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        title.trim(),
        category.trim(),
        description.trim(),
        cover_image,
        gallery_images || [],
        tags || [],
        live_url ? live_url.trim() : null,
        github_url ? github_url.trim() : null,
        completion_date || null,
        featured === true,
        parseInt(display_order) || 0
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('POST /api/portfolio error:', err);
    res.status(500).json({ success: false, error: 'Failed to create portfolio project.' });
  }
});

// ─── POST /api/portfolio/upload ───────────────────────────────────────────────
// Upload a file to return its URL (can be used for cover image or gallery images)
router.post('/upload', requireAdminAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const fileUrl = useCloudinary
      ? req.file.path
      : `/uploads/portfolio/${req.file.filename}`;

    res.json({ success: true, url: fileUrl });
  } catch (err) {
    console.error('POST /api/portfolio/upload error:', err);
    res.status(500).json({ success: false, error: 'File upload failed.' });
  }
});

// ─── PATCH /api/portfolio/reorder ─────────────────────────────────────────────
router.patch('/reorder', requireAdminAuth, async (req, res) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, error: 'Orders array is required.' });
    }

    await pool.query('BEGIN');
    for (const item of orders) {
      await pool.query(
        'UPDATE portfolio_projects SET display_order = $1 WHERE id = $2',
        [parseInt(item.display_order), item.id]
      );
    }
    await pool.query('COMMIT');

    res.json({ success: true, message: 'Projects reordered successfully.' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('PATCH /api/portfolio/reorder error:', err);
    res.status(500).json({ success: false, error: 'Failed to reorder projects.' });
  }
});

// ─── PATCH /api/portfolio/:id ─────────────────────────────────────────────────
router.patch('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, category, description, cover_image, gallery_images,
      tags, live_url, github_url, completion_date, featured, display_order
    } = req.body;

    const fields = [];
    const params = [];
    let paramIndex = 1;

    const addField = (name, value) => {
      if (value !== undefined) {
        fields.push(`${name} = $${paramIndex}`);
        params.push(value);
        paramIndex++;
      }
    };

    addField('title', title?.trim());
    addField('category', category?.trim());
    addField('description', description?.trim());
    addField('cover_image', cover_image);
    if (gallery_images !== undefined) addField('gallery_images', gallery_images);
    if (tags !== undefined) addField('tags', tags);
    addField('live_url', live_url !== undefined ? (live_url ? live_url.trim() : null) : undefined);
    addField('github_url', github_url !== undefined ? (github_url ? github_url.trim() : null) : undefined);
    if (completion_date !== undefined) addField('completion_date', completion_date || null);
    if (featured !== undefined) addField('featured', featured);
    if (display_order !== undefined) addField('display_order', parseInt(display_order));

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update.' });
    }

    params.push(id);
    const query = `UPDATE portfolio_projects SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('PATCH /api/portfolio/:id error:', err);
    res.status(500).json({ success: false, error: 'Failed to update project.' });
  }
});

// ─── DELETE /api/portfolio/:id ────────────────────────────────────────────────
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    // Optional: Delete local files if local storage is used and stored in DB
    const selectRes = await pool.query('SELECT cover_image, gallery_images FROM portfolio_projects WHERE id = $1', [id]);
    if (selectRes.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    const project = selectRes.rows[0];

    // Proceed to delete database record
    await pool.query('DELETE FROM portfolio_projects WHERE id = $1', [id]);

    // Cleanup local files
    if (!useCloudinary) {
      const allFiles = [project.cover_image, ...(project.gallery_images || [])];
      allFiles.forEach(fileUrl => {
        if (fileUrl && fileUrl.startsWith('/uploads/portfolio/')) {
          const fileName = fileUrl.split('/').pop();
          const filePath = path.join(localUploadsDir, fileName);
          if (fs.existsSync(filePath)) {
            try { fs.unlinkSync(filePath); } catch (e) { console.error('Clean-file fail:', e); }
          }
        }
      });
    } else {
      // Cloudinary delete cover image
      if (project.cover_image && project.cover_image.includes('cloudinary.com')) {
        const publicId = project.cover_image.split('/').slice(-2).join('/').split('.')[0];
        try { await cloudinary.uploader.destroy(publicId); } catch (e) { console.error('Cloudinary delete error:', e); }
      }
    }

    res.json({ success: true, message: `Project ${id} deleted.` });
  } catch (err) {
    console.error('DELETE /api/portfolio/:id error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete project.' });
  }
});

export default router;
