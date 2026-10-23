require('dotenv').config();
const express = require('express');
const cors    = require('cors');

const authRoutes   = require('./routes/auth');
const destRoutes   = require('./routes/destinations');
const itinRoutes   = require('./routes/itineraries');
const miscRoutes   = require('./routes/misc');

const app = express();

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:8081',   // Expo web
    'http://localhost:3000',   // Admin dashboard
    'http://localhost:19006',  // Expo Go web
  ],
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/destinations', destRoutes);
app.use('/api/itineraries',  itinRoutes);
app.use('/api',              miscRoutes);

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'LakbayLocal API' }));

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, message: 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 LakbayLocal API running on http://localhost:${PORT}`));

module.exports = app;
