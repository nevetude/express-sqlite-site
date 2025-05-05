const express = require('express');
const { Pool } = require('pg');
const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://user:password@localhost:5432/mydb',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Инициализация БД (асинхронная)
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('База данных готова');
  } catch (err) {
    console.error('Ошибка инициализации БД:', err);
  }
}

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Главная страница
app.get('/', async (req, res) => {
  try {
    const { rows: messages } = await pool.query(
      'SELECT * FROM messages ORDER BY created_at DESC'
    );
    res.render('index', { messages });
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка сервера');
  }
});

// Добавление сообщения
app.post('/add', async (req, res) => {
  const { text } = req.body;
  try {
    await pool.query(
      'INSERT INTO messages (text) VALUES ($1)',
      [text]
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при добавлении сообщения');
  }
});

// Удаление сообщения
app.post('/delete/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(
      'DELETE FROM messages WHERE id = $1',
      [id]
    );
    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.status(500).send('Ошибка при удалении сообщения');
  }
});

// Инициализация и запуск сервера
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
  });
});