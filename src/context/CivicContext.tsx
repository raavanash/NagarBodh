import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  AuditEventType,
  CivicCategory,
  CivicSignal,
  ClusteredIncident,
  DispatchActionPlan,
  IncidentStatus,
  SimulationStep,
  StateTransitionRecord
} from '../types/civic';
import { SIMULATION_STEPS } from '../data/initialData';
import { ClusterTransition, clusterSignals } from '../engine/clusteringEngine';
import { parseCivicSignalText, parseSignalWithGemini } from '../engine/nlpParser';
import { WARDS_DATA } from '../data/wardsData';
import { SignalIngestionService } from '../engine/ingestion/SignalIngestionService';
import { IngestedCivicSignal, IngestionMode, IngestionStats, RawSignalPayload } from '../types/ingestion';
import { AgentTrace } from '../types/agent';
import { CivicContextDataLayer, civicContextDataLayerInstance } from '../engine/context/CivicContextDataLayer';
import { ExternalDataPointEnvelope, WeatherData } from '../types/contextDataLayer';
import { calculateResolutionVerification } from '../engine/resolutionVerificationEngine';
import { createRepositories, type RepositoryRegistry, type RepositoryStatus } from '../repositories';


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
  activeTab: 'development_map' | 'demand_intelligence' | 'citizen_signals' | 'investment_gaps' | 'project_priorities' | 'policy_board' | 'impact' | 'live_map' | 'dossier' | 'signals' | 'dispatch' | 'authority' | 'timeline';
  currentStepIndex: number;
  currentStep: SimulationStep;
  currentWeather: SimulationStep['weatherCondition'];
  isPlaying: boolean;
  playbackSpeed: 1 | 5 | 10;
  auditLogs: AuditLogEntry[];
  operationalClock: string;

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
  setActiveTab: (tab: 'development_map' | 'demand_intelligence' | 'citizen_signals' | 'investment_gaps' | 'project_priorities' | 'policy_board' | 'impact' | 'live_map' | 'dossier' | 'signals' | 'dispatch' | 'authority' | 'timeline') => void;
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
  setIngestionMode: (mode: IngestionMode) => void;
  ingestionStats: IngestionStats;
  ingestFileDataset: (fileContent: string, fileName: string) => Promise<number>;
  liveWeatherEnvelope: ExternalDataPointEnvelope<WeatherData> | null;
  refreshWeather: () => Promise<void>;

  // Agent Traces & Inspector
  agentTraces: AgentTrace[];
  selectedTrace: AgentTrace | null;
  inspectAgentTrace: (trace: AgentTrace | null) => void;

  // Civic Context Data Layer
  civicContextDataLayer: CivicContextDataLayer;

  // Interactive Operations & Lifecycle Transitions
  transitionIncidentState: (incidentId: string, newState: IncidentStatus, actor: string, notes?: string) => void;
  triageIncident: (incidentId: string, actor?: string, notes?: string) => void;
  stageDispatchPlan: (incidentId: string, actor?: string, notes?: string) => void;
  approveDispatch: (incidentId: string, notes?: string, modifiedPlan?: Partial<DispatchActionPlan>) => void;
  modifyDispatch: (incidentId: string, updatedPlan: Partial<DispatchActionPlan>) => void;
  rejectDispatch: (incidentId: string, reason?: string) => void;
  dispatchUnits: (incidentId: string, actor?: string, notes?: string) => void;
  markOnSite: (incidentId: string, actor?: string, notes?: string) => void;
  markResolving: (incidentId: string, actor?: string, notes?: string) => void;
  resolveIncident: (incidentId: string, actor?: string, notes?: string) => void;
  aiVerifyIncident: (incidentId: string, actor?: string, notes?: string) => void;
  fieldVerify: (incidentId: string, verifiedBy?: string) => void;
  addCustomSignal: (text: string, channel: any, coords?: { lat: number; lng: number }) => Promise<void>;
  
  // Human Approval Modal
  isApprovalModalOpen: boolean;
  openApprovalModal: (incidentId?: string) => void;
  closeApprovalModal: () => void;

  // Scripted Demo Command Center Orchestration Handlers
  startLiveDemo: () => void;
  pauseDemo: () => void;
  resetDemo: () => void;
  fastForwardDemo: () => void;
  triggerEmergencyDemo: () => void;
  approveResponseDemo: () => void;
  simulateFieldArrivalDemo: () => void;
  simulateResolutionDemo: () => void;
  verifyResolutionDemo: () => void;

  geminiApiKey: string;
  setGeminiApiKey: (key: string) => void;
  getBlueskyHealth: () => any;

  // Theme State
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;

  // Repositories & Firebase Persistence Status
  repositories: RepositoryRegistry;
  persistenceStatus: RepositoryStatus;
}

const CivicContext = createContext<CivicContextType | undefined>(undefined);

export const CivicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 5 | 10>(1);

  // Active signals accumulated up to current step
  const [signals, setSignals] = useState<CivicSignal[]>(() => [...SIMULATION_STEPS[0].signalsAdded]);

  // Central Repositories instance (Firebase vs In-Memory Fallback)
  const repositories = useMemo(() => createRepositories({ signals }), [signals]);
  const persistenceStatus = repositories.status;

  // Persistent Action Plans (preserved across clustering recalculations)
  const [actionPlans, setActionPlans] = useState<Record<string, DispatchActionPlan>>({});

  // Persistent Incident Lifecycle Map (9-State NagarBodh Lifecycle)
  const [lifecycleMap, setLifecycleMap] = useState<Record<string, { status: IncidentStatus; notes?: string; actor?: string; statusHistory: StateTransitionRecord[] }>>({});

  // Human Approval Modal state
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState<boolean>(false);

  const openApprovalModal = useCallback((incidentId?: string) => {
    if (incidentId) setSelectedIncidentId(incidentId);
    setIsApprovalModalOpen(true);
  }, []);

  const closeApprovalModal = useCallback(() => {
    setIsApprovalModalOpen(false);
  }, []);

  // In-memory recurrence counter: tracks how many times each ward+category cluster has resolved
  const [recurrenceCounter, setRecurrenceCounter] = useState<Record<string, number>>({});

  // Selected incident & active navigation tab
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'development_map' | 'demand_intelligence' | 'citizen_signals' | 'investment_gaps' | 'project_priorities' | 'policy_board' | 'impact' | 'live_map' | 'dossier' | 'signals' | 'dispatch' | 'authority' | 'timeline'>('development_map');

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

  // Gemini API Key management (Secured server-side; client stays free of secret credentials)
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');

  // Theme State (Light Gov-Tech default vs Dark Tactical Command)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('nagarbodh_theme');
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  useEffect(() => {
    try {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('nagarbodh_theme', theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

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

  // Real-time operational clock ticker (syncs to real time in LIVE mode)
  const [realTimeClock, setRealTimeClock] = useState<string>(() => {
    return new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setRealTimeClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

    // Reattach saved action plans and apply explicit lifecycle state overrides & statusHistory
    const merged = rawClustered.map(inc => {
      const savedPlan = actionPlans[inc.id];
      const lifecycle = lifecycleMap[inc.id];
      const status = lifecycle?.status || (savedPlan?.status === 'approved' ? 'approved' : inc.status);
      const statusHistory = lifecycle?.statusHistory || inc.statusHistory || [];

      const resVerification = calculateResolutionVerification(
        { ...inc, status, statusHistory },
        signals
      );

      return {
        ...inc,
        actionPlan: savedPlan || inc.actionPlan,
        status,
        statusHistory,
        resolutionVerification: resVerification
      } as ClusteredIncident;
    });

    return { incidents: merged, pendingTransitions: transitions };
  }, [signals, currentWeather.rainfallMmPerHour, actionPlans, lifecycleMap]);

  // Effect: Keep prevIncidentsRef synchronized outside of render
  useEffect(() => {
    prevIncidentsRef.current = incidents;
  }, [incidents]);

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
    setLifecycleMap({});
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

  // Scripted Demo Command Handlers
  const startLiveDemo = useCallback(() => {
    setPlaybackSpeed(1);
    setIsPlaying(true);
  }, []);

  const pauseDemo = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resetDemo = useCallback(() => {
    resetSimulation();
  }, [resetSimulation]);

  const fastForwardDemo = useCallback(() => {
    setIsPlaying(false);
    if (currentStepIndex < SIMULATION_STEPS.length - 1) {
      stepForwardFn(currentStepIndex, signals);
    }
  }, [currentStepIndex, signals, stepForwardFn]);

  const triggerEmergencyDemo = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(8); // 10:00 AM Emergency Surge

    const allSurgeSignals: CivicSignal[] = [];
    for (let i = 0; i <= 8; i++) {
      allSurgeSignals.push(...(SIMULATION_STEPS[i]?.signalsAdded || []));
    }
    const uniqueMap = new Map<string, CivicSignal>();
    allSurgeSignals.forEach(s => uniqueMap.set(s.id, s));
    setSignals(Array.from(uniqueMap.values()));

    const targetId = 'incident-ward-15-central-sub-city-waterlogging';
    setSelectedIncidentId(targetId);

    appendAuditLog({
      timeLabel: '10:00 AM',
      type: 'priority_spike',
      title: '⚡ Demo Emergency Triggered: Sector 15 Critical Inundation',
      description: 'Ingested 31 multi-channel signals (+280% velocity surge). Priority calculated at 94/100 Red Alert.',
      actor: 'Demo Command Center'
    });
  }, [appendAuditLog]);

  // Core NagarBodh 9-State Transition Engine
  const transitionIncidentState = useCallback((
    incidentId: string,
    newState: IncidentStatus,
    actor: string,
    notes: string = ''
  ) => {
    const inc = incidents.find(i => i.id === incidentId);
    if (!inc) return;

    const previousState = inc.status;
    const timestamp = new Date().toISOString();
    const simulatedTimeLabel = currentStep.simulatedTime;
    const auditLogId = `log-trans-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    const transitionRecord: StateTransitionRecord = {
      id: `trans-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      incidentId,
      timestamp,
      simulatedTimeLabel,
      previousState,
      newState,
      actor,
      notes: notes || `Transitioned from ${previousState.toUpperCase()} to ${newState.toUpperCase()}`,
      auditLogId
    };

    // Update in-memory lifecycle map
    setLifecycleMap(prev => {
      const existing = prev[incidentId] || { status: previousState, statusHistory: inc.statusHistory || [] };
      return {
        ...prev,
        [incidentId]: {
          status: newState,
          notes,
          actor,
          statusHistory: [transitionRecord, ...(existing.statusHistory || [])]
        }
      };
    });

    // Update prevIncidentsRef immediately
    prevIncidentsRef.current = prevIncidentsRef.current.map(i =>
      i.id === incidentId
        ? { ...i, status: newState, statusHistory: [transitionRecord, ...(i.statusHistory || [])] }
        : i
    );

    // Audit Log Generation
    let eventType: AuditEventType = 'state_transition';
    let title = `Lifecycle Transition: ${previousState.toUpperCase()} → ${newState.toUpperCase()}`;
    if (newState === 'triaged') {
      eventType = 'incident_triaged';
      title = `📋 Incident Triaged: ${inc.title}`;
    } else if (newState === 'dispatch_pending') {
      eventType = 'response_plan_generated';
      title = `⚡ Dispatch Plan Staged: ${inc.ward}`;
    } else if (newState === 'approved') {
      eventType = 'dispatch_approved';
      title = `✅ Human Approval Granted: ${inc.title}`;
    } else if (newState === 'dispatched') {
      eventType = 'crew_dispatched';
      title = `🚨 Field Crew Dispatched: ${inc.ward}`;
    } else if (newState === 'on_site') {
      eventType = 'units_on_site';
      title = `📍 Field Units On-Site: ${inc.ward}`;
    } else if (newState === 'resolving') {
      eventType = 'resolution_begun';
      title = `⚙️ Active Field Mitigation: ${inc.ward}`;
    } else if (newState === 'resolved') {
      eventType = 'resolution_confirmed';
      title = `✅ Incident Resolved: ${inc.title}`;
    } else if (newState === 'verified') {
      eventType = 'field_verification';
      title = `🔍 AI Verification Passed: ${inc.title}`;
    }

    appendAuditLog({
      timeLabel: simulatedTimeLabel,
      type: eventType,
      title,
      description: `Actor: ${actor} | Prev State: ${previousState.toUpperCase()} → New State: ${newState.toUpperCase()}${notes ? ` | Notes: ${notes}` : ''}`,
      actor,
      incidentId,
      metadata: { previousState, newState, notes }
    });
  }, [incidents, currentStep.simulatedTime, appendAuditLog]);

  const triageIncident = useCallback((incidentId: string, actor = 'Municipal Triaging Officer (Duty Desk)', notes = 'Verified signal velocity and categorized severity.') => {
    transitionIncidentState(incidentId, 'triaged', actor, notes);
  }, [transitionIncidentState]);

  const stageDispatchPlan = useCallback((incidentId: string, actor = 'NagarBodh Response Engine AI', notes = 'Generated dynamic SOP response plan and staged for officer review.') => {
    transitionIncidentState(incidentId, 'dispatch_pending', actor, notes);
  }, [transitionIncidentState]);

  const approveDispatch = useCallback((incidentId: string, notes = 'Plan approved via Human Approval Modal.', modifiedPlanPartial?: Partial<DispatchActionPlan>) => {
    const inc = incidents.find(i => i.id === incidentId);
    if (!inc) return;

    if (modifiedPlanPartial && inc.actionPlan) {
      const updatedPlan: DispatchActionPlan = {
        ...inc.actionPlan,
        ...modifiedPlanPartial,
        status: 'approved',
        approvedBy: 'Municipal Operations Commander',
        notes: notes || inc.actionPlan.notes
      };
      setActionPlans(prev => ({ ...prev, [incidentId]: updatedPlan }));
    } else if (inc.actionPlan) {
      setActionPlans(prev => ({ ...prev, [incidentId]: { ...inc.actionPlan!, status: 'approved' } }));
    }

    transitionIncidentState(incidentId, 'approved', 'Municipal Operations Commissioner (Badge #CC-04)', notes);
  }, [incidents, transitionIncidentState]);

  const modifyDispatch = useCallback((incidentId: string, updatedPlanPartial: Partial<DispatchActionPlan>) => {
    const inc = incidents.find(i => i.id === incidentId);
    if (!inc || !inc.actionPlan) return;

    const updatedPlan: DispatchActionPlan = {
      ...inc.actionPlan,
      ...updatedPlanPartial,
      status: 'modified'
    };

    setActionPlans(prev => ({ ...prev, [incidentId]: updatedPlan }));
    appendAuditLog({
      timeLabel: currentStep.simulatedTime,
      type: 'plan_modified',
      title: `✏️ Response Plan Modified: ${inc.ward}`,
      description: `Plan #${inc.actionPlan.id} modified by Commander before authorization.`,
      actor: 'Municipal Operations Commander',
      incidentId
    });
  }, [incidents, currentStep.simulatedTime, appendAuditLog]);

  const rejectDispatch = useCallback((incidentId: string, reason?: string) => {
    const inc = incidents.find(i => i.id === incidentId);
    if (!inc || !inc.actionPlan) return;

    setActionPlans(prev => ({
      ...prev,
      [incidentId]: { ...inc.actionPlan!, status: 'rejected', notes: reason ? `Rejected: ${reason}` : inc.actionPlan!.notes }
    }));

    appendAuditLog({
      timeLabel: currentStep.simulatedTime,
      type: 'plan_rejected',
      title: `❌ Response Plan Rejected: ${inc.ward}`,
      description: `Action plan rejected by Commander. Reason: ${reason || 'Reassessment requested.'}`,
      actor: 'Municipal Operations Commander',
      incidentId
    });
  }, [incidents, currentStep.simulatedTime, appendAuditLog]);

  const dispatchUnits = useCallback((incidentId: string, actor = 'Control Room Dispatcher (Unit Lead)', notes = 'Mobilized dewatering and emergency crews to target location.') => {
    const inc = incidents.find(i => i.id === incidentId);
    if (inc?.actionPlan) {
      setActionPlans(prev => ({
        ...prev,
        [incidentId]: {
          ...inc.actionPlan!,
          equipment: inc.actionPlan!.equipment.map(e => ({ ...e, status: 'deployed' as const })),
          requiredResources: (inc.actionPlan!.requiredResources || []).map(r => ({ ...r, status: 'deployed' as const }))
        }
      }));
    }
    transitionIncidentState(incidentId, 'dispatched', actor, notes);
  }, [incidents, transitionIncidentState]);

  const markOnSite = useCallback((incidentId: string, actor = 'Field Response Unit Alpha', notes = 'Crew arrived on site and established safety perimeter.') => {
    transitionIncidentState(incidentId, 'on_site', actor, notes);
  }, [transitionIncidentState]);

  const markResolving = useCallback((incidentId: string, actor = 'Engineering Operations Crew', notes = 'High-capacity dewatering pumps operational; drain obstruction cleared.') => {
    transitionIncidentState(incidentId, 'resolving', actor, notes);
  }, [transitionIncidentState]);

  const resolveIncident = useCallback((incidentId: string, actor = 'Field Supervisor (Badge #FS-07)', notes = 'Floodwaters receded; traffic flow restored. Field work complete.') => {
    transitionIncidentState(incidentId, 'resolved', actor, notes);
    const inc = incidents.find(i => i.id === incidentId);
    if (inc) {
      const key = `${inc.ward}::${inc.category}`;
      setRecurrenceCounter(prev => ({ ...prev, [key]: (prev[key] || 0) + 1 }));
    }
  }, [incidents, transitionIncidentState]);

  const aiVerifyIncident = useCallback((incidentId: string, actor = 'NagarBodh AI Corroboration Engine', notes = 'Cross-channel signal sentiment analysis confirms incident resolved. SLA closed.') => {
    const inc = incidents.find(i => i.id === incidentId);
    if (inc) {
      prevIncidentsRef.current = prevIncidentsRef.current.map(i =>
        i.id === incidentId ? { ...i, status: 'verified', verifiedAt: new Date().toISOString(), verifiedBy: actor } : i
      );
    }
    transitionIncidentState(incidentId, 'verified', actor, notes);
  }, [incidents, transitionIncidentState]);

  const fieldVerify = useCallback((incidentId: string, verifiedBy = 'Field Supervisor (Badge #FS-07)') => {
    aiVerifyIncident(incidentId, verifiedBy, 'Manual field verification override completed.');
  }, [aiVerifyIncident]);

  // Demo Action Button Implementations
  const approveResponseDemo = useCallback(() => {
    const targetId = selectedIncidentId || 'incident-ward-15-central-sub-city-waterlogging';
    approveDispatch(targetId, 'Authorized via Demo Command Center by Operations Commander.');
  }, [selectedIncidentId, approveDispatch]);

  const simulateFieldArrivalDemo = useCallback(() => {
    const targetId = selectedIncidentId || 'incident-ward-15-central-sub-city-waterlogging';
    dispatchUnits(targetId, 'Control Room Dispatcher', 'Deployed heavy dewatering pumps & mobile response units.');
    markOnSite(targetId, 'Field Response Unit Alpha', 'Arrived at Sector 15 underpass dip; established safety perimeter.');
  }, [selectedIncidentId, dispatchUnits, markOnSite]);

  const simulateResolutionDemo = useCallback(() => {
    const targetId = selectedIncidentId || 'incident-ward-15-central-sub-city-waterlogging';
    if (SIMULATION_STEPS[13]) {
      const posSignals = SIMULATION_STEPS[13].signalsAdded;
      setSignals(prev => {
        const map = new Map<string, CivicSignal>(prev.map(s => [s.id, s]));
        posSignals.forEach(s => map.set(s.id, s));
        return Array.from(map.values());
      });
    }
    markResolving(targetId, 'Engineering Operations Crew', 'High-capacity dewatering pumps operational; drain choked points cleared.');
    resolveIncident(targetId, 'Field Supervisor (Badge #FS-07)', 'Floodwaters receded; subway approach reopened; traffic flowing normal.');
  }, [selectedIncidentId, markResolving, resolveIncident]);

  const verifyResolutionDemo = useCallback(() => {
    const targetId = selectedIncidentId || 'incident-ward-15-central-sub-city-waterlogging';
    aiVerifyIncident(targetId, 'NagarBodh AI Verification Engine', '8-Step resolution verification audit complete. -87% signal reduction verified.');
  }, [selectedIncidentId, aiVerifyIncident]);

  // Ingestion Service Instance
  const ingestionServiceRef = useRef<SignalIngestionService>(new SignalIngestionService(signals as any));
  const [ingestionStats, setIngestionStats] = useState<IngestionStats>(() => ingestionServiceRef.current.getStats());
  const [ingestionMode, setIngestionModeState] = useState<IngestionMode>(() => {
    const saved = localStorage.getItem('nagar_bodh_ingestion_mode') as IngestionMode;
    return saved || 'LIVE';
  });

  const operationalClock = ingestionMode === 'LIVE' ? realTimeClock : currentStep.simulatedTime;
  const [liveWeatherEnvelope, setLiveWeatherEnvelope] = useState<ExternalDataPointEnvelope<any> | null>(null);

  // Weather Refresh Logic
  const refreshWeather = useCallback(async () => {
    try {
      const mode = ingestionMode === 'LIVE' ? 'live' : 'cached';
      const envelope = await civicContextDataLayerInstance['weatherProvider'].getWeather(28.5831, 77.3184, mode);
      setLiveWeatherEnvelope(envelope);
    } catch (err) {
      console.warn('[CivicContext] refreshWeather error:', err);
    }
  }, [ingestionMode]);

  // Bluesky Live Ingestion & Polling Handler
  const fetchBlueskyLiveSignals = useCallback(async () => {
    try {
      const bskyProvider = ingestionServiceRef.current.getProvider('provider-social-bluesky') as any;
      if (bskyProvider) {
        bskyProvider.setMode('LIVE');
        const { normalizedSignals, results } = await ingestionServiceRef.current.ingest('provider-social-bluesky');
        const duplicates = results.filter(r => r.isDuplicate).length;

        console.log(`[Bluesky] Normalized signals: ${normalizedSignals.length}`);
        console.log(`[Bluesky] Duplicates removed: ${duplicates}`);

        if (normalizedSignals.length > 0) {
          setSignals(prev => {
            const existingIds = new Set(prev.map(s => s.id));
            const fresh = normalizedSignals.filter(s => !existingIds.has(s.id));
            return fresh.length > 0 ? [...fresh, ...prev] : prev;
          });
        }
      }
    } catch (err) {
      console.warn('[CivicContext] Exception fetching live Bluesky signals:', err);
    }
  }, []);

  // Mode Switch Handler (LIVE vs SIMULATION)
  const setIngestionMode = useCallback(async (newMode: IngestionMode) => {
    setIngestionModeState(newMode);
    localStorage.setItem('nagar_bodh_ingestion_mode', newMode);
    ingestionServiceRef.current.setIngestionMode(newMode);

    if (newMode === 'LIVE') {
      civicContextDataLayerInstance.setGlobalMode('live');
      // Trigger immediate live fetches
      const env = await civicContextDataLayerInstance['weatherProvider'].getWeather(28.5831, 77.3184, 'live');
      setLiveWeatherEnvelope(env);

      // Trigger live Bluesky API fetch
      await fetchBlueskyLiveSignals();

      appendAuditLog({
        timeLabel: currentStep.simulatedTime,
        type: 'state_transition',
        title: '🌐 Switched to LIVE Bluesky Ingestion Mode',
        description: 'Live ingestion mode enabled. External providers will be queried through the NagarBodh backend proxy.',
        actor: 'Commander Mode Switcher'
      });
    } else {
      civicContextDataLayerInstance.setGlobalMode('cached');
      const bskyProvider = ingestionServiceRef.current.getProvider('provider-social-bluesky') as any;
      if (bskyProvider) {
        bskyProvider.setMode('SIMULATION');
      }
      refreshWeather();

      appendAuditLog({
        timeLabel: currentStep.simulatedTime,
        type: 'state_transition',
        title: '⚡ Switched to SIMULATION Mode',
        description: 'Reverted to deterministic simulation baseline steps and mock datasets.',
        actor: 'Commander Mode Switcher'
      });
    }
  }, [currentStep.simulatedTime, appendAuditLog, refreshWeather, fetchBlueskyLiveSignals]);

  // Register real-time callback from BlueskyJetstreamProvider to drive state bridge
  useEffect(() => {
    const currentIngestionService = ingestionServiceRef.current;
    const bskyProvider = currentIngestionService.getProvider('provider-social-bluesky') as any;

    if (bskyProvider && typeof bskyProvider.setOnSignalListener === 'function') {
      bskyProvider.setOnSignalListener(async (rawPayload: RawSignalPayload) => {
        try {
          const { normalizedSignals, results } = await currentIngestionService.ingest(
            'provider-social-bluesky',
            rawPayload
          );

          const isDuplicate = results.some(r => r.isDuplicate);
          if (isDuplicate && bskyProvider.duplicatesRejected !== undefined) {
            bskyProvider.duplicatesRejected++;
            console.log('[Bluesky Jetstream] Duplicate signal rejected');
          }

          if (normalizedSignals.length > 0) {
            if (bskyProvider.normalizedAccepted !== undefined) {
              bskyProvider.normalizedAccepted += normalizedSignals.length;
            }
            console.log('[Bluesky Jetstream] Forwarding RawSignalPayload');
            console.log('[Bluesky Jetstream] Normalized signal accepted');
            console.log(`[Bluesky Jetstream] Adding ${normalizedSignals.length} live signals to CivicContext`);

            setSignals(prev => {
              const existingIds = new Set(prev.map(s => s.id));
              const fresh = normalizedSignals.filter(s => !existingIds.has(s.id));
              const nextState = fresh.length > 0 ? [...fresh, ...prev] : prev;
              console.log(`[Bluesky Jetstream] CivicContext signals updated: total ${nextState.length}`);
              return nextState;
            });
          }
        } catch (err) {
          console.warn('[CivicContext] Exception processing live Jetstream signal:', err);
        }
      });
    }

    const handleTestFixture = (e: any) => {
      const fixtureData = e.detail;
      if (bskyProvider && typeof bskyProvider.simulateRawJetstreamEventForTesting === 'function') {
        bskyProvider.simulateRawJetstreamEventForTesting(fixtureData);
      }
    };
    window.addEventListener('nagarbodh:test-jetstream', handleTestFixture);

    return () => {
      window.removeEventListener('nagarbodh:test-jetstream', handleTestFixture);
      if (bskyProvider && typeof bskyProvider.setOnSignalListener === 'function') {
        bskyProvider.setOnSignalListener(null);
      }
    };
  }, []);

  // Sync Data Layer mode on mount & trigger initial live fetch if mode is LIVE
  useEffect(() => {
    ingestionServiceRef.current.setIngestionMode(ingestionMode);
    if (ingestionMode === 'LIVE') {
      civicContextDataLayerInstance.setGlobalMode('live');
      fetchBlueskyLiveSignals();
    } else {
      civicContextDataLayerInstance.setGlobalMode('cached');
    }

    const currentIngestionService = ingestionServiceRef.current;
    return () => {
      const bskyProvider = currentIngestionService.getProvider('provider-social-bluesky') as any;
      if (bskyProvider && typeof bskyProvider.stop === 'function') {
        bskyProvider.stop();
      }
    };
  }, [ingestionMode, fetchBlueskyLiveSignals]);

  // Auto-refresh weather every 5 minutes in LIVE mode
  useEffect(() => {
    refreshWeather();
    if (ingestionMode !== 'LIVE') return;
    const interval = setInterval(() => {
      refreshWeather();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [ingestionMode, refreshWeather]);

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
    const parsed = await parseSignalWithGemini(text);

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
  }, [currentStep.simulatedTime, appendAuditLog]);

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
        operationalClock,
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
        setIngestionMode,
        ingestionStats,
        ingestFileDataset,
        liveWeatherEnvelope,
        refreshWeather,
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
        transitionIncidentState,
        triageIncident,
        stageDispatchPlan,
        approveDispatch,
        modifyDispatch,
        rejectDispatch,
        dispatchUnits,
        markOnSite,
        markResolving,
        resolveIncident,
        aiVerifyIncident,
        fieldVerify,
        addCustomSignal,
        isApprovalModalOpen,
        openApprovalModal,
        closeApprovalModal,
        startLiveDemo,
        pauseDemo,
        resetDemo,
        fastForwardDemo,
        triggerEmergencyDemo,
        approveResponseDemo,
        simulateFieldArrivalDemo,
        simulateResolutionDemo,
        verifyResolutionDemo,
        geminiApiKey,
        civicContextDataLayer: civicContextDataLayerInstance,
        setGeminiApiKey: key => {
          setGeminiApiKey(key);
          localStorage.setItem('nagar_bodh_gemini_key', key);
        },
        getBlueskyHealth: () => ingestionServiceRef.current.getBlueskyHealth(),
        theme,
        setTheme,
        toggleTheme,
        repositories,
        persistenceStatus
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



