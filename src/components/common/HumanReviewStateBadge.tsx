import React from 'react';
import { UserCheck, ShieldAlert, CheckCircle2, Edit3, XCircle } from 'lucide-react';

export type ReviewState = 'pending_policy_review' | 'human_review_required' | 'ai_recommendation' | 'approved' | 'modified' | 'rejected';

interface HumanReviewStateBadgeProps {
  state: ReviewState | string;
  approvedBy?: string;
  compact?: boolean;
}

export const HumanReviewStateBadge: React.FC<HumanReviewStateBadgeProps> = ({
  state,
  approvedBy,
  compact = false
}) => {
  const normState = (state || 'pending_policy_review').toLowerCase();

  let bg = 'rgba(217, 119, 6, 0.15)';
  let color = '#d97706';
  let border = '1px solid #fcd34d';
  let Icon = ShieldAlert;
  let text = 'HUMAN REVIEW REQUIRED';

  if (normState === 'approved') {
    bg = 'rgba(5, 150, 105, 0.15)';
    color = '#059669';
    border = '1px solid #6ee7b7';
    Icon = CheckCircle2;
    text = approvedBy ? `APPROVED BY ${approvedBy.toUpperCase()}` : 'APPROVED BY POLICYMAKER';
  } else if (normState === 'modified') {
    bg = 'rgba(2, 132, 199, 0.15)';
    color = '#0284c7';
    border = '1px solid #93c5fd';
    Icon = Edit3;
    text = 'MODIFIED BY POLICYMAKER';
  } else if (normState === 'rejected') {
    bg = 'rgba(220, 38, 38, 0.15)';
    color = '#dc2626';
    border = '1px solid #fca5a5';
    Icon = XCircle;
    text = 'REJECTED / RECALIBRATE';
  } else if (normState === 'ai_recommendation' || normState.includes('ai')) {
    bg = 'rgba(124, 58, 237, 0.15)';
    color = '#7c3aed';
    border = '1px solid #c4b5fd';
    Icon = UserCheck;
    text = 'AI-ASSISTED RECOMMENDATION';
  }

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        padding: compact ? '0.15rem 0.45rem' : '0.25rem 0.6rem',
        borderRadius: '6px',
        background: bg,
        color: color,
        border: border,
        fontSize: compact ? '0.65rem' : '0.72rem',
        fontWeight: 800,
        fontFamily: 'var(--font-mono)',
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
        whiteSpace: 'nowrap'
      }}
    >
      <Icon size={compact ? 12 : 14} />
      <span>{text}</span>
    </span>
  );
};
