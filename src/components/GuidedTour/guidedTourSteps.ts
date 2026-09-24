export type TourActionType = 'informational' | 'click' | 'navigation' | 'selection';

export interface TourStep {
  id: string;
  stepNumber: number;
  totalSteps: number;
  targetSelector: string;
  title: string;
  description: string;
  instruction?: string;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
  actionType: TourActionType;
  targetTab?: string;
  nextLabel?: string;
  prevLabel?: string;
  completionTitle?: string;
  completionSubtext?: string;
}

export const GUIDED_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    stepNumber: 1,
    totalSteps: 8,
    targetSelector: '[data-tour="brand"]',
    title: 'Welcome to NagarBodh',
    description: 'NagarBodh connects citizen signals, spatial intelligence and public investment decisions in one civic intelligence system.',
    placement: 'bottom',
    actionType: 'informational',
    targetTab: 'development_map',
    nextLabel: 'START'
  },
  {
    id: 'signals',
    stepNumber: 2,
    totalSteps: 8,
    targetSelector: '[data-tour="nav-signals"]',
    title: 'Start with citizen signals',
    description: 'NagarBodh brings together civic signals from citizens and public sources to identify what is happening on the ground.',
    instruction: 'Click Citizen Signals to view intake.',
    placement: 'bottom',
    actionType: 'navigation',
    targetTab: 'citizen_signals'
  },
  {
    id: 'map',
    stepNumber: 3,
    totalSteps: 8,
    targetSelector: '[data-tour="nav-map"]',
    title: 'See where the problem is happening',
    description: 'Signals become spatial intelligence. The map reveals clusters, hotspots, infrastructure and affected areas.',
    placement: 'bottom',
    actionType: 'navigation',
    targetTab: 'development_map'
  },
  {
    id: 'hotspot',
    stepNumber: 4,
    totalSteps: 8,
    targetSelector: '[data-tour="map-hotspot-cluster"]',
    title: 'Investigate a hotspot',
    description: 'Select a hotspot to understand how individual signals combine into a larger civic problem.',
    instruction: 'Click the highlighted hotspot.',
    placement: 'top',
    actionType: 'selection',
    targetTab: 'development_map'
  },
  {
    id: 'dossier',
    stepNumber: 5,
    totalSteps: 8,
    targetSelector: '[data-tour="open-dossier-btn"]',
    title: 'Understand the evidence',
    description: 'NagarBodh connects citizen reports with location, infrastructure and contextual evidence to explain why this problem matters.',
    instruction: 'Open the Evidence Dossier.',
    placement: 'right',
    actionType: 'click',
    targetTab: 'development_map'
  },
  {
    id: 'investment',
    stepNumber: 6,
    totalSteps: 8,
    targetSelector: '[data-tour="nav-invest"]',
    title: 'Turn evidence into an investment decision',
    description: 'The Investment Board identifies infrastructure gaps and explains why an intervention deserves attention.',
    placement: 'bottom',
    actionType: 'navigation',
    targetTab: 'investment_gaps'
  },
  {
    id: 'human_decision',
    stepNumber: 7,
    totalSteps: 8,
    targetSelector: '[data-tour="nav-decide"]',
    title: 'Keep the decision human',
    description: 'AI can organize and explain evidence, but public investment remains under human authority.',
    placement: 'bottom',
    actionType: 'informational',
    targetTab: 'project_priorities',
    nextLabel: 'Continue'
  },
  {
    id: 'impact',
    stepNumber: 8,
    totalSteps: 8,
    targetSelector: '[data-tour="nav-impact"]',
    title: 'Close the loop',
    description: 'NagarBodh tracks what happens after a decision — from implementation to expected and verified outcomes.',
    placement: 'bottom',
    actionType: 'informational',
    targetTab: 'impact',
    completionTitle: "That's NagarBodh.",
    completionSubtext: 'From citizen signal to civic decision to measurable impact.',
    nextLabel: 'EXPLORE NAGARBODH'
  }
];
