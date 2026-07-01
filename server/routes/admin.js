const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// POST /api/admin/login — проверка пароля
router.post('/login', (req, res) => {
  const { password } = req.body;
  const db = getDb();
  const stored = db.prepare("SELECT value FROM settings WHERE key = 'admin_password'").get();

  if (stored && password === stored.value) {
    // Простая токен-сессия: храним в БД
    const token = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
    db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)").run('admin_token', token);
    return res.json({ token });
  }

  res.status(401).json({ error: 'Неверный пароль' });
});

// POST /api/admin/check — проверить токен
router.post('/check', (req, res) => {
  const { token } = req.body;
  const db = getDb();
  const stored = db.prepare("SELECT value FROM settings WHERE key = 'admin_token'").get();
  if (stored && token === stored.value) {
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Не авторизован' });
});

// PUT /api/admin/password — сменить пароль
router.put('/password', (req, res) => {
  const { token, new_password } = req.body;
  const db = getDb();
  const stored = db.prepare("SELECT value FROM settings WHERE key = 'admin_token'").get();
  if (stored && token === stored.value) {
    db.prepare("UPDATE settings SET value = ? WHERE key = 'admin_password'").run(new_password);
    return res.json({ ok: true });
  }
  res.status(401).json({ error: 'Не авторизован' });
});

// ---- База знаний (контекст для ИИ) ----

// GET /api/admin/context — получить контекст
router.get('/context', (req, res) => {
  const token = req.headers.authorization;
  const db = getDb();
  const stored = db.prepare("SELECT value FROM settings WHERE key = 'admin_token'").get();
  if (!stored || token !== stored.value) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  const ctx = db.prepare("SELECT value FROM settings WHERE key = 'chat_context'").get();
  res.json({ context: ctx?.value || '' });
});

// PUT /api/admin/context — сохранить контекст
router.put('/context', (req, res) => {
  const { token, context } = req.body;
  const db = getDb();
  const stored = db.prepare("SELECT value FROM settings WHERE key = 'admin_token'").get();
  if (!stored || token !== stored.value) {
    return res.status(401).json({ error: 'Не авторизован' });
  }
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('chat_context', ?)").run(context || '');
  res.json({ ok: true });
});

module.exports = router;
