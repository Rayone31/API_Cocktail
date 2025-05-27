const express = require('express');
const cors = require('cors');
const db = require('./DataBase/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3001;

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
      email: user.Email,
      grade: user.Grade,
    });
  });
});

// Endpoint pour ajouter un cocktail
app.post('/api/cocktails', (req, res) => {
  const {
    name,
    category,
    origin,
    image,
    userId,
    ingredients,
    recipes
  } = req.body;

  // Statut et favori fixés côté serveur
  const status = 'à Vérifier';
  const favori = 0;

  if (
    !name || !category || !origin || !image ||
    !userId ||
    !Array.isArray(ingredients) || !Array.isArray(recipes)
  ) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }

  db.run(
    `INSERT INTO cocktail (Name_Cocktail, Categorie, Origine, Image, Statut, Favori, Id_User)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, category, origin, image, status, favori, userId],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'ajout du cocktail :', err.message);
        return res.status(500).json({ error: 'Erreur lors de l\'ajout du cocktail' });
      }
      const cocktailId = this.lastID;

      // Insertion des ingrédients
      ingredients.forEach(ing => {
        db.run(
          `INSERT INTO ingredient (Id_Cocktail, Liste_Ingredient) VALUES (?, ?)`,
          [cocktailId, ing.liste_ingredient]
        );
      });

      // Insertion des étapes de recette
      recipes.forEach(rec => {
        db.run(
          `INSERT INTO recipe (Id_Cocktail, Etape, Equipement) VALUES (?, ?, ?)`,
          [cocktailId, rec.etape, rec.equipement]
        );
      });

      res.status(201).json({ message: 'Cocktail ajouté avec succès', cocktailId });
    }
  );
});

// Endpoint pour récupérer tous les cocktails
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

// Endpoint pour récupérer un cocktail par ID
app.get('/api/cocktails/:id', (req, res) => {
  const { id } = req.params;
  db.get('SELECT * FROM cocktail WHERE Id_Cocktail = ?', [id], (err, cocktail) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur lors de la récupération du cocktail' });
    }
    if (!cocktail) {
      return res.status(404).json({ error: 'Cocktail non trouvé' });
    }

    db.all('SELECT * FROM ingredient WHERE Id_Cocktail = ?', [id], (err, ingredients) => {
      if (err) {
        return res.status(500).json({ error: 'Erreur lors de la récupération des ingrédients' });
      }
      db.all('SELECT * FROM recipe WHERE Id_Cocktail = ?', [id], (err, recipes) => {
        if (err) {
          return res.status(500).json({ error: 'Erreur lors de la récupération des étapes' });
        }
        res.json({
          ...cocktail,
          ingredients,
          recipes
        });
      });
    });
  });
});

// Endpoint pour mettre à jour le statut d'un cocktail
app.put('/api/cocktails/:id', (req, res) => {
  const { id } = req.params;
  const { Statut } = req.body;

  if (!Statut) {
    return res.status(400).json({ error: 'Le statut est requis' });
  }

  db.run(
    'UPDATE cocktail SET Statut = ? WHERE Id_Cocktail = ?',
    [Statut, id],
    function (err) {
      if (err) {
        console.error('Erreur lors de la mise à jour du statut du cocktail :', err.message);
        return res.status(500).json({ error: 'Erreur lors de la mise à jour du statut du cocktail' });
      } else if (this.changes === 0) {
        return res.status(404).json({ error: 'Cocktail non trouvé' });
      } else {
        res.json({ message: 'Statut du cocktail mis à jour avec succès' });
      }
    }
  );
});

// Endpoint pour supprimer un cocktail
app.delete('/api/cocktails/:id', (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM cocktail WHERE Id_Cocktail = ?', [id], function (err) {
    if (err) {
      console.error('Erreur lors de la suppression du cocktail :', err.message);
      return res.status(500).json({ error: 'Erreur lors de la suppression du cocktail' });
    } else if (this.changes === 0) {
      return res.status(404).json({ error: 'Cocktail non trouvé' });
    } else {
      res.json({ message: 'Cocktail supprimé avec succès' });
    }
  });
});

// Endpoint pour récupérer tous les utilisateurs
app.get('/api/users', (req, res) => {
  db.all('SELECT * FROM user', (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des utilisateurs :', err.message);
      res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
    } else {
      res.json(rows);
    }
  });
});

// Endpoint pour supprimer un utilisateur
app.delete('/api/users/:id', (req, res) => {
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

app.get('/api/users/:id/cocktails', (req, res) => {
  const { id } = req.params;
  console.log(`ID utilisateur reçu : ${id}`);

  db.all('SELECT * FROM cocktail WHERE Id_User = ?', [id], (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des cocktails :', err.message);
      res.status(500).json({ error: 'Erreur lors de la récupération des cocktails' });
    } else {
      console.log('Cocktails trouvés :', rows);
      res.json(rows);
    }
  });
});

// Démarrer le serveur
app.listen(port, () => {
  console.log(`API en écoute sur http://localhost:${port}/api/test`);
});

