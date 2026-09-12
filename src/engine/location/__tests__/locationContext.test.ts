import { describe, expect, it } from 'vitest';
import { LocationContextEngine } from '../LocationContextEngine';
import { LocationResolver } from '../LocationResolver';

describe('LocationResolver Engine', () => {
  it('1. resolves exact location with lat/lng and ward match', () => {
    const rawText = 'Waterlogging at Karol Bagh metro station Ward 14';
    const resolved = LocationResolver.resolveLocation(rawText, {
      lat: 28.6518,
      lng: 77.1906,
      ward: 'Ward 14',
      locationName: 'Karol Bagh Metro Station',
    });

    expect(resolved.id).toContain('IN/Delhi-NCR/Central-Delhi');
    expect(resolved.latitude).toBe(28.6518);
    expect(resolved.longitude).toBe(77.1906);
    expect(resolved.locationConfidence).toBe(1.0);
    expect(resolved.resolutionStatus).toBe('exact');
    expect(resolved.geohash).toBeDefined();
    expect(resolved.geohash?.length).toBeGreaterThan(0);
  });

  it('2. resolves district-only location without landmark or coordinates', () => {
    const rawText = 'Development request for district Central Delhi';
    const resolved = LocationResolver.resolveLocation(rawText, {
      district: 'Central Delhi',
      state: 'Delhi NCR',
    });

    expect(resolved.latitude).toBeNull();
    expect(resolved.longitude).toBeNull();
    expect(resolved.resolutionStatus).toBe('district_level');
    expect(resolved.locationConfidence).toBe(0.65);
    expect(resolved.geohash).toBeUndefined();
  });

  it('3. handles missing coordinates without fabrication', () => {
    const rawText = 'Need garbage collection in unspecified area';
    const resolved = LocationResolver.resolveLocation(rawText);

    expect(resolved.latitude).toBeNull();
    expect(resolved.longitude).toBeNull();
    expect(resolved.resolutionStatus).toBe('district_level');
    expect(resolved.locationConfidence).toBe(0.65);
  });

  it('4. resolves locations across multiple Indian states', () => {
    const delhi = LocationResolver.resolveLocation('Potholes in Karol Bagh Delhi');
    expect(delhi.state).toBe('Delhi NCR');
    expect(delhi.district).toBe('Central Delhi');

    const up = LocationResolver.resolveLocation('Water pipeline needed in Noida Sector 62');
    expect(up.state).toBe('Uttar Pradesh');
    expect(up.district).toBe('Gautam Buddha Nagar');

    const haryana = LocationResolver.resolveLocation('Traffic gridlock in Gurgaon Cyber City');
    expect(haryana.state).toBe('Haryana');
    expect(haryana.district).toBe('Gurugram');

    const maharashtra = LocationResolver.resolveLocation('Road repair in Bandra Mumbai');
    expect(maharashtra.state).toBe('Maharashtra');
    expect(maharashtra.district).toBe('Mumbai Suburban');

    const karnataka = LocationResolver.resolveLocation('Street lights broken in Whitefield Bengaluru');
    expect(karnataka.state).toBe('Karnataka');
    expect(karnataka.district).toBe('Bengaluru Urban');

    const bihar = LocationResolver.resolveLocation('Drainage overflow in Kankerbagh Patna');
    expect(bihar.state).toBe('Bihar');
    expect(bihar.district).toBe('Patna');
  });

  it('5. calculates stable canonical location IDs', () => {
    const id = LocationResolver.generateCanonicalLocationId({
      countryCode: 'IN',
      state: 'Delhi NCR',
      district: 'Central Delhi',
      ward: 'Ward 14 - Karol Bagh',
    });

    expect(id).toBe('IN/Delhi-NCR/Central-Delhi/Ward-14---Karol-Bagh');
  });
});

describe('LocationContextEngine', () => {
  it('6. associates location to weather and development context', async () => {
    const location = LocationResolver.resolveLocation('Primary health clinic needed in Karol Bagh', {
      lat: 28.6518,
      lng: 77.1906,
      ward: 'Ward 14 - Karol Bagh',
    });

    const engine = new LocationContextEngine('simulated');
    const unifiedContext = await engine.getUnifiedLocationContext(location, 'SIMULATION');

    expect(unifiedContext.location.id).toBe(location.id);
    expect(unifiedContext.demographic.wardName).toContain('Karol Bagh');
    expect(unifiedContext.infrastructure.healthcareIndex).toBeGreaterThan(0);
    expect(unifiedContext.investment.existingInvestment).toBeGreaterThan(0);
    expect(unifiedContext.weather).toBeDefined();
    expect(unifiedContext.provenance.locationId).toBe(location.id);
    expect(unifiedContext.provenance.mode).toBe('SIMULATION');
  });
});
