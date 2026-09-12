import React from 'react';
import { MapPin, ShieldAlert, Mic, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const MobileBottomNav: React.FC = () => {
  const { activeTab, setActiveTab, incidents } = useCivic();

  const criticalCount = incidents.filter(i => i.priority.overallScore >= 80).length;

  return (
    <nav
      className="mobile-bottom-nav"
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
      {/* 1. Map */}
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
          fontSize: '0.65rem',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        <MapPin size={18} />
        <span>Map</span>
      </button>

      {/* 2. Hotspots */}
      <button
        onClick={() => setActiveTab('demand_intelligence')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          background: 'none',
          border: 'none',
          color: activeTab === 'demand_intelligence' || activeTab === 'dossier' ? 'var(--civic-blue-600)' : 'var(--text-muted)',
          fontSize: '0.65rem',
          fontWeight: 700,
          cursor: 'pointer',
          position: 'relative'
        }}
      >
        <ShieldAlert size={18} />
        <span>Hotspots</span>
        {criticalCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '2px',
              right: '25%',
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
          width: '44px',
          height: '44px',
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
        <Mic size={22} />
      </button>

      {/* 4. Policy Board */}
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
          fontSize: '0.65rem',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        <Sparkles size={18} />
        <span>Policy</span>
      </button>

      {/* 5. Impact */}
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
          fontSize: '0.65rem',
          fontWeight: 700,
          cursor: 'pointer'
        }}
      >
        <CheckCircle2 size={18} />
        <span>Impact</span>
      </button>
    </nav>
  );
};
