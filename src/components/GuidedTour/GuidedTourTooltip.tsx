import React, { useLayoutEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Compass, HelpCircle, X } from 'lucide-react';
import { TourStep } from './guidedTourSteps';

interface GuidedTourTooltipProps {
  step: TourStep;
  targetRect: DOMRect | null;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
  isFirstStep: boolean;
  isLastStep: boolean;
}

export const GuidedTourTooltip: React.FC<GuidedTourTooltipProps> = ({
  step,
  targetRect,
  onNext,
  onPrev,
  onSkip,
  isFirstStep,
  isLastStep
}) => {
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 100, left: 100 });
  const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

  useLayoutEffect(() => {
    if (!targetRect || isMobile) return;

    const tooltipWidth = 320;
    const tooltipHeight = 220;
    const gap = 14;

    let top = 100;
    let left = 100;

    switch (step.placement) {
      case 'bottom':
        top = targetRect.bottom + gap;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = targetRect.top - tooltipHeight - gap;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.left - tooltipWidth - gap;
        break;
      case 'right':
        top = targetRect.top + targetRect.height / 2 - tooltipHeight / 2;
        left = targetRect.right + gap;
        break;
      default:
        top = targetRect.bottom + gap;
        left = targetRect.left + targetRect.width / 2 - tooltipWidth / 2;
    }

    // Viewport clamping
    const maxLeft = window.innerWidth - tooltipWidth - 16;
    const maxTop = window.innerHeight - tooltipHeight - 16;

    left = Math.max(16, Math.min(maxLeft, left));
    top = Math.max(16, Math.min(maxTop, top));

    setPosition({ top, left });
  }, [targetRect, step.placement, isMobile]);

  // Mobile Bottom-Sheet Fallback Layout
  if (isMobile) {
    return (
      <div
        className="guided-tour-tooltip-mobile"
        style={{
          position: 'fixed',
          bottom: '0.75rem',
          left: '0.75rem',
          right: '0.75rem',
          zIndex: 9995,
          background: 'var(--bg-surface)',
          border: '1.5px solid var(--border-medium)',
          borderRadius: '14px',
          padding: '1rem',
          boxShadow: '0 -10px 30px rgba(15, 23, 42, 0.3)',
          animation: 'fadeIn 0.2s ease-out',
          color: 'var(--text-primary)'
        }}
      >
        {/* Step Progress Row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', background: 'var(--civic-blue-50)', padding: '0.1rem 0.45rem', borderRadius: 4 }}>
            {step.stepNumber} / {step.totalSteps}
          </span>
          <button
            onClick={onSkip}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700 }}
          >
            Skip Tour
          </button>
        </div>

        <h4 style={{ fontSize: '0.98rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--text-primary)' }}>
          {step.title}
        </h4>

        <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.4, margin: '0 0 0.6rem 0' }}>
          {step.description}
        </p>

        {step.instruction && (
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', padding: '0.35rem 0.65rem', borderRadius: 6, marginBottom: '0.75rem' }}>
            👉 {step.instruction}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
          {!isFirstStep ? (
            <button onClick={onPrev} className="sim-btn" style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}>
              <ArrowLeft size={13} /> Back
            </button>
          ) : <div />}

          <button
            onClick={onNext}
            style={{
              background: '#1e3a8a',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              padding: '0.45rem 0.85rem',
              fontSize: '0.78rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4
            }}
          >
            <span>{step.nextLabel || (isLastStep ? 'EXPLORE NAGARBODH' : 'Next →')}</span>
          </button>
        </div>
      </div>
    );
  }

  // Desktop Floating Tooltip Card Layout
  return (
    <div
      className="guided-tour-tooltip-desktop"
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9995,
        width: 320,
        background: 'var(--bg-surface)',
        border: '1.5px solid var(--border-medium)',
        borderRadius: '12px',
        padding: '1rem',
        boxShadow: '0 12px 35px rgba(15, 23, 42, 0.28)',
        animation: 'mapCardIn 0.2s ease-out',
        color: 'var(--text-primary)',
        backdropFilter: 'blur(16px)'
      }}
    >
      {/* Step Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.45rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', fontWeight: 800, color: '#2563eb', background: 'var(--civic-blue-50)', border: '1px solid var(--border-subtle)', padding: '0.1rem 0.45rem', borderRadius: 4 }}>
            {step.stepNumber} / {step.totalSteps}
          </span>
          {/* Progress dots */}
          <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
            {Array.from({ length: step.totalSteps }).map((_, i) => (
              <span
                key={i}
                style={{
                  width: i + 1 === step.stepNumber ? 6 : 4,
                  height: i + 1 === step.stepNumber ? 6 : 4,
                  borderRadius: '50%',
                  background: i + 1 === step.stepNumber ? '#2563eb' : i < step.stepNumber ? '#059669' : 'var(--border-medium)',
                  transition: 'all 0.15s ease'
                }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={onSkip}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.68rem', fontWeight: 700, padding: 2 }}
          title="Skip Guided Tour"
        >
          Skip Tour
        </button>
      </div>

      {/* Completion Header (if on step 8) */}
      {step.completionTitle ? (
        <div style={{ marginBottom: '0.35rem' }}>
          <div style={{ fontSize: '1.1rem', fontWeight: 900, color: '#1e3a8a', letterSpacing: '-0.02em' }}>
            {step.completionTitle}
          </div>
          <div style={{ fontSize: '0.72rem', color: '#0284c7', fontWeight: 700 }}>
            {step.completionSubtext}
          </div>
        </div>
      ) : (
        <h4 style={{ fontSize: '0.96rem', fontWeight: 800, margin: '0 0 0.35rem 0', color: 'var(--text-primary)', lineHeight: 1.25 }}>
          {step.title}
        </h4>
      )}

      <p style={{ fontSize: '0.76rem', color: 'var(--text-secondary)', lineHeight: 1.45, margin: '0 0 0.65rem 0' }}>
        {step.description}
      </p>

      {step.instruction && (
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: '#0284c7', background: '#e0f2fe', border: '1px solid #bae6fd', padding: '0.35rem 0.65rem', borderRadius: 6, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span>👉</span>
          <span>{step.instruction}</span>
        </div>
      )}

      {/* Action Controls Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.55rem' }}>
        {!isFirstStep ? (
          <button
            onClick={onPrev}
            className="sim-btn"
            style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem' }}
          >
            <ArrowLeft size={12} />
            <span>Back</span>
          </button>
        ) : <div />}

        <button
          onClick={onNext}
          style={{
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            borderRadius: 6,
            padding: '0.45rem 0.85rem',
            fontSize: '0.76rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            boxShadow: '0 2px 6px rgba(30, 58, 138, 0.25)'
          }}
        >
          <span>{step.nextLabel || (isLastStep ? 'EXPLORE NAGARBODH' : 'Next →')}</span>
        </button>
      </div>
    </div>
  );
};
