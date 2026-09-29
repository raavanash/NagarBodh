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
    totalSteps: 7,
    targetSelector: '[data-tour="brand"]',
    title: 'Welcome to NagarBodh',
    description: 'NagarBodh turns fragmented civic signals and public context into explainable investment decisions.',
    placement: 'bottom',
    actionType: 'informational',
    targetTab: 'investment_gaps',
    nextLabel: 'START'
  },
  {
    id: 'invest',
    stepNumber: 2,
    totalSteps: 7,
    targetSelector: '[data-tour="nav-invest"]',
    title: 'Identify where intervention matters',
    description: 'The Investment Board turns civic demand, infrastructure deficits and population exposure into a prioritized investment case.',
    placement: 'bottom',
    actionType: 'navigation',
    targetTab: 'investment_gaps'
  },
  {
    id: 'map',
    stepNumber: 3,
    totalSteps: 7,
    targetSelector: '[data-tour="nav-map"]',
    title: 'See where the problem is happening',
    description: 'Spatial intelligence shows where signals, hotspots and infrastructure context converge.',
    placement: 'bottom',
    actionType: 'navigation',
    targetTab: 'development_map'
  },
  {
    id: 'dossier',
    stepNumber: 4,
    totalSteps: 7,
    targetSelector: '[data-tour="nav-decide"]',
    title: 'Understand the evidence',
    description: 'Inspect the evidence behind the recommendation — separating observed signals, public context, calculated factors and external public signals.',
    placement: 'bottom',
    actionType: 'informational',
    targetTab: 'project_priorities'
  },
  {
    id: 'human_decision',
    stepNumber: 5,
    totalSteps: 7,
    targetSelector: '[data-tour="nav-decide"]',
    title: 'Keep the decision human',
    description: 'AI helps organize and explain evidence. Public intervention remains under human authority.',
    placement: 'bottom',
    actionType: 'informational',
    targetTab: 'project_priorities'
  },
  {
    id: 'impact',
    stepNumber: 6,
    totalSteps: 7,
    targetSelector: '[data-tour="nav-impact"]',
    title: 'See the projected outcome',
    description: 'NagarBodh models the potential civic outcome of an intervention and clearly separates projected results from measured real-world outcomes.',
    placement: 'bottom',
    actionType: 'informational',
    targetTab: 'impact'
  },
  {
    id: 'scenario_lab',
    stepNumber: 7,
    totalSteps: 7,
    targetSelector: '[data-tour="nav-more"]',
    title: 'Explore what-if scenarios',
    description: "Test changes to civic assumptions without modifying NagarBodh's canonical investment decision or simulation state.",
    placement: 'bottom',
    actionType: 'navigation',
    targetTab: 'scenario_lab',
    completionTitle: "That's NagarBodh.",
    completionSubtext: 'From civic signals and evidence to human authority and measurable impact.',
    nextLabel: 'EXPLORE NAGARBODH'
  }
];
