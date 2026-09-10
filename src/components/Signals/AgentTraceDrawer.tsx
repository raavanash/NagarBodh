import React, { useState } from 'react';
import {
  AlertTriangle,
  Bot,
  Brain,
  CheckCircle2,
  Clock,
  Code,
  Eye,
  FileText,
  Lightbulb,
  MapPin,
  ShieldAlert,
  Wrench,
  X
} from 'lucide-react';
import { AgentTrace } from '../../types/agent';

interface AgentTraceDrawerProps {
  trace: AgentTrace | null;
  onClose: () => void;
}

export const AgentTraceDrawer: React.FC<AgentTraceDrawerProps> = ({ trace, onClose }) => {
  const [activeTab, setActiveTab] = useState<'facts' | 'location' | 'tools' | 'json'>('facts');

  if (!trace) return null;

  const out = trace.structuredOutput;
  const facts = out.factSeparation;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 'min(640px, 100vw)',
        maxWidth: '100vw',
        background: 'var(--bg-surface-elevated)',
        borderLeft: '1px solid var(--border-accent)',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.7)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(12px)'
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(15, 23, 42, 0.8)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <Brain size={24} color="var(--cyan-400)" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>Signal Analyst Agent Trace</h3>
              <span
                style={{
                  background: trace.fallbackUsed ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: trace.fallbackUsed ? '#fbbf24' : '#34d399',
                  border: trace.fallbackUsed ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid rgba(16, 185, 129, 0.4)',
                  fontSize: '0.62rem',
                  padding: '0.1rem 0.45rem',
                  borderRadius: '4px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700
                }}
              >
                {trace.fallbackUsed ? 'RULE FALLBACK' : 'LIVE GEMINI 2.0'}
              </span>
            </div>
            <p style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
              Trace ID: <code style={{ color: 'var(--cyan-400)' }}>{trace.id}</code> • Model: {trace.model}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            cursor: 'pointer',
            padding: '0.4rem'
          }}
        >
          <X size={20} />
        </button>
      </div>

      {/* Metrics Banner */}
      <div
        style={{
          padding: '0.75rem 1.5rem',
          background: 'rgba(6, 182, 212, 0.05)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '0.75rem',
          textAlign: 'center'
        }}
      >
        <div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Confidence</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--cyan-400)' }}>
            {(trace.confidence * 100).toFixed(0)}%
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Execution Latency</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#a78bfa' }}>
            {trace.latencyMs} ms
          </div>
        </div>
        <div>
          <div style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Language</div>
          <div style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-mono)', color: '#f472b6' }}>
            {out.language.toUpperCase()}
          </div>
        </div>
      </div>

      {/* API Key Error / Fallback Status Banner */}
      {trace.fallbackUsed && (
        <div
          style={{
            padding: '0.65rem 1.5rem',
            background: 'rgba(245, 158, 11, 0.12)',
            borderBottom: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#fbbf24',
            fontSize: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-mono)'
          }}
        >
          <AlertTriangle size={15} style={{ flexShrink: 0 }} />
          <div>
            <strong>Fallback Notice:</strong> {trace.apiError || 'Using deterministic rule parser engine because no active Gemini API key was provided.'}
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-canvas)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none'
        }}
      >
        {[
          { id: 'facts', label: 'Fact Separation', icon: Eye },
          { id: 'location', label: 'Landmark Candidates', icon: MapPin },
          { id: 'tools', label: 'Tools Consulted', icon: Wrench },
          { id: 'json', label: 'Raw JSON', icon: Code }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              style={{
                flex: '0 0 auto',
                padding: '0.75rem 0.85rem',
                border: 'none',
                background: isActive ? 'var(--bg-surface-elevated)' : 'transparent',
                borderBottom: isActive ? '2px solid var(--cyan-400)' : '2px solid transparent',
                color: isActive ? 'var(--cyan-400)' : 'var(--text-secondary)',
                fontSize: '0.76rem',
                fontWeight: isActive ? 700 : 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.35rem',
                whiteSpace: 'nowrap',
                minHeight: '42px'
              }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div style={{ padding: '1.25rem 1.5rem', flex: 1, overflowY: 'auto' }}>
        {activeTab === 'facts' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {/* OBSERVED Block */}
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.08)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '8px',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <CheckCircle2 size={18} color="#4ade80" />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#4ade80', letterSpacing: '0.05em' }}>
                  1. OBSERVED (Direct Facts & Telemetry)
                </h4>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <strong style={{ color: '#fff' }}>Verbatim Text Quotes:</strong>
                  {facts.OBSERVED.verbatimQuotes.map((q, idx) => (
                    <div key={idx} style={{ padding: '0.4rem 0.6rem', background: 'rgba(0,0,0,0.3)', borderRadius: '4px', marginTop: '0.25rem', fontFamily: 'var(--font-mono)', fontSize: '0.76rem', color: '#e2e8f0' }}>
                      "{q}"
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: '0.25rem' }}>
                  <strong style={{ color: '#fff' }}>Reported Landmark:</strong> {facts.OBSERVED.reportedLocation}
                </div>
              </div>
            </div>

            {/* INFERRED Block */}
            <div
              style={{
                background: 'rgba(168, 85, 247, 0.08)',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                borderRadius: '8px',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <Brain size={18} color="#c084fc" />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#c084fc', letterSpacing: '0.05em' }}>
                  2. INFERRED (AI Urgency & Cause Deduction)
                </h4>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <strong style={{ color: '#fff' }}>Risk Assessment:</strong> {facts.INFERRED.riskAssessment}
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>Estimated Urgency:</strong>{' '}
                  <span style={{ color: '#f87171', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>{facts.INFERRED.estimatedUrgency}</span>
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>Inferred Root Cause:</strong> {facts.INFERRED.inferredRootCause}
                </div>
              </div>
            </div>

            {/* RECOMMENDED Block */}
            <div
              style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '8px',
                padding: '1rem'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.65rem' }}>
                <Lightbulb size={18} color="var(--cyan-400)" />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--cyan-400)', letterSpacing: '0.05em' }}>
                  3. RECOMMENDED (Initial SOP Dispatch Actions)
                </h4>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div>
                  <strong style={{ color: '#fff' }}>Suggested Lead Department:</strong>{' '}
                  <span style={{ color: 'var(--cyan-400)', fontWeight: 700 }}>{facts.RECOMMENDED.suggestedDepartment}</span>
                </div>
                <div>
                  <strong style={{ color: '#fff' }}>Initial Field Actions:</strong>
                  <ul style={{ paddingLeft: '1.2rem', marginTop: '0.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    {facts.RECOMMENDED.initialActions.map((act, idx) => (
                      <li key={idx} style={{ color: '#e2e8f0' }}>{act}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'location' && (
          <div>
            <div style={{ padding: '0.75rem', background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '6px', fontSize: '0.8rem', color: '#93c5fd', marginBottom: '1rem' }}>
              <strong>No Arbitrary Coordinate Invention Rule:</strong> Model outputs landmark candidates and location confidence only. Precise coordinates are matched deterministically by spatial lookup.
            </div>

            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>
              Extracted Landmark Candidates ({out.locationCandidates.length})
            </h4>

            {out.locationCandidates.length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No explicit landmark candidates extracted from text.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {out.locationCandidates.map((cand, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '0.75rem',
                      background: 'var(--bg-surface)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.85rem' }}>{cand.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Type: {cand.type}</div>
                    </div>
                    <span style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--cyan-400)' }}>
                      {(cand.confidence * 100).toFixed(0)}% match
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'tools' && (
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginBottom: '0.75rem' }}>
              Tools & Knowledge Bases Consulted ({trace.toolsOrDataConsulted.length})
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {trace.toolsOrDataConsulted.map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.65rem 0.85rem',
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: '#e2e8f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <Wrench size={14} color="var(--cyan-400)" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'json' && (
          <pre
            style={{
              padding: '1rem',
              background: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              color: '#38bdf8',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.74rem',
              overflowX: 'auto',
              whiteSpace: 'pre-wrap'
            }}
          >
            {JSON.stringify(trace.structuredOutput, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
};
