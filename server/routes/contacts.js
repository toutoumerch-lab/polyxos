import express from 'express';
import pool from '../db.js';

const router = express.Router();

// ─── POST /api/contacts ───────────────────────────────────────────────────────
// Submit a new contact form message
router.post('/', async (req, res) => {
  try {
    const { name, email, service, message } = req.body;

    // Basic validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required.',
      });
    }

    // Simple email format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address.',
      });
    }

    const rawIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    const ipAddress = rawIp.split(',')[0].trim().substring(0, 50);

    const result = await pool.query(
      `INSERT INTO contacts (name, email, service, message, ip_address)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, service, status, created_at`,
      [name.trim(), email.toLowerCase().trim(), service || null, message.trim(), ipAddress]
    );

    const contact = result.rows[0];
    console.log(`📩 New contact: [${contact.id}] ${contact.name} <${contact.email}>`);

    return res.status(201).json({
      success: true,
      message: 'Message received! We\'ll get back to you within 24 hours.',
      data: contact,
    });
  } catch (err) {
    console.error('POST /api/contacts error:', err);
    return res.status(500).json({
      success: false,
      error: 'Something went wrong. Please try again later.',
    });
  }
});

// ─── GET /api/contacts ────────────────────────────────────────────────────────
// List all contact submissions (admin use)
router.get('/', async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    let query = `SELECT id, name, email, service, message, status, created_at
                 FROM contacts`;
    const params = [];

    if (status) {
      params.push(status);
      query += ` WHERE status = $${params.length}`;
    }

    params.push(parseInt(limit));
    params.push(parseInt(offset));
    query += ` ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`;

    const result = await pool.query(query, params);

    // Total count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM contacts${status ? ' WHERE status = $1' : ''}`,
      status ? [status] : []
    );

    return res.json({
      success: true,
      data: result.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (err) {
    console.error('GET /api/contacts error:', err);
    return res.status(500).json({ success: false, error: 'Failed to fetch contacts.' });
  }
});

// ─── PATCH /api/contacts/:id ──────────────────────────────────────────────────
// Update status (new → read → replied)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowed = ['new', 'read', 'replied', 'archived'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, error: `Status must be one of: ${allowed.join(', ')}` });
    }

    const result = await pool.query(
      `UPDATE contacts SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Contact not found.' });
    }

    return res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('PATCH /api/contacts error:', err);
    return res.status(500).json({ success: false, error: 'Failed to update contact.' });
  }
});

// ─── DELETE /api/contacts/:id ─────────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Contact not found.' });
    }

    return res.json({ success: true, message: `Contact ${id} deleted.` });
  } catch (err) {
    console.error('DELETE /api/contacts error:', err);
    return res.status(500).json({ success: false, error: 'Failed to delete contact.' });
  }
});

export default router;
