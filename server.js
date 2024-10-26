const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();

// Activer CORS pour toutes les requêtes
app.use(cors());

// Route pour intercepter les requêtes et transmettre le header Authorization
app.get('/proxy', (req, res) => {
    const targetUrl = req.query.url;
    const username = 'quentin_dusserre_quentin';
    const password = 'nIg974UeEM';
    const encodedCredentials = btoa(`${username}:${password}`);
    if (!targetUrl) {
        return res.status(400).send("URL cible manquante dans la requête.");
    }
    // Appel de l'API cible avec le header Authorization
    request({
        url: targetUrl,
        headers: {
            'Authorization': 'Basic ' + encodedCredentials,
            'Content-Type': 'application/json'
        }
    }).pipe(res);
});

// Lancer le serveur sur le port par défaut de Render (ou 3000 en local)
app.listen(process.env.PORT || 3000, () => console.log("Proxy CORS en ligne !"));
