const express = require('express');
const cors = require('cors');
const db = require('./DataBase/db'); // Importer db.js
const bcrypt = require('bcrypt');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Endpoint pour récupérer un message
app.get('/api/test', (req, res) => {
  db.get('SELECT content FROM messages LIMIT 1', (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Erreur lors de la récupération du message' });
    } else {
      res.json({ message: row ? row.content : 'Aucun message trouvé' });
    }
  });
});

// Endpoint pour ajouter un nouvel utilisateur
app.post('/api/users', async (req, res) => {
  const { name, password, email } = req.body;

  try {
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer l'utilisateur dans la base de données
    db.run(
      'INSERT INTO user (name, password, email) VALUES (?, ?, ?)',
      [name, hashedPassword, email],
      function (err) {
        if (err) {
          res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'utilisateur' });
        } else {
          res.status(201).json({ message: 'Utilisateur ajouté avec succès', userId: this.lastID });
        }
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors du hashage du mot de passe' });
  }
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`API en écoute sur http://localhost:${port}/api/test`);
});
