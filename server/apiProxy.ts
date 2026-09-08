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

  if (pathname === '/api/weather') {
    const lat = reqUrl.searchParams.get('lat') || '28.583';
    const lng = reqUrl.searchParams.get('lng') || '77.318';
    const apiKey = (process.env.OPENWEATHER_API_KEY || process.env.VITE_OPENWEATHER_API_KEY || '').trim();

    res.setHeader('Content-Type', 'application/json');
    if (!apiKey || apiKey === 'your_openweather_api_key_here') {
      res.statusCode = 400;
      res.end(JSON.stringify({
        ok: false,
        error: 'OPENWEATHER_API_KEY is missing or unconfigured on backend server.'
      }));
      return true;
    }

    try {
      const owRes = await fetchUrl(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`);
      if (!owRes.ok) {
        res.statusCode = owRes.status || 500;
        res.end(JSON.stringify({
          ok: false,
          status: owRes.status,
          error: `OpenWeather API returned HTTP ${owRes.status}: ${owRes.data?.message || owRes.statusText || 'Fetch failed'}`
        }));
        return true;
      }
      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, data: owRes.data }));
      return true;
    } catch (err: any) {
      res.statusCode = 502;
      res.end(JSON.stringify({ ok: false, error: `OpenWeather network request failed: ${err.message}` }));
      return true;
    }
  }

  if (pathname === '/api/social') {
    const query = reqUrl.searchParams.get('query') || '(waterlogging OR "drain overflow" OR "paani bhar gaya") (Delhi OR Noida OR Gurgaon)';
    const maxResults = reqUrl.searchParams.get('max_results') || '10';
    let token = process.env.X_BEARER_TOKEN || process.env.VITE_X_BEARER_TOKEN || '';

    res.setHeader('Content-Type', 'application/json');
    if (!token || token.includes('your_x_bearer_token')) {
      res.statusCode = 400;
      res.end(JSON.stringify({
        ok: false,
        error: 'X_BEARER_TOKEN is missing or unconfigured on backend server.'
      }));
      return true;
    }

    token = token.trim().replace(/^["']|["']$/g, '').replace(/^Bearer\s+/i, '');
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
        res.statusCode = xRes.status || 500;
        res.end(JSON.stringify({
          ok: false,
          status: xRes.status,
          error: `X API returned HTTP ${xRes.status}: ${xRes.data?.detail || xRes.data?.title || xRes.statusText || 'Fetch failed'}`
        }));
        return true;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, data: xRes.data?.data || [] }));
      return true;
    } catch (err: any) {
      res.statusCode = 502;
      res.end(JSON.stringify({ ok: false, error: `X API network request failed: ${err.message}` }));
      return true;
    }
  }

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

    const apiKey = (bodyJson.apiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '').trim();

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      res.statusCode = 400;
      res.end(JSON.stringify({
        ok: false,
        error: 'GEMINI_API_KEY is missing or unconfigured on backend server.'
      }));
      return true;
    }

    const model = bodyJson.model || 'gemini-3.6-flash';
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
        res.statusCode = geminiRes.status || 500;
        res.end(JSON.stringify({
          ok: false,
          status: geminiRes.status,
          error: `Gemini API returned HTTP ${geminiRes.status}: ${geminiRes.data?.error?.message || geminiRes.statusText || 'Fetch failed'}`
        }));
        return true;
      }

      res.statusCode = 200;
      res.end(JSON.stringify({ ok: true, data: geminiRes.data }));
      return true;
    } catch (err: any) {
      res.statusCode = 502;
      res.end(JSON.stringify({ ok: false, error: `Gemini network request failed: ${err.message}` }));
      return true;
    }
  }

  return false;
}
