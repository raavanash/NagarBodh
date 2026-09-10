import React, { useRef, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FastForward,
  Flame,
  GripVertical,
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
  const [isPillMinimized, setIsPillMinimized] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth <= 640);
  const [pillPos, setPillPos] = useState<{ x: number; y: number } | null>(null);
  const isDraggingPillRef = useRef(false);
  const dragPillStartRef = useRef<{ startX: number; startY: number; initialX: number; initialY: number }>({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });
  const pillRef = useRef<HTMLDivElement>(null);

  const handlePillPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    const el = pillRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    isDraggingPillRef.current = true;
    dragPillStartRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: pillPos ? pillPos.x : rect.left,
      initialY: pillPos ? pillPos.y : rect.top
    };
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePillPointerMove = (e: React.PointerEvent) => {
    if (!isDraggingPillRef.current) return;
    const dx = e.clientX - dragPillStartRef.current.startX;
    const dy = e.clientY - dragPillStartRef.current.startY;
    const newX = Math.max(10, Math.min(window.innerWidth - 240, dragPillStartRef.current.initialX + dx));
    const newY = Math.max(10, Math.min(window.innerHeight - 45, dragPillStartRef.current.initialY + dy));
    setPillPos({ x: newX, y: newY });
  };

  const handlePillPointerUp = (e: React.PointerEvent) => {
    if (isDraggingPillRef.current) {
      isDraggingPillRef.current = false;
      try {
        (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
      } catch {}
    }
  };

  return (
    <>
      {/* Draggable & Minimizable Persistent Floating Demo Pill */}
      <div
        ref={pillRef}
        className="demo-pill-container"
        style={pillPos ? { position: 'fixed', left: `${pillPos.x}px`, top: `${pillPos.y}px`, right: 'auto', bottom: 'auto' } : undefined}
      >
        {isPillMinimized ? (
          /* Minimized Compact Demo Pill */
          <div className="demo-pill" style={{ padding: '0.35rem 0.65rem', gap: '0.5rem' }}>
            {/* Drag Handle */}
            <div
              onPointerDown={handlePillPointerDown}
              onPointerMove={handlePillPointerMove}
              onPointerUp={handlePillPointerUp}
              style={{
                cursor: isDraggingPillRef.current ? 'grabbing' : 'grab',
                display: 'flex',
                alignItems: 'center',
                padding: '0 2px',
                color: '#94a3b8',
                touchAction: 'none'
              }}
              title="Drag to reposition demo pill"
            >
              <GripVertical size={13} />
            </div>

            <div className="demo-pill-status">
              <span className="demo-pill-dot" />
              <span className="demo-pill-title" style={{ fontSize: '0.72rem' }}>DEMO</span>
            </div>

            <span style={{ color: 'var(--text-muted)', fontSize: '0.68rem', fontFamily: 'var(--font-mono)' }}>
              Step {currentStepIndex + 1}/15
            </span>

            {isPlaying ? (
              <button onClick={pauseDemo} className="demo-pill-btn" style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem' }} title="Pause Demo">
                <Pause size={11} />
              </button>
            ) : (
              <button onClick={startLiveDemo} className="demo-pill-btn demo-pill-btn-play" style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem' }} title="Play Live Demo">
                <Play size={11} />
              </button>
            )}

            <button
              onClick={() => setIsPillMinimized(false)}
              className="demo-pill-btn"
              style={{ padding: '0.15rem 0.35rem', fontSize: '0.65rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
              title="Expand Demo Controls"
            >
              <ChevronUp size={13} />
            </button>
          </div>
        ) : (
          /* Expanded Full Demo Control Pill */
          <div className="demo-pill">
            {/* Drag Handle */}
            <div
              onPointerDown={handlePillPointerDown}
              onPointerMove={handlePillPointerMove}
              onPointerUp={handlePillPointerUp}
              style={{
                cursor: isDraggingPillRef.current ? 'grabbing' : 'grab',
                display: 'flex',
                alignItems: 'center',
                padding: '0 2px',
                color: '#94a3b8',
                touchAction: 'none'
              }}
              title="Drag to reposition demo controls"
            >
              <GripVertical size={14} />
            </div>

            <div className="demo-pill-status">
              <span className="demo-pill-dot" />
              <span className="demo-pill-title">DEMO MODE</span>
            </div>

            <div className="demo-pill-divider" style={{ color: 'var(--border-medium)' }}>|</div>
 
            <div className="demo-pill-scenario" style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: 600 }}>
              Scenario: Waterlogging Surge
            </div>

            <div className="demo-pill-divider" style={{ color: 'var(--border-medium)' }}>|</div>

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

              <button
                onClick={() => setIsPillMinimized(true)}
                className="demo-pill-btn"
                style={{ padding: '0.2rem 0.35rem', marginLeft: '0.15rem', background: 'transparent', border: 'none', color: 'var(--text-muted)' }}
                title="Minimize Demo Pill"
              >
                <ChevronDown size={13} />
              </button>
            </div>
          </div>
        )}
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
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
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
