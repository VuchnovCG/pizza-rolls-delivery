const express = require('express');
const path = require('path');
const cors = require('cors');

const menuRoutes = require('./routes/menu');
const ordersRoutes = require('./routes/orders');
const adminRoutes = require('./routes/admin');
const paymentRoutes = require('./routes/payment');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/menu', menuRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);

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
