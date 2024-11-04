const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();
const axios = require('axios');

// Activer CORS pour toutes les requêtes
app.use(cors());

app.get('/apimeteo', (req, res) => {
    console.log("Call /apimeteo");
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
    }).on('error', (err) => {
        console.error('Erreur lors de la requête :', err);
        res.status(500).send('Erreur lors de l\'appel de l\'API cible.');
    }).pipe(res);
});

app.get('/meteofrance', (req, res) => {
    console.log("Call /meteofrance");
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
    }).on('error', (err) => {
        console.error('Erreur lors de la requête :', err);
        res.status(500).send('Erreur lors de l\'appel de l\'API cible.');
    }).pipe(res);
});

app.get('/health', (req, res) => {
    console.log("Call /health");
});

// Fonction pour appeler le proxy
async function callProxy() {
    try {
        const response = await axios.get('https://proxy-ddj0.onrender.com/health');
    } catch (error) {
        console.error('Erreur lors de l\'appel du proxy :', error);
    }
}

// Appeler la fonction callProxy toutes les 10 minutes
setInterval(callProxy, 600000);

// Lancer le serveur sur le port par défaut de Render (ou 3000 en local)
app.listen(process.env.PORT, () => console.log("Proxy en ligne !"));