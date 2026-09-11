import { describe, expect, it } from 'vitest';
import { generatePolicyExplanation, getIndiaDevelopmentPolicyBoard } from '../policyBoardEngine';
import { SampleDevelopmentContextProvider } from '../context/providers/SampleDevelopmentContextProvider';

describe('India Development Policy Board Engine', () => {
  const provider = new SampleDevelopmentContextProvider();

  it('aggregates multi-state regional contexts and ranks leaderboard rows by priority score descending', async () => {
    const contexts = await provider.getAllContexts();
    const rows = getIndiaDevelopmentPolicyBoard([], contexts);

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].rank).toBe(1);
    expect(rows[0].priorityScore).toBeGreaterThanOrEqual(rows[1].priorityScore);

    // Verify expected columns exist
    const topRow = rows[0];
    expect(topRow.state).toBeDefined();
    expect(topRow.district).toBeDefined();
    expect(topRow.developmentNeed).toBeDefined();
    expect(topRow.demandScore).toBeGreaterThan(0);
    expect(topRow.infrastructureGap).toBeGreaterThan(0);
    expect(topRow.affectedPopulation).toBeGreaterThan(0);
    expect(topRow.geminiExplanation).toBeDefined();
  });

  it('generates concise policymaker narrative using exact structured context numbers', async () => {
    const contexts = await provider.getAllContexts();
    const rows = getIndiaDevelopmentPolicyBoard([], contexts);
    const topRow = rows[0];

    const narrative = generatePolicyExplanation(topRow);

    expect(narrative).toContain(topRow.district);
    expect(narrative).toContain(topRow.state);
    expect(narrative).toContain(`Demand Score: ${topRow.demandScore}/100`);
    expect(narrative).toContain(`Unfunded Investment Gap: ₹${topRow.investmentGapLakhs} Lakhs`);
  });

  it('correctly filters leaderboard rows by state and district', async () => {
    const contexts = await provider.getAllContexts();
    const delhiRows = getIndiaDevelopmentPolicyBoard([], contexts, { state: 'Delhi NCR' });

    expect(delhiRows.length).toBeGreaterThan(0);
    delhiRows.forEach(r => {
      expect(r.state).toBe('Delhi NCR');
    });
  });
});
