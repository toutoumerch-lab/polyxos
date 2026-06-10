import express from 'express';
import pool from '../db.js';
import { requireAdminAuth } from '../auth.js';

const router = express.Router();

// ─── GET /api/services ────────────────────────────────────────────────────────
// Public route: fetch active services. Admin can fetch all.
router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    let query = 'SELECT * FROM services';
    const params = [];

    if (all !== 'true') {
      query += ' WHERE active = true';
    }

    query += ' ORDER BY display_order ASC, id ASC';
    const result = await pool.query(query, params);

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error('GET /api/services error:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch services.' });
  }
});

// ─── POST /api/services ───────────────────────────────────────────────────────
// Admin route: create a new service
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const {
      title, short_description, detailed_description,
      icon_name, display_order, active, features, color, gradient
    } = req.body;

    if (!title || !short_description) {
      return res.status(400).json({ success: false, error: 'Title and short description are required.' });
    }

    const result = await pool.query(
      `INSERT INTO services (
        title, short_description, detailed_description,
        icon_name, display_order, active, features, color, gradient
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        title.trim(),
        short_description.trim(),
        detailed_description ? detailed_description.trim() : null,
        icon_name || 'Globe',
        parseInt(display_order) || 0,
        active !== false,
        features || [],
        color || '#3B82F6',
        gradient || 'from-blue-500/20 to-blue-600/5'
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('POST /api/services error:', err);
    res.status(500).json({ success: false, error: 'Failed to create service.' });
  }
});

// ─── PATCH /api/services/reorder ──────────────────────────────────────────────
// Admin route: reorder multiple services in one operation
router.patch('/reorder', requireAdminAuth, async (req, res) => {
  try {
    const { orders } = req.body; // Array of { id, display_order }
    if (!Array.isArray(orders)) {
      return res.status(400).json({ success: false, error: 'Orders array is required.' });
    }

    await pool.query('BEGIN');
    for (const item of orders) {
      await pool.query(
        'UPDATE services SET display_order = $1 WHERE id = $2',
        [parseInt(item.display_order), item.id]
      );
    }
    await pool.query('COMMIT');

    res.json({ success: true, message: 'Services reordered successfully.' });
  } catch (err) {
    await pool.query('ROLLBACK');
    console.error('PATCH /api/services/reorder error:', err);
    res.status(500).json({ success: false, error: 'Failed to reorder services.' });
  }
});

// ─── PATCH /api/services/:id ──────────────────────────────────────────────────
// Admin route: update service
router.patch('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title, short_description, detailed_description,
      icon_name, display_order, active, features, color, gradient
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
    addField('short_description', short_description?.trim());
    addField('detailed_description', detailed_description !== undefined ? detailed_description?.trim() : undefined);
    addField('icon_name', icon_name);
    if (display_order !== undefined) addField('display_order', parseInt(display_order));
    if (active !== undefined) addField('active', active);
    if (features !== undefined) addField('features', features);
    addField('color', color);
    addField('gradient', gradient);

    if (fields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update.' });
    }

    params.push(id);
    const query = `UPDATE services SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found.' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('PATCH /api/services/:id error:', err);
    res.status(500).json({ success: false, error: 'Failed to update service.' });
  }
});

// ─── DELETE /api/services/:id ─────────────────────────────────────────────────
// Admin route: delete service
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM services WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Service not found.' });
    }

    res.json({ success: true, message: `Service ${id} deleted.` });
  } catch (err) {
    console.error('DELETE /api/services/:id error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete service.' });
  }
});

export default router;
