const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();
const axios = require('axios');

const dep = '44';
const lat = '47.2917';
const lon = '-2.5201';
const paramsDay = 't_2m:C,precip_1h:mm,wind_speed_10m:ms,wind_gusts_10m_1h:ms,wind_dir_10m:d,msl_pressure:hPa,weather_symbol_1h:idx,uv:idx';
const paramsWeek = 'sunrise:sql,sunset:sql,t_min_2m_24h:C,t_max_2m_24h:C,precip_24h:mm,wind_gusts_10m_24h:ms,msl_pressure:hPa,weather_symbol_24h:idx';

// Activer CORS pour toutes les requêtes
app.use(cors());

// Cache en mémoire
let cache = {
    meteoday: null,
    meteoweek: null,
    vigilance: null
};

// Durée de validité du cache en millisecondes)
const CACHE_DURATION_VIGILANCE = 60 * 60 * 1000;
const CACHE_DURATION_METEOMATICS_DAY = 10 * 60 * 1000;
const CACHE_DURATION_METEOMATICS_WEEK = 60 * 60 * 1000;

// Fonction pour mettre à jour le cache
function updateCache(service, data) {
    let duration;
    if (service === 'meteoday') duration = CACHE_DURATION_METEOMATICS_DAY;
    else if (service === 'meteoweek') duration = CACHE_DURATION_METEOMATICS_WEEK;
    else if (service === 'vigilance') duration = CACHE_DURATION_VIGILANCE;
    cache[service] = data;
}

// Route pour l'API de Vigilance Météo France
app.get('/vigilance', (res) => {
    console.log("Call /vigilance");
    return res.json(cache['vigilance']);
});
// Route pour l'API Meteomatics
app.get('/meteoday', (res) => {
    console.log("Call /meteoday");
    return res.json(cache['meteoday']);
});
app.get('/meteoweek', (res) => {
    console.log("Call /meteoweek");
    return res.json(cache['meteoweek']);
});

// Fonction pour mettre à jour le cache périodiquement
async function refreshCacheVigilance() {
    try {
        console.log("Mise à jour du cache Vigilance...");
        const vigilanceResponse = await axios.get(`https://public.opendatasoft.com/api/explore/v2.1/catalog/datasets/weatherref-france-vigilance-meteo-departement/records?where=domain_id%3D%22${dep}%22&limit=20E`);

        updateCache('vigilance', vigilanceResponse.data);
        console.log("Mise à jour du cache Vigilance OK !");

    } catch (error) {
        console.error('Erreur lors de la mise à jour du cache :', error);
    }
}
async function refreshCacheMeteoDay() {

    const currentDate = new Date();
    const currentHour = new Date(currentDate);
    currentHour.setMinutes(0, 0, 0);
    const beginDateDay = currentHour.toISOString().split('.')[0] + 'Z';

    try {
        console.log("Mise à jour du cache Meteo Matics Day...");
        const meteodayResponse = await axios.get(`https://api.meteomatics.com/${beginDateDay}PT23H:PT1H/${paramsDay}/${lat},${lon}/json`);

        updateCache('meteoday', meteodayResponse.data);
        console.log("Mise à jour du cache Meteo Matics Day OK !");

    } catch (error) {
        console.error('Erreur lors de la mise à jour du cache :', error);
    }
}
async function refreshCacheMeteoWeek() {

    const currentDate = new Date();
    const currentHour = new Date(currentDate);
    currentHour.setMinutes(0, 0, 0);
    const nextDayMidnight = new Date(currentDate);
    nextDayMidnight.setHours(0, 0, 0, 0);
    nextDayMidnight.setDate(nextDayMidnight.getDate() + 1);
    const beginDateWeek = nextDayMidnight.toISOString().split('.')[0] + 'Z';

    try {
        console.log("Mise à jour du cache Meteo Matics Week...");
        const meteoweekResponse = await axios.get(`https://api.meteomatics.com/${beginDateWeek}P6D:P1D/${paramsWeek}/${lat},${lon}/json`);

        updateCache('meteoweek', meteoweekResponse.data);
        console.log("Mise à jour du cache Meteo Matics Week OK !");

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