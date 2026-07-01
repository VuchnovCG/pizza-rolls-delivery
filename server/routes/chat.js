const express = require('express');
const router = express.Router();

const DEEPSEEK_API = 'https://api.deepseek.com/v1/chat/completions';
const API_KEY = process.env.DEEPSEEK_API_KEY || '';

const SYSTEM_PROMPT = `Ты — дружелюбный консультант службы доставки Pizza & Rolls.

Ты знаешь всё меню, цены и помогаешь клиентам выбрать еду, оформить заказ, ответить на вопросы.

Правила:
- Отвечай коротко и по делу, по-русски
- Если спрашивают про меню — посмотри в списке ниже и порекомендуй
- Если просят изменить заказ — скажи что это можно сделать позвонив оператору
- Если спрашивают про оплату — расскажи про наличные и карту онлайн (ЮKassa, тестовая)
- Если спрашивают про доставку — скажи что доставка по городу 300₽, самовывоз бесплатно
- Если вопрос не по теме — вежливо верни к меню
- Будь приветливым, используй эмодзи умеренно
- Не выдумывай цены и позиции — только то что есть в меню ниже`;

// In-memory chat history (просто для сессии, не храним в БД)
const sessions = {};

function getMenuContext() {
  try {
    const { getDb } = require('../db');
    const db = getDb();
    const categories = db.prepare('SELECT * FROM categories ORDER BY sort_order').all();
    const items = db.prepare('SELECT * FROM menu_items WHERE is_available = 1').all();
    let ctx = 'МЕНЮ:\n';
    categories.forEach(cat => {
      ctx += `\n${cat.name}:\n`;
      items.filter(i => i.category_id === cat.id).forEach(item => {
        ctx += `  - ${item.name} (${item.price}₽) — ${item.description || ''}\n`;
      });
    });
    return ctx;
  } catch (e) {
    return 'Меню временно недоступно.';
  }
}

function getKnowledgeBase() {
  try {
    const { getDb } = require('../db');
    const db = getDb();
    const row = db.prepare("SELECT value FROM settings WHERE key = 'chat_context'").get();
    return row?.value?.trim() || '';
  } catch {
    return '';
  }
}

// POST /api/chat — отправить сообщение ИИ-консультанту
router.post('/', async (req, res) => {
  const { message, session_id } = req.body;

  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Пустое сообщение' });
  }

  if (!API_KEY) {
    return res.json({
      reply: '🔧 ИИ-консультант временно не подключён. Пожалуйста, свяжитесь с оператором по телефону.',
      session_id: session_id || 'offline'
    });
  }

  const sid = session_id || 'ses_' + Date.now();
  if (!sessions[sid]) {
    const kb = getKnowledgeBase();
    const extraContext = kb ? `\n\nДОПОЛНИТЕЛЬНАЯ ИНФОРМАЦИЯ О БИЗНЕСЕ:\n${kb}` : '';
    sessions[sid] = [
      { role: 'system', content: SYSTEM_PROMPT + '\n\n' + getMenuContext() + extraContext }
    ];
  }

  sessions[sid].push({ role: 'user', content: message });

  // Keep last 10 messages max to avoid token overflow
  if (sessions[sid].length > 11) {
    sessions[sid] = [sessions[sid][0], ...sessions[sid].slice(-9)];
  }

  try {
    const response = await fetch(DEEPSEEK_API, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: sessions[sid],
        max_tokens: 512,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('DeepSeek API error:', data);
      return res.json({
        reply: 'Извините, возникла ошибка. Попробуйте позже или свяжитесь с оператором.',
        session_id: sid
      });
    }

    const reply = data.choices[0].message.content;
    sessions[sid].push({ role: 'assistant', content: reply });

    res.json({ reply, session_id: sid });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.json({
      reply: 'Извините, сервис временно недоступен. Пожалуйста, позвоните нам.',
      session_id: sid
    });
  }
});

module.exports = router;
