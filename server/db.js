const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data.db');

let db;

function getDb() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema();
  }
  return db;
}

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      sort_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS menu_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      price INTEGER NOT NULL,
      image TEXT,
      is_available INTEGER DEFAULT 1,
      FOREIGN KEY (category_id) REFERENCES categories(id)
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      items TEXT NOT NULL,
      total_price INTEGER NOT NULL,
      delivery_cost INTEGER DEFAULT 0,
      order_type TEXT DEFAULT 'delivery',
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      pickup_address TEXT,
      entrance TEXT,
      floor TEXT,
      intercom TEXT,
      comment TEXT,
      delivery_time TEXT,
      payment_method TEXT DEFAULT 'cash',
      payment_status TEXT DEFAULT 'pending',
      status TEXT DEFAULT 'new',
      telegram_user_id TEXT,
      created_at TEXT DEFAULT (datetime('now', '+3 hours'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  // Insert admin password if not exists
  const existing = db.prepare('SELECT key FROM settings WHERE key = ?').get('admin_password');
  if (!existing) {
    db.prepare('INSERT INTO settings (key, value) VALUES (?, ?)').run('admin_password', 'admin123');
  }

  // Seed categories and menu if empty
  const catCount = db.prepare('SELECT COUNT(*) as c FROM categories').get().c;
  if (catCount === 0) {
    seedData();
  }
}

function seedData() {
  const insertCat = db.prepare('INSERT INTO categories (name, slug, sort_order) VALUES (?, ?, ?)');
  insertCat.run('Пицца', 'pizza', 1);
  insertCat.run('Роллы', 'rolls', 2);
  insertCat.run('Напитки', 'drinks', 3);

  const insertItem = db.prepare(
    'INSERT INTO menu_items (category_id, name, description, price, image) VALUES (?, ?, ?, ?, ?)'
  );

  // Pizza
  insertItem.run(1, 'Пепперони', 'Классическая пепперони с моцареллой и томатным соусом', 550, '🍕');
  insertItem.run(1, 'Маргарита', 'Сочная моцарелла, томаты, базилик, оливковое масло', 490, '🍕');
  insertItem.run(1, 'Четыре сыра', 'Моцарелла, пармезан, горгонзола, фета', 650, '🧀');
  insertItem.run(1, 'Барбекю', 'Курица, бекон, соус барбекю, красный лук, сыр', 620, '🍖');

  // Rolls
  insertItem.run(2, 'Филадельфия', 'Лосось, сливочный сыр, огурец', 380, '🍣');
  insertItem.run(2, 'Калифорния', 'Краб, авокадо, огурец, кунжут', 350, '🦀');
  insertItem.run(2, 'Запечённый с лососем', 'Лосось, сыр, соус спайси, запечённый', 420, '🔥');
  insertItem.run(2, 'Дракон', 'Угорь, авокадо, соус унаги, кунжут', 450, '🐉');

  // Drinks
  insertItem.run(3, 'Кола', 'Напиток газированный', 120, '🥤');
  insertItem.run(3, 'Морс клюквенный', 'Домашний морс из клюквы', 180, '🍷');
  insertItem.run(3, 'Чай зелёный', 'Зелёный чай с жасмином', 100, '🍵');
  insertItem.run(3, 'Лимонад', 'Лимонад домашний со льдом и мятой', 200, '🍋');
}

module.exports = { getDb };
