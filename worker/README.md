Cloudflare Worker deployment


1. Create a new Worker in Cloudflare dashboard.
2. Copy `worker/worker.js` into the worker script.
3. Set a Worker secret `MY_API_KEY` via the dashboard (recommended) and read it using
`const API_KEY = MY_API_KEY;` if using Wrangler; otherwise inline for testing.
