const db = require('../config/db');

// ── GET /api/admin/stats ──────────────────────────────────────────────────────
const stats = async (_req, res) => {
  const [[users]]        = await db.query('SELECT COUNT(*) AS total FROM users');
  const [[destinations]] = await db.query("SELECT COUNT(*) AS total FROM destinations WHERE status='approved'");
  const [[pending]]      = await db.query("SELECT COUNT(*) AS total FROM destinations WHERE status='pending'");
  const [[reviews]]      = await db.query('SELECT COUNT(*) AS total FROM reviews');
  const [[itineraries]]  = await db.query('SELECT COUNT(*) AS total FROM itineraries');

  const [popularDest] = await db.query(
    `SELECT d.id, d.name, d.city, d.avg_rating, d.review_count, d.cover_image_url
     FROM destinations d WHERE d.status='approved'
     ORDER BY d.review_count DESC LIMIT 5`
  );

  const [recentSubmissions] = await db.query(
    `SELECT d.id, d.name, d.city, d.status, d.created_at, u.name AS submitted_by
     FROM destinations d LEFT JOIN users u ON u.id = d.submitted_by
     ORDER BY d.created_at DESC LIMIT 10`
  );

  return res.json({
    success: true,
    stats: {
      users: users.total,
      destinations: destinations.total,
      pending_destinations: pending.total,
      reviews: reviews.total,
      itineraries: itineraries.total,
    },
    popularDest,
    recentSubmissions,
  });
};

// ── GET /api/admin/users ──────────────────────────────────────────────────────
const listUsers = async (req, res) => {
  const { page = 1, limit = 20, search } = req.query;
  const offset = (Number(page) - 1) * Number(limit);
  let where = '1=1';
  const params = [];
  if (search) { where += ' AND (name LIKE ? OR email LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  const [rows] = await db.query(
    `SELECT id, name, email, role, is_active, created_at FROM users WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, Number(limit), offset]
  );
  return res.json({ success: true, data: rows });
};

// ── PATCH /api/admin/users/:id ────────────────────────────────────────────────
const updateUser = async (req, res) => {
  const { role, is_active } = req.body;
  await db.query('UPDATE users SET role=?, is_active=? WHERE id=?', [role, is_active, req.params.id]);
  return res.json({ success: true });
};

// ── GET /api/admin/submissions ────────────────────────────────────────────────
const pendingSubmissions = async (_req, res) => {
  const [rows] = await db.query(
    `SELECT d.*, c.name AS category_name, u.name AS submitted_by_name, u.email AS submitted_by_email
     FROM destinations d
     JOIN categories c ON c.id = d.category_id
     LEFT JOIN users u ON u.id = d.submitted_by
     WHERE d.status = 'pending'
     ORDER BY d.created_at ASC`
  );
  return res.json({ success: true, data: rows });
};

module.exports = { stats, listUsers, updateUser, pendingSubmissions };
