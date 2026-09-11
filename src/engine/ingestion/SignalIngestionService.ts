import { IngestedCivicSignal, IngestionMode, IngestionStats, NormalizationResult, ProviderType, RawSignalPayload, SignalProvider } from '../../types/ingestion';
import { DuplicateDetector } from './DuplicateDetector';
import { BlueskyJetstreamProvider } from './providers/BlueskyJetstreamProvider';
import { BlueskySocialProvider } from './providers/BlueskySocialProvider';
import { CitizenReportProvider } from './providers/CitizenReportProvider';
import { DemoSimulationProvider } from './providers/DemoSimulationProvider';
import { FileImportProvider } from './providers/FileImportProvider';
import { GovtGrievanceProvider } from './providers/GovtGrievanceProvider';
import { PublicSocialXProvider } from './providers/PublicSocialXProvider';
import { SignalNormalizer } from './SignalNormalizer';

export class SignalIngestionService {
  private providers = new Map<string, SignalProvider>();
  private duplicateDetector: DuplicateDetector;

  private stats: IngestionStats = {
    signalsReceived: 0,
    accepted: 0,
    rejected: 0,
    duplicates: 0,
    civicRelevant: 0,
    analyzed: 0,
    clustered: 0
  };

  private activeMode: IngestionMode = 'SIMULATION';

  constructor(initialSignals: IngestedCivicSignal[] = []) {
    this.duplicateDetector = new DuplicateDetector(initialSignals);

    // Register built-in providers (Jetstream is primary for Bluesky)
    this.registerProvider(new DemoSimulationProvider());
    this.registerProvider(new CitizenReportProvider());

    const jetstreamProvider = new BlueskyJetstreamProvider();
    this.registerProvider(jetstreamProvider);

    const legacyBlueskyProvider = new BlueskySocialProvider();
    legacyBlueskyProvider.id = 'provider-social-bluesky-legacy';
    this.registerProvider(legacyBlueskyProvider);

    this.registerProvider(new PublicSocialXProvider());
    this.registerProvider(new GovtGrievanceProvider());
    this.registerProvider(new FileImportProvider());

    // Update initial stats
    this.stats.signalsReceived = initialSignals.length;
    this.stats.accepted = initialSignals.length;
    this.stats.civicRelevant = initialSignals.length;
    this.stats.analyzed = initialSignals.length;
  }

  public registerProvider(provider: SignalProvider): void {
    this.providers.set(provider.id, provider);
  }

  public getProvider(providerId: string): SignalProvider | undefined {
    return this.providers.get(providerId);
  }

  public setIngestionMode(mode: IngestionMode): void {
    this.activeMode = mode;
    this.providers.forEach(provider => {
      if (typeof provider.setMode === 'function') {
        provider.setMode(mode);
      }
    });
  }

  public getIngestionMode(): IngestionMode {
    return this.activeMode;
  }

  public getBlueskyHealth(): any {
    const provider = this.providers.get('provider-social-bluesky') as BlueskyJetstreamProvider | undefined;
    return provider && typeof provider.getHealthStatus === 'function'
      ? provider.getHealthStatus()
      : null;
  }

  public getStats(): IngestionStats {
    return { ...this.stats };
  }

  /**
   * Main entry point to ingest raw payloads from any provider
   */
  public async ingest(
    providerId: string,
    payloadsInput?: RawSignalPayload | RawSignalPayload[] | string
  ): Promise<{ normalizedSignals: IngestedCivicSignal[]; results: NormalizationResult[] }> {
    const provider = this.providers.get(providerId) || this.providers.get('provider-simulation-stream');
    const providerType: ProviderType = provider ? provider.type : 'simulation';
    const isMockOrReplay = provider ? provider.mode !== 'LIVE' : true;

    let rawPayloads: RawSignalPayload[] = [];

    try {
      if (provider) {
        rawPayloads = await provider.fetchOrIngest(payloadsInput as any);
      } else if (payloadsInput) {
        rawPayloads = Array.isArray(payloadsInput) ? payloadsInput : [payloadsInput as any];
      }
    } catch (err) {
      console.warn(`[SignalIngestionService] Provider ${providerId} threw error, falling back gracefully:`, err);
      return { normalizedSignals: [], results: [] };
    }

    const results: NormalizationResult[] = [];
    const normalizedSignals: IngestedCivicSignal[] = [];

    for (const raw of rawPayloads) {
      this.stats.signalsReceived += 1;

      // 1. Normalization & Civic Relevance Filter
      const normResult = SignalNormalizer.normalize(raw, providerId, providerType, isMockOrReplay);

      if (!normResult.success || !normResult.signal) {
        this.stats.rejected += 1;
        results.push(normResult);
        continue;
      }

      this.stats.civicRelevant += 1;

      // 2. Duplicate Detection
      const dupCheck = this.duplicateDetector.isDuplicate(normResult.signal);
      if (dupCheck.isDuplicate) {
        this.stats.duplicates += 1;
        results.push({
          success: false,
          isDuplicate: true,
          error: `Duplicate signal rejected: ${dupCheck.reason}`
        });
        continue;
      }

      // 3. Accepted & Analyzed
      this.duplicateDetector.register(normResult.signal);
      this.stats.accepted += 1;
      this.stats.analyzed += 1;

      normalizedSignals.push(normResult.signal);
      results.push(normResult);
    }

    return { normalizedSignals, results };
  }

  /**
   * Reset stats and deduplication cache
   */
  public reset(baselineSignals: IngestedCivicSignal[] = []): void {
    this.duplicateDetector.clear();
    baselineSignals.forEach(s => this.duplicateDetector.register(s));
    this.stats = {
      signalsReceived: baselineSignals.length,
      accepted: baselineSignals.length,
      rejected: 0,
      duplicates: 0,
      civicRelevant: baselineSignals.length,
      analyzed: baselineSignals.length,
      clustered: 0
    };
  }

  /**
   * Update number of clustered incidents in stats
   */
  public updateClusteredCount(count: number): void {
    this.stats.clustered = count;
  }
}
