const express = require('express');
const router = express.Router();
const db = require('../DataBase/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Inscription
router.post('/', async (req, res) => {
  const { name, password, email, grade } = req.body;
  if (!name || !password || !email) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    db.run(
      'INSERT INTO user (name, password, email, grade) VALUES (?, ?, ?, ?)',
      [name, hashedPassword, email, grade || 'user'],
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

// Connexion
router.post('/login', (req, res) => {
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
    const token = jwt.sign({ userId: user.Id, grade: user.Grade }, 'CFM', { expiresIn: '1h' });
    res.json({
      message: 'Connexion réussie',
      token,
      userId: user.Id,
      name: user.Name,
      email: user.Email,
      grade: user.Grade,
    });
  });
});

// Récupérer tous les utilisateurs
router.get('/', (req, res) => {
  db.all('SELECT * FROM user', (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs :', err.message);
      res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    } else {
      res.json(rows);
    }
  });
});

// Supprimer un utilisateur
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  db.run('DELETE FROM user WHERE Id = ?', [id], function (err) {
    if (err) {
      console.error('Erreur lors de la suppression de l\'utilisateur :', err.message);
      return res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
    } else if (this.changes === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    } else {
      res.json({ message: 'Utilisateur supprimé avec succès', userId: id });
    }
  });
});

// Récupérer les cocktails d'un utilisateur
router.get('/:id/cocktails', (req, res) => {
  const { id } = req.params;
  db.all('SELECT * FROM cocktail WHERE Id_User = ?', [id], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des cocktails :', err.message);
      res.status(500).json({ error: 'Erreur lors de la récupération des cocktails' });
    } else {
      res.json(rows);
    }
  });
});

module.exports = router;