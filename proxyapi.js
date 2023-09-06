import * as dotenv from "dotenv"

import express from "express";
import fetch from "node-fetch";
import path from "path";
import rateLimit from "express-rate-limit";

import { fileURLToPath } from "url";

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const app = express();
const port = 443;
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebase = initializeApp(JSON.parse(process.env.FIREBASE_CONFIG));
const auth = getAuth(firebase);

const limiter = rateLimit({
	windowMs: 500,
	max: 10,
})

// apply to all requests
app.use(limiter)

// serve web content when browsing on http://localhost/
app.use("/", express.static(__dirname, {extensions: ['*/*']}));

// serve API, looking for GET requests
app.get("/api/geo", (req, res) => {
    try {
		var lat = req.query.lat;
        var lon = req.query.lon;


        // Pra mais informações sobre o resultado da API,
        // visite https://apidocs.geoapify.com/docs/geocoding/reverse-geocoding
        return fetch(`https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${process.env.VITE_GEOAPIFY_API}`, { method: 'GET' })
        .then(r => r.json()).then(response => {

            console.info(`sending geolocation api response...`);
            return res.setHeader('Access-Control-Allow-Origin', '*').send(response);
        })

    } catch (err) {
        return res.status(500).json({ code: err.code, message: err.message });
    }
});

// serve POST listening for registering users
app.post('/user/register/:email/:password', (req, res) => {
    let email = req.params.email;
    let password = req.params.password;

    createUserWithEmailAndPassword(auth, email, password).then((userCredential) => {
        res.status(200).json({user: userCredential});
    }).catch((error) => {
        res.status(error.code).json(error);
    });
})

// serve GET listening for logging existing users
app.get('/user/login/:email/:password', (req, res) => {
    let email = req.params.email;
    let password = req.params.password;

    signInWithEmailAndPassword(auth, email, password).then((userCredential) => {
        res.status(200).json({user: userCredential});
    }).catch((error) => {
        res.status(error.code).json(error);
    });
})

// serve 404 error page.
app.use(express.static(__dirname + '/404'), (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '/404/index.html'));
});

app.listen(port, () => console.log(`serving WEB content and REST API requests on http://localhost:${port}`));