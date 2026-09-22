import React from 'react';
import { MapPin, TrendingUp, Mic, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, incidents } = useCivic();

  const criticalCount = incidents.filter(i => i.priority.overallScore >= 80).length;

  return (
    <nav
      className="mobile-bottom-nav md:hidden"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '56px',
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border-medium)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        zIndex: 2000,
        boxShadow: '0 -4px 12px rgba(15, 23, 42, 0.08)'
      }}
    >
      {/* 1. Civic Investment Board */}
      <button
        onClick={() => setActiveTab('investment_gaps')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          background: 'none',
          border: 'none',
          color: activeTab === 'investment_gaps' ? 'var(--civic-blue-600)' : 'var(--text-muted)',
          fontSize: '0.62rem',
          fontWeight: 700,
          cursor: 'pointer'
        }}
        title="Civic Investment Board"
      >
        <TrendingUp size={17} />
        <span>Invest</span>
      </button>

      {/* 2. Development Map */}
      <button
        onClick={() => setActiveTab('development_map')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          background: 'none',
          border: 'none',
          color: activeTab === 'development_map' || activeTab === 'live_map' ? 'var(--civic-blue-600)' : 'var(--text-muted)',
          fontSize: '0.62rem',
          fontWeight: 700,
          cursor: 'pointer',
          position: 'relative'
        }}
        title="Development Demand Map"
      >
        <MapPin size={17} />
        <span>Map</span>
        {criticalCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '1px',
              right: '20%',
              background: '#dc2626',
              color: '#fff',
              fontSize: '0.55rem',
              borderRadius: '999px',
              width: '14px',
              height: '14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800
            }}
          >
            {criticalCount}
          </span>
        )}
      </button>

      {/* 3. Voice Ingest (Elevated Center Button) */}
      <button
        onClick={() => setActiveTab('citizen_signals')}
        style={{
          width: '42px',
          height: '42px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
          border: '2px solid #fff',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 10px rgba(37, 99, 235, 0.4)',
          cursor: 'pointer',
          marginTop: '-12px'
        }}
        title="Voice & Citizen Ingestion"
      >
        <Mic size={20} />
      </button>

      {/* 4. Priority Leaderboard */}
      <button
        onClick={() => setActiveTab('policy_board')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          background: 'none',
          border: 'none',
          color: activeTab === 'policy_board' || activeTab === 'authority' ? 'var(--civic-blue-600)' : 'var(--text-muted)',
          fontSize: '0.62rem',
          fontWeight: 700,
          cursor: 'pointer'
        }}
        title="Priority Leaderboard"
      >
        <Sparkles size={17} />
        <span>Board</span>
      </button>

      {/* 5. Impact Measurement */}
      <button
        onClick={() => setActiveTab('impact')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          background: 'none',
          border: 'none',
          color: activeTab === 'impact' || activeTab === 'timeline' ? 'var(--civic-blue-600)' : 'var(--text-muted)',
          fontSize: '0.62rem',
          fontWeight: 700,
          cursor: 'pointer'
        }}
        title="Impact Measurement"
      >
        <CheckCircle2 size={17} />
        <span>Impact</span>
      </button>
    </nav>
  );
};
