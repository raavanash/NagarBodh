import { describe, expect, it, vi } from 'vitest';
import {
  OpenWeatherProvider,
  ReplayWeatherProvider,
  WeatherContextProvider,
} from '../providers/WeatherContextProvider';

describe('OpenWeather Provider & Weather Provider Orchestrator', () => {
  it('1. OpenWeatherProvider fetches live weather via backend /api/weather proxy when configured', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        provider: 'openweather',
        source: 'OpenWeatherMap Live API',
        data: {
          main: { temp: 29.5, feels_like: 33.0, humidity: 84, pressure: 1009 },
          wind: { speed: 5.0, deg: 110 },
          weather: [{ main: 'Rain', description: 'heavy monsoon rain' }],
          rain: { '1h': 35.0 },
          name: 'NCR Region',
        },
      }),
    }) as any;

    try {
      const owProvider = new OpenWeatherProvider();
      const weatherEnv = await owProvider.getWeather(28.5832, 77.3188);

      expect(weatherEnv).not.toBeNull();
      expect(weatherEnv?.mode).toBe('live');
      expect(weatherEnv?.source).toContain('OpenWeatherMap');
      expect(weatherEnv?.data.temperatureCelsius).toBe(29.5);
      expect(weatherEnv?.data.precipitationMmPerHour).toBe(35.0);
      expect(weatherEnv?.data.alertLevel).toBe('orange');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('2. OpenWeatherProvider handles malformed JSON response gracefully', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        provider: 'openweather',
        data: null,
      }),
    }) as any;

    try {
      const owProvider = new OpenWeatherProvider();
      const weatherEnv = await owProvider.getWeather(28.5832, 77.3188);

      expect(weatherEnv).toBeNull();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('3. OpenWeatherProvider handles HTTP 403 / 500 errors gracefully', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    }) as any;

    try {
      const owProvider = new OpenWeatherProvider();
      const weatherEnv = await owProvider.getWeather(28.5832, 77.3188);

      expect(weatherEnv).toBeNull();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('4. OpenWeatherProvider handles timeout and network drops', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network timeout')) as any;

    try {
      const owProvider = new OpenWeatherProvider();
      const weatherEnv = await owProvider.getWeather(28.5832, 77.3188);

      expect(weatherEnv).toBeNull();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('5. Orchestrator prioritizes OpenWeather -> Replay -> Simulation', async () => {
    const provider = new WeatherContextProvider('live');

    // Scenario A: OpenWeather succeeds
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('provider=openweather')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ok: true,
            provider: 'openweather',
            data: {
              main: { temp: 28.0, humidity: 75 },
              weather: [{ main: 'Clouds', description: 'overcast' }],
            },
          }),
        });
      }
      return Promise.resolve({ ok: false });
    }) as any;

    try {
      const envA = await provider.getWeather(28.5832, 77.3188);
      expect(envA.source).toContain('OpenWeatherMap');
      expect(envA.mode).toBe('live');
    } finally {
      global.fetch = originalFetch;
    }

    // Scenario B: Live provider fails -> Fallback to Replay with error envelope
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as any;

    try {
      const envB = await provider.getWeather(28.5832, 77.3188);
      expect(envB.fallbackUsed).toBe(true);
      expect(envB.mode).toBe('error');
      expect(envB.data).toBeDefined(); // Application continues working without UI break
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('6. ReplayWeatherProvider returns complete deterministic envelope without network requests', async () => {
    const replay = new ReplayWeatherProvider();
    const env = await replay.getWeather(28.5832, 77.3188);

    expect(env.mode).toBe('demo_fallback');
    expect(env.source).toContain('Deterministic Historical Replay');
    expect(env.dataFreshness).toContain('Demo');
    expect(env.data.precipitationMmPerHour).toBeGreaterThan(0);
  });

  it('7. Orchestrator handles missing/fallback coordinates cleanly', async () => {
    const provider = new WeatherContextProvider('simulation');
    const env = await provider.getWeather(28.6518, 77.1906);

    expect(env).toBeDefined();
    expect(env.data.temperatureCelsius).toBeGreaterThan(0);
    expect(env.location.lat).toBe(28.6518);
    expect(env.location.lng).toBe(77.1906);
  });
});

