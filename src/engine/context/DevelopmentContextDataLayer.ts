import { DevelopmentContext } from '../../types/development';
import { DevelopmentContextProvider } from './providers/DevelopmentContextProvider';
import { GovernmentDataProvider, OpenDataProvider, SampleDevelopmentContextProvider } from './providers/SampleDevelopmentContextProvider';

export type DevelopmentProviderType = 'sample' | 'government' | 'open';

/**
 * DevelopmentContextDataLayer serves as the primary aggregation engine for India (and BRICS)
 * development context data, combining demographic metrics, infrastructure indices, and public investment plans.
 */
export class DevelopmentContextDataLayer {
  private activeProvider: DevelopmentContextProvider;
  private providerType: DevelopmentProviderType;

  constructor(providerType: DevelopmentProviderType = 'sample') {
    this.providerType = providerType;
    this.activeProvider = this.createProvider(providerType);
  }

  private createProvider(type: DevelopmentProviderType): DevelopmentContextProvider {
    switch (type) {
      case 'government':
        return new GovernmentDataProvider();
      case 'open':
        return new OpenDataProvider();
      case 'sample':
      default:
        return new SampleDevelopmentContextProvider();
    }
  }

  public setProviderType(type: DevelopmentProviderType): void {
    this.providerType = type;
    this.activeProvider = this.createProvider(type);
  }

  public getProviderType(): DevelopmentProviderType {
    return this.providerType;
  }

  /**
   * Fetch context by administrative location (State, District, Sub-district)
   */
  public async getContextForLocation(
    state: string,
    district: string,
    subDistrict?: string
  ): Promise<DevelopmentContext> {
    return this.activeProvider.getContextByLocation(state, district, subDistrict);
  }

  /**
   * Fetch context by geographic lat/lng coordinates
   */
  public async getContextForCoordinates(lat: number, lng: number): Promise<DevelopmentContext> {
    return this.activeProvider.getContextByCoordinates(lat, lng);
  }

  /**
   * List all available region contexts
   */
  public async getAllContexts(): Promise<DevelopmentContext[]> {
    return this.activeProvider.getAllContexts();
  }

  /**
   * UI Formatting Helper: Extracts key indicators required by Hotspot overlays & Dossiers
   */
  public static formatForUI(context: DevelopmentContext) {
    const d = context.demographic;
    const i = context.infrastructure;
    const inv = context.investment;
    const h = context.hierarchy;

    return {
      regionLabel: `${h.villageOrWard || h.subDistrict || h.district}, ${h.state} (${h.countryCode})`,
      countryCode: h.countryCode,
      population: d.population,
      vulnerablePopulation: d.vulnerablePopulation,
      vulnerableRatioPercent: ((d.vulnerablePopulation / d.population) * 100).toFixed(1),
      infrastructureIndices: {
        healthcare: i.healthcareIndex,
        education: i.educationIndex,
        water: i.waterIndex,
        sanitation: i.sanitationIndex,
        transport: i.transportIndex,
        electricity: i.electricityIndex,
        digitalConnectivity: i.digitalConnectivityIndex
      },
      investmentSummary: {
        existingLakhs: inv.existingInvestment,
        plannedLakhs: inv.plannedInvestment,
        investmentGapLakhs: inv.investmentGapLakhs || Math.max(0, inv.plannedInvestment - inv.existingInvestment),
        activeProjects: inv.activeProjects,
        plannedProjects: inv.plannedProjects
      },
      provenanceBadge: `${context.provenance.source} [${context.provenance.mode}]`
    };
  }
}
