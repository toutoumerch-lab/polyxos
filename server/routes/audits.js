import express from 'express';
import pool from '../db.js';

const router = express.Router();

// ─── POST /api/audits ─────────────────────────────────────────────────────────
// Submit a new website audit request
router.post('/', async (req, res) => {
  try {
    const { name, email, website_url } = req.body;

    // Validation
    if (!name || !email || !website_url) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and website URL are required.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email address.' });
    }

    // Ensure URL has a protocol
    let url = website_url.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = `https://${url}`;
    }

    const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

    const result = await pool.query(
      `INSERT INTO audit_requests (name, email, website_url, ip_address)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, website_url, status, created_at`,
      [name.trim(), email.toLowerCase().trim(), url, ipAddress]
    );

    const audit = result.rows[0];
    console.log(`🔍 New audit request: [${audit.id}] ${audit.name} — ${audit.website_url}`);

    return res.status(201).json({
      success: true,
      message: 'Audit request received! We\'ll start your audit within 48 hours.',
      data: audit,
    });
  } catch (err) {
    console.error('POST /api/audits error:', err);
    return res.status(500).json({ success: false, error: 'Something went wrong. Please try again.' });
  }
});

// ─── GET /api/audits ──────────────────────────────────────────────────────────
// List all audit requests
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `SELECT id, name, email, website_url, status, notes, created_at
                 FROM audit_requests`;
    const params = [];

    if (status) {
      params.push(status);
      query += ` WHERE status = $${params.length}`;
    }

    params.push(parseInt(limit));
    params.push(parseInt(offset));
    query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM audit_requests${status ? ' WHERE status = $1' : ''}`,
      status ? [status] : []
    );

    return res.json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (err) {
    console.error('GET /api/audits error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch audit requests.' });
  }
});

// ─── PATCH /api/audits/:id ────────────────────────────────────────────────────
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const allowed = ['pending', 'in_progress', 'completed', 'archived'];
    if (status && !allowed.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${allowed.join(', ')}` });
    }

    const fields = [];
    const values = [];

    if (status) { fields.push(`status = $${fields.length + 1}`); values.push(status); }
    if (notes !== undefined) { fields.push(`notes = $${fields.length + 1}`); values.push(notes); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update.' });
    }

    values.push(id);
    const result = await pool.query(
      `UPDATE audit_requests SET ${fields.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Audit request not found.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('PATCH /api/audits error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update audit request.' });
  }
});

export default router;
