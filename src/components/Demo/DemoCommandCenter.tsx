import React, { useRef, useState } from 'react';
import {
  Activity,
  ArrowRight,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FastForward,
  Flame,
  GripVertical,
  Layers,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Shield,
  Sliders,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Truck,
  Wrench,
  X
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const DemoCommandCenter: React.FC = () => {
  const {
    currentStepIndex,
    currentStep,
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
    setActiveTab,
    activeIntervention,
    prioritizeRecommendationInPipeline,
    approveIntervention,
    measureInterventionImpact,
    setSelectedIncidentId
  } = useCivic();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPillMinimized, setIsPillMinimized] = useState<boolean>(() => typeof window !== 'undefined' && window.innerWidth <= 640);
  const [activeTabMode, setActiveTabMode] = useState<'stepper' | 'cheatsheet' | 'shortcuts'>('stepper');
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
        style={pillPos ? { position: 'fixed', left: `${pillPos.x}px`, top: `${pillPos.y}px`, right: 'auto', bottom: 'auto', zIndex: 1200 } : { zIndex: 1200 }}
      >
        {isPillMinimized ? (
          /* Minimized Compact Demo Pill */
          <div className="demo-pill" style={{ padding: '0.35rem 0.65rem', gap: '0.5rem' }}>
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
              <span className="demo-pill-title" style={{ fontSize: '0.72rem' }}>JUDGE DEMO</span>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="demo-pill-btn demo-pill-btn-expand"
              style={{ padding: '0.2rem 0.45rem', fontSize: '0.68rem', fontWeight: 800 }}
              title="Open Judging Controls & Cheat Sheet"
            >
              <Sparkles size={11} />
              <span>JUDGE MODE</span>
            </button>

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
              <span className="demo-pill-title">JUDGE MODE</span>
            </div>

            <div className="demo-pill-divider" style={{ color: 'var(--border-medium)' }}>|</div>

            <div className="demo-pill-scenario" style={{ fontSize: '0.72rem', color: '#2563eb', fontWeight: 700 }}>
              Sector 15 Surge (₹350L)
            </div>

            <div className="demo-pill-divider" style={{ color: 'var(--border-medium)' }}>|</div>

            <div className="demo-pill-step">
              <span>Step {currentStepIndex + 1}/15</span>
              <span className="demo-pill-time">({currentStep.simulatedTime})</span>
            </div>

            <div className="demo-pill-actions" style={{ marginLeft: '0.4rem' }}>
              <button
                onClick={() => setIsOpen(true)}
                className="demo-pill-btn demo-pill-btn-expand"
                style={{ background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)', color: '#ffffff', fontWeight: 800, border: 'none' }}
                title="Open Canonical Judging Stepper & Presenter Cheat Sheet"
              >
                <Sparkles size={12} />
                <span>Judging Stepper</span>
              </button>

              <button onClick={resetDemo} className="demo-pill-btn" title="Reset Demo to Baseline">
                <RotateCcw size={12} />
                <span>Reset</span>
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
        <div className="demo-drawer-overlay" onClick={() => setIsOpen(false)} style={{ zIndex: 2500 }}>
          <div className="demo-drawer-modal" onClick={e => e.stopPropagation()} style={{ maxWidth: '850px' }}>
            <div className="demo-drawer-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div className="logo-badge" style={{ width: 32, height: 32, background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
                  <Sparkles size={18} />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 900, color: 'var(--text-primary)', margin: 0 }}>
                      NagarBodh Live Judging Demonstration Suite
                    </h3>
                    <span style={{ fontSize: '0.62rem', background: '#dcfce7', color: '#166534', border: '1px solid #86efac', padding: '2px 6px', borderRadius: '4px', fontWeight: 800 }}>
                      CANONICAL DEMO
                    </span>
                  </div>
                  <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', margin: '2px 0 0 0' }}>
                    Step {currentStepIndex + 1}/15 • {currentStep.simulatedTime} — 5-Minute Core Lifecycle Journey
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={() => {
                    resetDemo();
                    setIsOpen(false);
                  }}
                  className="sim-btn"
                  style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                >
                  <RotateCcw size={13} /> Reset Demo
                </button>
                <button onClick={() => setIsOpen(false)} className="demo-close-btn">
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Navigation Tabs inside Modal */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', background: 'var(--bg-surface)', padding: '0.5rem 1.25rem', gap: '0.5rem' }}>
              <button
                onClick={() => setActiveTabMode('stepper')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: activeTabMode === 'stepper' ? '1px solid #2563eb' : '1px solid transparent',
                  background: activeTabMode === 'stepper' ? '#eff6ff' : 'transparent',
                  color: activeTabMode === 'stepper' ? '#1d4ed8' : 'var(--text-secondary)',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Sparkles size={13} />
                <span>1. Canonical Stepper</span>
              </button>

              <button
                onClick={() => setActiveTabMode('cheatsheet')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: activeTabMode === 'cheatsheet' ? '1px solid #2563eb' : '1px solid transparent',
                  background: activeTabMode === 'cheatsheet' ? '#eff6ff' : 'transparent',
                  color: activeTabMode === 'cheatsheet' ? '#1d4ed8' : 'var(--text-secondary)',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <BookOpen size={13} />
                <span>2. Presenter Cheat Sheet & Memory Anchors</span>
              </button>

              <button
                onClick={() => setActiveTabMode('shortcuts')}
                style={{
                  padding: '0.35rem 0.75rem',
                  borderRadius: '6px',
                  border: activeTabMode === 'shortcuts' ? '1px solid #2563eb' : '1px solid transparent',
                  background: activeTabMode === 'shortcuts' ? '#eff6ff' : 'transparent',
                  color: activeTabMode === 'shortcuts' ? '#1d4ed8' : 'var(--text-secondary)',
                  fontSize: '0.76rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}
              >
                <Layers size={13} />
                <span>3. Operational View Shortcuts</span>
              </button>
            </div>

            <div className="demo-drawer-body" style={{ padding: '1.25rem' }}>
              {/* TAB 1: CANONICAL STEPPER */}
              {activeTabMode === 'stepper' && (
                <div>
                  <div style={{ background: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.45 }}>
                      <strong>5-Minute Live Judging Flow:</strong> Execute the deterministic Sector 15 lifecycle in sequence without menu searching.
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {/* Stage 1 */}
                    <button
                      onClick={() => {
                        triggerEmergencyDemo();
                        setActiveTab('investment_gaps');
                        setSelectedIncidentId('incident-ward-15-central-sub-city-waterlogging');
                        setIsOpen(false);
                      }}
                      className="demo-cmd-btn"
                      style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', padding: '0.75rem', textAlign: 'left' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#2563eb', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800 }}>1</span>
                        <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>Load Sector 15 Scenario</strong>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                        10:00 AM Surge • 32 Signals • Priority 94 Red Alert on Civic Investment Board
                      </div>
                    </button>

                    {/* Stage 2 */}
                    <button
                      onClick={() => {
                        setActiveTab('investment_gaps');
                        setSelectedIncidentId('incident-ward-15-central-sub-city-waterlogging');
                        setIsOpen(false);
                      }}
                      className="demo-cmd-btn"
                      style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', padding: '0.75rem', textAlign: 'left' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800 }}>2</span>
                        <strong style={{ fontSize: '0.78rem', color: 'var(--text-primary)' }}>Why Recommendation & Brief</strong>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                        Explainable Dossier • 5-Factor Breakdown • Synthesize Grounded Decision Brief
                      </div>
                    </button>

                    {/* Stage 3 */}
                    <button
                      onClick={() => {
                        const sec15Id = 'incident-ward-15-central-sub-city-waterlogging';
                        prioritizeRecommendationInPipeline(sec15Id);
                        setIsOpen(false);
                      }}
                      className="demo-cmd-btn"
                      style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', padding: '0.75rem', textAlign: 'left' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#0284c7', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800 }}>3</span>
                        <strong style={{ fontSize: '0.78rem', color: 'var(--cyan-400)' }}>Prioritize in Pipeline</strong>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                        Carry ₹350L Subsurface Array into Governance Pipeline under policy review
                      </div>
                    </button>

                    {/* Stage 4 */}
                    <button
                      onClick={() => {
                        approveIntervention('incident-ward-15-central-sub-city-waterlogging', 'Demo Municipal Approver [SIMULATION]');
                        setActiveTab('project_priorities');
                        setIsOpen(false);
                      }}
                      className="demo-cmd-btn"
                      style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', padding: '0.75rem', textAlign: 'left' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#10b981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800 }}>4</span>
                        <strong style={{ fontSize: '0.78rem', color: '#34d399' }}>Approve Intervention</strong>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                        Human governance authorization recorded • Status $\to$ INTERVENTION_RECORDED
                      </div>
                    </button>

                    {/* Stage 5 */}
                    <button
                      onClick={() => {
                        measureInterventionImpact('incident-ward-15-central-sub-city-waterlogging');
                        setIsOpen(false);
                      }}
                      className="demo-cmd-btn"
                      style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', padding: '0.75rem', textAlign: 'left' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#8b5cf6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800 }}>5</span>
                        <strong style={{ fontSize: '0.78rem', color: '#a78bfa' }}>Measure Impact</strong>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                        Feedback loop closed • -37 pts demand drop, +29 pts infra gain, Impact Score 84/100
                      </div>
                    </button>

                    {/* Reset */}
                    <button
                      onClick={() => {
                        resetDemo();
                        setIsOpen(false);
                      }}
                      className="demo-cmd-btn"
                      style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-medium)', padding: '0.75rem', textAlign: 'left' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.62rem', fontWeight: 800 }}>6</span>
                        <strong style={{ fontSize: '0.78rem', color: '#f87171' }}>Reset Demo</strong>
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.3 }}>
                        Clear active interventions, reset simulation clock to 08:00 AM baseline
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PRESENTER CHEAT SHEET & MEMORY ANCHORS */}
              {activeTabMode === 'cheatsheet' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Canonical Numbers Grid */}
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#2563eb', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
                      Canonical Sector 15 Memory Anchors (FROZEN Scoring Output)
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.6rem', fontSize: '0.74rem' }}>
                      <div style={{ background: 'var(--bg-canvas)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>PRIORITY SCORE</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#ef4444', fontFamily: 'var(--font-mono)' }}>94 / 100</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>[CALCULATED] Level P1</div>
                      </div>

                      <div style={{ background: 'var(--bg-canvas)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>CAPITAL OUTLAY</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#10b981', fontFamily: 'var(--font-mono)' }}>₹350 Lakhs</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>[RECOMMENDED] Capex</div>
                      </div>

                      <div style={{ background: 'var(--bg-canvas)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>AFFECTED CITIZENS</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>184,000</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>[BASELINE CONTEXT]</div>
                      </div>

                      <div style={{ background: 'var(--bg-canvas)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>VULNERABLE POPULATION</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#d97706', fontFamily: 'var(--font-mono)' }}>45,000 (24.5%)</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>Index: 91/100</div>
                      </div>

                      <div style={{ background: 'var(--bg-canvas)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>PROJECTED DEMAND DELTA</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-mono)' }}>-37 pts</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>[PROJECTED] Index drop</div>
                      </div>

                      <div style={{ background: 'var(--bg-canvas)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>INFRASTRUCTURE GAIN</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-mono)' }}>+29 pts</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>[PROJECTED] Index gain</div>
                      </div>

                      <div style={{ background: 'var(--bg-canvas)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>SERVICE ACCESS GAIN</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-mono)' }}>+30 pts</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>[PROJECTED] Index gain</div>
                      </div>

                      <div style={{ background: 'var(--bg-canvas)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>TRANSIT DISTANCE REDUCTION</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#059669', fontFamily: 'var(--font-mono)' }}>-40%</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>[PROJECTED] Distance</div>
                      </div>

                      <div style={{ background: 'var(--bg-canvas)', padding: '0.5rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>OVERALL IMPACT SCORE</div>
                        <div style={{ fontSize: '1rem', fontWeight: 900, color: '#7c3aed', fontFamily: 'var(--font-mono)' }}>84 / 100</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>[PROJECTED] Modeled Impact</div>
                      </div>
                    </div>
                  </div>

                  {/* 5-Minute Story Timeline Schedule */}
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#0284c7', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
                      5-Minute Judging Schedule Outline
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.74rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#2563eb', width: '80px' }}>0:00–0:30</span>
                        <span><strong>Problem & Signal Intake:</strong> Incoming multi-channel citizen signals across WhatsApp, Helpline, Social, and App.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#2563eb', width: '80px' }}>0:30–1:15</span>
                        <span><strong>Civic Investment Board:</strong> Signals mapped against underlying civic infrastructure gaps to identify investment priorities.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#2563eb', width: '80px' }}>1:15–2:00</span>
                        <span><strong>Why This Recommendation:</strong> Evidence-backed deterministic recommendation (Priority 94/100, ₹350L Capex).</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#2563eb', width: '80px' }}>2:00–2:30</span>
                        <span><strong>Gemini Decision Brief:</strong> Gemini-generated decision brief grounded in NagarBodh evidence without fabricating data.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#2563eb', width: '80px' }}>2:30–3:15</span>
                        <span><strong>Governance Pipeline & Human Approval:</strong> Human approval authorizes intervention record.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#2563eb', width: '80px' }}>3:15–4:15</span>
                        <span><strong>Intervention $\to$ Impact Measurement:</strong> Closed feedback loop models +29 pts infra, -37 pts demand, 84/100 projected impact.</span>
                      </div>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#2563eb', width: '80px' }}>4:15–5:00</span>
                        <span><strong>Close the Loop:</strong> Decision $\to$ Intervention $\to$ Projected Impact.</span>
                      </div>
                    </div>
                  </div>

                  {/* Presenter Speaking Cues */}
                  <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '1rem' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
                      Presenter Speaking Cues (One-Sentence Anchors)
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', fontSize: '0.74rem' }}>
                      <div><strong style={{ color: '#2563eb' }}>1. Signals:</strong> "These fragmented incoming signals become a single demand hotspot."</div>
                      <div><strong style={{ color: '#2563eb' }}>2. Civic Gap:</strong> "NagarBodh doesn't just count complaints; it identifies the infrastructure deficit behind them."</div>
                      <div><strong style={{ color: '#2563eb' }}>3. Evidence:</strong> "Every major number is classified as observed, baseline, calculated, recommended or projected."</div>
                      <div><strong style={{ color: '#2563eb' }}>4. Gemini:</strong> "Gemini synthesizes the evidence into a decision brief without becoming the source of the score."</div>
                      <div><strong style={{ color: '#2563eb' }}>5. Approval:</strong> "The recommendation remains subject to human authorization."</div>
                      <div><strong style={{ color: '#2563eb' }}>6. Impact:</strong> "We then compare the intervention against the baseline using projected scenario outcomes."</div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: SHORTCUTS & OPERATIONAL CONTROLS */}
              {activeTabMode === 'shortcuts' && (
                <div>
                  <div style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '0.6rem' }}>
                    1-Click Crisis Response Actions
                  </div>

                  <div className="demo-commands-grid" style={{ marginBottom: '1.25rem' }}>
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

                  <div>
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em', marginBottom: '0.5rem' }}>
                      Direct View Navigation
                    </div>
                    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                      <button onClick={() => { setActiveTab('investment_gaps'); setIsOpen(false); }} className="sim-btn">Investment Board</button>
                      <button onClick={() => { setActiveTab('development_map'); setIsOpen(false); }} className="sim-btn">Development Map</button>
                      <button onClick={() => { setActiveTab('citizen_signals'); setIsOpen(false); }} className="sim-btn">Citizen Signals</button>
                      <button onClick={() => { setActiveTab('project_priorities'); setIsOpen(false); }} className="sim-btn">Investment Pipeline</button>
                      <button onClick={() => { setActiveTab('policy_board'); setIsOpen(false); }} className="sim-btn">Priority Leaderboard</button>
                      <button onClick={() => { setActiveTab('impact'); setIsOpen(false); }} className="sim-btn">Impact Measurement</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
