import * as dotenv from "dotenv"
import express, { response } from "express";
import fetch from "node-fetch";
import rateLimit from "express-rate-limit";
const app = express();
const port = 3000;
dotenv.config();

// Rate limiting - Goodreads limits to 1/sec, so we should too

// Enable if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
// see https://expressjs.com/en/guide/behind-proxies.html
// app.set('trust proxy', 1);

const limiter = rateLimit({
	windowMs: 1500, // 1.5 second
	max: 1, // limit each IP to 1 requests per windowMs
})

//  apply to all requests
app.use(limiter)

// Routes

// Test route, visit localhost:3000 to confirm it's working
// should show 'Hello World!' in the browser
// app.get("/", (req, res) => res.send("Hello World!"));

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

app.listen(port, () => console.log(`listening for API requests on http://localhost:${port}`));