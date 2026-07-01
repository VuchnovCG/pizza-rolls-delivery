const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// POST /api/orders — создать заказ
router.post('/', (req, res) => {
  const { items, total_price, customer_name, phone, address, entrance, floor, intercom, comment, delivery_time, payment_method, telegram_user_id } = req.body;

  if (!items || !customer_name || !phone || !address) {
    return res.status(400).json({ error: 'Заполните обязательные поля' });
  }

  const db = getDb();
  const result = db.prepare(`
    INSERT INTO orders (items, total_price, customer_name, phone, address, entrance, floor, intercom, comment, delivery_time, payment_method, telegram_user_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    JSON.stringify(items),
    total_price,
    customer_name,
    phone,
    address,
    entrance || null,
    floor || null,
    intercom || null,
    comment || null,
    delivery_time || 'now',
    payment_method || 'cash',
    telegram_user_id || null
  );

  res.json({ id: result.lastInsertRowid, status: 'new' });
});

// GET /api/orders — список заказов (админ)
router.get('/', (req, res) => {
  const db = getDb();
  const orders = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
  res.json(orders.map(o => ({
    ...o,
    items: JSON.parse(o.items)
  })));
});

// PUT /api/orders/:id/status — изменить статус (админ)
router.put('/:id/status', (req, res) => {
  const { status } = req.body;
  const db = getDb();
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id);
  res.json({ ok: true });
});

module.exports = router;
