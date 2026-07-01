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

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);

// DEBUG: check env variables — временный роут
app.get('/api/debug/env', (req, res) => {
  const key = process.env.DEEPSEEK_API_KEY || '';
  res.json({
    hasKey: key.length > 0,
    keyLength: key.length,
    keyPrefix: key.substring(0, Math.min(8, key.length)),
    nodeEnv: process.env.NODE_ENV || 'not set',
    envKeys: Object.keys(process.env).filter(k => /DEEP|API|KEY/i.test(k))
  });
});

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
});
