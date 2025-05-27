const express = require('express');
const router = express.Router();
const db = require('../DataBase/db');

// Ajouter ou mettre à jour une note
router.post('/', (req, res) => {
  const { userId, cocktailId, note } = req.body;
  if (
    typeof userId !== 'number' ||
    typeof cocktailId !== 'number' ||
    typeof note !== 'number' ||
    note < 0 || note > 5
  ) {
    return res.status(400).json({ error: 'Paramètres invalides' });
  }
  db.run(
    `INSERT INTO review (Id_User, Id_Cocktail, Note)
     VALUES (?, ?, ?)
     ON CONFLICT(Id_User, Id_Cocktail) DO UPDATE SET Note=excluded.Note`,
    [userId, cocktailId, note],
    function (err) {
      if (err) {
        console.error('Erreur lors de l\'ajout/mise à jour de la note :', err.message);
        return res.status(500).json({ error: 'Erreur lors de l\'ajout/mise à jour de la note' });
      }
      // Mettre à jour la moyenne dans la table cocktail
      db.get(
        'SELECT AVG(Note) as average FROM review WHERE Id_Cocktail = ?',
        [cocktailId],
        (err, row) => {
          if (err) {
            console.error('Erreur lors du calcul de la moyenne :', err.message);
            return res.status(500).json({ error: 'Erreur lors du calcul de la moyenne' });
          }
          const moyenne = row && row.average ? Number(row.average).toFixed(2) : 0;
          db.run(
            'UPDATE cocktail SET Note = ? WHERE Id_Cocktail = ?',
            [moyenne, cocktailId],
            (err) => {
              if (err) {
                console.error('Erreur lors de la mise à jour de la note du cocktail :', err.message);
                return res.status(500).json({ error: 'Erreur lors de la mise à jour de la note du cocktail' });
              }
              res.status(201).json({ message: 'Note enregistrée avec succès' });
            }
          );
        }
      );
    }
  );
});

// Récupérer la note d'un utilisateur sur un cocktail
router.get('/:userId/:cocktailId', (req, res) => {
  const { userId, cocktailId } = req.params;
  db.get(
    'SELECT Note FROM review WHERE Id_User = ? AND Id_Cocktail = ?',
    [userId, cocktailId],
    (err, row) => {
      if (err) {
        console.error('Erreur lors de la récupération de la note :', err.message);
        return res.status(500).json({ error: 'Erreur lors de la récupération de la note' });
      }
      res.json({ note: row ? row.Note : null });
    }
  );
});

module.exports = router;