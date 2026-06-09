import express from 'express';
import pool from '../db.js';

const router = express.Router();

const LOGO_KEY = 'site_logo';
// Generous cap on the stored data-URL string (base64 inflates the raw file ~1.37x).
const MAX_LOGO_LEN = 4 * 1024 * 1024;

// ─── GET /api/settings/logo ───────────────────────────────────────────────────
// Returns the uploaded site logo as a data URL, or null if none has been set.
router.get('/logo', async (_req, res) => {
  try {
    const result = await pool.query('SELECT value FROM settings WHERE key = $1', [LOGO_KEY]);
    return res.json({ success: true, data: { logo: result.rows[0]?.value ?? null } });
  } catch (err) {
    console.error('GET /api/settings/logo error:', err);
    return res.status(500).json({ success: false, error: 'Failed to load logo.' });
  }
});

// ─── PUT /api/settings/logo ───────────────────────────────────────────────────
// Upload / replace the site logo. Body: { logo: "data:image/...;base64,..." }
router.put('/logo', async (req, res) => {
  try {
    const { logo } = req.body || {};

    if (typeof logo !== 'string' || !logo.startsWith('data:image/')) {
      return res.status(400).json({ success: false, error: 'Logo must be an image data URL.' });
    }
    if (logo.length > MAX_LOGO_LEN) {
      return res.status(413).json({ success: false, error: 'Logo is too large. Please use an image under 2MB.' });
    }

    await pool.query(
      `INSERT INTO settings (key, value, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()`,
      [LOGO_KEY, logo]
    );

    console.log('🖼️  Site logo updated.');
    return res.json({ success: true, data: { logo } });
  } catch (err) {
    console.error('PUT /api/settings/logo error:', err);
    return res.status(500).json({ success: false, error: 'Failed to save logo.' });
  }
});

// ─── DELETE /api/settings/logo ────────────────────────────────────────────────
// Remove the custom logo (reverts the site to the default badge logo).
router.delete('/logo', async (_req, res) => {
  try {
    await pool.query('DELETE FROM settings WHERE key = $1', [LOGO_KEY]);
    console.log('🗑️  Site logo reset to default.');
    return res.json({ success: true });
  } catch (err) {
    console.error('DELETE /api/settings/logo error:', err);
    return res.status(500).json({ success: false, error: 'Failed to remove logo.' });
  }
});

export default router;
