import { BASELINE_SIGNALS, SIMULATION_STEPS } from '../../../data/initialData';
import { IngestionMode, RawSignalPayload, SignalProvider } from '../../../types/ingestion';

export class DemoSimulationProvider implements SignalProvider {
  public id = 'provider-simulation-stream';
  public name = 'Demo Simulation Chrono-Stream';
  public type = 'simulation' as const;
  public mode: IngestionMode = 'SIMULATION';

  public async isAvailable(): Promise<boolean> {
    return true;
  }

  public async fetchOrIngest(stepIndex?: number | any): Promise<RawSignalPayload[]> {
    if (typeof stepIndex === 'number' && stepIndex >= 0 && stepIndex < SIMULATION_STEPS.length) {
      return SIMULATION_STEPS[stepIndex].signalsAdded.map(s => ({
        ...s,
        sourceChannel: s.channel
      }));
    }

    // Default: return step 0 baseline
    return BASELINE_SIGNALS.map(s => ({
      ...s,
      sourceChannel: s.channel
    }));
  }
}
