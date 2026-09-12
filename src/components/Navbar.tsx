import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Database,
  Globe2,
  MapPin,
  Moon,
  Send,
  ShieldAlert,
  Sparkles,
  Sun,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentStep,
    incidents,
    ingestionMode,
    setIngestionMode,
    theme,
    toggleTheme,
    persistenceStatus
  } = useCivic();

  const criticalCount = incidents.filter(i => i.priority.overallScore >= 80).length;
  const pendingDispatchCount = incidents.filter(i => i.actionPlan?.status === 'pending_review' && i.priority.overallScore >= 70).length;

  return (
    <header className="navbar">
      <div className="navbar-top-bar">
        {/* Brand & City Selector */}
        <div className="brand-section">
          <div className="logo-badge">
            <Globe2 size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
              <h1 className="brand-title">NagarBodh</h1>
              <span style={{
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #bfdbfe',
                fontSize: '0.6rem',
                padding: '0.1rem 0.35rem',
                borderRadius: '4px',
                fontFamily: 'var(--font-mono)',
                fontWeight: 700
              }}>
                CITIZEN DEVELOPMENT INTELLIGENCE
              </span>
            </div>

            <div className="brand-subtitle" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              <Building2 size={11} color="#2563eb" />
              <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>BRICS Innovation Track • Digital Public Infrastructure</span>
              <span>•</span>
              <span style={{ color: '#059669', fontWeight: 700 }}>National Policy Command</span>
            </div>
          </div>
        </div>

        {/* Right User & Operational Controls */}
        <div className="navbar-right-controls" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* LIVE vs SIMULATION Ingestion Mode Switcher */}
          <div
            className="navbar-mode-switch"
            style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '20px',
              padding: '2px',
              gap: '2px'
            }}
          >
            <button
              onClick={() => setIngestionMode('LIVE')}
              style={{
                background: ingestionMode === 'LIVE' ? '#d1fae5' : 'transparent',
                color: ingestionMode === 'LIVE' ? '#047857' : 'var(--text-muted)',
                border: ingestionMode === 'LIVE' ? '1px solid #6ee7b7' : 'none',
                borderRadius: '16px',
                padding: '0.2rem 0.55rem',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.2s ease'
              }}
              title="Live ingestion via OpenWeather and Bluesky Jetstream WebSocket"
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ingestionMode === 'LIVE' ? '#10b981' : '#94a3b8' }} />
              LIVE
            </button>

            <button
              onClick={() => setIngestionMode('SIMULATION')}
              style={{
                background: ingestionMode === 'SIMULATION' ? '#eff6ff' : 'transparent',
                color: ingestionMode === 'SIMULATION' ? '#2563eb' : 'var(--text-muted)',
                border: ingestionMode === 'SIMULATION' ? '1px solid #bfdbfe' : 'none',
                borderRadius: '16px',
                padding: '0.2rem 0.55rem',
                fontSize: '0.68rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'all 0.2s ease'
              }}
              title="Use deterministic simulation steps and demo dataset"
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: ingestionMode === 'SIMULATION' ? '#2563eb' : '#94a3b8' }} />
              SIM
            </button>
          </div>

          {/* Persistence Layer Status Badge */}
          <div
            className="navbar-persistence-badge"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.2rem 0.55rem',
              borderRadius: '16px',
              background: persistenceStatus?.isLive ? '#d1fae5' : '#eff6ff',
              border: `1px solid ${persistenceStatus?.isLive ? '#6ee7b7' : '#bfdbfe'}`,
              color: persistenceStatus?.isLive ? '#047857' : '#1e40af',
              fontSize: '0.68rem',
              fontWeight: 700
            }}
            title={
              persistenceStatus?.isLive
                ? 'Firebase Firestore live persistence active'
                : 'Firebase environment unconfigured. Operating in deterministic Replay/Simulation fallback mode.'
            }
          >
            <Database size={11} color={persistenceStatus?.isLive ? '#047857' : '#2563eb'} />
            <span>{persistenceStatus?.isLive ? 'FIREBASE LIVE' : 'DEMO FALLBACK'}</span>
          </div>

          <div className="sim-clock-badge navbar-clock-badge" title="Operational Clock">
            <span style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#10b981'
            }} />
            <span>{currentStep.simulatedTime}</span>
          </div>

          {/* Commander Badge */}
          <div className="navbar-commander-badge" style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.35rem 0.6rem',
            borderRadius: '7px',
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.72rem',
            color: 'var(--text-primary)'
          }}>
            <UserCheck size={13} color="#2563eb" />
            <span style={{ fontWeight: 600 }}>Commander</span>
          </div>

          {/* Theme Switcher Toggle Button */}
          <button
            className="navbar-theme-btn"
            onClick={toggleTheme}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '7px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              fontSize: '0.72rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: 'var(--shadow-sm)'
            }}
            title={theme === 'light' ? 'Switch to Dark Tactical Command Theme' : 'Switch to Light Gov-Tech Theme'}
          >
            {theme === 'light' ? (
              <>
                <Sun size={14} color="#d97706" />
                <span className="navbar-theme-label">Light</span>
              </>
            ) : (
              <>
                <Moon size={14} color="#38bdf8" />
                <span className="navbar-theme-label">Dark</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Navigation Tabs — Reframed for BRICS Citizen Development Intelligence */}
      <nav className="nav-tabs" aria-label="Command Views">
        <button
          className={`nav-tab-btn ${activeTab === 'development_map' || activeTab === 'live_map' ? 'active' : ''}`}
          onClick={() => setActiveTab('development_map')}
          title="Where is development demand concentrated? · Geospatial Hotspots"
        >
          <MapPin size={14} />
          <span>Development Map</span>
          {criticalCount > 0 && <span className="nav-tab-badge">{criticalCount}</span>}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'demand_intelligence' || activeTab === 'dossier' ? 'active' : ''}`}
          onClick={() => setActiveTab('demand_intelligence')}
          title="What development need is emerging? · Priority & Context Analysis"
        >
          <ShieldAlert size={14} />
          <span>Demand Intelligence</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'citizen_signals' || activeTab === 'signals' ? 'active' : ''}`}
          onClick={() => setActiveTab('citizen_signals')}
          title="What are citizens asking for? · Voice, Text & Messaging Requests"
        >
          <Activity size={14} />
          <span>Citizen Signals</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'investment_gaps' ? 'active' : ''}`}
          onClick={() => setActiveTab('investment_gaps')}
          title="Where is demand not matched by infrastructure/investment? · Gap Analysis"
        >
          <TrendingUp size={14} />
          <span>Investment Gaps</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'project_priorities' || activeTab === 'dispatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('project_priorities')}
          title="What should policymakers consider? · Candidate Development Projects"
        >
          <Send size={14} />
          <span>Project Priorities</span>
          {pendingDispatchCount > 0 && (
            <span style={{
              background: '#fef3c7',
              color: '#b45309',
              border: '1px solid #fcd34d',
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
          className={`nav-tab-btn ${activeTab === 'policy_board' || activeTab === 'authority' ? 'active' : ''}`}
          onClick={() => setActiveTab('policy_board')}
          title="Where should national/state policymakers focus? · Multi-State Leaderboard"
        >
          <Sparkles size={14} />
          <span>Policy Board</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'impact' || activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('impact')}
          title="Did the intervention reduce the gap? · Development Impact Feedback Loop"
        >
          <CheckCircle2 size={14} />
          <span>Impact</span>
        </button>
      </nav>
    </header>
  );
};
