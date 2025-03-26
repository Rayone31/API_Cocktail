// filepath: /path/to/your/server/app.js
const express = require('express');
const cors = require('cors');
const db = require('./DataBase/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

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

  if (!name || !password || !email) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  try {
    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insérer l'utilisateur dans la base de données
    db.run(
      'INSERT INTO user (name, password, email) VALUES (?, ?, ?)',
      [name, hashedPassword, email],
      function (err) {
        if (err) {
          console.error('Erreur lors de l\'ajout de l\'utilisateur :', err.message);
          return res.status(500).json({ error: 'Erreur lors de l\'ajout de l\'utilisateur' });
        } else {
          res.status(201).json({ message: 'Utilisateur ajouté avec succès', userId: this.lastID });
        }
      }
    );
  } catch (error) {
    console.error('Erreur lors du hashage du mot de passe :', error);
    res.status(500).json({ error: 'Erreur lors du hashage du mot de passe' });
  }
});

// Endpoint pour la connexion
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  db.get('SELECT * FROM user WHERE email = ?', [email], async (err, user) => {
    if (err) {
      console.error('Erreur lors de la récupération de l\'utilisateur :', err.message);
      return res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
    }

    if (!user) {
      return res.status(400).json({ error: 'Utilisateur non trouvé' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.Password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ userId: user.Id }, 'votre_secret', { expiresIn: '1h' });
    res.json({ message: 'Connexion réussie', token });
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`API en écoute sur http://localhost:${port}/api/test`);
});