import { describe, expect, it, vi } from 'vitest';
import type { CivicSignal } from '../../types/civic';
import type {
  DevelopmentHotspot,
  DevelopmentImpact,
  DevelopmentProjectRecommendation,
  DevelopmentRequest,
} from '../../types/development';
import {
  FirebaseDevelopmentRequestRepository,
  FirebaseHotspotRepository,
  FirebaseImpactRepository,
  FirebaseProjectRepository,
  FirebaseSignalRepository,
} from '../firebaseRepositories';
import {
  InMemoryDevelopmentRequestRepository,
  InMemoryHotspotRepository,
  InMemoryImpactRepository,
  InMemoryProjectRepository,
  InMemorySignalRepository,
} from '../inMemoryRepositories';
import { createRepositories } from '../index';

describe('In-Memory Repositories (Fallback & Replay Mode)', () => {
  it('InMemorySignalRepository saves and retrieves signals correctly', async () => {
    const repo = new InMemorySignalRepository([], 'SIMULATION');
    const mockSignal: CivicSignal = {
      id: 'sig-test-1',
      timestamp: new Date().toISOString(),
      simulatedTimeLabel: '09:00 AM',
      channel: 'citizen_app',
      rawText: 'Test civic signal raw text',
      detectedLanguage: 'en',
      englishTranslation: 'Test civic signal raw text',
      category: 'water',
      reportedSeverity: 'high',
      confidenceScore: 0.9,
      coordinates: { lat: 28.6139, lng: 77.209 },
      locationName: 'Connaught Place',
      ward: 'Ward 1',
      sentiment: 'urgent',
      keyEntities: ['water'],
    };

    await repo.save(mockSignal);
    const all = await repo.getAll();

    expect(all).toHaveLength(1);
    expect(all[0].id).toBe('sig-test-1');
    expect(repo.getStatus()).toEqual({
      mode: 'SIMULATION',
      isLive: false,
      provider: 'InMemoryFallback',
    });
  });

  it('InMemoryDevelopmentRequestRepository saves and retrieves requests', async () => {
    const repo = new InMemoryDevelopmentRequestRepository([], 'REPLAY');
    const mockRequest: DevelopmentRequest = {
      id: 'req-test-1',
      rawText: 'Water pipeline needed in Sector 15',
      language: 'en',
      sourceChannel: 'TEXT',
      source: 'SMS Portal',
      mode: 'REPLAY',
      timestamp: new Date().toISOString(),
      location: {
        country: 'India',
        state: 'Delhi',
        district: 'New Delhi',
        locationName: 'Sector 15',
      },
      category: 'WATER',
      extractedEntities: ['water', 'pipeline'],
      demandIntensity: 0.85,
      evidence: [],
      confidence: 0.95,
      status: 'pending',
    };

    await repo.save(mockRequest);
    const results = await repo.getAll();

    expect(results).toHaveLength(1);
    expect(results[0].category).toBe('WATER');
    expect(repo.getStatus().mode).toBe('REPLAY');
  });

  it('InMemoryProjectRepository updates status correctly', async () => {
    const repo = new InMemoryProjectRepository([], 'SIMULATION');
    const mockProject: DevelopmentProjectRecommendation = {
      id: 'proj-101',
      title: 'Rohini Clean Water Pipeline Construction',
      category: 'WATER',
      geography: {
        state: 'Delhi',
        district: 'North West Delhi',
      },
      problemStatement: 'Severe shortage of clean drinking water',
      recommendedIntervention: 'Install high-capacity distribution pipeline',
      priorityScore: 92,
      expectedBeneficiaries: 45000,
      estimatedImpact: {
        infrastructureIndexImprovement: 25,
        accessIndexImprovement: 30,
        expectedDemandReduction: 50,
      },
      supportingEvidence: ['High request volume in Ward 12'],
      rationale: 'Addresses critical water access deficit',
      implementationConsiderations: ['Initial planning stage'],
      confidence: 0.88,
      sourceMode: 'SIMULATION',
    };

    await repo.save(mockProject);
    const updated = await repo.updateStatus('proj-101', 'APPROVED', { approvedBy: 'Board Director' });

    expect(updated).not.toBeNull();
    expect(updated?.implementationConsiderations).toContain('Status updated to APPROVED: {"approvedBy":"Board Director"}');
  });
});

describe('Firebase Repositories with Fallback Handling', () => {
  it('FirebaseSignalRepository falls back cleanly when Firebase DB is null', async () => {
    const repo = new FirebaseSignalRepository([]);
    expect(repo.getStatus()).toEqual({
      mode: 'SIMULATION',
      isLive: false,
      provider: 'InMemoryFallback',
    });

    const mockSignal: CivicSignal = {
      id: 'sig-fb-1',
      timestamp: new Date().toISOString(),
      simulatedTimeLabel: '10:00 AM',
      channel: 'social_x',
      rawText: 'Pothole on Main Street',
      detectedLanguage: 'en',
      englishTranslation: 'Pothole on Main Street',
      category: 'roads',
      reportedSeverity: 'medium',
      confidenceScore: 0.8,
      coordinates: { lat: 28.7041, lng: 77.1025 },
      locationName: 'Rohini Sector 7',
      ward: 'Rohini',
      sentiment: 'negative',
      keyEntities: ['pothole'],
    };

    const saved = await repo.save(mockSignal);
    expect(saved.id).toBe('sig-fb-1');

    const all = await repo.getAll();
    expect(all).toHaveLength(1);
    expect(all[0].locationName).toBe('Rohini Sector 7');
  });

  it('FirebaseDevelopmentRequestRepository handles save and batch operations smoothly', async () => {
    const repo = new FirebaseDevelopmentRequestRepository([]);
    const requests: DevelopmentRequest[] = [
      {
        id: 'req-b-1',
        rawText: 'Build primary health centre',
        language: 'en',
        sourceChannel: 'VOICE',
        source: 'Voice Helpline',
        mode: 'SIMULATION',
        timestamp: new Date().toISOString(),
        location: { country: 'India', state: 'Delhi', district: 'South Delhi' },
        category: 'HEALTHCARE',
        extractedEntities: ['health centre'],
        demandIntensity: 0.9,
        evidence: [],
        confidence: 0.85,
        status: 'pending',
      },
    ];

    await repo.saveBatch(requests);
    const results = await repo.getAll();
    expect(results).toHaveLength(1);
    expect(results[0].category).toBe('HEALTHCARE');
  });

  it('FirebaseHotspotRepository and FirebaseImpactRepository return correct fallback state', async () => {
    const hotspotRepo = new FirebaseHotspotRepository([]);
    const impactRepo = new FirebaseImpactRepository([]);

    expect(hotspotRepo.getStatus().isLive).toBe(false);
    expect(impactRepo.getStatus().isLive).toBe(false);
  });

  it('createRepositories factory creates full repository registry', () => {
    const registry = createRepositories({
      signals: [],
      requests: [],
      hotspots: [],
      projects: [],
      impacts: [],
    });

    expect(registry.signals).toBeDefined();
    expect(registry.requests).toBeDefined();
    expect(registry.hotspots).toBeDefined();
    expect(registry.projects).toBeDefined();
    expect(registry.impacts).toBeDefined();
    expect(registry.status).toBeDefined();
    expect(registry.status.mode).toBe('SIMULATION');
  });
});
