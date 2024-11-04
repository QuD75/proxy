const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();
const axios = require('axios');

// Activer CORS pour toutes les requêtes
app.use(cors());

// Cache en mémoire
let cache = {
    meteoday: null,
    meteoweek: null,
    vigilance: null
};
let cacheExpiration = {
    meteoday: 0,
    meteoweek: 0,
    vigilance: 0
};

// Durée de validité du cache en millisecondes)
const CACHE_DURATION_VIGILANCE = 60 * 60 * 1000;
const CACHE_DURATION_METEOMATICS_DAY = 10 * 60 * 1000;
const CACHE_DURATION_METEOMATICS_WEEK = 60 * 60 * 1000;

// Fonction pour vérifier si le cache est encore valide
function isCacheValid(service) {
    return cache[service] && (Date.now() < cacheExpiration[service]);
}

// Fonction pour mettre à jour le cache
function updateCache(service, data) {
    let duration;
    if (service === 'meteoday') duration = CACHE_DURATION_METEOMATICS_DAY;
    else if (service === 'meteoweek') duration = CACHE_DURATION_METEOMATICS_WEEK;
    else if (service === 'vigilance') duration = CACHE_DURATION_VIGILANCE;
    cache[service] = data;
    cacheExpiration[service] = Date.now() + duration;
}

// Route pour l'API Meteomatics
app.get('/meteoday', (req, res) => {
    console.log("Call /meteoday");

    if (isCacheValid('meteoday')) {
        // Utiliser le cache si valide
        return res.json(cache['meteoday']);
    }

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
        },
        json: true
    }, (error, response, body) => {
        if (error) {
            console.error('Erreur lors de la requête :', error);
            return res.status(500).send('Erreur lors de l\'appel de l\'API cible.');
        }

        // Mettre en cache la réponse
        updateCache('meteoday', body);
        res.json(body);
    });
});
app.get('/meteoweek', (req, res) => {
    console.log("Call /meteoweek");

    if (isCacheValid('meteoweek')) {
        // Utiliser le cache si valide
        return res.json(cache['meteoweek']);
    }

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
        },
        json: true
    }, (error, response, body) => {
        if (error) {
            console.error('Erreur lors de la requête :', error);
            return res.status(500).send('Erreur lors de l\'appel de l\'API cible.');
        }

        // Mettre en cache la réponse
        updateCache('meteoweek', body);
        res.json(body);
    });
});

// Route pour l'API de Vigilance Météo France
app.get('/vigilance', (req, res) => {
    console.log("Call /vigilance");

    if (isCacheValid('vigilance')) {
        // Utiliser le cache si valide
        return res.json(cache['vigilance']);
    }

    const targetUrl = req.query.url;
    const apiKey = process.env.API_KEY_VIGILANCE;

    if (!targetUrl) {
        return res.status(400).send("URL cible manquante dans la requête.");
    }

    request({
        url: targetUrl,
        headers: {
            'apikey': apiKey
        },
        json: true
    }, (error, response, body) => {
        if (error) {
            console.error('Erreur lors de la requête :', error);
            return res.status(500).send('Erreur lors de l\'appel de l\'API cible.');
        }

        // Mettre en cache la réponse
        updateCache('vigilance', body);
        res.json(body);
    });
});

// Fonction pour appeler le proxy et mettre à jour le cache périodiquement
async function refreshCacheMeteoDay() {
    try {
        console.log("Mise à jour du cache Meteo Matics Day...");
        const meteodayUrl = "URL_DE_L_API_METEOMATICS";  // Remplace par l'URL réelle
        const meteodayResponse = await axios.get(`http://localhost:${process.env.PORT}/apimeteo?url=${encodeURIComponent(meteodayUrl)}`);

        updateCache('meteoday', meteodayResponse.data);
        console.log("Mise à jour du cache Meteo Matics Day OK !");

    } catch (error) {
        console.error('Erreur lors de la mise à jour du cache :', error);
    }
}
async function refreshCacheMeteoWeek() {
    try {
        console.log("Mise à jour du cache Meteo Matics Week...");
        const meteoweekUrl = "URL_DE_L_API_METEOMATICS";  // Remplace par l'URL réelle
        const meteoweekResponse = await axios.get(`http://localhost:${process.env.PORT}/apimeteo?url=${encodeURIComponent(meteoweekUrl)}`);

        updateCache('meteoweek', meteoweekResponse.data);
        console.log("Mise à jour du cache Meteo Matics Week OK !");

    } catch (error) {
        console.error('Erreur lors de la mise à jour du cache :', error);
    }
}
async function refreshCacheVigilance() {
    try {
        console.log("Mise à jour du cache Vigilance...");
        const vigilanceUrl = "URL_DE_L_API_METEOFRANCE";  // Remplace par l'URL réelle
        const vigilanceResponse = await axios.get(`http://localhost:${process.env.PORT}/meteofrance?url=${encodeURIComponent(vigilanceUrl)}`);

        updateCache('vigilance', vigilanceResponse.data);
        console.log("Mise à jour du cache Vigilance OK !");

    } catch (error) {
        console.error('Erreur lors de la mise à jour du cache :', error);
    }
}

// Rafraîchir le cache
setInterval(refreshCacheVigilance, CACHE_DURATION_VIGILANCE);
setInterval(refreshCacheMeteoDay, CACHE_DURATION_METEOMATICS_DAY);
setInterval(refreshCacheMeteoWeek, CACHE_DURATION_METEOMATICS_WEEK);

// Lancer le serveur sur le port par défaut de Render (ou 3000 en local)
app.listen(process.env.PORT, () => console.log("Proxy en ligne !"));