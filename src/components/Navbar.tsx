import React from 'react';
import {
  Activity,
  AlertTriangle,
  Building2,
  Globe2,
  MapPin,
  Send,
  ShieldAlert,
  Sparkles,
  UserCheck
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    currentStep,
    incidents
  } = useCivic();

  const criticalCount = incidents.filter(i => i.priority.overallScore >= 80).length;
  const pendingDispatchCount = incidents.filter(i => i.actionPlan?.status === 'pending_review' && i.priority.overallScore >= 70).length;

  return (
    <header className="navbar">
      {/* Brand & City Selector */}
      <div className="brand-section">
        <div className="logo-badge">
          <Globe2 size={20} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', whiteSpace: 'nowrap' }}>
            <h1 className="brand-title">NagarBodh</h1>
            <span style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--cyan-400)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              fontSize: '0.6rem',
              padding: '0.1rem 0.35rem',
              borderRadius: '4px',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700
            }}>
              MUNICIPAL OS
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
            <Building2 size={11} color="var(--cyan-400)" />
            <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Delhi NCR Command</span>
            <span>•</span>
            <span style={{ color: '#34d399', fontWeight: 700 }}>99.8% Health</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="nav-tabs" aria-label="Command Views">
        <button
          className={`nav-tab-btn ${activeTab === 'live_map' ? 'active' : ''}`}
          onClick={() => setActiveTab('live_map')}
        >
          <MapPin size={14} />
          <span>Live Map</span>
          {criticalCount > 0 && <span className="nav-tab-badge">{criticalCount}</span>}
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'dossier' ? 'active' : ''}`}
          onClick={() => setActiveTab('dossier')}
        >
          <ShieldAlert size={14} />
          <span>Incident Intelligence</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'signals' ? 'active' : ''}`}
          onClick={() => setActiveTab('signals')}
        >
          <Activity size={14} />
          <span>Signal Explorer</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'dispatch' ? 'active' : ''}`}
          onClick={() => setActiveTab('dispatch')}
        >
          <Send size={14} />
          <span>Response Planner</span>
          {pendingDispatchCount > 0 && (
            <span style={{
              background: 'rgba(245, 158, 11, 0.25)',
              color: 'var(--amber-400)',
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
        >
          <Sparkles size={14} />
          <span>Authority Board</span>
        </button>

        <button
          className={`nav-tab-btn ${activeTab === 'timeline' ? 'active' : ''}`}
          onClick={() => setActiveTab('timeline')}
        >
          <AlertTriangle size={14} />
          <span>Resolution Verification</span>
        </button>
      </nav>

      {/* Right User & Operational Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <div className="sim-clock-badge" title="Operational Clock">
          <span style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: '#10b981'
          }} />
          <span>{currentStep.simulatedTime}</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.35rem',
          padding: '0.35rem 0.6rem',
          borderRadius: '7px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-subtle)',
          fontSize: '0.72rem',
          color: 'var(--text-secondary)'
        }}>
          <UserCheck size={13} color="var(--cyan-400)" />
          <span style={{ fontWeight: 600 }}>Commander</span>
        </div>
      </div>
    </header>
  );
};
