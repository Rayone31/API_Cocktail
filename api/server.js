const express = require('express');
const cors = require('cors');
const db = require('./DataBase/db'); // Importer db.js

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

// Démarrer le serveur
app.listen(port, () => {
  console.log(`API en écoute sur http://localhost:${port}/api/test`);
});
