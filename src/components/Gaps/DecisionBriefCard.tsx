import React from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  DollarSign,
  FileCheck,
  Layers,
  MapPin,
  Shield,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  X
} from 'lucide-react';
import { GroundedDecisionBriefOutput } from '../../types/decisionBrief';
import { ProvenanceBadge } from '../Evidence/ExpandableEvidenceUI';

interface Props {
  brief: GroundedDecisionBriefOutput;
  onPrioritize?: () => void;
  onClose?: () => void;
}

export const DecisionBriefCard: React.FC<Props> = ({
  brief,
  onPrioritize,
  onClose
}) => {
  const isGemini = brief.model === 'GEMINI';

  return (
    <div
      style={{
        background: 'var(--bg-canvas)',
        border: `1px solid ${isGemini ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
        borderRadius: '12px',
        padding: '1.25rem',
        boxShadow: 'var(--shadow-md)',
        marginBottom: '1.5rem',
        animation: 'fadeIn 0.25s ease-out'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border-subtle)',
          paddingBottom: '0.85rem',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              background: isGemini ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isGemini ? '#10b981' : '#f59e0b'
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                Executive Decision Brief
              </h3>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '4px',
                  background: isGemini ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: isGemini ? '#10b981' : '#d97706',
                  border: `1px solid ${isGemini ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                }}
              >
                {brief.model === 'GEMINI' ? '✨ GOOGLE GEMINI 2.0 FLASH' : '⚙️ DETERMINISTIC FALLBACK'}
              </span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              {brief.modelIdentifier} • Generated {new Date(brief.generatedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <ProvenanceBadge label="[DECISION BRIEF]" type="recommended" />
          {onClose && (
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Close Decision Brief"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Grounding & Integrity Statement */}
      <div
        style={{
          padding: '0.6rem 0.85rem',
          borderRadius: '8px',
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          fontSize: '0.74rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.45,
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}
      >
        <Shield size={16} color="#6366f1" style={{ flexShrink: 0 }} />
        <div>
          <strong>AI GROUNDING & NUMERICAL INTEGRITY:</strong> Every numerical score, budget figure, and population metric in this brief is strictly anchored to NagarBodh's deterministic calculation engines. AI is bounded to evidence synthesis and decision explanation—numerical truth is never hallucinated.
        </div>
      </div>

      {/* Warning if validation fallback occurred */}
      {brief.validationWarnings && brief.validationWarnings.length > 0 && (
        <div
          style={{
            padding: '0.6rem 0.85rem',
            borderRadius: '8px',
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            fontSize: '0.72rem',
            color: '#ef4444',
            marginBottom: '1rem'
          }}
        >
          <strong>Safety Guardrail Engaged:</strong> Substitution made with deterministic verified brief due to validation warnings: {brief.validationWarnings.join(', ')}
        </div>
      )}

      {/* 8-Section Structured Brief Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {brief.sections.map((sec, idx) => (
          <div
            key={sec.title}
            style={{
              background: 'var(--bg-surface)',
              borderRadius: '8px',
              padding: '0.85rem 1rem',
              border: '1px solid var(--border-subtle)',
              borderLeft: `3px solid ${
                sec.title === 'PROBLEM' ? '#ef4444' :
                sec.title === 'WHY IT MATTERS' ? '#f59e0b' :
                sec.title === 'EVIDENCE' ? '#0284c7' :
                sec.title === 'RECOMMENDATION' ? '#2563eb' :
                sec.title === 'CAPITAL REQUIREMENT' ? '#d97706' :
                sec.title === 'EXPECTED / PROJECTED OUTCOME' ? '#059669' :
                sec.title === 'CAVEATS' ? '#64748b' : '#10b981'
              }`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: 'var(--bg-canvas)',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.65rem',
                    fontWeight: 800
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ fontSize: '0.74rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '0.03em' }}>
                  {sec.title}
                </span>
              </div>
              <ProvenanceBadge label={`[${sec.provenanceBadge}]`} />
            </div>

            <div
              style={{
                fontSize: '0.78rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.5,
                marginTop: '0.2rem'
              }}
            >
              {sec.content}
            </div>
          </div>
        ))}
      </div>

      {/* Compact Evidence Basis Bar */}
      <div
        style={{
          marginTop: '1.25rem',
          padding: '0.75rem',
          background: 'var(--bg-surface-elevated)',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          {brief.evidenceBasisSummary.map((item) => (
            <div key={item.label} style={{ fontSize: '0.72rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>{item.label}: </span>
              <strong style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{item.value}</strong>
              <span style={{ fontSize: '0.65rem', color: '#6366f1', marginLeft: '4px' }}>{item.badge}</span>
            </div>
          ))}
        </div>

        {onPrioritize && (
          <button
            onClick={onPrioritize}
            style={{
              padding: '0.45rem 0.95rem',
              borderRadius: '6px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <span>Prioritize in Pipeline</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
};
