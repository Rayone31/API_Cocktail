const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Import des routes
const userRoutes = require('./routes/user');
const cocktailRoutes = require('./routes/cocktail');
const reviewRoutes = require('./routes/review');

// Utilisation des routes
app.use('/api/users', userRoutes);
app.use('/api/cocktails', cocktailRoutes);
app.use('/api/reviews', reviewRoutes);

// Exemple route test
app.get('/api/test', (req, res) => {
  const db = require('./DataBase/db');
  db.get('SELECT content FROM messages LIMIT 1', (err, row) => {
    if (err) {
      res.status(500).json({ error: 'Erreur lors de la récupération du message' });
    } else {
      res.json({ message: row ? row.content : 'Aucun message trouvé' });
    }
  });
});

app.listen(port, () => {
  console.log(`API en écoute sur http://localhost:${port}/api/test`);
});