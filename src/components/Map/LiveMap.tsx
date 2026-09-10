import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Eye,
  Filter,
  Flame,
  GripHorizontal,
  Layers,
  MapPin,
  Maximize2,
  Minus,
  Pause,
  Play,
  RotateCcw,
  Shield,
  SkipForward,
  Sparkles,
  Zap
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { CRITICAL_ASSETS } from '../../data/criticalAssets';
import { SIMULATION_STEPS } from '../../data/initialData';
import { CivicSignal, ClusteredIncident } from '../../types/civic';

export const LiveMap: React.FC = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const clusterLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const signalLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const assetLayerGroupRef = useRef<L.LayerGroup | null>(null);
  const bufferLayerGroupRef = useRef<L.LayerGroup | null>(null);

  const prevSignalsCountRef = useRef<number>(0);

  const [isLegendMinimized, setIsLegendMinimized] = useState<boolean>(false);
  const [isQuickNavMinimized, setIsQuickNavMinimized] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth <= 900);
  const [isTimelineMinimized, setIsTimelineMinimized] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth <= 900);
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
    selectedIncidentId,
    setSelectedIncidentId,
    setActiveTab,
    mapMode,
    setMapMode,
    categoryFilter,
    sourceFilter,
    severityFilter,
    wardFilter,
    timeRangeFilter,
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
    triggerSector15Surge,
    setPlaybackSpeed
  } = useCivic();

  // Initialize Leaflet Map with OpenFreeMap vector layer
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Center default near Gurugram / NCR central corridor
    const map = L.map(mapContainerRef.current, {
      center: [28.4595, 77.0266],
      zoom: 13,
      zoomControl: false
    });

    // Reliable, 100% public OpenStreetMap raster tiles with dark theme CSS filter (Zero watermarks, Zero API key errors)
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      subdomains: 'abc',
      maxZoom: 19,
      className: 'dark-map-tiles'
    });
    tileLayer.addTo(map);

    L.control.zoom({ position: 'topright' }).addTo(map);

    const bufferGroup = L.layerGroup().addTo(map);
    const assetGroup = L.layerGroup().addTo(map);
    const signalGroup = L.layerGroup().addTo(map);
    const clusterGroup = L.layerGroup().addTo(map);

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

  // Render Critical Infrastructure POIs & Proximity Buffers
  useEffect(() => {
    if (!mapInstanceRef.current || !assetLayerGroupRef.current || !bufferLayerGroupRef.current) return;

    assetLayerGroupRef.current.clearLayers();
    bufferLayerGroupRef.current.clearLayers();

    CRITICAL_ASSETS.forEach(asset => {
      // Vulnerability Buffer circle
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
            Critical Urban Infrastructure • ${asset.type.toUpperCase()}
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
  }, []);

  // Filter individual civic signals
  const filteredSignals = signals.filter(sig => {
    if (categoryFilter !== 'all' && sig.category !== categoryFilter) return false;
    if (sourceFilter !== 'all' && sig.channel !== sourceFilter) return false;
    if (severityFilter !== 'all' && sig.reportedSeverity !== severityFilter) return false;
    if (wardFilter !== 'all' && sig.ward !== wardFilter) return false;
    return true;
  });

  // Filter clustered incidents
  const filteredIncidents = incidents.filter(inc => {
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

  // Render Individual Civic Signals (when in CIVIC SIGNALS mode or toggled)
  useEffect(() => {
    if (!mapInstanceRef.current || !signalLayerGroupRef.current) return;

    signalLayerGroupRef.current.clearLayers();

    if (mapMode === 'civic_signals') {
      filteredSignals.forEach(sig => {
        let channelIcon = '📱';
        let channelColor = '#06b6d4';
        if (sig.channel === 'social_x') {
          channelIcon = '🐦';
          channelColor = '#1d9bf0';
        } else if (sig.channel === 'grievance_portal') {
          channelIcon = '🏛️';
          channelColor = '#a78bfa';
        } else if (sig.channel === 'helpline_311') {
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
                ${channelIcon} ${sig.channel === 'helpline_311' ? '155304 / 112 HELPLINE' : sig.channel.replace('_', ' ').toUpperCase()}
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
  }, [signals, mapMode, filteredSignals]);

  // Render Clustered Incidents with Dynamic Pulsing Markers & Emerging Now Acceleration Badge
  useEffect(() => {
    if (!mapInstanceRef.current || !clusterLayerGroupRef.current) return;

    clusterLayerGroupRef.current.clearLayers();

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

      const clusterIcon = L.divIcon({
        className: 'cluster-custom-div',
        html: `
          <div class="pulse-cluster-marker ${clusterColorClass}" style="width: ${pulseSize}px; height: ${pulseSize}px;">
            ${isEmergingNow && !isResolved ? `<div class="emerging-now-badge">🔥 EMERGING NOW</div><div class="emerging-double-ring" style="width: ${pulseSize * 1.2}px; height: ${pulseSize * 1.2}px;"></div>` : ''}
            ${!isResolved ? `<div class="pulse-ring" style="width: ${pulseSize}px; height: ${pulseSize}px;"></div>` : ''}
            <div class="cluster-dot" style="${isSelected ? 'transform: scale(1.35); border: 2.5px solid #fff; box-shadow: 0 0 25px rgba(6, 182, 212, 0.95);' : ''}">
              ${inc.signalIds.length}
            </div>
          </div>
        `,
        iconSize: [pulseSize, pulseSize],
        iconAnchor: [pulseSize / 2, pulseSize / 2]
      });

      const marker = L.marker([inc.centroid.lat, inc.centroid.lng], { icon: clusterIcon });

      // Interactive Popup
      marker.bindPopup(`
        <div style="font-family: var(--font-sans); color: var(--text-primary); min-width: 250px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: ${isCritical ? '#ef4444' : '#0284c7'};">
              ${inc.category.toUpperCase()} • ${inc.status.toUpperCase()}
            </span>
            <span style="font-family: var(--font-mono); font-size: 0.74rem; font-weight: 700; color: ${isCritical ? '#b91c1c' : '#0369a1'}; background: ${isCritical ? '#fee2e2' : '#e0f2fe'}; padding: 2px 6px; border-radius: 4px; border: 1px solid ${isCritical ? '#fca5a5' : '#bae6fd'};">
              PRIORITY ${inc.priority.overallScore}/100
            </span>
          </div>

          ${isEmergingNow ? `<div style="background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: #dc2626; font-size: 0.68rem; font-weight: 800; padding: 3px 6px; border-radius: 4px; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            🔥 ACCELERATING SIGNAL VELOCITY (+${inc.velocitySurgePercent}%/hr)
          </div>` : ''}

          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; color: var(--text-primary); line-height: 1.3;">
            ${inc.title}
          </div>

          <div style="font-size: 0.78rem; color: var(--text-secondary); margin-bottom: 8px; line-height: 1.35;">
            ${inc.auditableInsight.modelInference.summary}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.72rem; font-family: var(--font-mono); background: var(--bg-surface-elevated); border: 1px solid var(--border-subtle); padding: 6px 8px; border-radius: 6px; margin-bottom: 8px; color: var(--text-secondary);">
            <div>Signals: <strong style="color: var(--text-primary);">${inc.signalIds.length}</strong></div>
            <div>Velocity: <strong style="color: #dc2626;">+${inc.velocitySurgePercent}%/hr</strong></div>
            ${inc.auditableInsight.calculatedMetrics.nearestSchoolName ? `<div style="grid-column: span 2; color: #7c3aed; font-weight: 600;">🏫 ${inc.auditableInsight.calculatedMetrics.nearestSchoolName} (${inc.auditableInsight.calculatedMetrics.nearestSchoolDistanceMeters}m)</div>` : ''}
          </div>

          <button
            id="popup-btn-${inc.id}"
            style="width: 100%; padding: 7px 10px; background: #2563eb; border: none; border-radius: 6px; color: #fff; font-weight: 700; font-size: 0.76rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.25); transition: background 0.15s ease;"
          >
            Inspect Intelligence Dossier →
          </button>
        </div>
      `);

      marker.on('click', () => {
        setSelectedIncidentId(inc.id);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`popup-btn-${inc.id}`);
        if (btn) {
          btn.onclick = () => {
            setSelectedIncidentId(inc.id);
            setActiveTab('dossier');
          };
        }
      });

      marker.addTo(clusterLayerGroupRef.current!);
    });
  }, [filteredIncidents, selectedIncidentId, mapMode, setSelectedIncidentId, setActiveTab]);

  // Selected-incident focus flying camera
  useEffect(() => {
    if (!selectedIncidentId || !mapInstanceRef.current) return;
    const selected = incidents.find(i => i.id === selectedIncidentId);
    if (selected && selected.centroid) {
      mapInstanceRef.current.flyTo([selected.centroid.lat, selected.centroid.lng], 16, {
        duration: 1.2,
        easeLinearity: 0.25
      });
    }
  }, [selectedIncidentId]);

  const focusGurugramCyberCity = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([28.4950, 77.0880], 15, { duration: 1.2 });
    }
  };

  const focusGurugramSubhashChowk = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([28.4290, 77.0415], 15, { duration: 1.2 });
    }
  };

  const focusSector15 = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([28.5833, 77.3185], 16, { duration: 1.2 });
    }
  };

  const fitOverview = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([28.53, 77.12], 11, { duration: 1.2 });
    }
  };

  return (
    <div className="map-canvas-wrapper" style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: '100%', height: '100%' }}>
      {/* Main Leaflet Map Canvas (rendered first so overlay controls sit on top) */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} />

      {/* Top Header Floating Controls Bar (z-index 1100 on top of Leaflet canvas) */}
      <div
        className="live-map-top-bar"
        style={{
          position: 'absolute',
          top: '0.85rem',
          left: '0.85rem',
          right: '0.85rem',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          pointerEvents: 'none'
        }}
      >
        {/* Left Side: Minimizable Telemetry Legend */}
        {isLegendMinimized ? (
          <button
            onClick={() => setIsLegendMinimized(false)}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              boxShadow: 'var(--shadow-md)',
              cursor: 'pointer',
              backdropFilter: 'blur(12px)',
              transition: 'all 0.15s ease'
            }}
            title="Expand Telemetry Legend"
          >
            <Layers size={14} color="#2563eb" />
            <span>Telemetry Legend</span>
            <ChevronDown size={13} color="var(--text-muted)" />
          </button>
        ) : (
          <div
            style={{
              pointerEvents: 'auto',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: '10px',
              padding: '0.65rem 0.85rem',
              backdropFilter: 'blur(16px)',
              fontSize: '0.72rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.35rem',
              boxShadow: 'var(--shadow-lg)',
              maxWidth: '260px'
            }}
          >
            <div style={{ fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Layers size={13} color="#2563eb" />
                <span style={{ fontSize: '0.74rem' }}>Telemetry Legend</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span style={{ color: '#2563eb', fontSize: '0.62rem', fontWeight: 700, background: 'var(--civic-blue-50)', padding: '0.1rem 0.35rem', borderRadius: '4px', border: '1px solid var(--border-subtle)' }}>
                  {mapMode === 'ai_priority' ? 'AI PRIORITY' : 'CIVIC SIGNALS'}
                </span>
                <button
                  onClick={() => setIsLegendMinimized(true)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                    borderRadius: '4px'
                  }}
                  title="Minimize Telemetry Legend"
                >
                  <ChevronUp size={14} />
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444', display: 'inline-block', flexShrink: 0 }} />
              <span>Critical P1 (Priority &ge; 80)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block', flexShrink: 0 }} />
              <span>High P2 (Priority 60 - 79)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#2563eb', display: 'inline-block', flexShrink: 0 }} />
              <span>Standard P3 (Priority &lt; 60)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
              <span style={{ fontSize: '0.7rem' }}>🔥</span>
              <span>Emerging Now (Velocity Surge)</span>
            </div>
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.25rem', display: 'flex', flexWrap: 'wrap', gap: '0.45rem', fontSize: '0.66rem' }}>
              <span>📱 App</span>
              <span>🐦 X</span>
              <span>🏛️ Grievance</span>
              <span>📞 155304 / 112</span>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.66rem', color: 'var(--text-muted)' }}>
              <span>🏫 School (250m)</span>
              <span>🏥 Hospital (400m)</span>
            </div>
          </div>
        )}

        {/* Right Side: Quick Corridor Jump Controls (Minimizable) */}
        {isQuickNavMinimized ? (
          <button
            onClick={() => setIsQuickNavMinimized(false)}
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'var(--bg-surface)',
              padding: '0.4rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-md)',
              backdropFilter: 'blur(12px)',
              cursor: 'pointer',
              color: 'var(--text-primary)',
              fontSize: '0.74rem',
              fontWeight: 700
            }}
            title="Expand Quick Corridors"
          >
            <Compass size={13} color="#2563eb" />
            <span>Quick Corridors</span>
            <ChevronDown size={13} color="var(--text-muted)" />
          </button>
        ) : (
          <div
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              background: 'var(--bg-surface)',
              padding: '0.35rem 0.5rem',
              borderRadius: '10px',
              border: '1px solid var(--border-medium)',
              boxShadow: 'var(--shadow-md)',
              backdropFilter: 'blur(12px)'
            }}
          >
            <button
              onClick={focusGurugramCyberCity}
              className="sim-btn"
              style={{ fontSize: '0.74rem', background: '#eff6ff', borderColor: '#bfdbfe', color: '#0284c7' }}
              title="Focus Gurugram Cyber City & Rapid Metro Hub"
            >
              🏢 Cyber City
            </button>
            <button
              onClick={focusGurugramSubhashChowk}
              className="sim-btn"
              style={{ fontSize: '0.74rem', background: '#fef3c7', borderColor: '#fcd34d', color: '#b45309' }}
              title="Focus Gurugram Subhash Chowk Underpass Corridor"
            >
              📍 Subhash Chowk
            </button>
            <button
              onClick={focusSector15}
              className="sim-btn"
              style={{ fontSize: '0.74rem', background: '#fee2e2', borderColor: '#fca5a5', color: '#dc2626' }}
              title="Focus Sector 15 Emergency Inundation Zone"
            >
              📍 Sector 15
            </button>
            <button
              onClick={fitOverview}
              className="sim-btn"
              style={{ fontSize: '0.74rem' }}
              title="Zoom out to NCR regional overview"
            >
              🌐 NCR View
            </button>
            <button
              onClick={() => setIsQuickNavMinimized(true)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '2px',
                borderRadius: '4px',
                marginLeft: '2px'
              }}
              title="Minimize Quick Corridors"
            >
              <ChevronUp size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Floating Replay & Time Slider Control Bar (Draggable across screen & Minimizable) */}
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
          /* Minimized Compact Timeline Bar */
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
          /* Expanded Timeline Control Bar */
          <>
            {/* Drag Handle & Status Header */}
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
                  title="Minimize timeline to compact bar"
                >
                  <Minus size={11} />
                  <span>Minimize</span>
                </button>
              </div>
            </div>

            {/* Timeline Slider Track */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <button
                onClick={isPlaying ? pause : play}
                style={{
                  background: isPlaying ? '#fee2e2' : 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  border: isPlaying ? '1px solid #fca5a5' : 'none',
                  borderRadius: '50%',
                  width: 32,
                  height: 32,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: isPlaying ? '#dc2626' : '#fff',
                  boxShadow: '0 2px 6px rgba(37, 99, 235, 0.2)'
                }}
                title={isPlaying ? 'Pause simulation replay' : 'Play simulation replay'}
              >
                {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
              </button>

              <button
                onClick={stepForward}
                className="sim-btn"
                style={{
                  padding: '0.35rem 0.55rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.72rem'
                }}
                title="Advance one simulation step"
              >
                <SkipForward size={12} />
              </button>

              {/* Interactive Range Slider */}
              <input
                type="range"
                min="0"
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
                style={{
                  padding: '0.35rem 0.55rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                  fontSize: '0.72rem'
                }}
                title="Reset simulation to initial baseline"
              >
                <RotateCcw size={12} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
