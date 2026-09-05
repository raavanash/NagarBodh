import React from 'react';
import {
  Activity,
  AlertTriangle,
  ChevronRight,
  FastForward,
  Flame,
  Globe2,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Send,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentStep,
    currentStepIndex,
    isPlaying,
    play,
    pause,
    stepForward,
    triggerSector15Surge,
    resetSimulation,
    playbackSpeed,
    setPlaybackSpeed,
    incidents,
    ingestionMode
  } = useCivic();

  const criticalCount = incidents.filter(i => i.priority.overallScore >= 75).length;
  const pendingDispatchCount = incidents.filter(i => i.actionPlan?.status === 'pending_review' && i.priority.overallScore >= 70).length;

  return (
    <header className="navbar">
      {/* Brand Section */}
      <div className="brand-section">
        <div className="logo-badge">
          <Globe2 size={22} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'nowrap', whiteSpace: 'nowrap' }}>
            <h1 className="brand-title">NagarBodh</h1>
            <span style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--cyan-400)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              fontSize: '0.62rem',
              padding: '0.1rem 0.4rem',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}>
              AI CIVIC OS
            </span>
            <span
              style={{
                background: ingestionMode === 'LIVE' ? 'rgba(16, 185, 129, 0.2)' : ingestionMode === 'REPLAY' ? 'rgba(139, 92, 246, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: ingestionMode === 'LIVE' ? '#34d399' : ingestionMode === 'REPLAY' ? '#c084fc' : '#fbbf24',
                border: ingestionMode === 'LIVE' ? '1px solid rgba(16, 185, 129, 0.4)' : ingestionMode === 'REPLAY' ? '1px solid rgba(139, 92, 246, 0.4)' : '1px solid rgba(245, 158, 11, 0.4)',
                fontSize: '0.62rem',
                padding: '0.1rem 0.45rem',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                whiteSpace: 'nowrap'
              }}
              title={`Current Signal Ingestion Mode: ${ingestionMode}`}
            >
              <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: ingestionMode === 'LIVE' ? '#34d399' : ingestionMode === 'REPLAY' ? '#c084fc' : '#fbbf24' }} />
              <span>INGESTION: {ingestionMode}</span>
            </span>
          </div>
          <div className="brand-tagline">
            Understand the city • Prioritize what matters • Act where it counts
          </div>
        </div>
      </div>

      {/* Center 6-Screen Tabs */}
      <nav className="nav-tabs" aria-label="Command Views">
        <button
          className={`nav-tab-btn ${activeTab === 'live_map' ? 'active' : ''}`}
          onClick={() => setActiveTab('live_map')}
          title="Full-screen geospatial incident intelligence map"
        >
          <MapPin size={15} />
          <span>Live Map</span>
          {criticalCount > 0 && <span className="nav-tab-badge">{criticalCount}</span>}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'dossier' ? 'active' : ''}`}
          onClick={() => setActiveTab('dossier')}
          title="Deep dive incident dossier with 4-way fact separation"
        >
          <ShieldAlert size={15} />
          <span>Incident Dossier</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'signals' ? 'active' : ''}`}
          onClick={() => setActiveTab('signals')}
          title="Multilingual raw citizen signals stream & translation"
        >
          <Activity size={15} />
          <span>Signal Explorer</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'dispatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('dispatch')}
          title="SOP-driven multi-agency response & 1-click dispatch"
        >
          <Send size={15} />
          <span>Response Planner</span>
          {pendingDispatchCount > 0 && (
            <span style={{
              background: 'rgba(245, 158, 11, 0.25)',
              color: 'var(--amber-400)',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              fontSize: '0.65rem',
              padding: '0.05rem 0.35rem',
              borderRadius: '999px',
              fontWeight: 700
            }}>
              {pendingDispatchCount}
            </span>
          )}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'authority' ? 'active' : ''}`}
          onClick={() => setActiveTab('authority')}
          title="Municipal authority executive dashboard & ward rollups"
        >
          <Sparkles size={15} />
          <span>Authority Board</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
          title="End-to-end incident resolution audit timeline"
        >
          <AlertTriangle size={15} />
          <span>Resolution Timeline</span>
        </button>
      </nav>

      {/* Right Controls: Chrono-Player & Quick Demo Buttons */}
      <div className="sim-controls">
        {/* Simulated Time Clock */}
        <div className="sim-clock-badge" title="Current simulated operational clock">
          <span style={{
            width: '7px',
            height: '7px',
            borderRadius: '50%',
            background: isPlaying ? '#10b981' : '#f59e0b',
            boxShadow: isPlaying ? '0 0 8px #10b981' : 'none'
          }} />
          <span>{currentStep.simulatedTime}</span>
        </div>

        {/* Play/Pause */}
        {isPlaying ? (
          <button className="sim-btn" onClick={pause} title="Pause simulation">
            <Pause size={14} />
            <span>Pause</span>
          </button>
        ) : (
          <button className="sim-btn sim-btn-play" onClick={play} title="Play automated chronological stream">
            <Play size={14} fill="currentColor" />
            <span>Simulate</span>
          </button>
        )}

        {/* Playback speed toggle */}
        <button
          className="sim-btn"
          onClick={() => {
            const nextSpeed = playbackSpeed === 1 ? 5 : playbackSpeed === 5 ? 10 : 1;
            setPlaybackSpeed(nextSpeed as any);
          }}
          title="Toggle playback speed"
          style={{ minWidth: '46px', justifyContent: 'center', fontFamily: 'var(--font-mono)' }}
        >
          <FastForward size={13} />
          <span>{playbackSpeed}x</span>
        </button>

        {/* Step Forward */}
        <button
          className="sim-btn"
          onClick={stepForward}
          disabled={currentStepIndex >= 6}
          style={{ opacity: currentStepIndex >= 6 ? 0.4 : 1, cursor: currentStepIndex >= 6 ? 'not-allowed' : 'pointer' }}
          title={currentStepIndex >= 6 ? 'Simulation reached peak step' : 'Advance to next chronological event'}
        >
          <ChevronRight size={15} />
          <span>Step</span>
        </button>

        {/* Quick Demo: Instant Sector 15 Surge Button */}
        <button
          className="sim-btn sim-btn-surge"
          onClick={triggerSector15Surge}
          title="Instant Hackathon Demo: Jump to critical +280% velocity surge in Sector 15 with school van trapped!"
        >
          <Flame size={14} />
          <span>SURGE DEMO</span>
        </button>

        {/* Reset */}
        <button className="sim-btn" onClick={resetSimulation} title="Reset simulation to 08:00 baseline">
          <RotateCcw size={13} />
        </button>
      </div>
    </header>
  );
};
