# Roblox Users API Proxy


Simple proxy that fetches basic user info (id, name, created) from Roblox's Users API and caches results.


Two deployment options are included:
- Node + Express (suitable for Replit, Render, Vercel)
- Cloudflare Worker (very lightweight)


## Features
- Simple API key auth (`x-api-key` header)
- In-memory caching (24 hours by default)
- Minimal surface area: returns only fields needed


## Files
- `node/` - Node Express app
- `worker/` - Cloudflare Worker example
- `.env.example` - environment variables example


## Usage
1. Pick the deployment method (Node or Worker).
2. Set `MY_API_KEY` to a strong random string in your host's environment variables.
3. Deploy.
4. Call from Roblox Server Script using `HttpService:GetAsync` (HTTP requests must be enabled).


Example Roblox call (server script):


```lua
local HttpService = game:GetService("HttpService")
local proxyUrl = "https://your-domain.com/user/12345"
local apiKey = "your_api_key"


local success, result = pcall(function()
return HttpService:GetAsync(proxyUrl, true, { ["x-api-key"] = apiKey })
end)


if success then
local data = HttpService:JSONDecode(result)
print(data.created)
else
warn("proxy request failed: ".. tostring(result))
end
