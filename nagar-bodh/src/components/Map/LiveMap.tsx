import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  Clock,
  Eye,
  Filter,
  Flame,
  Layers,
  MapPin,
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

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [28.5835, 77.3185],
      zoom: 14,
      zoomControl: false
    });

    // Dark vector basemap tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

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
        <div style="font-family: var(--font-sans); color: #f8fafc;">
          <div style="font-size: 0.68rem; color: #94a3b8; text-transform: uppercase; font-weight: 700; margin-bottom: 2px;">
            Critical Urban Infrastructure • ${asset.type.toUpperCase()}
          </div>
          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 4px; color: #fff;">
            ${asset.name}
          </div>
          <div style="font-size: 0.78rem; color: #cbd5e1; margin-bottom: 6px;">
            ${asset.capacity || ''}
          </div>
          <div style="font-size: 0.72rem; color: #38bdf8; font-family: var(--font-mono); border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px;">
            Contact: ${asset.contactPerson || 'Emergency Liaison'}
          </div>
          <div style="font-size: 0.68rem; color: #e2e8f0; margin-top: 4px; background: rgba(139, 92, 246, 0.2); padding: 3px 6px; border-radius: 4px;">
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
          <div style="font-family: var(--font-sans); color: #f8fafc; max-width: 240px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
              <span style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: ${channelColor};">
                ${channelIcon} ${sig.channel.replace('_', ' ').toUpperCase()}
              </span>
              <span style="font-family: var(--font-mono); font-size: 0.7rem; color: #94a3b8;">
                ${sig.simulatedTimeLabel}
              </span>
            </div>
            <div style="font-size: 0.82rem; color: #fff; font-weight: 600; margin-bottom: 6px; line-height: 1.3;">
              "${sig.rawText}"
            </div>
            <div style="font-size: 0.72rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.1); padding-top: 4px; display: flex; justify-content: space-between;">
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
        <div style="font-family: var(--font-sans); color: #f8fafc; min-width: 250px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="font-size: 0.68rem; font-weight: 700; text-transform: uppercase; color: ${isCritical ? '#f87171' : '#38bdf8'};">
              ${inc.category.toUpperCase()} • ${inc.status.toUpperCase()}
            </span>
            <span style="font-family: var(--font-mono); font-size: 0.74rem; font-weight: 700; color: #fff; background: ${isCritical ? 'rgba(239,68,68,0.3)' : 'rgba(6,182,212,0.3)'}; padding: 2px 6px; border-radius: 4px;">
              PRIORITY ${inc.priority.overallScore}/100
            </span>
          </div>

          ${isEmergingNow ? `<div style="background: rgba(239,68,68,0.2); border: 1px solid rgba(239,68,68,0.4); color: #fca5a5; font-size: 0.68rem; font-weight: 800; padding: 3px 6px; border-radius: 4px; margin-bottom: 6px; display: flex; align-items: center; gap: 4px;">
            🔥 ACCELERATING SIGNAL VELOCITY (+${inc.velocitySurgePercent}%/hr)
          </div>` : ''}

          <div style="font-weight: 700; font-size: 0.95rem; margin-bottom: 6px; color: #fff; line-height: 1.3;">
            ${inc.title}
          </div>

          <div style="font-size: 0.78rem; color: #cbd5e1; margin-bottom: 8px;">
            ${inc.auditableInsight.modelInference.summary}
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.72rem; font-family: var(--font-mono); background: rgba(0,0,0,0.4); padding: 6px 8px; border-radius: 6px; margin-bottom: 8px;">
            <div>Signals: <strong>${inc.signalIds.length}</strong></div>
            <div>Velocity: <strong>+${inc.velocitySurgePercent}%/hr</strong></div>
            ${inc.auditableInsight.calculatedMetrics.nearestSchoolName ? `<div style="grid-column: span 2; color: #c084fc;">🏫 ${inc.auditableInsight.calculatedMetrics.nearestSchoolName} (${inc.auditableInsight.calculatedMetrics.nearestSchoolDistanceMeters}m)</div>` : ''}
          </div>

          <button
            id="popup-btn-${inc.id}"
            style="width: 100%; padding: 6px 10px; background: linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%); border: none; border-radius: 6px; color: #fff; font-weight: 700; font-size: 0.76rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 4px;"
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

  const focusSector15 = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([28.5833, 77.3185], 16, { duration: 1.2 });
    }
  };

  const fitOverview = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([28.62, 77.26], 12, { duration: 1.2 });
    }
  };

  return (
    <div className="map-canvas-wrapper" style={{ display: 'flex', flexDirection: 'column', position: 'relative', width: '100%', height: '100%' }}>
      {/* Top Header Mode Switcher Bar */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          left: '1rem',
          right: '1rem',
          zIndex: 400,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pointerEvents: 'none'
        }}
      >
        {/* Left Side: Map Mode Switcher */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'rgba(14, 21, 38, 0.9)',
            padding: '0.3rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)'
          }}
        >
          <button
            onClick={() => setMapMode('ai_priority')}
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.35rem 0.85rem',
              borderRadius: '8px',
              background: mapMode === 'ai_priority' ? 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)' : 'transparent',
              color: mapMode === 'ai_priority' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Zap size={14} color={mapMode === 'ai_priority' ? '#fff' : 'var(--cyan-400)'} />
            AI PRIORITY MODE
          </button>

          <button
            onClick={() => setMapMode('civic_signals')}
            style={{
              fontSize: '0.75rem',
              fontWeight: 800,
              padding: '0.35rem 0.85rem',
              borderRadius: '8px',
              background: mapMode === 'civic_signals' ? 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)' : 'transparent',
              color: mapMode === 'civic_signals' ? '#fff' : 'var(--text-secondary)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              transition: 'all 0.2s'
            }}
          >
            <Activity size={14} color={mapMode === 'civic_signals' ? '#fff' : '#c084fc'} />
            CIVIC SIGNALS MODE
          </button>
        </div>

        {/* Right Side: Quick Navigation & Focus Controls */}
        <div
          style={{
            pointerEvents: 'auto',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(14, 21, 38, 0.9)',
            padding: '0.3rem',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <button
            onClick={focusSector15}
            className="sim-btn"
            style={{ fontSize: '0.74rem', background: 'rgba(239, 68, 68, 0.2)', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#fca5a5' }}
            title="Focus Sector 15 Emergency Inundation Zone"
          >
            📍 Focus Sector 15
          </button>
          <button
            onClick={fitOverview}
            className="sim-btn"
            style={{ fontSize: '0.74rem' }}
            title="Zoom out to city-wide overview"
          >
            🌐 City View
          </button>
        </div>
      </div>

      {/* Main Map Container */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Floating Replay & Time Slider Control Bar */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.25rem',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 450,
          width: 'calc(100% - 340px)',
          maxWidth: '820px',
          background: 'rgba(14, 21, 38, 0.92)',
          border: '1px solid var(--border-accent)',
          borderRadius: '12px',
          padding: '0.75rem 1.25rem',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 12px 35px rgba(0,0,0,0.85)',
          color: '#fff',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Clock size={14} color="var(--cyan-400)" />
            <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: 'var(--cyan-400)' }}>
              {currentStep.simulatedTime}
            </strong>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.74rem' }}>
              • {currentStep.description}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Rainfall:</span>
            <strong style={{ fontSize: '0.75rem', color: currentStep.weatherCondition.rainfallMmPerHour > 50 ? '#f87171' : '#38bdf8', fontFamily: 'var(--font-mono)' }}>
              {currentStep.weatherCondition.rainfallMmPerHour} mm/hr
            </strong>
          </div>
        </div>

        {/* Timeline Slider Track */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={isPlaying ? pause : play}
            style={{
              background: isPlaying ? 'rgba(239, 68, 68, 0.25)' : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              border: 'none',
              borderRadius: '50%',
              width: 32,
              height: 32,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff'
            }}
            title={isPlaying ? 'Pause simulation replay' : 'Play simulation replay'}
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} style={{ marginLeft: 2 }} />}
          </button>

          <button
            onClick={stepForward}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '0.35rem 0.55rem',
              color: '#fff',
              cursor: 'pointer',
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
            style={{ flex: 1, accentColor: 'var(--cyan-400)', height: 6, cursor: 'pointer' }}
          />

          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            Step {currentStepIndex + 1}/{SIMULATION_STEPS.length}
          </span>

          <button
            onClick={resetSimulation}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '0.35rem 0.55rem',
              color: '#fff',
              cursor: 'pointer',
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
      </div>

      {/* Map Legend Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '1.25rem',
          left: '1rem',
          zIndex: 400,
          background: 'rgba(14, 21, 38, 0.92)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '0.75rem 1rem',
          backdropFilter: 'blur(12px)',
          fontSize: '0.72rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          maxWidth: '260px'
        }}
      >
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Telemetry Legend</span>
          <span style={{ color: 'var(--cyan-400)', fontSize: '0.65rem' }}>{mapMode === 'ai_priority' ? 'AI PRIORITY' : 'CIVIC SIGNALS'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />
          <span>Critical P1 (Priority &ge; 80)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', display: 'inline-block' }} />
          <span>High P2 (Priority 60 - 79)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#06b6d4', display: 'inline-block' }} />
          <span>Standard P3 (Priority &lt; 60)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '0.7rem' }}>🔥</span>
          <span>Emerging Now (Velocity Surge)</span>
        </div>
        <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.3rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', fontSize: '0.68rem' }}>
          <span>📱 App</span>
          <span>🐦 X</span>
          <span>🏛️ Grievance</span>
          <span>📞 311</span>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.68rem', color: 'var(--text-muted)' }}>
          <span>🏫 School (250m)</span>
          <span>🏥 Hospital (400m)</span>
        </div>
      </div>
    </div>
  );
};
