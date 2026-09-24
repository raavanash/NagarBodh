import React, { useState } from 'react';
import { Compass, Sparkles, X } from 'lucide-react';

interface GuidedTourWelcomeOverlayProps {
  onStartTour: () => void;
  onExploreOnOwn: (dontShowAgain: boolean) => void;
}

export const GuidedTourWelcomeOverlay: React.FC<GuidedTourWelcomeOverlayProps> = ({
  onStartTour,
  onExploreOnOwn
}) => {
  const [dontShowAgain, setDontShowAgainState] = useState(false);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '460px',
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border-medium)',
          borderRadius: '14px',
          padding: '1.5rem',
          boxShadow: '0 20px 50px rgba(15, 23, 42, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          color: 'var(--text-primary)'
        }}
      >
        {/* Header Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#2563eb', background: 'var(--civic-blue-50)', padding: '0.2rem 0.55rem', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
            <Compass size={14} color="#2563eb" />
            <span>NagarBodh Guided Journey</span>
          </div>

          <button
            onClick={() => onExploreOnOwn(dontShowAgain)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}
            title="Close Welcome"
          >
            <X size={16} />
          </button>
        </div>

        <div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: '0 0 0.35rem 0', color: 'var(--text-primary)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
            WELCOME TO NAGARBODH
          </h3>
          <p style={{ fontSize: '0.86rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: 0 }}>
            See how citizen signals become evidence-backed civic decisions.
          </p>
        </div>

        <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 8, padding: '0.75rem 0.9rem', fontSize: '0.75rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
          Take a 2-minute interactive walk through our spatial intelligence pipeline: intake raw reports, isolate demand hotspots, inspect auditable evidence, and ground municipal capital investments.
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <button
            onClick={onStartTour}
            style={{
              width: '100%',
              padding: '0.7rem 1rem',
              background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 8,
              fontSize: '0.86rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              boxShadow: '0 4px 14px rgba(30, 58, 138, 0.3)'
            }}
          >
            <Sparkles size={16} />
            <span>START GUIDED JOURNEY</span>
          </button>

          <button
            onClick={() => onExploreOnOwn(dontShowAgain)}
            style={{
              width: '100%',
              padding: '0.6rem 1rem',
              background: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-medium)',
              borderRadius: 8,
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            EXPLORE ON MY OWN
          </button>
        </div>

        {/* Don't show again checkbox */}
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.72rem', color: 'var(--text-muted)', cursor: 'pointer', paddingTop: '0.2rem' }}>
          <input
            type="checkbox"
            checked={dontShowAgain}
            onChange={e => setDontShowAgainState(e.target.checked)}
            style={{ accentColor: '#2563eb', cursor: 'pointer' }}
          />
          <span>Don't show this again</span>
        </label>
      </div>
    </div>
  );
};
