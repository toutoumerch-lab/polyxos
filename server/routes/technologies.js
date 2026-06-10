import express from 'express';
import pool from '../db.js';
import { requireAdminAuth } from '../auth.js';

const router = express.Router();

// ─── GET /api/technologies ───────────────────────────────────────────────────
// Public: fetch all technologies
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM technologies ORDER BY display_order ASC, name ASC');
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('GET /api/technologies error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch technologies.' });
  }
});

// ─── POST /api/technologies ──────────────────────────────────────────────────
// Create a new technology
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const { name, logo_icon, category, proficiency, display_order } = req.body;

    if (!name || !category) {
      return res.status(400).json({ success: false, error: 'Name and category are required.' });
    }

    const result = await pool.query(
      `INSERT INTO technologies (name, logo_icon, category, proficiency, display_order)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        name.trim(),
        logo_icon || '⚛',
        category.trim(),
        proficiency ? proficiency.trim() : null,
        parseInt(display_order) || 0
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('POST /api/technologies error:', err);
    res.status(500).json({ success: false, error: 'Failed to create technology.' });
  }
});

// ─── PATCH /api/technologies/reorder ──────────────────────────────────────────
router.patch('/reorder', requireAdminAuth, async (req, res) => {
  try {
    const { orders } = req.body;
    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, error: 'Orders array is required.' });
    }

    await pool.query('BEGIN');
    for (const item of orders) {
      await pool.query(
        'UPDATE technologies SET display_order = $1 WHERE id = $2',
        [parseInt(item.display_order), item.id]
      );
    }
    await pool.query('COMMIT');

    res.json({ success: true, message: 'Technologies reordered successfully.' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('PATCH /api/technologies/reorder error:', err);
    res.status(500).json({ success: false, error: 'Failed to reorder technologies.' });
  }
});

// ─── PATCH /api/technologies/:id ──────────────────────────────────────────────
router.patch('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, logo_icon, category, proficiency, display_order } = req.body;

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

    addField('name', name?.trim());
    addField('logo_icon', logo_icon);
    addField('category', category?.trim());
    addField('proficiency', proficiency !== undefined ? (proficiency ? proficiency.trim() : null) : undefined);
    if (display_order !== undefined) addField('display_order', parseInt(display_order));

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update.' });
    }

    params.push(id);
    const query = `UPDATE technologies SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Technology not found.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('PATCH /api/technologies/:id error:', err);
    res.status(500).json({ success: false, error: 'Failed to update technology.' });
  }
});

// ─── DELETE /api/technologies/:id ─────────────────────────────────────────────
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM technologies WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Technology not found.' });
    }

    res.json({ success: true, message: `Technology ${id} deleted.` });
  } catch (err) {
    console.error('DELETE /api/technologies/:id error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete technology.' });
  }
});

export default router;
