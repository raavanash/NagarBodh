import { describe, expect, it, vi } from 'vitest';
import {
  GoogleWeatherProvider,
  ReplayWeatherProvider,
  WeatherContextProvider,
} from '../providers/WeatherContextProvider';

describe('Google Weather Provider & Multi-Tier Weather Provider Orchestrator', () => {
  it('1. GoogleWeatherProvider fetches live weather via backend /api/weather proxy when configured', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        provider: 'google',
        source: 'Google Weather API (Hyperlocal Grid)',
        data: {
          currentConditions: {
            temperature: { degrees: 29.5 },
            feelsLikeTemperature: { degrees: 33.0 },
            relativeHumidity: 84,
            airPressure: { value: 1009 },
            wind: { speed: { value: 18 }, direction: { degrees: 110 } },
            weatherCondition: { description: { text: 'Heavy Monsoon Rain' } },
            precipitation: { qpf: { value: 35.0 } },
          },
        },
      }),
    }) as any;

    try {
      const googleProvider = new GoogleWeatherProvider();
      const weatherEnv = await googleProvider.getWeather(28.5832, 77.3188);

      expect(weatherEnv).not.toBeNull();
      expect(weatherEnv?.mode).toBe('live');
      expect(weatherEnv?.source).toBe('Google Weather API (Hyperlocal Grid)');
      expect(weatherEnv?.data.temperatureCelsius).toBe(29.5);
      expect(weatherEnv?.data.precipitationMmPerHour).toBe(35.0);
      expect(weatherEnv?.data.alertLevel).toBe('orange');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('2. GoogleWeatherProvider handles malformed JSON response gracefully', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        provider: 'google',
        data: { invalidSchema: true },
      }),
    }) as any;

    try {
      const googleProvider = new GoogleWeatherProvider();
      const weatherEnv = await googleProvider.getWeather(28.5832, 77.3188);

      expect(weatherEnv).toBeNull();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('3. GoogleWeatherProvider handles HTTP 403 / 500 errors gracefully', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'Forbidden',
    }) as any;

    try {
      const googleProvider = new GoogleWeatherProvider();
      const weatherEnv = await googleProvider.getWeather(28.5832, 77.3188);

      expect(weatherEnv).toBeNull();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('4. GoogleWeatherProvider handles timeout and network drops', async () => {
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockRejectedValue(new Error('Network timeout')) as any;

    try {
      const googleProvider = new GoogleWeatherProvider();
      const weatherEnv = await googleProvider.getWeather(28.5832, 77.3188);

      expect(weatherEnv).toBeNull();
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('5. Orchestrator prioritizes Google Weather -> OpenWeather -> Replay -> Simulation', async () => {
    const provider = new WeatherContextProvider('live');

    // Scenario A: Google Weather available
    const originalFetch = global.fetch;
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('provider=google')) {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            ok: true,
            provider: 'google',
            data: {
              currentConditions: {
                temperature: { degrees: 30.0 },
                relativeHumidity: 80,
                weatherCondition: { description: { text: 'Scattered Rain' } },
              },
            },
          }),
        });
      }
      return Promise.resolve({ ok: false });
    }) as any;

    try {
      const envA = await provider.getWeather(28.5832, 77.3188);
      expect(envA.source).toContain('Google Weather');
      expect(envA.mode).toBe('live');
    } finally {
      global.fetch = originalFetch;
    }

    // Scenario B: Google Weather fails, OpenWeather succeeds
    global.fetch = vi.fn().mockImplementation((url: string) => {
      if (url.includes('provider=google')) {
        return Promise.resolve({ ok: false });
      }
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
      const envB = await provider.getWeather(28.5832, 77.3188);
      expect(envB.source).toContain('OpenWeatherMap');
      expect(envB.mode).toBe('live');
    } finally {
      global.fetch = originalFetch;
    }

    // Scenario C: Both live providers fail -> Fallback to Replay
    global.fetch = vi.fn().mockResolvedValue({ ok: false }) as any;

    try {
      const envC = await provider.getWeather(28.5832, 77.3188);
      expect(envC.fallbackUsed).toBe(true);
      expect(envC.mode).toBe('error');
      expect(envC.data).toBeDefined(); // Application continues working without UI break
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
