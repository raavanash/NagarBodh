import React from 'react';
import { Sparkles, ShieldCheck, AlertCircle, CheckCircle2, FileText } from 'lucide-react';

interface GeminiExplanationCardProps {
  explanation: string;
  confidence?: number;
  sourcesCount?: number;
  modelName?: string;
  auditBlock?: string;
  evidenceBasis?: string[];
  recommendedAction?: string;
  expectedOutcome?: string;
  limitations?: string;
}

export const GeminiExplanationCard: React.FC<GeminiExplanationCardProps> = ({
  explanation,
  confidence = 0.967,
  sourcesCount = 42,
  modelName = 'Google Gemini 1.5 Pro (Public Sector Fine-tuned)',
  auditBlock = '0x9f4a...c12',
  evidenceBasis = ['Multilingual citizen telemetry', 'Sub-surface drainage deficit matrix', 'Demographic vulnerability density'],
  recommendedAction = 'Sanction immediate pre-cast culvert box alignment and automated dewatering array.',
  expectedOutcome = 'Reduces localized flood inundation duration by 78% during peak monsoon events.',
  limitations = 'Subject to final pre-engineering survey and human decision authority sanction.'
}) => {
  return (
    <div className="bg-[var(--bg-surface-elevated)] border border-amber-500/30 rounded-xl p-3.5 flex flex-col gap-3 shadow-xs">
      {/* Explicit AI Attribution Header */}
      <div className="flex items-center justify-between flex-wrap gap-2 pb-2 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <span className="provenance-tag-ai flex items-center gap-1">
            <Sparkles size={11} className="text-amber-500" />
            <span>AI-GENERATED EXPLANATION</span>
          </span>
          <span className="text-[11px] font-bold text-[var(--text-secondary)]">
            Based on NagarBodh Evidence
          </span>
        </div>

        <div className="flex items-center gap-2 text-[10px] font-mono">
          <span className="text-emerald-500 font-bold flex items-center gap-1">
            <ShieldCheck size={12} />
            {(confidence * 100).toFixed(1)}% Confidence
          </span>
          <span className="text-[var(--text-muted)]">• {modelName}</span>
        </div>
      </div>

      {/* Rationale Quote */}
      <div className="text-xs text-[var(--text-primary)] leading-relaxed italic bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-subtle)]">
        "{explanation}"
      </div>

      {/* Structured Analytical Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs pt-1">
        {/* WHY THIS MATTERS */}
        <div className="bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-amber-500 mb-1">
            <AlertCircle size={12} />
            <span>Why This Matters</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-normal">
            Elevated infrastructure deficit interacting with high vulnerable population density.
          </p>
        </div>

        {/* RECOMMENDED ACTION */}
        <div className="bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
          <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-blue-400 mb-1">
            <CheckCircle2 size={12} />
            <span>Recommended Action</span>
          </div>
          <p className="text-[11px] text-[var(--text-secondary)] leading-normal">
            {recommendedAction}
          </p>
        </div>
      </div>

      {/* Evidence & Limitations Footer */}
      <div className="flex items-center justify-between flex-wrap gap-2 text-[10px] font-mono text-[var(--text-muted)] pt-1 border-t border-[var(--border-subtle)]">
        <span className="flex items-center gap-1">
          <FileText size={11} className="text-blue-400" />
          RAG Grounding: <strong>{sourcesCount} Evidence Sources</strong>
        </span>
        <span>Audit Block: <strong>{auditBlock}</strong></span>
        <span className="text-amber-500 font-semibold">{limitations}</span>
      </div>
    </div>
  );
};
