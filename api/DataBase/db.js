const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcrypt');

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

// Créer les tables si elles n'existent pas
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS user (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Name TEXT NOT NULL,
      Password TEXT NOT NULL,
      Email TEXT NOT NULL UNIQUE,
      Grade TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS cocktail (
      Id_Cocktail INTEGER PRIMARY KEY AUTOINCREMENT,
      Name_Cocktail TEXT NOT NULL,
      Categorie TEXT NOT NULL,
      Origine TEXT NOT NULL,
      Image TEXT NOT NULL,
      Statut TEXT NOT NULL,
      Note INTEGER DEFAULT 0,
      Id_User INTEGER NOT NULL,
      FOREIGN KEY (Id_User) REFERENCES user(Id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS review (
      Id_Review INTEGER PRIMARY KEY AUTOINCREMENT,
      Id_User INTEGER NOT NULL,
      Id_Cocktail INTEGER NOT NULL,
      Note INTEGER NOT NULL CHECK(Note >= 0 AND Note <= 5),
      FOREIGN KEY (Id_User) REFERENCES user(Id),
      FOREIGN KEY (Id_Cocktail) REFERENCES cocktail(Id_Cocktail),
      UNIQUE (Id_User, Id_Cocktail)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS recipe (
      Id_Recipe INTEGER PRIMARY KEY AUTOINCREMENT,
      Id_Cocktail INTEGER NOT NULL,
      Etape TEXT NOT NULL,
      Equipement TEXT NOT NULL,
      FOREIGN KEY (Id_Cocktail) REFERENCES cocktail(Id_Cocktail)
    )
  `);


  db.run(`
    CREATE TABLE IF NOT EXISTS ingredient (
      Id_Ingredient INTEGER PRIMARY KEY AUTOINCREMENT,
      Id_Cocktail INTEGER NOT NULL,
      Liste_Ingredient TEXT NOT NULL,
      FOREIGN KEY (Id_Cocktail) REFERENCES cocktail(Id_Cocktail)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT NOT NULL
    )
  `);

  db.get('SELECT COUNT(*) AS count FROM messages', (err, row) => {
    if (err) {
      console.error('Erreur lors de la vérification des messages :', err.message);
    } else if (row.count === 0) {
      db.run('INSERT INTO messages (content) VALUES (?)', ["Media'ktail"]);
    }
  });

  db.get('SELECT COUNT(*) AS count FROM user', async (err, row) => {
    if (err) {
      console.error('Erreur lors de la vérification des utilisateurs :', err.message);
    } else if (row.count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      db.run('INSERT INTO user (name, password, email, grade) VALUES (?, ?, ?, ?)', ['admin', hashedPassword, 'admin@example.com', 'admin']);
    }
  });

});

module.exports = db;