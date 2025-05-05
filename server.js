const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Подключение БД
const db = new sqlite3.Database('./database.db');

// Создание таблицы (если её нет)
db.run(`
  CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Middleware
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Главная страница (вывод сообщений из БД)
app.get('/', (req, res) => {
  db.all('SELECT * FROM messages ORDER BY created_at DESC', (err, messages) => {
    res.render('index', { messages });
  });
});

// Добавление сообщения
app.post('/add', (req, res) => {
  const { text } = req.body;
  db.run('INSERT INTO messages (text) VALUES (?)', [text], (err) => {
    res.redirect('/');
  });
});

// Удаление сообщения
app.post('/delete/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM messages WHERE id = ?', [id], (err) => {
    res.redirect('/');
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен: http://localhost:${PORT}`);
});