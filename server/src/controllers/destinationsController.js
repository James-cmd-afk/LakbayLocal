const db = require('../config/db');

// ── GET /api/destinations  (list, filter, search) ────────────────────────────
const list = async (req, res) => {
  const {
    category, city, province, search,
    featured, page = 1, limit = 12,
  } = req.query;

  const offset = (Number(page) - 1) * Number(limit);
  const params = [];
  let where = `d.status = 'approved'`;

  if (category)  { where += ' AND d.category_id = ?'; params.push(category); }
  if (city)      { where += ' AND d.city LIKE ?';     params.push(`%${city}%`); }
  if (province)  { where += ' AND d.province LIKE ?'; params.push(`%${province}%`); }
  if (featured === 'true') { where += ' AND d.featured = 1'; }
  if (search) {
    where += ' AND (d.name LIKE ? OR d.description LIKE ? OR d.city LIKE ?)';
    params.push(`%${search}%`, `%${search}%`, `%${search}%`);
  }

  const sql = `
    SELECT d.id, d.name, d.slug, d.city, d.province, d.entrance_fee,
           d.avg_food_cost, d.avg_transport, d.avg_rating, d.review_count,
           d.cover_image_url, d.featured, d.opening_time, d.closing_time,
           c.name AS category_name, c.icon AS category_icon, c.color_hex
    FROM   destinations d
    JOIN   categories c ON c.id = d.category_id
    WHERE  ${where}
    ORDER  BY d.featured DESC, d.avg_rating DESC
    LIMIT  ? OFFSET ?
  `;

  const countSql = `SELECT COUNT(*) AS total FROM destinations d WHERE ${where}`;

  const [rows]  = await db.query(sql, [...params, Number(limit), offset]);
  const [count] = await db.query(countSql, params);

  return res.json({
    success: true,
    data: rows,
    pagination: {
      total: count[0].total,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(count[0].total / Number(limit)),
    },
  });
};

// ── GET /api/destinations/:slug ───────────────────────────────────────────────
const getOne = async (req, res) => {
  const { slug } = req.params;
  const [rows] = await db.query(
    `SELECT d.*, c.name AS category_name, c.icon AS category_icon, c.color_hex,
            u.name AS submitted_by_name
     FROM   destinations d
     JOIN   categories c ON c.id = d.category_id
     LEFT JOIN users u   ON u.id = d.submitted_by
     WHERE  d.slug = ? AND d.status = 'approved'`,
    [slug]
  );
  if (!rows.length) return res.status(404).json({ success: false, message: 'Destination not found.' });

  const dest = rows[0];
  const [images] = await db.query(
    'SELECT * FROM destination_images WHERE destination_id = ? ORDER BY sort_order',
    [dest.id]
  );
  const [reviews] = await db.query(
    `SELECT r.*, u.name AS reviewer_name, u.avatar_url AS reviewer_avatar
     FROM reviews r JOIN users u ON u.id = r.user_id
     WHERE r.destination_id = ? AND r.is_visible = 1
     ORDER BY r.created_at DESC LIMIT 20`,
    [dest.id]
  );

  return res.json({ success: true, data: { ...dest, images, reviews } });
};

// ── POST /api/destinations  (contributor / admin submit) ─────────────────────
const create = async (req, res) => {
  const {
    category_id, name, description, address, city, province,
    latitude, longitude, entrance_fee, avg_food_cost, avg_transport,
    opening_time, closing_time, cover_image_url,
  } = req.body;

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
             + '-' + Date.now();

  const status = req.user.role === 'admin' ? 'approved' : 'pending';

  const [result] = await db.query(
    `INSERT INTO destinations
       (category_id, submitted_by, name, slug, description, address, city, province,
        latitude, longitude, entrance_fee, avg_food_cost, avg_transport,
        opening_time, closing_time, status, cover_image_url)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [category_id, req.user.id, name, slug, description, address, city, province,
     latitude, longitude, entrance_fee ?? 0, avg_food_cost ?? 0, avg_transport ?? 0,
     opening_time, closing_time, status, cover_image_url]
  );

  return res.status(201).json({ success: true, id: result.insertId, slug, status });
};

// ── PATCH /api/destinations/:id/approve  (admin only) ────────────────────────
const approve = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' | 'rejected'
  await db.query(
    `UPDATE destinations SET status = ?, approved_by = ?, approved_at = NOW()
     WHERE id = ?`,
    [status, req.user.id, id]
  );
  return res.json({ success: true, message: `Destination ${status}.` });
};

// ── GET /api/destinations/categories ─────────────────────────────────────────
const listCategories = async (_req, res) => {
  const [rows] = await db.query('SELECT * FROM categories ORDER BY name');
  return res.json({ success: true, data: rows });
};

// ── Budget-Based Trip Builder ─────────────────────────────────────────────────
// POST /api/destinations/budget-builder
const budgetBuilder = async (req, res) => {
  const { budget, num_days, category_ids, max_per_day } = req.body;
  const days = Number(num_days) || 1;
  const perDay = Number(budget) / days;

  let categoryFilter = '';
  const params = [];
  if (category_ids?.length) {
    categoryFilter = `AND d.category_id IN (${category_ids.map(() => '?').join(',')})`;
    params.push(...category_ids);
  }

  const [all] = await db.query(
    `SELECT d.id, d.name, d.slug, d.city, d.province, d.entrance_fee,
            d.avg_food_cost, d.avg_transport, d.avg_rating, d.cover_image_url,
            c.name AS category_name, c.icon AS category_icon, c.color_hex
     FROM   destinations d JOIN categories c ON c.id = d.category_id
     WHERE  d.status = 'approved' ${categoryFilter}
     ORDER  BY d.avg_rating DESC`,
    params
  );

  // Simple greedy packing per day
  const itinerary = [];
  let totalCost = 0;

  for (let day = 1; day <= days; day++) {
    const dayItems = [];
    let dayCost = 0;
    const maxItems = Number(max_per_day) || 3;

    for (const dest of all) {
      if (dayItems.length >= maxItems) break;
      if (itinerary.flat().some(i => i.id === dest.id)) continue; // no duplicates
      const cost = Number(dest.entrance_fee) + Number(dest.avg_food_cost) + Number(dest.avg_transport);
      if (dayCost + cost <= perDay) {
        dayItems.push({ ...dest, estimated_cost: cost });
        dayCost += cost;
      }
    }
    itinerary.push({ day, destinations: dayItems, day_total: dayCost });
    totalCost += dayCost;
  }

  return res.json({
    success: true,
    budget: Number(budget),
    estimated_total: totalCost,
    remaining: Number(budget) - totalCost,
    itinerary,
  });
};

module.exports = { list, getOne, create, approve, listCategories, budgetBuilder };
