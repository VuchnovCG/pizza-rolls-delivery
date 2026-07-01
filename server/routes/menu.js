const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// GET /api/menu — все категории с товарами
router.get('/', (req, res) => {
  const db = getDb();
  const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
  const items = db.prepare('SELECT * FROM menu_items ORDER BY id').all();

  const menu = categories.map(cat => ({
    ...cat,
    items: items.filter(i => i.category_id === cat.id)
  }));

  res.json(menu);
});

// PUT /api/menu/:id — изменить товар (админ)
router.put('/:id', (req, res) => {
  const { name, description, price, is_available } = req.body;
  const db = getDb();
  db.prepare(`
    UPDATE menu_items SET name = ?, description = ?, price = ?, is_available = ?
    WHERE id = ?
  `).run(name, description, price, is_available ?? 1, req.params.id);
  res.json({ ok: true });
});

// POST /api/menu — добавить товар (админ)
router.post('/', (req, res) => {
  const { category_id, name, description, price, image } = req.body;
  const db = getDb();
  const result = db.prepare(`
    INSERT INTO menu_items (category_id, name, description, price, image)
    VALUES (?, ?, ?, ?, ?)
  `).run(category_id, name, description, price, image || '🍕');
  res.json({ id: result.lastInsertRowid });
});

// DELETE /api/menu/:id — удалить товар (админ)
router.delete('/:id', (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM menu_items WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

module.exports = router;
