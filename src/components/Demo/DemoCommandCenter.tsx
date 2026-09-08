import React, { useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ChevronUp,
  FastForward,
  Flame,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sliders,
  Sparkles,
  Truck,
  Wrench,
  X
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const DemoCommandCenter: React.FC = () => {
  const {
    currentStepIndex,
    currentStep,
    currentWeather,
    isPlaying,
    startLiveDemo,
    pauseDemo,
    resetDemo,
    fastForwardDemo,
    triggerEmergencyDemo,
    approveResponseDemo,
    simulateFieldArrivalDemo,
    simulateResolutionDemo,
    verifyResolutionDemo,
    setActiveTab
  } = useCivic();

  const [isOpen, setIsOpen] = useState<boolean>(false);

  return (
    <>
      {/* Minimal Persistent Floating Demo Pill */}
      <div className="demo-pill-container">
        <div className="demo-pill">
          <div className="demo-pill-status">
            <span className="demo-pill-dot" />
            <span className="demo-pill-title">DEMO MODE</span>
          </div>

          <div style={{ color: 'var(--text-muted)' }}>|</div>

          <div style={{ fontSize: '0.7rem', color: 'var(--cyan-300)', fontWeight: 600 }}>
            Scenario: Waterlogging Surge
          </div>

          <div style={{ color: 'var(--text-muted)' }}>|</div>

          <div className="demo-pill-step">
            <span>Step {currentStepIndex + 1}/15</span>
            <span className="demo-pill-time">({currentStep.simulatedTime})</span>
          </div>

          <div className="demo-pill-actions" style={{ marginLeft: '0.4rem' }}>
            {isPlaying ? (
              <button onClick={pauseDemo} className="demo-pill-btn" title="Pause Demo">
                <Pause size={12} />
                <span>Pause</span>
              </button>
            ) : (
              <button onClick={startLiveDemo} className="demo-pill-btn demo-pill-btn-play" title="Play Live Demo">
                <Play size={12} />
                <span>Play</span>
              </button>
            )}

            <button onClick={fastForwardDemo} className="demo-pill-btn" title="Next Step">
              <FastForward size={12} />
              <span>Next</span>
            </button>

            <button onClick={() => setIsOpen(true)} className="demo-pill-btn demo-pill-btn-expand" title="Open Advanced Controls">
              <Sliders size={12} />
              <span>Controls</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Demo Controls Modal */}
      {isOpen && (
        <div className="demo-drawer-overlay" onClick={() => setIsOpen(false)}>
          <div className="demo-drawer-modal" onClick={e => e.stopPropagation()}>
            <div className="demo-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="logo-badge" style={{ width: 28, height: 28 }}>
                  <Sparkles size={16} />
                </div>
                <div>
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                    NagarBodh Scripted Emergency Demonstration Controls
                  </h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>
                    Step {currentStepIndex + 1}/15 • {currentStep.simulatedTime} — {currentStep.description}
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button onClick={resetDemo} className="sim-btn" style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}>
                  <RotateCcw size={13} /> Reset Demo
                </button>
                <button onClick={() => setIsOpen(false)} className="demo-close-btn">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="demo-drawer-body">
              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--cyan-400)', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
                  1-Click Scenario Actions
                </div>

                <div className="demo-commands-grid">
                  <button onClick={() => { startLiveDemo(); setIsOpen(false); }} className="demo-cmd-btn demo-cmd-primary">
                    <Play size={15} />
                    <div>
                      <div className="demo-cmd-title">START LIVE DEMO</div>
                      <div className="demo-cmd-desc">Auto-advance 14-stage crisis sequence</div>
                    </div>
                  </button>

                  <button onClick={() => { triggerEmergencyDemo(); setActiveTab('live_map'); setIsOpen(false); }} className="demo-cmd-btn demo-cmd-danger">
                    <Flame size={15} />
                    <div>
                      <div className="demo-cmd-title">TRIGGER EMERGENCY</div>
                      <div className="demo-cmd-desc">10:00 AM • Priority 94 Red Alert</div>
                    </div>
                  </button>

                  <button onClick={() => { approveResponseDemo(); setActiveTab('dispatch'); setIsOpen(false); }} className="demo-cmd-btn demo-cmd-accent">
                    <CheckCircle2 size={15} />
                    <div>
                      <div className="demo-cmd-title">APPROVE RESPONSE</div>
                      <div className="demo-cmd-desc">Authorizes staged SOP dewatering plan</div>
                    </div>
                  </button>

                  <button onClick={() => { simulateFieldArrivalDemo(); setActiveTab('live_map'); setIsOpen(false); }} className="demo-cmd-btn demo-cmd-info">
                    <Truck size={15} />
                    <div>
                      <div className="demo-cmd-title">FIELD ARRIVAL</div>
                      <div className="demo-cmd-desc">11:00 AM • Heavy pumps operational</div>
                    </div>
                  </button>

                  <button onClick={() => { simulateResolutionDemo(); setActiveTab('live_map'); setIsOpen(false); }} className="demo-cmd-btn demo-cmd-success">
                    <Wrench size={15} />
                    <div>
                      <div className="demo-cmd-title">SIMULATE RESOLUTION</div>
                      <div className="demo-cmd-desc">12:00 PM • Water receded & clear</div>
                    </div>
                  </button>

                  <button onClick={() => { verifyResolutionDemo(); setActiveTab('timeline'); setIsOpen(false); }} className="demo-cmd-btn demo-cmd-verify">
                    <Shield size={15} />
                    <div>
                      <div className="demo-cmd-title">VERIFY RESOLUTION</div>
                      <div className="demo-cmd-desc">12:15 PM • 8-Step verification (91%)</div>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                  Product View Shortcuts
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  <button onClick={() => { setActiveTab('live_map'); setIsOpen(false); }} className="sim-btn">Live Map</button>
                  <button onClick={() => { setActiveTab('signals'); setIsOpen(false); }} className="sim-btn">Signal Explorer</button>
                  <button onClick={() => { setActiveTab('dispatch'); setIsOpen(false); }} className="sim-btn">Response Planner</button>
                  <button onClick={() => { setActiveTab('authority'); setIsOpen(false); }} className="sim-btn">Authority Board</button>
                  <button onClick={() => { setActiveTab('timeline'); setIsOpen(false); }} className="sim-btn">Resolution Verification</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
