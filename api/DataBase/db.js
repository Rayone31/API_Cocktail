const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Chemin vers le fichier de la base de données
const dbPath = path.join(__dirname, 'data.db');

// Initialiser la base de données
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Erreur lors de la connexion à la base de données :', err.message);
  } else {
    console.log('Connecté à la base de données SQLite.');
  }
});

// Créer une table si elle n'existe pas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL
    )
  `);

  // Ajouter un message par défaut si la table est vide
  db.get('SELECT COUNT(*) AS count FROM messages', (err, row) => {
    if (err) {
      console.error('Erreur lors de la vérification des messages :', err.message);
    } else if (row.count === 0) {
      db.run('INSERT INTO messages (content) VALUES (?)', ['Hello from SQLite!']);
    }
  });
});

module.exports = db;
