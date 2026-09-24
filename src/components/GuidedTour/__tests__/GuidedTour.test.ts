import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GUIDED_TOUR_STEPS } from '../guidedTourSteps';
import {
  getTourState,
  markTourCompleted,
  markTourSkipped,
  resetTourState,
  setDontShowAgain
} from '../guidedTourStorage';

const STORAGE_KEY = 'nagarbodh-guided-tour-v1';

// Mock localStorage for Node test environment
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock window event listener dispatch
if (typeof globalThis.window === 'undefined') {
  const listeners: Record<string, Function[]> = {};
  (globalThis as any).window = {
    addEventListener: (event: string, cb: Function) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(cb);
    },
    removeEventListener: (event: string, cb: Function) => {
      if (listeners[event]) {
        listeners[event] = listeners[event].filter((fn) => fn !== cb);
      }
    },
    dispatchEvent: (evt: { type: string }) => {
      if (listeners[evt.type]) {
        listeners[evt.type].forEach((fn) => fn(evt));
      }
      return true;
    }
  };
  (globalThis as any).CustomEvent = class CustomEvent {
    type: string;
    constructor(type: string) {
      this.type = type;
    }
  };
}

describe('Guided Tour Specifications & Configuration', () => {
  it('defines exactly 8 guided tour steps in correct chronological order', () => {
    expect(GUIDED_TOUR_STEPS).toHaveLength(8);

    const stepIds = GUIDED_TOUR_STEPS.map((s) => s.id);
    expect(stepIds).toEqual([
      'welcome',
      'signals',
      'map',
      'hotspot',
      'dossier',
      'investment',
      'human_decision',
      'impact'
    ]);
  });

  it('provides complete step metadata for every step', () => {
    GUIDED_TOUR_STEPS.forEach((step, index) => {
      expect(step.id).toBeDefined();
      expect(step.stepNumber).toBe(index + 1);
      expect(step.totalSteps).toBe(8);
      expect(step.title).toBeTruthy();
      expect(step.description).toBeTruthy();
      expect(step.targetSelector).toBeTruthy();
      expect(step.placement).toBeTruthy();
      expect(step.actionType).toBeTruthy();
    });
  });

  it('maps tour steps to correct navigation tabs', () => {
    expect(GUIDED_TOUR_STEPS[0].targetTab).toBe('development_map');
    expect(GUIDED_TOUR_STEPS[1].targetTab).toBe('citizen_signals');
    expect(GUIDED_TOUR_STEPS[2].targetTab).toBe('development_map');
    expect(GUIDED_TOUR_STEPS[3].targetTab).toBe('development_map');
    expect(GUIDED_TOUR_STEPS[4].targetTab).toBe('development_map');
    expect(GUIDED_TOUR_STEPS[5].targetTab).toBe('investment_gaps');
    expect(GUIDED_TOUR_STEPS[6].targetTab).toBe('project_priorities');
    expect(GUIDED_TOUR_STEPS[7].targetTab).toBe('impact');
  });
});

describe('Guided Tour LocalStorage Persistence Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns unvisited state by default', () => {
    const state = getTourState();
    expect(state).toEqual({
      version: 'v1',
      isCompleted: false,
      isSkipped: false,
      dontShowAgain: false,
      lastStepIndex: 0
    });
  });

  it('handles corrupted JSON in localStorage gracefully', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid_json');
    const state = getTourState();
    expect(state).toEqual({
      version: 'v1',
      isCompleted: false,
      isSkipped: false,
      dontShowAgain: false,
      lastStepIndex: 0
    });
  });

  it('persists completed status accurately', () => {
    markTourCompleted();
    const state = getTourState();
    expect(state.isCompleted).toBe(true);
    expect(state.lastStepIndex).toBe(7);
  });

  it('persists skipped status accurately', () => {
    markTourSkipped();
    const state = getTourState();
    expect(state.isSkipped).toBe(true);
  });

  it('persists dontShowAgain setting accurately', () => {
    setDontShowAgain(true);
    const state = getTourState();
    expect(state.dontShowAgain).toBe(true);
    expect(state.isSkipped).toBe(true);
  });

  it('resets tour state clean when requested', () => {
    markTourCompleted();
    expect(getTourState().isCompleted).toBe(true);

    resetTourState();
    expect(getTourState()).toEqual({
      version: 'v1',
      isCompleted: false,
      isSkipped: false,
      dontShowAgain: false,
      lastStepIndex: 0
    });
  });
});

describe('Guided Tour Event System', () => {
  it('dispatches nagarbodh:restart-tour event cleanly', () => {
    const listener = vi.fn();
    window.addEventListener('nagarbodh:restart-tour', listener);

    window.dispatchEvent(new CustomEvent('nagarbodh:restart-tour'));

    expect(listener).toHaveBeenCalledTimes(1);
    window.removeEventListener('nagarbodh:restart-tour', listener);
  });
});
