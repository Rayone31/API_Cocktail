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

    const token = jwt.sign({ userId: user.Id, grade: user.Grade }, 'CFM', { expiresIn: '1h' });
    res.json({
      message: 'Connexion réussie',
      token,
      userId: user.Id,
      name: user.Name,
      grade: user.Grade,
    });
  });
});

app.post('/api/cocktails', (req, res) => {
  console.log('Données reçues :', req.body);

  const {
    name,
    recipe,
    category,
    ingredient,
    origin,
    image, 
    status, 
    note, 
    creatorName,
    userId, 
  } = req.body;

  if (!name) console.log('Champ vide : name');
  if (!recipe) console.log('Champ vide : recipe');
  if (!category) console.log('Champ vide : category');
  if (!ingredient) console.log('Champ vide : ingredient');
  if (!origin) console.log('Champ vide : origin');
  if (!image) console.log('Champ vide : image');
  if (!status) console.log('Champ vide : status');
  if (!note) console.log('Champ vide : note');
  if (!creatorName) console.log('Champ vide : creatorName');
  if (!userId) console.log('Champ vide : userId');


  if (
    !name ||
    !recipe ||
    !category ||
    !ingredient ||
    !origin ||
    !image ||
    !status ||
    !note ||
    !creatorName ||
    !userId
  ) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  db.run(
    `INSERT INTO cocktail 
      (Name_Cocktail, ID_Recipe, Categorie, Id_Ingredient, Origine, Image, Statut, Note, Name_Creator, Id_User) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, recipe, category, ingredient, origin, image, status, note, creatorName, userId],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'ajout du cocktail :', err.message);
        return res.status(500).json({ error: 'Erreur lors de l\'ajout du cocktail' });
      } else {
        res.status(201).json({ message: 'Cocktail ajouté avec succès', cocktailId: this.lastID });
      }
    }
  );
});

app.get('/api/cocktails', (req, res) => {
  db.all('SELECT * FROM cocktail', (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des cocktails :', err.message);
      res.status(500).json({ error: 'Erreur lors de la récupération des cocktails' });
    } else {
      res.json(rows);
    }
  });
});

app.get('/api/cocktails/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM cocktail WHERE Id_Cocktail = ?', [id], (err, row) => {
    if (err) {
      console.error('Erreur lors de la récupération du cocktail :', err.message);
      res.status(500).json({ error: 'Erreur lors de la récupération du cocktail' });
    } else if (!row) {
      res.status(404).json({ error: 'Cocktail non trouvé' });
    } else {
      res.json(row);
    }
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`API en écoute sur http://localhost:${port}/api/test`);
});

