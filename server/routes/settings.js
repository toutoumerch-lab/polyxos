import express from 'express';
import pool from '../db.js';
import { requireAdminAuth } from '../auth.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

// ─── POST /api/settings/verify-auth ───────────────────────────────────────────
// Check if the provided password is correct
router.post('/verify-auth', (req, res) => {
  const { password } = req.body;
  if (!password) {
    return res.status(400).json({ success: false, error: 'Password is required.' });
  }
  if (password === ADMIN_PASSWORD) {
    return res.json({ success: true, token: ADMIN_PASSWORD });
  }
  return res.status(401).json({ success: false, error: 'Invalid password.' });
});

// ─── GET /api/settings ────────────────────────────────────────────────────────
// Public route to get general frontend settings (like GA4 Measurement ID)
router.get('/', async (req, res) => {
  try {
    const keys = ['ga4_measurement_id'];
    const result = await pool.query('SELECT key, value FROM settings WHERE key = ANY($1)', [keys]);
    
    const settingsObj = {};
    keys.forEach(k => { settingsObj[k] = ''; });
    result.rows.forEach(row => {
      settingsObj[row.key] = row.value;
    });

    res.json({ success: true, data: settingsObj });
  } catch (err) {
    console.error('GET /api/settings error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch settings.' });
  }
});

// ─── GET /api/settings/admin ──────────────────────────────────────────────────
// Admin route to fetch all settings (including private keys for Google Analytics Data API)
router.get('/admin', requireAdminAuth, async (req, res) => {
  try {
    const keys = ['ga4_measurement_id', 'ga4_property_id', 'ga4_client_email', 'ga4_private_key'];
    const result = await pool.query('SELECT key, value FROM settings WHERE key = ANY($1)', [keys]);

    const settingsObj = {};
    keys.forEach(k => { settingsObj[k] = ''; });
    result.rows.forEach(row => {
      settingsObj[row.key] = row.value;
    });

    res.json({ success: true, data: settingsObj });
  } catch (err) {
    console.error('GET /api/settings/admin error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch admin settings.' });
  }
});

// ─── POST /api/settings/admin ─────────────────────────────────────────────────
// Admin route to update settings
router.post('/admin', requireAdminAuth, async (req, res) => {
  try {
    const settings = req.body; // Object with key-value pairs
    if (typeof settings !== 'object' || settings === null) {
      return res.status(400).json({ success: false, error: 'Invalid settings object.' });
    }

    await pool.query('BEGIN');
    for (const [key, value] of Object.entries(settings)) {
      const sanitizedKey = key.trim().toLowerCase();
      const allowedKeys = ['ga4_measurement_id', 'ga4_property_id', 'ga4_client_email', 'ga4_private_key'];
      if (!allowedKeys.includes(sanitizedKey)) continue;

      await pool.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
        [sanitizedKey, value !== undefined ? String(value) : '']
      );
    }
    await pool.query('COMMIT');

    res.json({ success: true, message: 'Settings updated successfully.' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('POST /api/settings/admin error:', err);
    res.status(500).json({ success: false, error: 'Failed to update settings.' });
  }
});

export default router;
