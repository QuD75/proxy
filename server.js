const express = require('express');
const request = require('request');
const cors = require('cors');
const app = express();

// Activer CORS pour toutes les requêtes
app.use(cors());

app.get('/apimeteo', (req, res) => {
    const targetUrl = req.query.url;
    const username = process.env.USERNAME;
    const password = process.env.PASSWORD;
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
    if (!targetUrl) {
        return res.status(400).send("URL cible manquante dans la requête.");
    }
    request({
        url: targetUrl,
        headers: {
            'apikey': 'eyJ4NXQiOiJZV0kxTTJZNE1qWTNOemsyTkRZeU5XTTRPV014TXpjek1UVmhNbU14T1RSa09ETXlOVEE0Tnc9PSIsImtpZCI6ImdhdGV3YXlfY2VydGlmaWNhdGVfYWxpYXMiLCJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJRdWVudGluNzVAY2FyYm9uLnN1cGVyIiwiYXBwbGljYXRpb24iOnsib3duZXIiOiJRdWVudGluNzUiLCJ0aWVyUXVvdGFUeXBlIjpudWxsLCJ0aWVyIjoiVW5saW1pdGVkIiwibmFtZSI6IkRlZmF1bHRBcHBsaWNhdGlvbiIsImlkIjoxOTI1MiwidXVpZCI6IjYxN2M3NGYzLWZlZDEtNDBlMS05NGEyLTViMTBjYmZkNjA3YiJ9LCJpc3MiOiJodHRwczpcL1wvcG9ydGFpbC1hcGkubWV0ZW9mcmFuY2UuZnI6NDQzXC9vYXV0aDJcL3Rva2VuIiwidGllckluZm8iOnsiNTBQZXJNaW4iOnsidGllclF1b3RhVHlwZSI6InJlcXVlc3RDb3VudCIsImdyYXBoUUxNYXhDb21wbGV4aXR5IjowLCJncmFwaFFMTWF4RGVwdGgiOjAsInN0b3BPblF1b3RhUmVhY2giOnRydWUsInNwaWtlQXJyZXN0TGltaXQiOjAsInNwaWtlQXJyZXN0VW5pdCI6InNlYyJ9LCI2MFJlcVBhck1pbiI6eyJ0aWVyUXVvdGFUeXBlIjoicmVxdWVzdENvdW50IiwiZ3JhcGhRTE1heENvbXBsZXhpdHkiOjAsImdyYXBoUUxNYXhEZXB0aCI6MCwic3RvcE9uUXVvdGFSZWFjaCI6dHJ1ZSwic3Bpa2VBcnJlc3RMaW1pdCI6MCwic3Bpa2VBcnJlc3RVbml0Ijoic2VjIn19LCJrZXl0eXBlIjoiUFJPRFVDVElPTiIsInN1YnNjcmliZWRBUElzIjpbeyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkFST01FIiwiY29udGV4dCI6IlwvcHVibGljXC9hcm9tZVwvMS4wIiwicHVibGlzaGVyIjoiYWRtaW5fbWYiLCJ2ZXJzaW9uIjoiMS4wIiwic3Vic2NyaXB0aW9uVGllciI6IjUwUGVyTWluIn0seyJzdWJzY3JpYmVyVGVuYW50RG9tYWluIjoiY2FyYm9uLnN1cGVyIiwibmFtZSI6IkRvbm5lZXNQdWJsaXF1ZXNWaWdpbGFuY2UiLCJjb250ZXh0IjoiXC9wdWJsaWNcL0RQVmlnaWxhbmNlXC92MSIsInB1Ymxpc2hlciI6ImFkbWluIiwidmVyc2lvbiI6InYxIiwic3Vic2NyaXB0aW9uVGllciI6IjYwUmVxUGFyTWluIn1dLCJleHAiOjE4MjQ3OTUwMjIsInRva2VuX3R5cGUiOiJhcGlLZXkiLCJpYXQiOjE3MzAxMjIyMjIsImp0aSI6ImYwNjY4MjM4LTdmY2MtNDNlZC1iMDhhLWUyMzg0NDY0NjQ5NyJ9.GUriNOP6gjClJSn8EP-FeBNs_Qhtu_ZXsJvozpw_55c_EB9H9tftAkAO9DIt8nEGxgk2ovdrsKnBbv4zISz68SlMrPLE4-g8kdV62uHeG7MQy3QC14fpi14kBqLLefMipp8rej57zEE0Ap5SqJodFHde_gDl1kTHG8hwCly1-FKmahT6r-49cXqvpFF1slam17F8LSfSl-DINEwDxufv6QiDAJMOJ_iNk_RCF_mDXmiRgP4-WSz4Sp876mHovKzNFM40u5Lvy4ACiiq-o4FxVMcTKseOB6iICdWjZb8plFPHNkDDziqqUtAPf6v5HYEdiaPyTwDRW1opZcKbvqXPCQ=='
        }
    }).pipe(res);
});

// Lancer le serveur sur le port par défaut de Render (ou 3000 en local)
app.listen(process.env.PORT || 3000, () => console.log("Proxy CORS en ligne !"));
