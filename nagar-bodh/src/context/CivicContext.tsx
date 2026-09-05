import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AuditEventType,
  CivicCategory,
  CivicSignal,
  ClusteredIncident,
  DispatchActionPlan,
  SimulationStep
} from '../types/civic';
import { SIMULATION_STEPS } from '../data/initialData';
import { ClusterTransition, clusterSignals } from '../engine/clusteringEngine';
import { parseCivicSignalText, parseSignalWithGemini } from '../engine/nlpParser';
import { WARDS_DATA } from '../data/wardsData';
import { SignalIngestionService } from '../engine/ingestion/SignalIngestionService';
import { IngestedCivicSignal, IngestionMode, IngestionStats, RawSignalPayload } from '../types/ingestion';
import { AgentTrace } from '../types/agent';
import { CivicContextDataLayer, civicContextDataLayerInstance } from '../engine/context/CivicContextDataLayer';

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  timeLabel: string;
  type: AuditEventType;
  title: string;
  description: string;
  incidentId?: string;
  actor: string;
  metadata?: Record<string, any>;
}

export interface SignalFilterState {
  searchQuery: string;
  selectedLanguage: string;
  selectedChannel: string;
  selectedCategory: string;
}

interface CivicContextType {
  // State
  signals: CivicSignal[];
  incidents: ClusteredIncident[];
  selectedIncident: ClusteredIncident | null;
  selectedIncidentId: string | null;
  activeTab: 'live_map' | 'dossier' | 'signals' | 'dispatch' | 'authority' | 'timeline';
  currentStepIndex: number;
  currentStep: SimulationStep;
  currentWeather: SimulationStep['weatherCondition'];
  isPlaying: boolean;
  playbackSpeed: 1 | 5 | 10;
  auditLogs: AuditLogEntry[];

  // Incident & Map Filters
  mapMode: 'civic_signals' | 'ai_priority';
  categoryFilter: string;
  sourceFilter: string;
  severityFilter: string;
  wardFilter: string;
  timeRangeFilter: string;
  searchQuery: string;
  minPriorityFilter: number;

  // Signal Filters (Signal Explorer)
  signalFilters: SignalFilterState;

  // Computed ward stats (derived from live incidents)
  wardStats: Record<string, { activeCount: number; criticalCount: number }>;

  // Setters & Actions
  setMapMode: (mode: 'civic_signals' | 'ai_priority') => void;
  setSelectedIncidentId: (id: string | null) => void;
  setActiveTab: (tab: 'live_map' | 'dossier' | 'signals' | 'dispatch' | 'authority' | 'timeline') => void;
  setCategoryFilter: (cat: string) => void;
  setSourceFilter: (source: string) => void;
  setSeverityFilter: (sev: string) => void;
  setWardFilter: (ward: string) => void;
  setTimeRangeFilter: (range: string) => void;
  setSearchQuery: (query: string) => void;
  setMinPriorityFilter: (val: number) => void;
  setPlaybackSpeed: (speed: 1 | 5 | 10) => void;
  setSignalFilters: (filters: Partial<SignalFilterState>) => void;

  // Simulation Controls
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  jumpToStep: (stepIndex: number) => void;
  triggerSector15Surge: () => void;
  resetSimulation: () => void;

  // Ingestion Layer
  ingestionMode: IngestionMode;
  ingestionStats: IngestionStats;
  ingestFileDataset: (fileContent: string, fileName: string) => Promise<number>;

  // Agent Traces & Inspector
  agentTraces: AgentTrace[];
  selectedTrace: AgentTrace | null;
  inspectAgentTrace: (trace: AgentTrace | null) => void;

  // Civic Context Data Layer
  civicContextDataLayer: CivicContextDataLayer;

  // Interactive Operations
  approveDispatch: (incidentId: string, notes?: string) => void;
  modifyDispatch: (incidentId: string, updatedPlan: Partial<DispatchActionPlan>) => void;
  fieldVerify: (incidentId: string, verifiedBy?: string) => void;
  addCustomSignal: (text: string, channel: any, coords?: { lat: number; lng: number }) => Promise<void>;
  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
}

const CivicContext = createContext<CivicContextType | undefined>(undefined);

export const CivicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 5 | 10>(1);

  // Active signals accumulated up to current step
  const [signals, setSignals] = useState<CivicSignal[]>(() => [...SIMULATION_STEPS[0].signalsAdded]);

  // Persistent Action Plans (preserved across clustering recalculations)
  const [actionPlans, setActionPlans] = useState<Record<string, DispatchActionPlan>>({});

  // In-memory recurrence counter: tracks how many times each ward+category cluster has resolved
  const [recurrenceCounter, setRecurrenceCounter] = useState<Record<string, number>>({});

  // Selected incident & active navigation tab
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'live_map' | 'dossier' | 'signals' | 'dispatch' | 'authority' | 'timeline'>('live_map');

  // Map Mode & Extended Incident Filters
  const [mapMode, setMapMode] = useState<'civic_signals' | 'ai_priority'>('ai_priority');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [wardFilter, setWardFilter] = useState<string>('all');
  const [timeRangeFilter, setTimeRangeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minPriorityFilter, setMinPriorityFilter] = useState<number>(0);

  // Signal Explorer filters (separate domain from incident filters)
  const [signalFilters, setSignalFiltersState] = useState<SignalFilterState>({
    searchQuery: '',
    selectedLanguage: 'all',
    selectedChannel: 'all',
    selectedCategory: 'all'
  });

  // Gemini API Key (optional live integration)
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => localStorage.getItem('nagar_bodh_gemini_key') || '');

  // Audit Log History
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([
    {
      id: 'log-0',
      timestamp: new Date().toISOString(),
      timeLabel: '08:00 AM',
      type: 'signal_ingested',
      title: 'City Telemetry Baseline Ingested',
      description: 'Ingested initial background civic signals across Karol Bagh, Connaught Place, and Rohini.',
      actor: 'Ingestion Engine'
    }
  ]);

  const currentStep = SIMULATION_STEPS[currentStepIndex] || SIMULATION_STEPS[0];
  const currentWeather = currentStep.weatherCondition;

  // Keep a ref to the previous incidents list so clustering can compare and detect transitions
  const prevIncidentsRef = useRef<ClusteredIncident[]>([]);

  // Private helper: append to audit log
  const appendAuditLog = useCallback((entry: Omit<AuditLogEntry, 'id' | 'timestamp'>) => {
    const logEntry: AuditLogEntry = {
      ...entry,
      id: `log-${entry.type}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString()
    };
    setAuditLogs(prev => [logEntry, ...prev]);
  }, []);

  // Fire audit events for each cluster transition detected by the engine
  const fireTransitionAuditEvents = useCallback((transitions: ClusterTransition[], timeLabel: string) => {
    for (const t of transitions) {
      if (t.isNewCluster) {
        appendAuditLog({
          timeLabel,
          type: 'cluster_formed',
          title: `Cluster Formed: ${t.category.replace('_', ' ')} in ${t.ward}`,
          description: `New incident cluster detected with ${t.signalCountDelta} signals. Priority: ${t.priorityScore}/100.`,
          incidentId: t.incidentId,
          actor: 'Clustering Engine',
          metadata: { priorityScore: t.priorityScore, category: t.category }
        });
      } else if (t.signalCountDelta > 0) {
        appendAuditLog({
          timeLabel,
          type: 'cluster_updated',
          title: `Cluster Growing: ${t.ward} (+${t.signalCountDelta} signals)`,
          description: `Incident cluster absorbed ${t.signalCountDelta} new signals. Total priority: ${t.priorityScore}/100.`,
          incidentId: t.incidentId,
          actor: 'Clustering Engine',
          metadata: { signalDelta: t.signalCountDelta }
        });
      }

      // Status transition events
      if (t.previousStatus !== t.newStatus) {
        if (t.newStatus === 'triaged' && t.previousStatus !== 'triaged') {
          appendAuditLog({
            timeLabel,
            type: 'incident_triaged',
            title: `Incident Triaged: ${t.category.replace('_', ' ')} in ${t.ward}`,
            description: `Signal count threshold crossed. Incident escalated to triaged status.`,
            incidentId: t.incidentId,
            actor: 'Priority Engine'
          });
        }
        if (t.newStatus === 'dispatch_pending' && t.previousStatus !== 'dispatch_pending') {
          appendAuditLog({
            timeLabel,
            type: 'priority_spike',
            title: `⚠️ Priority Spike: ${t.category.replace('_', ' ')} — ${t.priorityScore}/100`,
            description: `Incident crossed priority threshold (${t.priorityScore}/100). Dispatch plan generated.`,
            incidentId: t.incidentId,
            actor: 'Priority Engine',
            metadata: { score: t.priorityScore }
          });
          appendAuditLog({
            timeLabel,
            type: 'response_plan_generated',
            title: `SOP Plan Generated for ${t.ward}`,
            description: `Standard Operating Procedure action plan created. Awaiting human-in-the-loop approval.`,
            incidentId: t.incidentId,
            actor: 'Response Planner'
          });
        }
        if (t.newStatus === 'resolving') {
          appendAuditLog({
            timeLabel,
            type: 'resolution_begun',
            title: `Resolution Underway: ${t.ward}`,
            description: `First positive confirmation signal received. Field crews reporting situation improvement.`,
            incidentId: t.incidentId,
            actor: 'Signal Analyst Agent'
          });
        }
        if (t.newStatus === 'resolved') {
          appendAuditLog({
            timeLabel,
            type: 'resolution_confirmed',
            title: `✅ Incident Resolved: ${t.ward}`,
            description: `Multiple confirmation signals received. Incident marked as resolved. Awaiting field verification.`,
            incidentId: t.incidentId,
            actor: 'Signal Analyst Agent'
          });
          // Increment recurrence counter for this ward+category
          const key = `${t.ward}::${t.category}`;
          setRecurrenceCounter(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
        }
      }
    }
  }, [appendAuditLog]);

  // Re-cluster whenever signals or rainfall change
  const { incidents, pendingTransitions } = useMemo(() => {
    const { incidents: rawClustered, transitions } = clusterSignals(
      signals,
      currentWeather.rainfallMmPerHour,
      prevIncidentsRef.current
    );

    // Reattach saved action plans and override status for approved dispatches
    const merged = rawClustered.map(inc => {
      if (actionPlans[inc.id]) {
        const savedPlan = actionPlans[inc.id];
        return {
          ...inc,
          actionPlan: savedPlan,
          status: savedPlan.status === 'approved'
            ? (inc.status === 'resolved' || inc.status === 'verified' ? inc.status : 'dispatched')
            : inc.status
        } as ClusteredIncident;
      }
      return inc;
    });

    prevIncidentsRef.current = merged;
    return { incidents: merged, pendingTransitions: transitions };
  }, [signals, currentWeather.rainfallMmPerHour, actionPlans]);

  // Effect: Process cluster transitions and emit audit events after component mounts / renders
  useEffect(() => {
    if (pendingTransitions.length > 0) {
      fireTransitionAuditEvents(pendingTransitions, currentStep.simulatedTime);
    }
  }, [pendingTransitions, currentStep.simulatedTime, fireTransitionAuditEvents]);

  // Selected incident object — auto-select first waterlogging incident at start
  const selectedIncident = useMemo(() => {
    if (!selectedIncidentId) {
      return incidents.find(i => i.category === 'waterlogging') || incidents[0] || null;
    }
    return incidents.find(i => i.id === selectedIncidentId) || incidents[0] || null;
  }, [incidents, selectedIncidentId]);

  // Auto-select the waterlogging incident on first load
  useEffect(() => {
    if (!selectedIncidentId && incidents.length > 0) {
      const waterlogging = incidents.find(i => i.category === 'waterlogging');
      if (waterlogging) setSelectedIncidentId(waterlogging.id);
    }
  }, [incidents, selectedIncidentId]);

  // Computed ward stats from live incidents (replaces static WARDS_DATA counts)
  const wardStats = useMemo(() => {
    const stats: Record<string, { activeCount: number; criticalCount: number }> = {};
    for (const ward of WARDS_DATA) {
      const wardIncidents = incidents.filter(
        i => i.ward.includes(ward.wardName.split(' - ')[0]) || i.ward === ward.wardName
      );
      stats[ward.wardId] = {
        activeCount: wardIncidents.filter(i => i.status !== 'resolved' && i.status !== 'verified').length,
        criticalCount: wardIncidents.filter(i => i.priority.overallScore >= 80).length
      };
    }
    return stats;
  }, [incidents]);

  // Simulation step advance — stable callback (prevents timer ghosting)
  const stepForwardFn = useCallback((stepIndex: number, currentSignals: CivicSignal[]) => {
    if (stepIndex >= SIMULATION_STEPS.length - 1) {
      setIsPlaying(false);
      return;
    }

    const nextIndex = stepIndex + 1;
    const nextStep = SIMULATION_STEPS[nextIndex];
    setCurrentStepIndex(nextIndex);

    setSignals(prev => {
      const existingIds = new Set(prev.map(s => s.id));
      const newToAdd = nextStep.signalsAdded.filter(s => !existingIds.has(s.id));
      return newToAdd.length > 0 ? [...prev, ...newToAdd] : prev;
    });

    appendAuditLog({
      timeLabel: nextStep.simulatedTime,
      type: nextIndex === 5 || nextIndex === 6 ? 'priority_spike' : 'signal_ingested',
      title: nextIndex === 6 ? '🚨 PRIORITY SPIKE: Sector 15 Emergency (94/100)' : `Time Advance: ${nextStep.simulatedTime}`,
      description: nextStep.description,
      actor: 'Chrono-Simulation Stream'
    });
  }, [appendAuditLog]);

  const stepForward = useCallback(() => {
    stepForwardFn(currentStepIndex, signals);
  }, [stepForwardFn, currentStepIndex, signals]);

  // Chrono-player timer — use ref to avoid stale closure issues
  const stepIndexRef = useRef(currentStepIndex);
  const signalsRef = useRef(signals);
  stepIndexRef.current = currentStepIndex;
  signalsRef.current = signals;

  useEffect(() => {
    if (!isPlaying) return;
    const intervalMs = Math.round(4000 / playbackSpeed);
    const timer = setInterval(() => {
      if (stepIndexRef.current < SIMULATION_STEPS.length - 1) {
        stepForwardFn(stepIndexRef.current, signalsRef.current);
      } else {
        setIsPlaying(false);
      }
    }, intervalMs);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, stepForwardFn]);

  // Instant Surge demo button — jumps to peak emergency (preserved exactly)
  const jumpToStep = useCallback((stepIndex: number) => {
    if (stepIndex < 0 || stepIndex >= SIMULATION_STEPS.length) return;
    setIsPlaying(false);
    setCurrentStepIndex(stepIndex);
    const accumulatedSignals: CivicSignal[] = [];
    for (let i = 0; i <= stepIndex; i++) {
      accumulatedSignals.push(...SIMULATION_STEPS[i].signalsAdded);
    }
    const uniqueMap = new Map<string, CivicSignal>();
    accumulatedSignals.forEach(s => uniqueMap.set(s.id, s));
    setSignals(Array.from(uniqueMap.values()));
  }, []);

  const triggerSector15Surge = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(6);

    const allSurgeSignals: CivicSignal[] = [];
    for (let i = 0; i <= 6; i++) {
      allSurgeSignals.push(...SIMULATION_STEPS[i].signalsAdded);
    }
    const uniqueMap = new Map<string, CivicSignal>();
    allSurgeSignals.forEach(s => uniqueMap.set(s.id, s));
    setSignals(Array.from(uniqueMap.values()));

    appendAuditLog({
      timeLabel: '10:15 AM',
      type: 'priority_spike',
      title: '⚡ Instant Surge Triggered: Sector 15 Critical Inundation',
      description: 'Ingested 22 rapid multi-channel signals (+280% velocity surge). Priority calculated at 94/100.',
      actor: 'Commander Demonstration Override'
    });

    // Auto-select Sector 15 waterlogging cluster (uses stable ID format)
    setTimeout(() => {
      setSelectedIncidentId(prev => {
        const waterloggingId = 'incident-ward-15-central-sub-city-waterlogging';
        return prev ?? waterloggingId;
      });
    }, 0);
  }, [appendAuditLog]);

  const resetSimulation = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSignals([...SIMULATION_STEPS[0].signalsAdded]);
    setActionPlans({});
    setSelectedIncidentId(null);
    prevIncidentsRef.current = [];
    appendAuditLog({
      timeLabel: '08:00 AM',
      type: 'signal_ingested',
      title: 'Simulation Reset to Initial Baseline',
      description: 'Cleared all emergency surges and returned to 08:00 AM baseline.',
      actor: 'Commander'
    });
  }, [appendAuditLog]);

  const play = useCallback(() => setIsPlaying(true), []);
  const pause = useCallback(() => setIsPlaying(false), []);

  // Human-in-the-Loop: Approve & Dispatch action plan
  const approveDispatch = useCallback((incidentId: string, notes?: string) => {
    const inc = incidents.find(i => i.id === incidentId);
    if (!inc || !inc.actionPlan) return;

    const updatedPlan: DispatchActionPlan = {
      ...inc.actionPlan,
      status: 'approved',
      approvedBy: 'Municipal Commissioner Duty Desk (Badge #CC-04)',
      dispatchedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      equipment: inc.actionPlan.equipment.map(e => ({ ...e, status: 'deployed' as const })),
      notes: notes || inc.actionPlan.notes
    };

    setActionPlans(prev => ({ ...prev, [incidentId]: updatedPlan }));

    appendAuditLog({
      timeLabel: currentStep.simulatedTime,
      type: 'dispatch_approved',
      title: `✅ Field Dispatch Executed: ${inc.title}`,
      description: `Approved deployment of ${inc.actionPlan.equipment.map(e => `${e.count}x ${e.name}`).join(', ')}. ETA: ${updatedPlan.etaMinutes} mins.`,
      actor: 'Municipal Commissioner (Human-in-the-Loop)',
      incidentId,
      metadata: { etaMinutes: updatedPlan.etaMinutes, approvedBy: updatedPlan.approvedBy }
    });

    appendAuditLog({
      timeLabel: currentStep.simulatedTime,
      type: 'crew_dispatched',
      title: `🚨 Field Units En Route: ${inc.ward}`,
      description: `${inc.actionPlan.primaryDepartment} units mobilizing. ETA to incident site: ~${updatedPlan.etaMinutes} minutes.`,
      actor: inc.actionPlan.primaryDepartment,
      incidentId,
      metadata: { etaMinutes: updatedPlan.etaMinutes }
    });
  }, [incidents, currentStep.simulatedTime, appendAuditLog]);

  // Human-in-the-Loop: Field verify resolution (VERIFIED terminal state)
  const fieldVerify = useCallback((incidentId: string, verifiedBy = 'Field Supervisor (Badge #FS-07)') => {
    const inc = incidents.find(i => i.id === incidentId);
    if (!inc || (inc.status !== 'resolved' && inc.status !== 'resolving')) return;

    // Persist verified status via actionPlan store (clustering engine reads it back)
    setActionPlans(prev => ({
      ...prev,
      [incidentId]: {
        ...(prev[incidentId] || inc.actionPlan!),
        status: 'resolved'
      }
    }));

    // Update the incident in prevIncidentsRef to carry 'verified' status forward
    prevIncidentsRef.current = prevIncidentsRef.current.map(i =>
      i.id === incidentId ? { ...i, status: 'verified', verifiedAt: new Date().toISOString(), verifiedBy } : i
    );

    const etaMinutes = inc.actionPlan?.etaMinutes ?? 0;
    appendAuditLog({
      timeLabel: currentStep.simulatedTime,
      type: 'field_verification',
      title: `🔍 Field Verification Complete: ${inc.title}`,
      description: `${verifiedBy} confirmed situation normalized. SLA clock stopped. Incident officially closed.`,
      actor: verifiedBy,
      incidentId,
      metadata: { verifiedBy, resolvedAt: new Date().toISOString(), etaMinutes }
    });
  }, [incidents, currentStep.simulatedTime, appendAuditLog]);

  // Modify action plan
  const modifyDispatch = useCallback((incidentId: string, updatedPlanPartial: Partial<DispatchActionPlan>) => {
    const inc = incidents.find(i => i.id === incidentId);
    if (!inc || !inc.actionPlan) return;
    setActionPlans(prev => ({
      ...prev,
      [incidentId]: { ...inc.actionPlan!, ...updatedPlanPartial }
    }));
  }, [incidents]);

  // Ingestion Service Instance
  const ingestionServiceRef = useRef<SignalIngestionService>(new SignalIngestionService(signals as any));
  const [ingestionStats, setIngestionStats] = useState<IngestionStats>(() => ingestionServiceRef.current.getStats());
  const [ingestionMode, setIngestionMode] = useState<IngestionMode>('SIMULATION');

  // Update ingestion stats whenever signals or incidents change
  useEffect(() => {
    ingestionServiceRef.current.updateClusteredCount(incidents.length);
    setIngestionStats(ingestionServiceRef.current.getStats());
  }, [signals, incidents]);

  // File Dataset Import Handler (CSV/JSON)
  const ingestFileDataset = useCallback(async (fileContent: string, fileName: string): Promise<number> => {
    const { normalizedSignals } = await ingestionServiceRef.current.ingest('provider-file-import', fileContent);
    if (normalizedSignals.length > 0) {
      setSignals(prev => [...normalizedSignals, ...prev]);
      setIngestionMode('REPLAY');
      ingestionServiceRef.current.setIngestionMode('REPLAY');
      setIngestionStats(ingestionServiceRef.current.getStats());

      appendAuditLog({
        timeLabel: currentStep.simulatedTime,
        type: 'signal_ingested',
        title: `Offline Dataset Imported: ${fileName}`,
        description: `Ingested ${normalizedSignals.length} validated signals from file import. Deduplication filter passed.`,
        actor: 'File Dataset Import Provider',
        metadata: { fileName, count: normalizedSignals.length }
      });
    }
    return normalizedSignals.length;
  }, [currentStep.simulatedTime, appendAuditLog]);

  // Agent Traces History
  const [agentTraces, setAgentTraces] = useState<AgentTrace[]>([]);
  const [selectedTrace, setSelectedTrace] = useState<AgentTrace | null>(null);

  const inspectAgentTrace = useCallback((trace: AgentTrace | null) => {
    setSelectedTrace(trace);
  }, []);

  // Add custom signal (test ingest from Signal Explorer using Ingestion Service & Agent)
  const addCustomSignal = useCallback(async (
    text: string,
    channel: any,
    coords: { lat: number; lng: number } = { lat: 28.5831, lng: 77.3184 }
  ) => {
    const parsed = await parseSignalWithGemini(text, geminiApiKey);

    if (parsed.agentTrace) {
      setAgentTraces(prev => [parsed.agentTrace!, ...prev]);
    }

    const rawPayload: RawSignalPayload = {
      text,
      sourceChannel: channel,
      lat: coords.lat,
      lng: coords.lng,
      category: parsed.category,
      severity: parsed.reportedSeverity,
      confidenceScore: parsed.confidenceScore,
      locationName: parsed.extractedLocationName || 'Reported Location',
      ward: 'Ward 15 - Central Sub-city',
      simulatedTimeLabel: currentStep.simulatedTime
    };

    const { normalizedSignals } = await ingestionServiceRef.current.ingest('provider-citizen-direct', rawPayload);
    setIngestionStats(ingestionServiceRef.current.getStats());

    if (normalizedSignals.length > 0) {
      const newSignal = normalizedSignals[0];
      setSignals(prev => [newSignal, ...prev]);

      appendAuditLog({
        timeLabel: currentStep.simulatedTime,
        type: 'signal_ingested',
        title: `New Signal Ingested (${parsed.detectedLanguage.toUpperCase()})`,
        description: `Raw Telemetry: "${text.slice(0, 80)}${text.length > 80 ? '…' : ''}" received via ${channel}.`,
        actor: 'Citizen Direct Provider',
        metadata: { channel }
      });

      appendAuditLog({
        timeLabel: currentStep.simulatedTime,
        type: 'signal_analyzed',
        title: `Signal Analyzed by AI Agent (${parsed.detectedLanguage.toUpperCase()})`,
        description: `Signal Analyst Agent output: Category=${parsed.category}, Severity=${parsed.reportedSeverity}, Fact Separation: [OBSERVED: "${parsed.extractedLocationName || text.slice(0, 30)}"], Urgency=${parsed.reportedSeverity.toUpperCase()}.`,
        actor: parsed.agentTrace?.model || 'Signal Analyst Agent',
        metadata: { category: parsed.category, language: parsed.detectedLanguage, confidence: parsed.confidenceScore, traceId: parsed.agentTrace?.id }
      });
    }
  }, [geminiApiKey, currentStep.simulatedTime, appendAuditLog]);

  const setSignalFilters = useCallback((filters: Partial<SignalFilterState>) => {
    setSignalFiltersState(prev => ({ ...prev, ...filters }));
  }, []);

  return (
    <CivicContext.Provider
      value={{
        signals,
        incidents,
        selectedIncident,
        selectedIncidentId,
        activeTab,
        currentStepIndex,
        currentStep,
        currentWeather,
        isPlaying,
        playbackSpeed,
        auditLogs,
        mapMode,
        setMapMode,
        categoryFilter,
        sourceFilter,
        setSourceFilter,
        severityFilter,
        setSeverityFilter,
        wardFilter,
        timeRangeFilter,
        setTimeRangeFilter,
        searchQuery,
        minPriorityFilter,
        signalFilters,
        wardStats,
        ingestionMode,
        ingestionStats,
        ingestFileDataset,
        agentTraces,
        selectedTrace,
        inspectAgentTrace,
        setSelectedIncidentId,
        setActiveTab,
        setCategoryFilter,
        setWardFilter,
        setSearchQuery,
        setMinPriorityFilter,
        setPlaybackSpeed,
        setSignalFilters,
        play,
        pause,
        stepForward,
        jumpToStep,
        triggerSector15Surge,
        resetSimulation,
        approveDispatch,
        modifyDispatch,
        fieldVerify,
        addCustomSignal,
        geminiApiKey,
        civicContextDataLayer: civicContextDataLayerInstance,
        setGeminiApiKey: key => {
          setGeminiApiKey(key);
          localStorage.setItem('nagar_bodh_gemini_key', key);
        }
      }}
    >
      {children}
    </CivicContext.Provider>
  );
};

export const useCivic = (): CivicContextType => {
  const context = useContext(CivicContext);
  if (!context) {
    throw new Error('useCivic must be used within a CivicProvider');
  }
  return context;
};



