import React from 'react';
import { MapPin, TrendingUp, Send, CheckCircle2 } from 'lucide-react';
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
      {/* 1. Civic Investment Board (Invest) */}
      <button
        onClick={() => setActiveTab('investment_gaps')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          background: 'none',
          border: 'none',
          color: activeTab === 'investment_gaps' ? '#1d4ed8' : 'var(--text-muted)',
          fontSize: '0.68rem',
          fontWeight: activeTab === 'investment_gaps' ? 800 : 600,
          cursor: 'pointer'
        }}
        title="Civic Investment Board (Where should we intervene?)"
      >
        <TrendingUp size={19} />
        <span>Invest</span>
      </button>

      {/* 2. Map Lens (Map) */}
      <button
        onClick={() => setActiveTab('development_map')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          background: 'none',
          border: 'none',
          color: activeTab === 'development_map' || activeTab === 'live_map' ? '#1d4ed8' : 'var(--text-muted)',
          fontSize: '0.68rem',
          fontWeight: activeTab === 'development_map' || activeTab === 'live_map' ? 800 : 600,
          cursor: 'pointer',
          position: 'relative'
        }}
        title="Map Lens (Where is the problem?)"
      >
        <MapPin size={19} />
        <span>Map</span>
        {criticalCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-2px',
              right: '25%',
              background: '#dc2626',
              color: '#fff',
              fontSize: '0.55rem',
              borderRadius: '999px',
              width: '15px',
              height: '15px',
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

      {/* 3. Decision & Approvals Pipeline (Decide) */}
      <button
        onClick={() => setActiveTab('project_priorities')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          background: 'none',
          border: 'none',
          color: activeTab === 'project_priorities' || activeTab === 'dispatch' ? '#1d4ed8' : 'var(--text-muted)',
          fontSize: '0.68rem',
          fontWeight: activeTab === 'project_priorities' || activeTab === 'dispatch' ? 800 : 600,
          cursor: 'pointer',
          position: 'relative'
        }}
        title="Decision & Approvals Pipeline (What intervention are we authorizing?)"
      >
        <Send size={19} />
        <span>Decide</span>
      </button>

      {/* 4. Impact Verification (Impact) */}
      <button
        onClick={() => setActiveTab('impact')}
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '3px',
          background: 'none',
          border: 'none',
          color: activeTab === 'impact' || activeTab === 'timeline' ? '#1d4ed8' : 'var(--text-muted)',
          fontSize: '0.68rem',
          fontWeight: activeTab === 'impact' || activeTab === 'timeline' ? 800 : 600,
          cursor: 'pointer'
        }}
        title="Impact Verification (What outcome did the intervention produce / project?)"
      >
        <CheckCircle2 size={19} />
        <span>Impact</span>
      </button>
    </nav>
  );
};
