Api_Cocktail pour YBoost:

Par:

Hebrard Dylan
LAGHALID Nohaeila
DAMIENS Giovanni
MOLINA Florian



npm install express
pour lancer l'API : node server.js


## Utilisation de l'API Cocktail

### Prérequis

- Node.js installé
- Installer les dépendances :
  ```
  npm install express sqlite3 bcrypt jsonwebtoken cors
  ```

### Lancer l'API

```
node api/server.js
```

---

## Structure des routes et exports

### Utilisateurs (`/api/users`)
- **Fichier route** : `api/routes/user.js`
- **Exports requis** :
  - `express`
  - `bcrypt`
  - `jsonwebtoken`
  - `../DataBase/db`
- **Fonctionnalités** :
  - Inscription : `POST /api/users`
  - Connexion : `POST /api/users/login`
  - Liste des utilisateurs : `GET /api/users`
  - Supprimer un utilisateur : `DELETE /api/users/:id`
  - Cocktails d'un utilisateur : `GET /api/users/:id/cocktails`

---

### Cocktails (`/api/cocktails`)
- **Fichier route** : `api/routes/cocktail.js`
- **Exports requis** :
  - `express`
  - `../DataBase/db`
- **Fonctionnalités** :
  - Ajouter un cocktail : `POST /api/cocktails`
  - Liste des cocktails : `GET /api/cocktails`
  - Détail d'un cocktail (avec ingrédients/recettes) : `GET /api/cocktails/:id`
  - Modifier le statut : `PUT /api/cocktails/:id`
  - Supprimer un cocktail : `DELETE /api/cocktails/:id`
  - Moyenne des notes : `GET /api/cocktails/:id/average`

---

### Avis/Notes (`/api/reviews`)
- **Fichier route** : `api/routes/review.js`
- **Exports requis** :
  - `express`
  - `../DataBase/db`
- **Fonctionnalités** :
  - Ajouter ou modifier une note : `POST /api/reviews`
  - Récupérer la note d'un utilisateur sur un cocktail : `GET /api/reviews/:userId/:cocktailId`

---

### Exemple d'import dans `server.js`

```javascript
const userRoutes = require('./routes/user');
const cocktailRoutes = require('./routes/cocktail');
const reviewRoutes = require('./routes/review');

app.use('/api/users', userRoutes);
app.use('/api/cocktails', cocktailRoutes);
app.use('/api/reviews', reviewRoutes);
```

---

**N'oublie pas** :  
- Toutes les routes utilisent la base de données SQLite via `../DataBase/db`.
- Les routes utilisateurs utilisent aussi `bcrypt` et `jsonwebtoken` pour la sécurité.

---

Pour toute nouvelle fonctionnalité, crée un fichier de route dédié dans `api/routes/` et exporte-le avec `module.exports = router;`.