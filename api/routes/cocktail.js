const express = require('express');
const router = express.Router();
const db = require('../DataBase/db');

// Ajouter un cocktail
router.post('/', (req, res) => {
  const { name, category, origin, image, userId, ingredients, recipes } = req.body;
  const status = 'à Vérifier';
  const note = 0;
  if (!name || !category || !origin || !image || !userId || !Array.isArray(ingredients) || !Array.isArray(recipes)) {
    return res.status(400).json({ error: 'Tous les champs sont requis' });
  }
  db.run(
    `INSERT INTO cocktail (Name_Cocktail, Categorie, Origine, Image, Statut, Note, Id_User)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [name, category, origin, image, status, note, userId],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'ajout du cocktail :', err.message);
        return res.status(500).json({ error: 'Erreur lors de l\'ajout du cocktail' });
      }
      const cocktailId = this.lastID;
      ingredients.forEach(ing => {
        db.run(
          `INSERT INTO ingredient (Id_Cocktail, Liste_Ingredient) VALUES (?, ?)`,
          [cocktailId, ing.liste_ingredient]
        );
      });
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

// Récupérer tous les cocktails
router.get('/', (req, res) => {
  db.all('SELECT * FROM cocktail', (err, rows) => {
    if (err) {
      console.error('Erreur lors de la récupération des cocktails :', err.message);
      res.status(500).json({ error: 'Erreur lors de la récupération des cocktails' });
    } else {
      res.json(rows);
    }
  });
});

// Récupérer un cocktail par ID (avec ingrédients et recettes)
router.get('/:id', (req, res) => {
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

// Mettre à jour le statut d'un cocktail
router.put('/:id', (req, res) => {
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

// Supprimer un cocktail
router.delete('/:id', (req, res) => {
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

// Moyenne des notes d'un cocktail
router.get('/:id/average', (req, res) => {
  const { id } = req.params;
  db.get(
    'SELECT AVG(Note) as average FROM review WHERE Id_Cocktail = ?',
    [id],
    (err, row) => {
      if (err) {
        console.error('Erreur lors de la récupération de la moyenne :', err.message);
        return res.status(500).json({ error: 'Erreur lors de la récupération de la moyenne' });
      }
      res.json({ average: row.average ? Number(row.average).toFixed(2) : null });
    }
  );
});

module.exports = router;