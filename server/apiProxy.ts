import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import path from 'node:path';

// Helper to auto-load .env and .env.local variables into process.env if not set
export function loadEnvFiles() {
  const envNames = ['.env', '.env.local'];
  const baseDirs = [process.cwd(), path.resolve(process.cwd(), '..')];
  
  for (const baseDir of baseDirs) {
    for (const envName of envNames) {
      const fullPath = path.resolve(baseDir, envName);
      if (fs.existsSync(fullPath)) {
        try {
          const content = fs.readFileSync(fullPath, 'utf8');
          for (const line of content.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
              const eqIdx = trimmed.indexOf('=');
              const key = trimmed.substring(0, eqIdx).trim();
              const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
              if (key && val) {
                process.env[key] = val;
              }
            }
          }
        } catch (e) {
          console.error('[ NAGARBODH SERVER ] Failed reading env file:', fullPath, e);
        }
      }
    }
  }
}
loadEnvFiles();

interface FetchResult {
  ok: boolean;
  status: number;
  statusText?: string;
  data: any;
}

// Startup environment configuration check (never prints key strings)
console.log('[ NAGARBODH SERVER ] GOOGLE_WEATHER_API_KEY configured:', Boolean(process.env.GOOGLE_WEATHER_API_KEY));
console.log('[ NAGARBODH SERVER ] OPENWEATHER_API_KEY configured:', Boolean(process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY));
console.log('[ NAGARBODH SERVER ] X_BEARER_TOKEN configured:', Boolean(process.env.X_BEARER_TOKEN || process.env.VITE_X_BEARER_TOKEN));
console.log('[ NAGARBODH SERVER ] GEMINI_API_KEY configured:', Boolean(process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY));

function fetchUrl(url: string, options: { method?: string; headers?: Record<string, string>; body?: any } = {}): Promise<FetchResult> {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(url);
    const transport = parsedUrl.protocol === 'https:' ? https : http;
    const reqOptions = {
      hostname: parsedUrl.hostname,
      port: parsedUrl.port || (parsedUrl.protocol === 'https:' ? 443 : 80),
      path: parsedUrl.pathname + parsedUrl.search,
      method: options.method || 'GET',
      headers: options.headers || {}
    };

    const req = transport.request(reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        let parsed: any;
        try {
          parsed = JSON.parse(data);
        } catch {
          parsed = data;
        }
        resolve({
          ok: (res.statusCode ?? 500) >= 200 && (res.statusCode ?? 500) < 300,
          status: res.statusCode ?? 500,
          statusText: res.statusMessage,
          data: parsed
        });
      });
    });

    req.on('error', err => reject(err));
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

export async function handleApiRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<boolean> {
  loadEnvFiles();
  const reqUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = reqUrl.pathname;

  // Add CORS & Content-Type headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return true;
  }

  // 1. Weather Route: Google Weather -> OpenWeatherMap -> Replay Fallback
  if (pathname === '/api/weather') {
    const lat = reqUrl.searchParams.get('lat') || '28.583';
    const lng = reqUrl.searchParams.get('lng') || '77.318';
    const requestedProvider = reqUrl.searchParams.get('provider') || 'auto';

    const googleKey = (process.env.GOOGLE_WEATHER_API_KEY || '').trim();
    const openweatherKey = (process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY || '').trim();

    res.setHeader('Content-Type', 'application/json');

    // (A) Attempt Google Weather if key configured and not explicitly set to openweather
    if (
      (requestedProvider === 'google' || requestedProvider === 'auto') &&
      googleKey &&
      googleKey !== 'your_google_weather_api_key_here'
    ) {
      try {
        const gwRes = await fetchUrl(
          `https://weather.googleapis.com/v1/currentConditions:lookup?key=${googleKey}&location.latitude=${lat}&location.longitude=${lng}`
        );
        if (gwRes.ok && gwRes.data?.currentConditions) {
          res.statusCode = 200;
          res.end(JSON.stringify({
            ok: true,
            provider: 'google',
            source: 'Google Weather API (Hyperlocal Grid)',
            data: gwRes.data
          }));
          return true;
        }
      } catch (err: any) {
        console.warn('[ NAGARBODH SERVER ] Google Weather request failed, attempting OpenWeather fallback:', err.message);
      }
    }

    // (B) Attempt OpenWeatherMap if configured
    if (openweatherKey && openweatherKey !== 'your_openweather_api_key_here') {
      try {
        const owRes = await fetchUrl(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${openweatherKey}&units=metric`
        );
        if (owRes.ok && owRes.data) {
          res.statusCode = 200;
          res.end(JSON.stringify({
            ok: true,
            provider: 'openweather',
            source: 'OpenWeatherMap Live API',
            data: owRes.data
          }));
          return true;
        }
      } catch (err: any) {
        console.warn('[ NAGARBODH SERVER ] OpenWeather request failed:', err.message);
      }
    }

    // (C) Honest Fallback: Inform client that live weather keys are unconfigured
    res.statusCode = 200;
    res.end(JSON.stringify({
      ok: false,
      provider: 'replay_fallback',
      message: 'Live weather API keys unconfigured or unreachable. Using deterministic replay simulation.',
      supportedProviders: ['google', 'openweather', 'replay']
    }));
    return true;
  }

  // 2. Bluesky Social Route: https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts
  if (pathname === '/api/social/bluesky') {
    const query = reqUrl.searchParams.get('query') || reqUrl.searchParams.get('q') || 'waterlogging Delhi';
    const limit = reqUrl.searchParams.get('limit') || '25';
    const sort = reqUrl.searchParams.get('sort') || 'latest';
    const bskyEndpoint = 'https://public.api.bsky.app/xrpc/app.bsky.feed.searchPosts';

    res.setHeader('Content-Type', 'application/json');

    console.log(`[Bluesky] Query: "${query}" (sort=${sort}, limit=${limit})`);

    try {
      const bskyUrl = `${bskyEndpoint}?q=${encodeURIComponent(query)}&sort=${encodeURIComponent(sort)}&limit=${encodeURIComponent(limit)}`;
      const bskyRes = await fetchUrl(bskyUrl, {
        headers: {
          'User-Agent': 'NagarBodh-CivicSignals/1.0',
          'Accept': 'application/json'
        }
      });

      console.log(`[Bluesky] HTTP status: ${bskyRes.status}`);

      if (!bskyRes.ok) {
        const errorDetail = typeof bskyRes.data === 'object' && bskyRes.data?.message
          ? bskyRes.data.message
          : (bskyRes.statusText || 'Search posts failed');
        console.warn(`[Bluesky] Upstream returned HTTP ${bskyRes.status} from ${bskyEndpoint}`);

        res.statusCode = 200;
        res.end(JSON.stringify({
          ok: false,
          fallback: false,
          provider: 'bluesky',
          status: bskyRes.status,
          errorCode: bskyRes.status === 403 ? 'UPSTREAM_FORBIDDEN' : 'UPSTREAM_ERROR',
          message: `Bluesky API returned HTTP ${bskyRes.status}: ${errorDetail}`,
          endpoint: bskyEndpoint
        }));
        return true;
      }

      const posts = bskyRes.data?.posts || [];
      console.log(`[Bluesky] Raw posts: ${posts.length}`);

      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: true,
        data: posts,
        query,
        count: posts.length,
        endpoint: bskyEndpoint
      }));
      return true;
    } catch (err: any) {
      console.error(`[Bluesky] Network/request exception: ${err.message}`);
      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: false,
        fallback: false,
        provider: 'bluesky',
        status: 502,
        errorCode: 'UPSTREAM_NETWORK_ERROR',
        message: `Bluesky API network request failed: ${err.message}`,
        endpoint: bskyEndpoint
      }));
      return true;
    }
  }

  // 3. Social / X Route (Optional / Legacy): X API v2 -> Simulated Fallback
  if (pathname === '/api/social') {
    const query = reqUrl.searchParams.get('query') || '(waterlogging OR "drain overflow" OR "paani bhar gaya") (Delhi OR Noida OR Gurgaon)';
    const maxResults = reqUrl.searchParams.get('max_results') || '10';
    let token = (process.env.X_BEARER_TOKEN || process.env.VITE_X_BEARER_TOKEN || '').trim();

    res.setHeader('Content-Type', 'application/json');
    if (!token || token.includes('your_x_bearer_token')) {
      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: false,
        fallback: true,
        error: 'X_BEARER_TOKEN is not configured on backend server. Operating in simulated replay feed mode.'
      }));
      return true;
    }

    token = token.replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '');
    if (token.includes('%')) {
      try { token = decodeURIComponent(token); } catch {}
    }

    try {
      const xRes = await fetchUrl(
        `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&tweet.fields=created_at,author_id&max_results=${maxResults}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (!xRes.ok) {
        res.statusCode = 200;
        res.end(JSON.stringify({
          ok: false,
          fallback: true,
          status: xRes.status,
          error: `X API returned HTTP ${xRes.status}: ${xRes.data?.detail || xRes.data?.title || xRes.statusText || 'Fetch failed'}`
        }));
        return true;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, data: xRes.data?.data || [] }));
      return true;
    } catch (err: any) {
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: false, fallback: true, error: `X API network request failed: ${err.message}` }));
      return true;
    }
  }

  // 3. Gemini REST Route: Server-side secret protection, strictly no client-side secret forwarding
  if (pathname === '/api/gemini') {
    res.setHeader('Content-Type', 'application/json');

    // Read POST body
    let bodyData = '';
    req.on('data', chunk => { bodyData += chunk; });
    await new Promise(resolve => req.on('end', resolve));

    let bodyJson: any = {};
    try {
      if (bodyData) bodyJson = JSON.parse(bodyData);
    } catch {}

    // Security hardening: Server-side environment key ONLY. Reject client body key.
    const apiKey = (process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      res.statusCode = 200;
      res.end(JSON.stringify({
        ok: false,
        fallback: true,
        error: 'GEMINI_API_KEY is not configured on backend server. Operating in deterministic AI fallback mode.'
      }));
      return true;
    }

    const model = bodyJson.model || 'gemini-2.0-flash';
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };

    try {
      const geminiRes = await fetchUrl(
        geminiUrl,
        {
          method: 'POST',
          headers,
          body: bodyJson.payload || bodyJson
        }
      );

      if (!geminiRes.ok) {
        res.statusCode = 200;
        res.end(JSON.stringify({
          ok: false,
          fallback: true,
          status: geminiRes.status,
          error: `Gemini API returned HTTP ${geminiRes.status}: ${geminiRes.data?.error?.message || geminiRes.statusText || 'Fetch failed'}`
        }));
        return true;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, data: geminiRes.data }));
      return true;
    } catch (err: any) {
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: false, fallback: true, error: `Gemini network request failed: ${err.message}` }));
      return true;
    }
  }

  return false;
}

