import { describe, expect, it } from 'vitest';
import { DevelopmentContextDataLayer } from '../DevelopmentContextDataLayer';
import { SampleDevelopmentContextProvider, GovernmentDataProvider, OpenDataProvider } from '../providers/SampleDevelopmentContextProvider';

describe('Development Context Data Layer (India & BRICS Scalability)', () => {
  it('fetches multi-state context records by administrative location', async () => {
    const layer = new DevelopmentContextDataLayer('sample');

    const delhiCtx = await layer.getContextForLocation('Delhi NCR', 'Central Delhi', 'Karol Bagh Zone');
    expect(delhiCtx.hierarchy.countryCode).toBe('IN');
    expect(delhiCtx.hierarchy.state).toBe('Delhi NCR');
    expect(delhiCtx.demographic.population).toBeGreaterThan(500000);
    expect(delhiCtx.infrastructure.waterIndex).toBe(42);
    expect(delhiCtx.investment.existingInvestment).toBeGreaterThan(0);

    const mumbaiCtx = await layer.getContextForLocation('Maharashtra', 'Mumbai Suburban');
    expect(mumbaiCtx.hierarchy.state).toBe('Maharashtra');
    expect(mumbaiCtx.infrastructure.transportIndex).toBe(89);

    const blrCtx = await layer.getContextForLocation('Karnataka', 'Bengaluru Urban');
    expect(blrCtx.hierarchy.state).toBe('Karnataka');
    expect(blrCtx.infrastructure.digitalConnectivityIndex).toBe(98);
  });

  it('fetches context fallback by geographical coordinates', async () => {
    const provider = new SampleDevelopmentContextProvider();

    // Mumbai coordinates (approx 19.0, 72.8)
    const mumCoordCtx = await provider.getContextByCoordinates(19.05, 72.85);
    expect(mumCoordCtx.hierarchy.state).toBe('Maharashtra');

    // Bengaluru coordinates (approx 12.97, 77.59)
    const blrCoordCtx = await provider.getContextByCoordinates(12.97, 77.59);
    expect(blrCoordCtx.hierarchy.state).toBe('Karnataka');
  });

  it('verifies data provenance and simulation transparency', async () => {
    const layer = new DevelopmentContextDataLayer('sample');
    const ctx = await layer.getContextForLocation('Delhi NCR', 'Central Delhi');

    expect(ctx.provenance.source).toContain('NagarBodh Realistic Sample Dataset');
    expect(ctx.provenance.mode).toBe('SIMULATION');
    expect(ctx.provenance.confidence).toBeGreaterThan(0.8);
    expect(ctx.provenance.freshness).toBeDefined();
  });

  it('supports provider switching (Sample, Government, OpenData)', async () => {
    const layer = new DevelopmentContextDataLayer('sample');
    expect(layer.getProviderType()).toBe('sample');

    layer.setProviderType('government');
    expect(layer.getProviderType()).toBe('government');
    const govtCtx = await layer.getContextForLocation('Delhi NCR', 'Central Delhi');
    expect(govtCtx.provenance.source).toContain('Government Portal');

    layer.setProviderType('open');
    expect(layer.getProviderType()).toBe('open');
    const openCtx = await layer.getContextForLocation('Delhi NCR', 'Central Delhi');
    expect(openCtx.provenance.source).toContain('OpenStreetMap');
  });

  it('formats context cleanly for UI overlays & hotspot cards', async () => {
    const layer = new DevelopmentContextDataLayer('sample');
    const ctx = await layer.getContextForLocation('Karnataka', 'Bengaluru Urban');

    const formatted = DevelopmentContextDataLayer.formatForUI(ctx);
    expect(formatted.countryCode).toBe('IN');
    expect(formatted.regionLabel).toContain('Karnataka');
    expect(formatted.population).toBe(620000);
    expect(formatted.vulnerablePopulation).toBe(130000);
    expect(formatted.infrastructureIndices.digitalConnectivity).toBe(98);
    expect(formatted.investmentSummary.existingLakhs).toBeGreaterThan(0);
    expect(formatted.provenanceBadge).toContain('SIMULATION');
  });
});
