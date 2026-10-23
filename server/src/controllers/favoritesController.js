const db = require('../config/db');

// ── GET /api/favorites  ───────────────────────────────────────────────────────
const listMine = async (req, res) => {
  const [rows] = await db.query(
    `SELECT f.id AS fav_id, d.id, d.name, d.slug, d.city, d.province,
            d.entrance_fee, d.avg_rating, d.cover_image_url,
            c.name AS category_name, c.icon AS category_icon, c.color_hex
     FROM favorites f
     JOIN destinations d ON d.id = f.destination_id
     JOIN categories  c  ON c.id = d.category_id
     WHERE f.user_id = ? AND d.status = 'approved'
     ORDER BY f.created_at DESC`,
    [req.user.id]
  );
  return res.json({ success: true, data: rows });
};

// ── POST /api/favorites ───────────────────────────────────────────────────────
const add = async (req, res) => {
  const { destination_id } = req.body;
  try {
    await db.query(
      'INSERT INTO favorites (user_id, destination_id) VALUES (?,?)',
      [req.user.id, destination_id]
    );
    return res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.json({ success: true, message: 'Already saved.' });
    throw err;
  }
};

// ── DELETE /api/favorites/:destinationId ─────────────────────────────────────
const remove = async (req, res) => {
  await db.query(
    'DELETE FROM favorites WHERE user_id=? AND destination_id=?',
    [req.user.id, req.params.destinationId]
  );
  return res.json({ success: true });
};

module.exports = { listMine, add, remove };
