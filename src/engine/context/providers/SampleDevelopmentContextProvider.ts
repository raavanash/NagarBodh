import { DevelopmentContext } from '../../../types/development';
import { DevelopmentContextProvider } from './DevelopmentContextProvider';

/**
 * SampleDevelopmentContextProvider provides realistic, multi-state Indian demographic,
 * infrastructure, and public investment context data.
 *
 * PROVENANCE: Transparently marked as "NagarBodh Realistic Sample Dataset" (SIMULATION mode).
 * SCALABILITY: Uses ISO country codes (e.g. 'IN') to support future BRICS partner countries.
 */
export class SampleDevelopmentContextProvider implements DevelopmentContextProvider {
  private sampleRecords: DevelopmentContext[] = [
    {
      id: 'ctx-delhi-central',
      hierarchy: {
        countryCode: 'IN',
        country: 'India',
        state: 'Delhi NCR',
        district: 'Central Delhi',
        subDistrict: 'Karol Bagh Zone',
        villageOrWard: 'Ward 14 - Karol Bagh'
      },
      demographic: {
        population: 580000,
        populationDensity: 23150,
        populationGrowth: 1.4,
        urbanizationRate: 100,
        vulnerablePopulation: 145000,
        youthPopulation: 210000,
        elderlyPopulation: 65000,
        wardId: 'WARD-DEL-14',
        wardName: 'Karol Bagh',
        populationDensityPerSqKm: 23150,
        totalPopulationEstimate: 580000,
        vulnerableGroupRatio: 0.25,
        primaryLivelihoodZone: 'Commercial / Small Business',
        literacyPercent: 88.5
      },
      infrastructure: {
        healthcareIndex: 65,
        educationIndex: 78,
        waterIndex: 42,
        sanitationIndex: 50,
        transportIndex: 82,
        electricityIndex: 88,
        digitalConnectivityIndex: 92,
        existingFacilitiesCount: 14,
        nearestFacilityName: 'RML Hospital Sub-centre',
        nearestFacilityDistanceMeters: 1200,
        capacityUtilizationPercent: 94,
        infrastructureDeficitIndex: 58
      },
      investment: {
        existingInvestment: 4500, // ₹ Lakhs
        plannedInvestment: 1200, // ₹ Lakhs
        activeProjects: 3,
        plannedProjects: 2,
        investmentByCategory: {
          HEALTHCARE: 800,
          EDUCATION: 400,
          WATER: 1500,
          SANITATION: 900,
          ROADS: 1200,
          ELECTRICITY: 900
        },
        approvedBudgetLakhs: 4500,
        allocatedFundingLakhs: 3300,
        investmentGapLakhs: 1200,
        historicalProjectsCompleted: 12,
        unaddressedRequestsCount: 45
      },
      provenance: {
        source: 'NagarBodh Realistic Sample Dataset (Delhi Master Plan 2026 Estimates)',
        mode: 'SIMULATION',
        timestamp: '2026-09-10T00:00:00.000Z',
        freshness: 'Q3 2026',
        coverage: 'Ward & Sub-district Level',
        confidence: 0.94
      }
    },
    {
      id: 'ctx-delhi-east',
      hierarchy: {
        countryCode: 'IN',
        country: 'India',
        state: 'Delhi NCR',
        district: 'East Delhi',
        subDistrict: 'Mayur Vihar Sub-division',
        villageOrWard: 'Ward 22 - Mayur Vihar Phase 1'
      },
      demographic: {
        population: 420000,
        populationDensity: 19800,
        populationGrowth: 1.6,
        urbanizationRate: 98,
        vulnerablePopulation: 110000,
        youthPopulation: 160000,
        elderlyPopulation: 52000,
        wardId: 'WARD-DEL-22',
        wardName: 'Mayur Vihar Phase 1',
        populationDensityPerSqKm: 19800,
        totalPopulationEstimate: 420000,
        vulnerableGroupRatio: 0.26,
        primaryLivelihoodZone: 'Residential / Service Sector',
        literacyPercent: 91.2
      },
      infrastructure: {
        healthcareIndex: 72,
        educationIndex: 85,
        waterIndex: 35,
        sanitationIndex: 45,
        transportIndex: 75,
        electricityIndex: 84,
        digitalConnectivityIndex: 90,
        existingFacilitiesCount: 11,
        nearestFacilityName: 'LBS Hospital',
        nearestFacilityDistanceMeters: 2100,
        capacityUtilizationPercent: 88,
        infrastructureDeficitIndex: 62
      },
      investment: {
        existingInvestment: 3800,
        plannedInvestment: 1800,
        activeProjects: 2,
        plannedProjects: 4,
        investmentByCategory: {
          WATER: 2200,
          SANITATION: 1100,
          HEALTHCARE: 900,
          EDUCATION: 600,
          ROADS: 800
        },
        approvedBudgetLakhs: 3800,
        allocatedFundingLakhs: 2000,
        investmentGapLakhs: 1800,
        historicalProjectsCompleted: 9,
        unaddressedRequestsCount: 38
      },
      provenance: {
        source: 'NagarBodh Realistic Sample Dataset (East Delhi Municipal Baseline)',
        mode: 'SIMULATION',
        timestamp: '2026-09-10T00:00:00.000Z',
        freshness: 'Q3 2026',
        coverage: 'Sub-district Level',
        confidence: 0.91
      }
    },
    {
      id: 'ctx-maharashtra-mumbai',
      hierarchy: {
        countryCode: 'IN',
        country: 'India',
        state: 'Maharashtra',
        district: 'Mumbai Suburban',
        subDistrict: 'Bandra West Zone',
        villageOrWard: 'Ward H/West'
      },
      demographic: {
        population: 750000,
        populationDensity: 32000,
        populationGrowth: 1.1,
        urbanizationRate: 100,
        vulnerablePopulation: 195000,
        youthPopulation: 280000,
        elderlyPopulation: 95000,
        wardId: 'WARD-MUM-HWEST',
        wardName: 'H/West Ward Bandra',
        populationDensityPerSqKm: 32000,
        totalPopulationEstimate: 750000,
        vulnerableGroupRatio: 0.26,
        primaryLivelihoodZone: 'Corporate & Mixed Commercial',
        literacyPercent: 93.4
      },
      infrastructure: {
        healthcareIndex: 82,
        educationIndex: 88,
        waterIndex: 55,
        sanitationIndex: 58,
        transportIndex: 89,
        electricityIndex: 94,
        digitalConnectivityIndex: 96,
        existingFacilitiesCount: 22,
        nearestFacilityName: 'Bhabha Hospital',
        nearestFacilityDistanceMeters: 800,
        capacityUtilizationPercent: 91,
        infrastructureDeficitIndex: 45
      },
      investment: {
        existingInvestment: 8500,
        plannedInvestment: 3200,
        activeProjects: 5,
        plannedProjects: 3,
        investmentByCategory: {
          TRANSPORT: 4500,
          WATER: 2500,
          HEALTHCARE: 1800,
          PUBLIC_SAFETY: 1200,
          DIGITAL_CONNECTIVITY: 1700
        },
        approvedBudgetLakhs: 8500,
        allocatedFundingLakhs: 5300,
        investmentGapLakhs: 3200,
        historicalProjectsCompleted: 24,
        unaddressedRequestsCount: 62
      },
      provenance: {
        source: 'NagarBodh Realistic Sample Dataset (BMC Infrastructure Index 2026)',
        mode: 'SIMULATION',
        timestamp: '2026-09-10T00:00:00.000Z',
        freshness: 'Q3 2026',
        coverage: 'Ward Level',
        confidence: 0.95
      }
    },
    {
      id: 'ctx-karnataka-bengaluru',
      hierarchy: {
        countryCode: 'IN',
        country: 'India',
        state: 'Karnataka',
        district: 'Bengaluru Urban',
        subDistrict: 'Mahadevapura Zone',
        villageOrWard: 'Ward 85 - Whitefield'
      },
      demographic: {
        population: 620000,
        populationDensity: 16500,
        populationGrowth: 3.2,
        urbanizationRate: 95,
        vulnerablePopulation: 130000,
        youthPopulation: 290000,
        elderlyPopulation: 45000,
        wardId: 'WARD-BLR-85',
        wardName: 'Whitefield',
        populationDensityPerSqKm: 16500,
        totalPopulationEstimate: 620000,
        vulnerableGroupRatio: 0.21,
        primaryLivelihoodZone: 'IT Corridor & Tech Parks',
        literacyPercent: 94.1
      },
      infrastructure: {
        healthcareIndex: 75,
        educationIndex: 82,
        waterIndex: 38,
        sanitationIndex: 48,
        transportIndex: 52,
        electricityIndex: 78,
        digitalConnectivityIndex: 98,
        existingFacilitiesCount: 16,
        nearestFacilityName: 'Vaidehi Hospital',
        nearestFacilityDistanceMeters: 1500,
        capacityUtilizationPercent: 86,
        infrastructureDeficitIndex: 58
      },
      investment: {
        existingInvestment: 7200,
        plannedInvestment: 4100,
        activeProjects: 6,
        plannedProjects: 5,
        investmentByCategory: {
          TRANSPORT: 4000,
          ROADS: 3200,
          WATER: 2100,
          DIGITAL_CONNECTIVITY: 2000
        },
        approvedBudgetLakhs: 7200,
        allocatedFundingLakhs: 3100,
        investmentGapLakhs: 4100,
        historicalProjectsCompleted: 18,
        unaddressedRequestsCount: 54
      },
      provenance: {
        source: 'NagarBodh Realistic Sample Dataset (BBMP Growth Corridor Data)',
        mode: 'SIMULATION',
        timestamp: '2026-09-10T00:00:00.000Z',
        freshness: 'Q3 2026',
        coverage: 'Zone Level',
        confidence: 0.93
      }
    },
    {
      id: 'ctx-up-lucknow',
      hierarchy: {
        countryCode: 'IN',
        country: 'India',
        state: 'Uttar Pradesh',
        district: 'Lucknow',
        subDistrict: 'Hazratganj Zone',
        villageOrWard: 'Ward 4 - Hazratganj'
      },
      demographic: {
        population: 510000,
        populationDensity: 14200,
        populationGrowth: 1.8,
        urbanizationRate: 85,
        vulnerablePopulation: 165000,
        youthPopulation: 220000,
        elderlyPopulation: 68000,
        wardId: 'WARD-LKO-4',
        wardName: 'Hazratganj Central',
        populationDensityPerSqKm: 14200,
        totalPopulationEstimate: 510000,
        vulnerableGroupRatio: 0.32,
        primaryLivelihoodZone: 'Administrative & Retail',
        literacyPercent: 84.6
      },
      infrastructure: {
        healthcareIndex: 70,
        educationIndex: 76,
        waterIndex: 60,
        sanitationIndex: 55,
        transportIndex: 72,
        electricityIndex: 75,
        digitalConnectivityIndex: 82,
        existingFacilitiesCount: 18,
        nearestFacilityName: 'KGMU General Ward',
        nearestFacilityDistanceMeters: 1800,
        capacityUtilizationPercent: 92,
        infrastructureDeficitIndex: 48
      },
      investment: {
        existingInvestment: 5400,
        plannedInvestment: 2200,
        activeProjects: 4,
        plannedProjects: 3,
        investmentByCategory: {
          HEALTHCARE: 1800,
          EDUCATION: 1400,
          SANATATION: 1200,
          ROADS: 1600,
          ELECTRICITY: 1600
        },
        approvedBudgetLakhs: 5400,
        allocatedFundingLakhs: 3200,
        investmentGapLakhs: 2200,
        historicalProjectsCompleted: 15,
        unaddressedRequestsCount: 41
      },
      provenance: {
        source: 'NagarBodh Realistic Sample Dataset (UP Smart City Index)',
        mode: 'SIMULATION',
        timestamp: '2026-09-10T00:00:00.000Z',
        freshness: 'Q3 2026',
        coverage: 'District Level',
        confidence: 0.90
      }
    },
    {
      id: 'ctx-bihar-patna',
      hierarchy: {
        countryCode: 'IN',
        country: 'India',
        state: 'Bihar',
        district: 'Patna',
        subDistrict: 'Danapur Sub-division',
        villageOrWard: 'Ward 12 - Danapur Cantonment'
      },
      demographic: {
        population: 680000,
        populationDensity: 18400,
        populationGrowth: 2.1,
        urbanizationRate: 64,
        vulnerablePopulation: 265000,
        youthPopulation: 310000,
        elderlyPopulation: 72000,
        wardId: 'WARD-PAT-12',
        wardName: 'Danapur',
        populationDensityPerSqKm: 18400,
        totalPopulationEstimate: 680000,
        vulnerableGroupRatio: 0.39,
        primaryLivelihoodZone: 'Agriculture & Small Trade',
        literacyPercent: 78.2
      },
      infrastructure: {
        healthcareIndex: 42,
        educationIndex: 58,
        waterIndex: 40,
        sanitationIndex: 38,
        transportIndex: 48,
        electricityIndex: 65,
        digitalConnectivityIndex: 72,
        existingFacilitiesCount: 9,
        nearestFacilityName: 'PMCH Sub-clinic',
        nearestFacilityDistanceMeters: 4200,
        capacityUtilizationPercent: 98,
        infrastructureDeficitIndex: 72
      },
      investment: {
        existingInvestment: 3200,
        plannedInvestment: 2900,
        activeProjects: 3,
        plannedProjects: 5,
        investmentByCategory: {
          HEALTHCARE: 1500,
          EDUCATION: 1200,
          WATER: 1100,
          SANITATION: 1000,
          ROADS: 1300
        },
        approvedBudgetLakhs: 3200,
        allocatedFundingLakhs: 1300,
        investmentGapLakhs: 2900,
        historicalProjectsCompleted: 8,
        unaddressedRequestsCount: 74
      },
      provenance: {
        source: 'NagarBodh Realistic Sample Dataset (Bihar State Development Baseline)',
        mode: 'SIMULATION',
        timestamp: '2026-09-10T00:00:00.000Z',
        freshness: 'Q3 2026',
        coverage: 'Sub-district Level',
        confidence: 0.89
      }
    }
  ];

  public async getContextByLocation(
    state: string,
    district: string,
    subDistrict?: string
  ): Promise<DevelopmentContext> {
    const sLower = state.toLowerCase();
    const dLower = district.toLowerCase();
    const subLower = subDistrict?.toLowerCase();

    // 1. Direct sub-district match
    if (subLower) {
      const matchSub = this.sampleRecords.find(
        r =>
          r.hierarchy.state.toLowerCase().includes(sLower) &&
          r.hierarchy.district.toLowerCase().includes(dLower) &&
          r.hierarchy.subDistrict?.toLowerCase().includes(subLower)
      );
      if (matchSub) return matchSub;
    }

    // 2. District match
    const matchDist = this.sampleRecords.find(
      r =>
        r.hierarchy.state.toLowerCase().includes(sLower) &&
        r.hierarchy.district.toLowerCase().includes(dLower)
    );
    if (matchDist) return matchDist;

    // 3. State match
    const matchState = this.sampleRecords.find(
      r => r.hierarchy.state.toLowerCase().includes(sLower)
    );
    if (matchState) return matchState;

    // 4. Default fallback: Delhi Central record
    return this.sampleRecords[0];
  }

  public async getContextByCoordinates(lat: number, lng: number): Promise<DevelopmentContext> {
    // Rough coordinate bounding boxes for sample locations
    if (lat >= 18.8 && lat <= 19.3 && lng >= 72.7 && lng <= 73.1) {
      return this.sampleRecords.find(r => r.hierarchy.state === 'Maharashtra') || this.sampleRecords[2];
    }
    if (lat >= 12.8 && lat <= 13.2 && lng >= 77.4 && lng <= 77.8) {
      return this.sampleRecords.find(r => r.hierarchy.state === 'Karnataka') || this.sampleRecords[3];
    }
    if (lat >= 26.7 && lat <= 27.0 && lng >= 80.8 && lng <= 81.1) {
      return this.sampleRecords.find(r => r.hierarchy.state === 'Uttar Pradesh') || this.sampleRecords[4];
    }
    if (lat >= 25.4 && lat <= 25.8 && lng >= 85.0 && lng <= 85.4) {
      return this.sampleRecords.find(r => r.hierarchy.state === 'Bihar') || this.sampleRecords[5];
    }

    // Default: Delhi NCR
    return this.sampleRecords[0];
  }

  public async getAllContexts(): Promise<DevelopmentContext[]> {
    return [...this.sampleRecords];
  }
}

/**
 * Future Government Data Provider stub (e.g. NITI Aayog Aspirational Districts / Data.gov.in)
 */
export class GovernmentDataProvider implements DevelopmentContextProvider {
  public async getContextByLocation(state: string, district: string, subDistrict?: string): Promise<DevelopmentContext> {
    const fallback = new SampleDevelopmentContextProvider();
    const ctx = await fallback.getContextByLocation(state, district, subDistrict);
    return {
      ...ctx,
      provenance: {
        source: 'Official Open Government Portal Adapter (Stub / Simulation)',
        mode: 'SIMULATION',
        timestamp: new Date().toISOString(),
        freshness: 'Real-time',
        coverage: 'State & District Official Index',
        confidence: 0.98
      }
    };
  }

  public async getContextByCoordinates(lat: number, lng: number): Promise<DevelopmentContext> {
    const fallback = new SampleDevelopmentContextProvider();
    return fallback.getContextByCoordinates(lat, lng);
  }

  public async getAllContexts(): Promise<DevelopmentContext[]> {
    const fallback = new SampleDevelopmentContextProvider();
    return fallback.getAllContexts();
  }
}

/**
 * Future Open Data Provider stub (e.g. OpenStreetMap / WorldBank Open Data)
 */
export class OpenDataProvider implements DevelopmentContextProvider {
  public async getContextByLocation(state: string, district: string, subDistrict?: string): Promise<DevelopmentContext> {
    const fallback = new SampleDevelopmentContextProvider();
    const ctx = await fallback.getContextByLocation(state, district, subDistrict);
    return {
      ...ctx,
      provenance: {
        source: 'OpenStreetMap & Global Open Data Adapter (Stub / Simulation)',
        mode: 'SIMULATION',
        timestamp: new Date().toISOString(),
        freshness: 'Monthly Digest',
        coverage: 'Global Geo-hierarchy',
        confidence: 0.90
      }
    };
  }

  public async getContextByCoordinates(lat: number, lng: number): Promise<DevelopmentContext> {
    const fallback = new SampleDevelopmentContextProvider();
    return fallback.getContextByCoordinates(lat, lng);
  }

  public async getAllContexts(): Promise<DevelopmentContext[]> {
    const fallback = new SampleDevelopmentContextProvider();
    return fallback.getAllContexts();
  }
}
