addEventListener('fetch', event => {
event.respondWith(handle(event.request));
});


// In production, store the key in a secret and reference it here
const API_KEY = 'change_me';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h


// Simple in-memory cache (per worker instance)
const cache = new Map();


async function handle(request) {
const url = new URL(request.url);
const key = request.headers.get('x-api-key');
if (!key || key !== API_KEY) return new Response('unauthorized', { status: 401 });


const parts = url.pathname.split('/').filter(Boolean); // e.g. /user/12345
if (parts.length !== 2 || parts[0] !== 'user') return new Response('not found', { status: 404 });


const userId = parts[1];
if (!/^[0-9]+$/.test(userId)) return new Response('bad user id', { status: 400 });


const c = cache.get(userId);
if (c && (Date.now() - c.t) < CACHE_TTL_MS) {
return new Response(JSON.stringify(c.v), { headers: { 'Content-Type': 'application/json' } });
}


try {
const r = await fetch(`https://users.roblox.com/v1/users/${userId}`);
if (!r.ok) return new Response(await r.text(), { status: r.status });
const j = await r.json();
const out = { id: j.id, name: j.name, created: j.created };
cache.set(userId, { v: out, t: Date.now() });
return new Response(JSON.stringify(out), { headers: { 'Content-Type': 'application/json' } });
} catch (err) {
return new Response('fetch error', { status: 502 });
}
}
