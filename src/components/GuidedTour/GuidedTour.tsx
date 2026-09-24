import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useCivic } from '../../context/CivicContext';
import { GuidedTourOverlay } from './GuidedTourOverlay';
import { GuidedTourTooltip } from './GuidedTourTooltip';
import { GuidedTourWelcomeOverlay } from './GuidedTourWelcomeOverlay';
import { GUIDED_TOUR_STEPS, TourStep } from './guidedTourSteps';
import {
  getTourState,
  markTourCompleted,
  markTourSkipped,
  resetTourState,
  saveTourState,
  setDontShowAgain
} from './guidedTourStorage';

export const GuidedTour: React.FC = () => {
  const { activeTab, setActiveTab, selectedIncidentId, incidents, setSelectedIncidentId } = useCivic();

  const [showWelcome, setShowWelcome] = useState<boolean>(false);
  const [isTourActive, setIsTourActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [showSkipConfirm, setShowSkipConfirm] = useState<boolean>(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const currentStep: TourStep = GUIDED_TOUR_STEPS[currentStepIndex] || GUIDED_TOUR_STEPS[0];

  // Initial load: Check localStorage on mount
  useEffect(() => {
    const state = getTourState();
    if (!state.isCompleted && !state.dontShowAgain && !state.isSkipped) {
      // Delay slightly for initial render
      const timer = setTimeout(() => setShowWelcome(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen for global restart tour events (triggered by Navbar Help button)
  useEffect(() => {
    const handleRestartEvent = () => {
      resetTourState();
      setShowWelcome(false);
      setCurrentStepIndex(0);
      setIsTourActive(true);
      setShowSkipConfirm(false);
    };

    window.addEventListener('nagarbodh:restart-tour', handleRestartEvent);
    return () => window.removeEventListener('nagarbodh:restart-tour', handleRestartEvent);
  }, []);

  // Start Tour
  const handleStartTour = () => {
    setShowWelcome(false);
    setCurrentStepIndex(0);
    setIsTourActive(true);
    saveTourState({ lastStepIndex: 0 });
    if (GUIDED_TOUR_STEPS[0].targetTab) {
      setActiveTab(GUIDED_TOUR_STEPS[0].targetTab as any);
    }
  };

  // Skip Tour
  const handleSkipClick = () => {
    setShowSkipConfirm(true);
  };

  const handleConfirmSkip = () => {
    setShowSkipConfirm(false);
    setIsTourActive(false);
    setShowWelcome(false);
    markTourSkipped();
  };

  // Close Tour (Explore on own)
  const handleExploreOnOwn = (dontShowAgainChecked: boolean) => {
    setShowWelcome(false);
    setIsTourActive(false);
    if (dontShowAgainChecked) {
      setDontShowAgain(true);
    }
  };

  // Step Navigation Handlers
  const handleNextStep = useCallback(() => {
    if (currentStepIndex < GUIDED_TOUR_STEPS.length - 1) {
      const nextIdx = currentStepIndex + 1;
      setCurrentStepIndex(nextIdx);
      saveTourState({ lastStepIndex: nextIdx });

      const nextStep = GUIDED_TOUR_STEPS[nextIdx];
      if (nextStep && nextStep.targetTab && activeTab !== nextStep.targetTab) {
        setActiveTab(nextStep.targetTab as any);
      }
    } else {
      // Tour Completed
      setIsTourActive(false);
      markTourCompleted();
    }
  }, [currentStepIndex, activeTab, setActiveTab]);

  const handlePrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      const prevIdx = currentStepIndex - 1;
      setCurrentStepIndex(prevIdx);
      saveTourState({ lastStepIndex: prevIdx });

      const prevStep = GUIDED_TOUR_STEPS[prevIdx];
      if (prevStep && prevStep.targetTab && activeTab !== prevStep.targetTab) {
        setActiveTab(prevStep.targetTab as any);
      }
    }
  }, [currentStepIndex, activeTab, setActiveTab]);

  // Observer Effect: Auto-advance on interactive user actions
  useEffect(() => {
    if (!isTourActive) return;

    // Step 4 (HOTSPOT): Auto-advance when user selects a hotspot
    if (currentStep.id === 'hotspot' && selectedIncidentId) {
      handleNextStep();
    }
  }, [isTourActive, currentStep.id, selectedIncidentId, handleNextStep]);

  // Bounds Recalculator Effect
  const updateTargetBounds = useCallback(() => {
    if (!isTourActive || !currentStep) {
      setTargetRect(null);
      return;
    }

    let el: Element | null = document.querySelector(currentStep.targetSelector);

    // Fallback selectors for specific steps if primary selector is rendering
    if (!el && currentStep.id === 'hotspot') {
      el = document.querySelector('.pulse-cluster-marker') || document.querySelector('.cluster-custom-div');
    } else if (!el && currentStep.id === 'dossier') {
      el = document.querySelector('[data-tour="open-dossier-btn"]') || document.querySelector('.map-floating-context-card button');
    }

    if (el) {
      const rect = el.getBoundingClientRect();
      setTargetRect(rect);
    } else {
      setTargetRect(null);
    }
  }, [isTourActive, currentStep]);

  useEffect(() => {
    updateTargetBounds();

    const interval = setInterval(updateTargetBounds, 300);
    window.addEventListener('resize', updateTargetBounds);
    window.addEventListener('scroll', updateTargetBounds, true);

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', updateTargetBounds);
      window.removeEventListener('scroll', updateTargetBounds, true);
    };
  }, [updateTargetBounds, currentStepIndex, activeTab]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showWelcome) {
          setShowWelcome(false);
        } else if (isTourActive) {
          setShowSkipConfirm(true);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showWelcome, isTourActive]);

  return (
    <>
      {/* First Visit Welcome Modal */}
      {showWelcome && (
        <GuidedTourWelcomeOverlay
          onStartTour={handleStartTour}
          onExploreOnOwn={handleExploreOnOwn}
        />
      )}

      {/* Active Guided Tour Overlays */}
      {isTourActive && (
        <>
          <GuidedTourOverlay
            targetRect={targetRect}
            onOverlayClick={() => {
              // Clicking background backdrop does not break tour
            }}
          />

          <GuidedTourTooltip
            step={currentStep}
            targetRect={targetRect}
            onNext={handleNextStep}
            onPrev={handlePrevStep}
            onSkip={handleSkipClick}
            isFirstStep={currentStepIndex === 0}
            isLastStep={currentStepIndex === GUIDED_TOUR_STEPS.length - 1}
          />
        </>
      )}

      {/* Skip Confirmation Dialog */}
      {showSkipConfirm && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 10000,
            background: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '360px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-medium)',
              borderRadius: '12px',
              padding: '1.25rem',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
              color: 'var(--text-primary)'
            }}
          >
            <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '0 0 0.4rem 0' }}>
              Skip the guided journey?
            </h4>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: '0 0 1rem 0' }}>
              You can restart the tour anytime by clicking the Help button in the navigation header.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setShowSkipConfirm(false)}
                className="sim-btn"
                style={{ fontSize: '0.74rem', padding: '0.35rem 0.65rem' }}
              >
                Continue Tour
              </button>
              <button
                onClick={handleConfirmSkip}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '0.35rem 0.75rem',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
