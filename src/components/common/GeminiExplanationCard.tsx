import React from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface GeminiExplanationCardProps {
  explanation: string;
  confidence?: number;
  sourcesCount?: number;
  modelName?: string;
  auditBlock?: string;
}

export const GeminiExplanationCard: React.FC<GeminiExplanationCardProps> = ({
  explanation,
  confidence = 0.967,
  sourcesCount = 42,
  modelName = 'Google Gemini 1.5 Pro (Public Sector Fine-tuned)',
  auditBlock = '0x9f4a...c12'
}) => {
  return (
    <div
      style={{
        background: 'rgba(6, 182, 212, 0.08)',
        border: '1px solid rgba(6, 182, 212, 0.3)',
        borderRadius: '8px',
        padding: '0.85rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.4rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--cyan-400)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          <Sparkles size={14} />
          <span>Explainable AI Policy Rationale ({modelName})</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.66rem', fontFamily: 'var(--font-mono)' }}>
          <span style={{ color: '#059669', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
            <ShieldCheck size={12} />
            {(confidence * 100).toFixed(1)}% Confidence
          </span>
          <span style={{ color: 'var(--text-muted)' }}>• Zero-Drift Certified</span>
        </div>
      </div>

      <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45, fontStyle: 'italic', background: 'var(--bg-surface)', padding: '0.65rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
        "{explanation}"
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
        <span>RAG Grounding: <strong>{sourcesCount} Ward Records</strong></span>
        <span>Audit Block: <strong>{auditBlock}</strong></span>
      </div>
    </div>
  );
};
