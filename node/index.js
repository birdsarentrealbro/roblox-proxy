// index.js - Node + Express proxy
import express from 'express';
import fetch from 'node-fetch';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';


dotenv.config();


const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.MY_API_KEY || 'change_me';


// Simple in-memory cache
const cache = new Map();
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours


// Basic security middleware
app.use(helmet());
app.set('trust proxy', 1);


// Rate limiter (adjust as needed)
const limiter = rateLimit({
windowMs: 60 * 1000, // 1 minute
max: 60, // limit each IP to 60 requests per window
});
app.use(limiter);


app.get('/user/:id', async (req, res) => {
const key = req.header('x-api-key');
if (!key || key !== API_KEY) return res.status(401).json({ error: 'unauthorized' });


const userId = req.params.id;
if (!/^[0-9]+$/.test(userId)) return res.status(400).json({ error: 'bad_user_id' });


const cached = cache.get(userId);
if (cached && (Date.now() - cached.t) < CACHE_TTL_MS) {
return res.json(cached.v);
}


try {
const r = await fetch(`https://users.roblox.com/v1/users/${userId}`);
if (!r.ok) return res.status(r.status).send(await r.text());
const data = await r.json();
const out = { id: data.id, name: data.name, created: data.created };
cache.set(userId, { v: out, t: Date.now() });
return res.json(out);
} catch (err) {
console.error('fetch error', err);
return res.status(500).json({ error: 'fetch_failed' });
}
});


app.get('/', (req, res) => res.send('Roblox Users Proxy'));


app.listen(PORT, () => console.log(`Listening on ${PORT}`));
