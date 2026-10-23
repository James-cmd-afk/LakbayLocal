const db = require('../config/db');

// ── GET /api/itineraries  (mine) ──────────────────────────────────────────────
const listMine = async (req, res) => {
  const [rows] = await db.query(
    `SELECT i.*, COUNT(ii.id) AS item_count
     FROM itineraries i
     LEFT JOIN itinerary_items ii ON ii.itinerary_id = i.id
     WHERE i.user_id = ?
     GROUP BY i.id
     ORDER BY i.updated_at DESC`,
    [req.user.id]
  );
  return res.json({ success: true, data: rows });
};

// ── GET /api/itineraries/:id ──────────────────────────────────────────────────
const getOne = async (req, res) => {
  const [itin] = await db.query(
    'SELECT * FROM itineraries WHERE id = ? AND user_id = ?',
    [req.params.id, req.user.id]
  );
  if (!itin.length) return res.status(404).json({ success: false, message: 'Not found.' });

  const [items] = await db.query(
    `SELECT ii.*, d.name, d.slug, d.city, d.cover_image_url,
            d.entrance_fee, d.avg_food_cost, d.avg_transport,
            c.name AS category_name, c.icon AS category_icon, c.color_hex
     FROM itinerary_items ii
     JOIN destinations d ON d.id = ii.destination_id
     JOIN categories c   ON c.id = d.category_id
     WHERE ii.itinerary_id = ?
     ORDER BY ii.day_number, ii.visit_order`,
    [req.params.id]
  );

  return res.json({ success: true, data: { ...itin[0], items } });
};

// ── POST /api/itineraries ─────────────────────────────────────────────────────
const create = async (req, res) => {
  const { title, description, start_date, end_date, budget, num_days } = req.body;
  const [result] = await db.query(
    `INSERT INTO itineraries (user_id, title, description, start_date, end_date, budget, num_days)
     VALUES (?,?,?,?,?,?,?)`,
    [req.user.id, title, description, start_date, end_date, budget ?? 0, num_days ?? 1]
  );
  return res.status(201).json({ success: true, id: result.insertId });
};

// ── PUT /api/itineraries/:id ──────────────────────────────────────────────────
const update = async (req, res) => {
  const { title, description, start_date, end_date, budget, num_days, status } = req.body;
  await db.query(
    `UPDATE itineraries SET title=?, description=?, start_date=?, end_date=?,
      budget=?, num_days=?, status=? WHERE id=? AND user_id=?`,
    [title, description, start_date, end_date, budget, num_days, status, req.params.id, req.user.id]
  );
  return res.json({ success: true });
};

// ── DELETE /api/itineraries/:id ───────────────────────────────────────────────
const remove = async (req, res) => {
  await db.query('DELETE FROM itineraries WHERE id=? AND user_id=?', [req.params.id, req.user.id]);
  return res.json({ success: true });
};

// ── POST /api/itineraries/:id/items ──────────────────────────────────────────
const addItem = async (req, res) => {
  const { destination_id, day_number, visit_order, visit_date,
          arrival_time, duration_mins, notes, transport_cost, meal_cost } = req.body;
  const [result] = await db.query(
    `INSERT INTO itinerary_items
       (itinerary_id, destination_id, day_number, visit_order, visit_date,
        arrival_time, duration_mins, notes, transport_cost, meal_cost)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [req.params.id, destination_id, day_number ?? 1, visit_order ?? 1,
     visit_date, arrival_time, duration_mins, notes, transport_cost ?? 0, meal_cost ?? 0]
  );
  return res.status(201).json({ success: true, id: result.insertId });
};

// ── DELETE /api/itineraries/:id/items/:itemId ─────────────────────────────────
const removeItem = async (req, res) => {
  await db.query('DELETE FROM itinerary_items WHERE id=? AND itinerary_id=?',
    [req.params.itemId, req.params.id]);
  return res.json({ success: true });
};

module.exports = { listMine, getOne, create, update, remove, addItem, removeItem };
