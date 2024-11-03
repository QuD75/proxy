const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();

// Activer CORS pour toutes les requêtes
app.use(cors());

app.get('/apimeteo', (req, res) => {
    const targetUrl = req.query.url;
    const username = process.env.USERNAME_METEOMATICS;
    const password = process.env.PASSWORD_METEOMATICS;
    const encodedCredentials = Buffer.from(`${username}:${password}`).toString('base64');
    if (!targetUrl) {
        return res.status(400).send("URL cible manquante dans la requête.");
    }
    request({
        url: targetUrl,
        headers: {
            'Authorization': 'Basic ' + encodedCredentials,
            'Content-Type': 'application/json'
        }
    }).pipe(res);
});

app.get('/meteofrance', (req, res) => {
    const targetUrl = req.query.url;
    const apiKey = process.env.API_KEY_METEOFRANCE;
    if (!targetUrl) {
        return res.status(400).send("URL cible manquante dans la requête.");
    }
    request({
        url: targetUrl,
        headers: {
            'apikey': apiKey
        }
    }).pipe(res);
});

// Lancer le serveur sur le port par défaut de Render (ou 3000 en local)
app.listen(process.env.PORT || 3000, () => console.log("Proxy CORS en ligne !"));
