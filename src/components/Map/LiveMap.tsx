import React, { useCallback, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Eye,
  Filter,
  Flame,
  FolderOpen,
  GripHorizontal,
  Layers,
  List,
  MapPin,
  Maximize2,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Shield,
  SkipForward,
  Sparkles,
  X,
  Zap
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { CRITICAL_ASSETS } from '../../data/criticalAssets';
import { SIMULATION_STEPS } from '../../data/initialData';
import { CivicSignal, ClusteredIncident } from '../../types/civic';
import { MapSidebarLeft } from './MapSidebarLeft';
import { ExplainableInvestmentDossierDrawer } from '../Gaps/ExplainableInvestmentDossierDrawer';
import { buildInvestmentExplanationDossier } from '../../engine/developmentGapEngine';
import { InvestmentExplanationDossier } from '../../types/development';

export const LiveMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const signalLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const assetLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const bufferLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const wardLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const prevSignalsCountRef = useRef<number>(0);

  // Floating Control Overlay States
  const [isLegendMinimized, setIsLegendMinimized] = useState<boolean>(false);
  const [isHotspotQueueCollapsed, setIsHotspotQueueCollapsed] = useState<boolean>(false);
  const [isLayerSwitcherOpen, setIsLayerSwitcherOpen] = useState<boolean>(false);
  const [selectedCategoryPill, setSelectedCategoryPill] = useState<string>('ALL');

  // Progressive Layer Visibility Switches
  const [visibleLayers, setVisibleLayers] = useState({
    hotspots: true,
    rawSignals: false,
    criticalAssets: true,
    wardBoundaries: true,
    weatherRisk: false,
    historicalIncidents: false,
    drainage: false
  });

  // Timeline Dock Floating Drag & Collapse State
  const [isTimelineMinimized, setIsTimelineMinimized] = useState<boolean>(
    () => typeof window !== 'undefined' && window.innerWidth <= 900
  );
  const [timelinePos, setTimelinePos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingTimelineRef = useRef(false);
  const dragStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });
  const timelineRef = useRef<HTMLDivElement>(null);

  const handleTimelinePointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const el = timelineRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    isDraggingTimelineRef.current = true;
    dragStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: timelinePos ? timelinePos.x : rect.left,
      initialY: timelinePos ? timelinePos.y : rect.top
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handleTimelinePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingTimelineRef.current) return;
    const dx = e.clientX - dragStartRef.current.startX;
    const dy = e.clientY - dragStartRef.current.startY;
    const newX = Math.max(10, Math.min(window.innerWidth - 320, dragStartRef.current.initialX + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 100, dragStartRef.current.initialY + dy));
    setTimelinePos({ x: newX, y: newY });
  };

  const handleTimelinePointerUp = (e: React.PointerEvent) => {
    if (isDraggingTimelineRef.current) {
      isDraggingTimelineRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  const {
    signals,
    incidents,
    selectedIncident,
    selectedIncidentId,
    setSelectedIncidentId,
    setActiveTab,
    prioritizeRecommendationInPipeline,
    mapMode,
    setMapMode,
    categoryFilter,
    setCategoryFilter,
    sourceFilter,
    severityFilter,
    wardFilter,
    minPriorityFilter,
    currentStepIndex,
    currentStep,
    isPlaying,
    playbackSpeed,
    play,
    pause,
    stepForward,
    jumpToStep,
    resetSimulation,
    setPlaybackSpeed,
    ingestionMode
  } = useCivic();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedDossier, setSelectedDossier] = useState<InvestmentExplanationDossier | null>(null);

  const handleOpenDossierFromMap = (incident: ClusteredIncident) => {
    const dossier = buildInvestmentExplanationDossier(incident.category, incidents, signals);
    setSelectedDossier(dossier);
  };

  // Initialize Leaflet Map with OpenStreetMap raster tiles
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center default near Gurugram / NCR central corridor
    const map = L.map(mapContainerRef.current, {
      center: [28.4595, 77.0266],
      zoom: 13,
      zoomControl: false
    });

    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      subdomains: 'abc',
      maxZoom: 19,
      className: 'dark-map-tiles'
    });
    tileLayer.addTo(map);

    const wardGroup = L.layerGroup().addTo(map);
    const bufferGroup = L.layerGroup().addTo(map);
    const assetGroup = L.layerGroup().addTo(map);
    const signalGroup = L.layerGroup().addTo(map);
    const clusterGroup = L.layerGroup().addTo(map);

    wardLayerGroupRef.current = wardGroup;
    bufferLayerGroupRef.current = bufferGroup;
    assetLayerGroupRef.current = assetGroup;
    signalLayerGroupRef.current = signalGroup;
    clusterLayerGroupRef.current = clusterGroup;

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Ward Boundaries Rendering Effect
  useEffect(() => {
    if (!mapInstanceRef.current || !wardLayerGroupRef.current) return;
    wardLayerGroupRef.current.clearLayers();

    if (visibleLayers.wardBoundaries) {
      const wardPolygons = [
        {
          name: 'Ward 15 - Sector 15 / Mayur Enclave',
          color: '#2563eb',
          coords: [
            [28.468, 77.030],
            [28.475, 77.048],
            [28.460, 77.054],
            [28.452, 77.035]
          ] as L.LatLngTuple[]
        },
        {
          name: 'Ward 14 - Karol Bagh Commercial',
          color: '#d97706',
          coords: [
            [28.450, 77.010],
            [28.462, 77.025],
            [28.450, 77.035],
            [28.438, 77.018]
          ] as L.LatLngTuple[]
        },
        {
          name: 'Ward 22 - Connaught Place & Ring Road',
          color: '#059669',
          coords: [
            [28.435, 77.025],
            [28.448, 77.042],
            [28.438, 77.055],
            [28.425, 77.038]
          ] as L.LatLngTuple[]
        },
        {
          name: 'Ward 09 - Rohini Sector 7 Residential',
          color: '#7c3aed',
          coords: [
            [28.460, 76.995],
            [28.472, 77.012],
            [28.458, 77.022],
            [28.448, 77.005]
          ] as L.LatLngTuple[]
        }
      ];

      wardPolygons.forEach(w => {
        const poly = L.polygon(w.coords, {
          color: w.color,
          weight: 1.5,
          dashArray: '5, 5',
          fillColor: w.color,
          fillOpacity: 0.06
        });
        poly.bindTooltip(w.name, { sticky: true });
        poly.addTo(wardLayerGroupRef.current!);
      });
    }
  }, [visibleLayers.wardBoundaries]);

  // Render Critical Infrastructure POIs & Proximity Buffers
  useEffect(() => {
    if (!mapInstanceRef.current || !assetLayerGroupRef.current || !bufferLayerGroupRef.current) return;

    assetLayerGroupRef.current.clearLayers();
    bufferLayerGroupRef.current.clearLayers();

    if (!visibleLayers.criticalAssets) return;

    CRITICAL_ASSETS.forEach(asset => {
      const bufferCircle = L.circle([asset.coordinates.lat, asset.coordinates.lng], {
        radius: asset.vulnerabilityBufferMeters,
        color: asset.type === 'school' ? '#8b5cf6' : asset.type === 'hospital' ? '#ef4444' : '#06b6d4',
        weight: 1,
        dashArray: '4, 6',
        fillColor: asset.type === 'school' ? '#8b5cf6' : asset.type === 'hospital' ? '#ef4444' : '#06b6d4',
        fillOpacity: 0.08
      });
      bufferCircle.addTo(bufferLayerGroupRef.current!);

      let iconEmoji = '🏫';
      let poiClass = 'poi-school';
      if (asset.type === 'hospital') {
        iconEmoji = '🏥';
        poiClass = 'poi-hospital';
      } else if (asset.type === 'metro') {
        iconEmoji = '🚇';
        poiClass = 'poi-metro';
      } else if (asset.type === 'pumping_station') {
        iconEmoji = '⚙️';
        poiClass = 'poi-pumping';
      } else if (asset.type === 'fire_station') {
        iconEmoji = '🚒';
        poiClass = 'poi-fire';
      }

      const customPoiIcon = L.divIcon({
        className: 'poi-custom-div',
        html: `<div class="poi-asset-marker ${poiClass}" title="${asset.name} (${asset.type.toUpperCase()})">
          <span style="font-size: 15px;">${iconEmoji}</span>
        </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });

      const marker = L.marker([asset.coordinates.lat, asset.coordinates.lng], { icon: customPoiIcon });

      marker.bindPopup(`
        <div style="font-family: var(--font-sans); color: var(--text-primary); min-width: 220px;">
          <div style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; margin-bottom: 2px;">
            Critical Infrastructure • ${asset.type.toUpperCase()}
          </div>
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; color: var(--text-primary);">
            ${asset.name}
          </div>
          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 6px;">
            ${asset.capacity || ''}
          </div>
          <div style="font-size: 0.72rem; color: var(--text-accent); font-family: var(--font-mono); border-top: 1px solid var(--border-subtle); padding-top: 4px;">
            Contact: ${asset.contactPerson || 'Emergency Liaison'}
          </div>
          <div style="font-size: 0.68rem; color: #7c3aed; margin-top: 4px; background: rgba(124, 58, 237, 0.12); border: 1px solid rgba(124, 58, 237, 0.25); padding: 3px 6px; border-radius: 4px; font-weight: 600;">
            Alert Buffer: ${asset.vulnerabilityBufferMeters}m
          </div>
        </div>
      `);

      marker.addTo(assetLayerGroupRef.current!);
    });
  }, [visibleLayers.criticalAssets]);

  // Filter individual civic signals
  const filteredSignals = signals.filter(sig => {
    if (categoryFilter !== 'all' && sig.category !== categoryFilter) return false;
    if (sourceFilter !== 'all' && sig.channel !== sourceFilter) return false;
    if (severityFilter !== 'all' && sig.reportedSeverity !== severityFilter) return false;
    if (wardFilter !== 'all' && sig.ward !== wardFilter) return false;
    return true;
  });

  // Filter clustered incidents based on global context + category pill filter
  const filteredIncidents = incidents.filter(inc => {
    if (selectedCategoryPill === 'GARBAGE' && !(inc.category === 'garbage' || inc.category === 'sanitation')) return false;
    if (selectedCategoryPill === 'WATERLOGGING' && !(inc.category === 'waterlogging' || inc.category === 'drainage')) return false;
    if (selectedCategoryPill === 'POTHOLE' && !(inc.category === 'road_hazard' || inc.category === 'roads')) return false;
    if (selectedCategoryPill === 'OTHERS' && !(inc.category === 'electricity' || inc.category === 'traffic')) return false;

    if (categoryFilter !== 'all' && inc.category !== categoryFilter) return false;
    if (sourceFilter !== 'all') {
      const incSignals = signals.filter(s => inc.signalIds.includes(s.id));
      const hasMatchingChannel = incSignals.some(s => s.channel === sourceFilter);
      if (!hasMatchingChannel) return false;
    }
    if (severityFilter !== 'all') {
      const matchSev = inc.priority.level === severityFilter || (severityFilter === 'critical' && inc.priority.overallScore >= 80);
      if (!matchSev) return false;
    }
    if (wardFilter !== 'all' && inc.ward !== wardFilter) return false;
    if (inc.priority.overallScore < minPriorityFilter) return false;
    return true;
  });

  // Category Pill Counts Helper
  const getPillCount = (pillId: string) => {
    if (pillId === 'ALL') return incidents.length;
    if (pillId === 'GARBAGE') return incidents.filter(i => i.category === 'garbage' || i.category === 'sanitation').length;
    if (pillId === 'WATERLOGGING') return incidents.filter(i => i.category === 'waterlogging' || i.category === 'drainage').length;
    if (pillId === 'POTHOLE') return incidents.filter(i => i.category === 'road_hazard' || i.category === 'roads').length;
    if (pillId === 'OTHERS') return incidents.filter(i => i.category === 'electricity' || i.category === 'traffic').length;
    return 0;
  };

  const handlePillClick = (pillId: string) => {
    setSelectedCategoryPill(pillId);
  };

  // Render Individual Civic Signals (when in CIVIC SIGNALS mode or toggled ON)
  useEffect(() => {
    if (!mapInstanceRef.current || !signalLayerGroupRef.current) return;

    signalLayerGroupRef.current.clearLayers();

    if (mapMode === 'civic_signals' || visibleLayers.rawSignals) {
      filteredSignals.forEach(sig => {
        let channelIcon = '📱';
        let channelColor = '#06b6d4';
        if (sig.channel === 'social_x' || sig.channel === 'social_bluesky') {
          channelIcon = '🐦';
          channelColor = '#1d9bf0';
        } else if (sig.channel === 'grievance_portal') {
          channelIcon = '🏛️';
          channelColor = '#a78bfa';
        } else if (sig.channel === 'helpline_112') {
          channelIcon = '📞';
          channelColor = '#f59e0b';
        }

        const sevColor = sig.reportedSeverity === 'critical' ? '#ef4444' : sig.reportedSeverity === 'high' ? '#f97316' : '#06b6d4';

        const signalDivIcon = L.divIcon({
          className: 'signal-custom-div',
          html: `
            <div class="signal-drop-pin" style="background: ${sevColor}; border-color: ${channelColor};" title="${sig.simulatedTimeLabel} • ${sig.category}">
              <span>${channelIcon}</span>
            </div>
          `,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        const marker = L.marker([sig.coordinates.lat, sig.coordinates.lng], { icon: signalDivIcon });

        marker.bindPopup(`
          <div style="font-family: var(--font-sans); color: var(--text-primary); max-width: 240px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: ${channelColor};">
                ${channelIcon} ${sig.channel === 'helpline_112' ? '155304 / 112 HELPLINE' : sig.channel.replace('_', ' ').toUpperCase()}
              </span>
              <span style="font-family: var(--font-mono); font-size: 0.7rem; color: var(--text-muted);">
                ${sig.simulatedTimeLabel}
              </span>
            </div>
            <div style="font-size: 0.82rem; color: var(--text-primary); font-weight: 600; margin-bottom: 6px; line-height: 1.3;">
              "${sig.rawText}"
            </div>
            <div style="font-size: 0.72rem; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 4px; display: flex; justify-content: space-between;">
              <span>📍 ${sig.locationName}</span>
              <span style="color: ${sevColor}; font-weight: 700;">${sig.reportedSeverity.toUpperCase()}</span>
            </div>
          </div>
        `);

        marker.addTo(signalLayerGroupRef.current!);
      });
    }

    // Ripple animation trigger when new signals arrive
    if (signals.length > prevSignalsCountRef.current && prevSignalsCountRef.current > 0) {
      const latestSignal = signals[signals.length - 1];
      if (latestSignal && latestSignal.coordinates) {
        const rippleIcon = L.divIcon({
          className: 'ripple-div',
          html: `<div class="signal-arrival-ripple"></div>`,
          iconSize: [48, 48],
          iconAnchor: [24, 24]
        });
        const rippleMarker = L.marker([latestSignal.coordinates.lat, latestSignal.coordinates.lng], { icon: rippleIcon });
        rippleMarker.addTo(signalLayerGroupRef.current!);
        setTimeout(() => {
          if (signalLayerGroupRef.current) signalLayerGroupRef.current.removeLayer(rippleMarker);
        }, 1200);
      }
    }
    prevSignalsCountRef.current = signals.length;
  }, [signals, mapMode, visibleLayers.rawSignals, filteredSignals]);

  // Render Clustered Demand Hotspot Markers with Visual Hierarchy
  useEffect(() => {
    if (!mapInstanceRef.current || !clusterLayerGroupRef.current) return;

    clusterLayerGroupRef.current.clearLayers();

    if (!visibleLayers.hotspots) return;

    filteredIncidents.forEach(inc => {
      const isCritical = inc.priority.overallScore >= 80;
      const isHigh = inc.priority.overallScore >= 60;
      const isResolved = inc.status === 'resolved';

      // Accelerating signal velocity check for Emerging Now state
      const isEmergingNow = inc.velocitySurgePercent >= 150 || inc.velocityPerHour >= 10;

      let clusterColorClass = 'cluster-medium';
      if (isResolved) {
        clusterColorClass = 'cluster-resolved';
      } else if (isCritical) {
        clusterColorClass = 'cluster-critical';
      } else if (isHigh) {
        clusterColorClass = 'cluster-high';
      }

      // Ring pulse size scales with velocity
      const pulseSize = Math.min(84, Math.max(48, Math.round(inc.velocityPerHour * 3.5)));
      const isSelected = inc.id === selectedIncidentId;
      const isAnySelected = Boolean(selectedIncidentId);

      const clusterIcon = L.divIcon({
        className: 'cluster-custom-div',
        html: `
          <div class="pulse-cluster-marker ${clusterColorClass}" style="width: ${pulseSize}px; height: ${pulseSize}px; ${isAnySelected && !isSelected ? 'opacity: 0.55; filter: grayscale(20%);' : ''}">
            ${isEmergingNow && !isResolved ? `<div class="emerging-now-badge">🔥 EMERGING NOW</div><div class="emerging-double-ring" style="width: ${pulseSize * 1.2}px; height: ${pulseSize * 1.2}px;"></div>` : ''}
            ${!isResolved ? `<div class="pulse-ring" style="width: ${pulseSize}px; height: ${pulseSize}px;"></div>` : ''}
            <div class="cluster-dot" style="${isSelected ? 'transform: scale(1.4); border: 3px solid #ffffff; box-shadow: 0 0 0 5px rgba(37, 99, 235, 0.4), 0 0 25px rgba(37, 99, 235, 0.85); z-index: 1000;' : ''}">
              ${inc.signalIds.length}
            </div>
          </div>
        `,
        iconSize: [pulseSize, pulseSize],
        iconAnchor: [pulseSize / 2, pulseSize / 2]
      });

      const marker = L.marker([inc.centroid.lat, inc.centroid.lng], { icon: clusterIcon });

      marker.on('click', () => {
        setSelectedIncidentId(inc.id);
      });

      marker.addTo(clusterLayerGroupRef.current!);
    });
  }, [filteredIncidents, selectedIncidentId, visibleLayers.hotspots, setSelectedIncidentId]);

  // Auto-minimize Telemetry Legend when an issue card is selected to prevent overlap
  useEffect(() => {
    if (selectedIncidentId) {
      setIsLegendMinimized(true);
    }
  }, [selectedIncidentId]);

  // Selected-incident camera focus flyTo
  useEffect(() => {
    if (!selectedIncidentId || !mapInstanceRef.current) return;
    const selected = incidents.find(i => i.id === selectedIncidentId);
    if (selected && selected.centroid) {
      mapInstanceRef.current.flyTo([selected.centroid.lat, selected.centroid.lng], 16, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [selectedIncidentId, incidents]);

  return (
    <div className="map-canvas-wrapper" style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: '100%', height: '100%' }}>
      {/* Dominant Leaflet Map Canvas (80–90% Visual Field) */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />

      {/* FLOATING CONTROL OVERLAY 1: Telemetry Legend (Upper-Left) */}
      <div style={{ position: 'absolute', top: '0.85rem', left: '0.85rem', zIndex: 1050, pointerEvents: 'none' }}>
        {isLegendMinimized ? (
          <button
            onClick={() => setIsLegendMinimized(false)}
            className="telemetry-collapsed-btn"
            title="Expand Telemetry Legend"
          >
            <Layers size={14} color="#2563eb" />
            <span>Telemetry</span>
            <ChevronDown size={13} color="var(--text-muted)" />
          </button>
        ) : (
          <div className="telemetry-legend-floating">
            <div className="telemetry-header">
              <div className="telemetry-title">
                <Layers size={14} color="#2563eb" />
                <span>Telemetry</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="telemetry-badge">AI PRIORITY</span>
                <button
                  onClick={() => setIsLegendMinimized(true)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}
                  title="Collapse Telemetry Legend"
                >
                  <ChevronUp size={14} />
                </button>
              </div>
            </div>

            <div className="telemetry-item">
              <span className="telemetry-dot" style={{ background: '#ef4444' }} />
              <span><strong>Critical P1</strong> (Score &ge; 80)</span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-dot" style={{ background: '#f59e0b' }} />
              <span><strong>High P2</strong> (Score 60 - 79)</span>
            </div>
            <div className="telemetry-item">
              <span className="telemetry-dot" style={{ background: '#0284c7' }} />
              <span><strong>Standard P3</strong> (Score &lt; 60)</span>
            </div>
            <div className="telemetry-item">
              <span>🔥</span>
              <span><strong>Emerging Now</strong> (Velocity Surge)</span>
            </div>

            <div className="telemetry-section-divider" />

            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Signal Channels
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.68rem' }}>
              <span>📱 App</span>
              <span>🏛️ Grievance</span>
              <span>🐦 Social</span>
              <span>📞 112 Helpline</span>
            </div>

            <div className="telemetry-section-divider" />

            <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.3rem' }}>
              Infrastructure Context
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
              <span>🏫 School</span>
              <span>🏥 Hospital</span>
              <span>⚙️ Infrastructure</span>
            </div>
          </div>
        )}
      </div>

      {/* FLOATING CONTROL OVERLAY 2: Hotspots Queue Control (Upper-Right) */}
      <div style={{ position: 'absolute', top: '0.85rem', right: '3.6rem', zIndex: 1050, pointerEvents: 'none' }}>
        {isHotspotQueueCollapsed ? (
          <button
            onClick={() => setIsHotspotQueueCollapsed(false)}
            className="telemetry-collapsed-btn"
            style={{ float: 'right' }}
            title="Expand Hotspots Queue"
          >
            <List size={14} color="#1e3a8a" />
            <span>Hotspots Queue ({filteredIncidents.length})</span>
            <ChevronDown size={13} color="var(--text-muted)" />
          </button>
        ) : (
          <div className="hotspots-queue-floating">
            <div className="hotspots-queue-header">
              <div className="hotspots-queue-title">
                <List size={15} color="#1e3a8a" />
                <span>HOTSPOTS QUEUE</span>
                <span className="hotspots-queue-badge">{filteredIncidents.length}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <span className="ai-hotspots-tag">AI HOTSPOTS</span>
                <button
                  onClick={() => setIsSidebarOpen(true)}
                  style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 4, cursor: 'pointer', color: 'var(--text-muted)', padding: '2px 5px', fontSize: '0.66rem', fontWeight: 700 }}
                  title="Open Search & Ward Drawer"
                >
                  <Filter size={11} />
                </button>
                <button
                  onClick={() => setIsHotspotQueueCollapsed(true)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 2 }}
                  title="Collapse Hotspots Queue"
                >
                  <ChevronUp size={14} />
                </button>
              </div>
            </div>

            {/* Quick Category Filter Pills */}
            <div className="category-filter-pills">
              {[
                { id: 'ALL', label: 'ALL' },
                { id: 'GARBAGE', label: 'GARBAGE' },
                { id: 'WATERLOGGING', label: 'WATERLOGGING' },
                { id: 'POTHOLE', label: 'POTHOLE' },
                { id: 'OTHERS', label: 'OTHERS' }
              ].map(pill => {
                const count = getPillCount(pill.id);
                const isActive = selectedCategoryPill === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => handlePillClick(pill.id)}
                    className={`category-pill ${isActive ? 'active' : ''}`}
                  >
                    <span>{pill.label}</span>
                    <span className="category-pill-count">({count})</span>
                  </button>
                );
              })}
            </div>

            {/* Scrollable Hotspot Queue List */}
            <div className="hotspot-queue-list">
              {filteredIncidents.length === 0 ? (
                <div style={{ padding: '0.75rem', textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  No hotspots match selected filter.
                </div>
              ) : (
                filteredIncidents.slice(0, 5).map(inc => {
                  const isSelected = inc.id === selectedIncidentId;
                  const isCrit = inc.priority.overallScore >= 80;
                  return (
                    <div
                      key={inc.id}
                      onClick={() => {
                        setSelectedIncidentId(inc.id);
                        if (mapInstanceRef.current && inc.centroid) {
                          mapInstanceRef.current.flyTo([inc.centroid.lat, inc.centroid.lng], 16);
                        }
                      }}
                      className={`hotspot-queue-item ${isSelected ? 'selected' : ''}`}
                    >
                      <div style={{ flex: 1, minWidth: 0, paddingRight: '0.4rem' }}>
                        <div style={{ fontSize: '0.74rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {inc.title}
                        </div>
                        <div style={{ fontSize: '0.66rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '1px' }}>
                          <span>📍 {inc.ward.split('-')[0].trim()}</span>
                          <span>• {inc.signalIds.length} signals</span>
                          {inc.velocitySurgePercent > 0 && (
                            <span style={{ color: '#dc2626', fontWeight: 700 }}>+{inc.velocitySurgePercent}%/hr</span>
                          )}
                        </div>
                      </div>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.66rem',
                        fontWeight: 800,
                        color: isCrit ? '#b91c1c' : '#0369a1',
                        background: isCrit ? '#fee2e2' : '#e0f2fe',
                        padding: '1px 5px',
                        borderRadius: 4,
                        border: `1px solid ${isCrit ? '#fca5a5' : '#bae6fd'}`
                      }}>
                        P{inc.priority.overallScore}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {/* FLOATING CONTROL OVERLAY 3: Vertical Map Controls Stack & Layer Switcher (Right Side) */}
      <div className="map-controls-vertical">
        <button
          onClick={() => mapInstanceRef.current?.zoomIn()}
          className="map-control-btn"
          title="Zoom In"
          aria-label="Zoom In"
        >
          <Plus size={16} />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.zoomOut()}
          className="map-control-btn"
          title="Zoom Out"
          aria-label="Zoom Out"
        >
          <Minus size={16} />
        </button>
        <button
          onClick={() => mapInstanceRef.current?.flyTo([28.4595, 77.0266], 13)}
          className="map-control-btn"
          title="Recenter Map View"
          aria-label="Recenter Map View"
        >
          <Compass size={16} />
        </button>
        <button
          onClick={() => setIsLayerSwitcherOpen(!isLayerSwitcherOpen)}
          className={`map-control-btn ${isLayerSwitcherOpen ? 'active' : ''}`}
          title="Toggle Map Layers"
          aria-label="Toggle Map Layers"
        >
          <Layers size={16} />
        </button>
      </div>

      {/* Floating Progressive Layer Switcher Popover */}
      {isLayerSwitcherOpen && (
        <div className="map-layer-popover">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.3rem' }}>
            <span style={{ fontSize: '0.74rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-primary)' }}>
              Map Layers
            </span>
            <button
              onClick={() => setIsLayerSwitcherOpen(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={13} />
            </button>
          </div>

          <div className="layer-group-title">CIVIC SIGNALS</div>
          <label className="layer-checkbox-item">
            <input
              type="checkbox"
              checked={visibleLayers.hotspots}
              onChange={e => setVisibleLayers(v => ({ ...v, hotspots: e.target.checked }))}
            />
            <span>Demand Hotspots</span>
          </label>
          <label className="layer-checkbox-item">
            <input
              type="checkbox"
              checked={visibleLayers.rawSignals}
              onChange={e => setVisibleLayers(v => ({ ...v, rawSignals: e.target.checked }))}
            />
            <span>Individual Signals</span>
          </label>

          <div className="layer-group-title">INFRASTRUCTURE</div>
          <label className="layer-checkbox-item">
            <input
              type="checkbox"
              checked={visibleLayers.criticalAssets}
              onChange={e => setVisibleLayers(v => ({ ...v, criticalAssets: e.target.checked }))}
            />
            <span>Critical Assets</span>
          </label>
          <label className="layer-checkbox-item">
            <input
              type="checkbox"
              checked={visibleLayers.drainage}
              onChange={e => setVisibleLayers(v => ({ ...v, drainage: e.target.checked }))}
            />
            <span>Drainage / Infrastructure</span>
          </label>

          <div className="layer-group-title">CONTEXT</div>
          <label className="layer-checkbox-item">
            <input
              type="checkbox"
              checked={visibleLayers.wardBoundaries}
              onChange={e => setVisibleLayers(v => ({ ...v, wardBoundaries: e.target.checked }))}
            />
            <span>Ward Boundaries</span>
          </label>
          <label className="layer-checkbox-item">
            <input
              type="checkbox"
              checked={visibleLayers.weatherRisk}
              onChange={e => setVisibleLayers(v => ({ ...v, weatherRisk: e.target.checked }))}
            />
            <span>Weather Risk Layer</span>
          </label>
          <label className="layer-checkbox-item">
            <input
              type="checkbox"
              checked={visibleLayers.historicalIncidents}
              onChange={e => setVisibleLayers(v => ({ ...v, historicalIncidents: e.target.checked }))}
            />
            <span>Historical Incidents</span>
          </label>
        </div>
      )}

      {/* FLOATING CONTROL OVERLAY 4: Selected Civic Issue Decision Card (Lower-Left) */}
      {selectedIncident && (
        <div className="map-floating-context-card">
          {/* Card Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, background: '#1e3a8a', color: '#ffffff', padding: '0.15rem 0.45rem', borderRadius: '4px' }}>
                  {selectedIncident.category.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  📍 {selectedIncident.ward}
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                {selectedIncident.title}
              </h3>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                background: selectedIncident.priority.overallScore >= 80 ? '#fee2e2' : '#fef3c7',
                color: selectedIncident.priority.overallScore >= 80 ? '#dc2626' : '#b45309',
                border: `1px solid ${selectedIncident.priority.overallScore >= 80 ? '#fca5a5' : '#fcd34d'}`,
                padding: '0.2rem 0.5rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: 800,
                fontFamily: 'var(--font-mono)'
              }}>
                {selectedIncident.priority.overallScore >= 80 && (
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#dc2626' }} />
                )}
                <span>P {selectedIncident.priority.overallScore}/100</span>
              </div>
              <button
                onClick={() => setSelectedIncidentId(null)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px'
                }}
                title="Dismiss Card"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Quantitative Telemetry Metrics Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            background: 'var(--bg-surface-elevated)',
            padding: '0.65rem 0.85rem',
            borderRadius: '8px',
            border: '1px solid var(--border-subtle)'
          }}>
            <div>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>CITIZEN SIGNALS</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.1rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {selectedIncident.signalIds.length}
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>reports</span>
              </div>
              <span className="provenance-tag-observed" style={{ fontSize: '0.58rem' }}>[OBSERVED]</span>
            </div>

            <div>
              <span style={{ fontSize: '0.64rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>SIGNAL VELOCITY</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem', marginTop: '0.1rem' }}>
                <span style={{ fontSize: '1.15rem', fontWeight: 900, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                  +{selectedIncident.velocitySurgePercent}%
                </span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/hr</span>
              </div>
              <span style={{ fontSize: '0.58rem', color: '#dc2626', fontWeight: 800, background: '#fee2e2', border: '1px solid #fca5a5', padding: '1px 5px', borderRadius: 4, fontFamily: 'var(--font-mono)' }}>[TELEMETRY]</span>
            </div>
          </div>

          {/* Impacted Infrastructure */}
          {selectedIncident.auditableInsight.calculatedMetrics.nearestSchoolName && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              padding: '0.5rem 0.75rem',
              background: 'rgba(124, 58, 237, 0.08)',
              border: '1px solid rgba(124, 58, 237, 0.2)',
              borderRadius: '6px',
              fontSize: '0.74rem',
              color: '#6d28d9',
              fontWeight: 600
            }}>
              <span>🏫</span>
              <span>
                {selectedIncident.auditableInsight.calculatedMetrics.nearestSchoolName} ({selectedIncident.auditableInsight.calculatedMetrics.nearestSchoolDistanceMeters}m away)
              </span>
            </div>
          )}

          {/* AI Synthesis Summary */}
          <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            {selectedIncident.auditableInsight.modelInference.summary}
          </div>

          {/* Action CTAs — MAP -> EVIDENCE -> INVESTMENT */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', paddingTop: '0.2rem' }}>
            <button
              data-tour="open-dossier-btn"
              onClick={() => handleOpenDossierFromMap(selectedIncident)}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '0.55rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                boxShadow: '0 2px 6px rgba(30, 58, 138, 0.25)'
              }}
            >
              <FolderOpen size={13} />
              <span>OPEN EVIDENCE DOSSIER</span>
            </button>

            <button
              onClick={() => setActiveTab('investment_gaps')}
              style={{
                background: 'var(--bg-surface-elevated)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                borderRadius: '6px',
                padding: '0.55rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <span>INVESTMENT BOARD</span>
            </button>

            <button
              onClick={() => prioritizeRecommendationInPipeline(selectedIncident.id)}
              style={{
                background: '#eff6ff',
                color: '#1e3a8a',
                border: '1px solid #bfdbfe',
                borderRadius: '6px',
                padding: '0.55rem 0.85rem',
                fontSize: '0.78rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
              title="Prioritize this recommendation in the Capital Pipeline"
            >
              <span>PRIORITIZE</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      )}

      {/* Floating Replay & Time Slider Control Bar (Visible only in SIMULATION mode) */}
      {ingestionMode === 'SIMULATION' && (
        <div
          ref={timelineRef}
          className="live-map-timeline-dock"
          style={{
            position: timelinePos ? 'fixed' : 'absolute',
            left: timelinePos ? `${timelinePos.x}px` : '50%',
            top: timelinePos ? `${timelinePos.y}px` : undefined,
            bottom: timelinePos ? undefined : '1.25rem',
            transform: timelinePos ? 'none' : 'translateX(-50%)',
            zIndex: 1100,
            width: isTimelineMinimized ? 'auto' : 'calc(100% - 340px)',
            maxWidth: isTimelineMinimized ? '440px' : '820px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: '12px',
            padding: isTimelineMinimized ? '0.45rem 0.85rem' : '0.65rem 1.15rem',
            backdropFilter: 'blur(16px)',
            boxShadow: 'var(--shadow-lg)',
            color: 'var(--text-primary)',
            display: 'flex',
            flexDirection: 'column',
            gap: isTimelineMinimized ? '0' : '0.45rem'
          }}
        >
          {isTimelineMinimized ? (
            <div
              onPointerDown={handleTimelinePointerDown}
              onPointerMove={handleTimelinePointerMove}
              onPointerUp={handleTimelinePointerUp}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                cursor: isDraggingTimelineRef.current ? 'grabbing' : 'grab',
                userSelect: 'none',
                touchAction: 'none'
              }}
              title="Drag to reposition timeline anywhere on screen"
            >
              <GripHorizontal size={14} color="#94a3b8" />
              <Clock size={13} color="#2563eb" />
              <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.82rem', color: '#2563eb' }}>
                {currentStep.simulatedTime}
              </strong>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                Step {currentStepIndex + 1}/{SIMULATION_STEPS.length}
              </span>
              <button
                onClick={isPlaying ? pause : play}
                style={{
                  background: isPlaying ? '#fee2e2' : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  border: isPlaying ? '1px solid #fca5a5' : 'none',
                  borderRadius: '50%',
                  width: 26,
                  height: 26,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isPlaying ? '#dc2626' : '#fff'
                }}
                title={isPlaying ? 'Pause replay' : 'Play replay'}
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} style={{ marginLeft: 1 }} />}
              </button>
              <button
                onClick={() => setIsTimelineMinimized(false)}
                className="sim-btn"
                style={{ padding: '0.2rem 0.5rem', fontSize: '0.68rem', gap: '0.25rem' }}
                title="Expand timeline controls"
              >
                <Maximize2 size={11} />
                <span>Expand</span>
              </button>
            </div>
          ) : (
            <>
              <div
                onPointerDown={handleTimelinePointerDown}
                onPointerMove={handleTimelinePointerMove}
                onPointerUp={handleTimelinePointerUp}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: isDraggingTimelineRef.current ? 'grabbing' : 'grab',
                  paddingBottom: '0.35rem',
                  borderBottom: '1px solid var(--border-subtle)',
                  userSelect: 'none',
                  touchAction: 'none'
                }}
                title="Drag to reposition timeline anywhere on screen"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem' }}>
                  <GripHorizontal size={15} color="#94a3b8" />
                  <Clock size={14} color="#2563eb" />
                  <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#2563eb' }}>
                    {currentStep.simulatedTime}
                  </strong>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
                    • {currentStep.description}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rainfall:</span>
                  <strong style={{ fontSize: '0.75rem', color: currentStep.weatherCondition.rainfallMmPerHour > 50 ? '#dc2626' : '#0284c7', fontFamily: 'var(--font-mono)' }}>
                    {currentStep.weatherCondition.rainfallMmPerHour} mm/hr
                  </strong>
                  <button
                    onClick={() => setIsTimelineMinimized(true)}
                    className="sim-btn"
                    style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem', gap: '0.2rem' }}
                    title="Minimize timeline dock"
                  >
                    <Minus size={12} />
                    <span>Minimize</span>
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <button
                  onClick={isPlaying ? pause : play}
                  className="sim-btn sim-btn-play"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                  title={isPlaying ? 'Pause replay' : 'Play replay'}
                >
                  {isPlaying ? <Pause size={13} /> : <Play size={13} />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>

                <button
                  onClick={stepForward}
                  className="sim-btn"
                  style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                  title="Step to next timeline frame"
                >
                  <SkipForward size={13} />
                  <span>Step</span>
                </button>

                <div style={{ display: 'flex', background: 'var(--bg-surface-elevated)', borderRadius: '6px', border: '1px solid var(--border-subtle)', padding: '2px', gap: '2px' }}>
                  {[1, 5, 10].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed as 1 | 5 | 10)}
                      style={{
                        border: 'none',
                        background: playbackSpeed === speed ? '#2563eb' : 'transparent',
                        color: playbackSpeed === speed ? '#ffffff' : 'var(--text-secondary)',
                        borderRadius: '4px',
                        padding: '0.15rem 0.4rem',
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>

                <input
                  type="range"
                  min={0}
                  max={SIMULATION_STEPS.length - 1}
                  value={currentStepIndex}
                  onChange={e => jumpToStep(Number(e.target.value))}
                  style={{ flex: 1, accentColor: '#2563eb', height: 6, cursor: 'pointer' }}
                />

                <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                  Step {currentStepIndex + 1}/{SIMULATION_STEPS.length}
                </span>

                <button
                  onClick={resetSimulation}
                  className="sim-btn"
                  style={{ padding: '0.35rem 0.55rem', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.72rem' }}
                  title="Reset simulation to initial baseline"
                >
                  <RotateCcw size={12} />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* On-demand Hotspot Queue & Search Slide-out Drawer */}
      {isSidebarOpen && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            zIndex: 1200,
            display: 'flex',
            animation: 'fadeIn 0.15s ease-out'
          }}
        >
          <div
            style={{
              width: '380px',
              maxWidth: '90vw',
              height: '100%',
              background: 'var(--bg-surface)',
              borderRight: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-lg)',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 1210
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--bg-surface-elevated)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <List size={15} color="#1e3a8a" />
                <span style={{ fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Hotspot Search & Ward Filters
                </span>
              </div>
              <button
                onClick={() => setIsSidebarOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-muted)',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px'
                }}
              >
                <X size={16} />
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              <MapSidebarLeft />
            </div>
          </div>

          <div
            onClick={() => setIsSidebarOpen(false)}
            style={{
              flex: 1,
              height: '100%',
              background: 'rgba(15, 23, 42, 0.35)',
              backdropFilter: 'blur(2px)',
              cursor: 'pointer'
            }}
          />
        </div>
      )}

      {/* Canonical Explainable Investment Dossier Slide-Over Drawer */}
      <ExplainableInvestmentDossierDrawer
        dossier={selectedDossier}
        isOpen={!!selectedDossier}
        onClose={() => setSelectedDossier(null)}
        onPrioritize={(incId) => {
          setSelectedDossier(null);
          prioritizeRecommendationInPipeline(incId || selectedIncident?.id);
        }}
      />
    </div>
  );
};
