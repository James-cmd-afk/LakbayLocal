const db = require('../config/db');

// ── POST /api/reviews ─────────────────────────────────────────────────────────
const create = async (req, res) => {
  const { destination_id, rating, title, body } = req.body;
  if (!rating || rating < 1 || rating > 5)
    return res.status(422).json({ success: false, message: 'Rating must be 1–5.' });

  try {
    await db.query(
      `INSERT INTO reviews (user_id, destination_id, rating, title, body)
       VALUES (?,?,?,?,?)`,
      [req.user.id, destination_id, rating, title, body]
    );
    // Update cached avg_rating on destination
    await db.query(
      `UPDATE destinations d SET
         avg_rating   = (SELECT AVG(rating) FROM reviews WHERE destination_id = d.id AND is_visible = 1),
         review_count = (SELECT COUNT(*)    FROM reviews WHERE destination_id = d.id AND is_visible = 1)
       WHERE d.id = ?`,
      [destination_id]
    );
    return res.status(201).json({ success: true });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'You already reviewed this destination.' });
    throw err;
  }
};

// ── DELETE /api/reviews/:id  (admin: hide) ────────────────────────────────────
const hide = async (req, res) => {
  await db.query('UPDATE reviews SET is_visible=0 WHERE id=?', [req.params.id]);
  return res.json({ success: true });
};

module.exports = { create, hide };
