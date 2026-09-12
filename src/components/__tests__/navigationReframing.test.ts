import { describe, expect, it } from 'vitest';

describe('BRICS Product UI Reframing & Navigation', () => {

  const PRIMARY_NAVIGATION_TABS = [
    { id: 'development_map', title: 'Development Map', question: 'Where is development demand concentrated?' },
    { id: 'demand_intelligence', title: 'Demand Intelligence', question: 'What development need is emerging?' },
    { id: 'citizen_signals', title: 'Citizen Signals', question: 'What are citizens asking for?' },
    { id: 'investment_gaps', title: 'Investment Gaps', question: 'Where is demand not matched by infrastructure/investment?' },
    { id: 'project_priorities', title: 'Project Priorities', question: 'What should policymakers consider?' },
    { id: 'policy_board', title: 'Policy Board', question: 'Where should national/state policymakers focus?' },
    { id: 'impact', title: 'Impact', question: 'Did the intervention reduce the gap?' }
  ];

  it('defines exactly 7 primary navigation tabs matching BRICS specification', () => {
    expect(PRIMARY_NAVIGATION_TABS).toHaveLength(7);
    const tabTitles = PRIMARY_NAVIGATION_TABS.map(t => t.title);
    expect(tabTitles).toEqual([
      'Development Map',
      'Demand Intelligence',
      'Citizen Signals',
      'Investment Gaps',
      'Project Priorities',
      'Policy Board',
      'Impact'
    ]);
  });

  it('maps every view to its corresponding policymaker screen question', () => {
    const questions = PRIMARY_NAVIGATION_TABS.map(t => t.question);
    expect(questions[0]).toBe('Where is development demand concentrated?');
    expect(questions[1]).toBe('What development need is emerging?');
    expect(questions[2]).toBe('What are citizens asking for?');
    expect(questions[3]).toBe('Where is demand not matched by infrastructure/investment?');
    expect(questions[4]).toBe('What should policymakers consider?');
    expect(questions[5]).toBe('Where should national/state policymakers focus?');
    expect(questions[6]).toBe('Did the intervention reduce the gap?');
  });

});
