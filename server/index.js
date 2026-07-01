const express = require('express');
const path = require('path');
const cors = require('cors');

const menuRoutes = require('./routes/menu');
const ordersRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');
const uploadRoutes = require('./routes/upload');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 4000;

// Seed DeepSeek API key from env into DB (на случай если Railway передаст переменную)
const { getDb } = require('./db');
try {
  const envKey = process.env.DEEPSEEK_API_KEY;
  if (envKey) {
    const db = getDb();
    const existing = db.prepare("SELECT value FROM settings WHERE key = 'deepseek_api_key'").get();
    if (!existing?.value) {
      db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('deepseek_api_key', ?)").run(envKey);
      console.log('✅ DeepSeek API key seeded from env into DB');
    }
  }
} catch (e) {
  console.log('⚠️ Could not seed API key:', e.message);
}

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static frontend in production
const clientDist = path.join(__dirname, '..', 'client', 'dist');
app.use(express.static(clientDist));

// SPA fallback — все не-API запросы отдаём index.html
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(clientDist, 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`🍕 Pizza & Rolls server running at http://localhost:${PORT}`);
  console.log('🔑 DeepSeek API key:', process.env.DEEPSEEK_API_KEY ? '✅ from env var' : '❌ not in env, fallback to DB');
});
