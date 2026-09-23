import React, { useState } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  DollarSign,
  Eye,
  FileText,
  Layers,
  MapPin,
  Radio,
  Share2,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wrench,
  X
} from 'lucide-react';
import { InvestmentExplanationDossier } from '../../types/development';
import { GroundedDecisionBriefOutput } from '../../types/decisionBrief';
import { generateDecisionBrief, buildGroundedInputFromDossier } from '../../engine/decisionBriefEngine';
import { useCivic } from '../../context/CivicContext';
import { ProvenanceBadge } from '../Evidence/ExpandableEvidenceUI';
import { DecisionBriefCard } from './DecisionBriefCard';
import { JudgingJourneyStepper } from '../common/JudgingJourneyStepper';

interface Props {
  dossier: InvestmentExplanationDossier | null;
  isOpen: boolean;
  onClose: () => void;
  onPrioritize?: (incidentId?: string) => void;
}

export const ExplainableInvestmentDossierDrawer: React.FC<Props> = ({
  dossier,
  isOpen,
  onClose,
  onPrioritize
}) => {
  const { geminiApiKey } = useCivic();
  const [activeSection, setActiveSection] = useState<'all' | 'signal' | 'infra' | 'priority' | 'capital' | 'outcome'>('all');
  const [decisionBrief, setDecisionBrief] = useState<GroundedDecisionBriefOutput | null>(null);
  const [isGeneratingBrief, setIsGeneratingBrief] = useState<boolean>(false);

  const handleGenerateBrief = async () => {
    if (!dossier) return;
    setIsGeneratingBrief(true);
    try {
      const groundedInput = buildGroundedInputFromDossier(dossier);
      const output = await generateDecisionBrief(groundedInput, geminiApiKey);
      setDecisionBrief(output);
    } catch (err) {
      console.warn('[DossierDrawer] Failed to generate decision brief:', err);
    } finally {
      setIsGeneratingBrief(false);
    }
  };

  if (!isOpen || !dossier) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 1050,
        display: 'flex',
        justifyContent: 'flex-end',
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '820px',
          height: '100%',
          background: 'var(--bg-canvas)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-8px 0 32px rgba(0, 0, 0, 0.25)',
          borderLeft: '1px solid var(--border-medium)',
          animation: 'slideLeft 0.25s ease-out',
          overflow: 'hidden'
        }}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: '1.25rem 1.5rem',
            background: 'var(--bg-surface-elevated)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '1rem'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.35rem' }}>
              <span
                style={{
                  background: 'rgba(37, 99, 235, 0.1)',
                  color: '#2563eb',
                  border: '1px solid rgba(37, 99, 235, 0.2)',
                  padding: '0.15rem 0.5rem',
                  borderRadius: '999px',
                  fontSize: '0.68rem',
                  fontWeight: 800,
                  fontFamily: 'var(--font-mono)'
                }}
              >
                {dossier.categoryLabel}
              </span>
              <ProvenanceBadge label="[DECISION DOSSIER]" type="recommended" />
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• {dossier.district}</span>
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
              Explainable Investment Dossier
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.25rem', color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
              <MapPin size={13} color="#2563eb" />
              <span>{dossier.ward}</span>
              <span style={{ color: 'var(--text-muted)' }}>• ID: {dossier.gapId}</span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '0.45rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Close Drawer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Unified 6-Stage Lifecycle Header with Persistent Context */}
        <div style={{ padding: '0.75rem 1.5rem 0.25rem 1.5rem' }}>
          <JudgingJourneyStepper
            currentStep={decisionBrief ? 'EXPLAIN' : 'EVIDENCE'}
            compact={true}
            intervention={{
              projectTitle: dossier.capitalRequirement?.recommendedProjectTitle || 'Sub-surface Automated Stormwater Pumping Array',
              locationName: `${dossier.ward} (${dossier.district})`,
              approvedCapitalLakhs: dossier.capitalRequirement?.estimatedCostLakhs || 350,
              priorityScore: dossier.priorityCalculation?.overallScore || 94,
              status: 'RECOMMENDED',
              dataMode: 'SIMULATION'
            }}
          />
        </div>

        {/* Navigation Section Filter Pills */}
        <div
          style={{
            padding: '0.65rem 1.5rem',
            background: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            overflowX: 'auto'
          }}
        >
          {[
            { id: 'all', label: 'Complete Dossier' },
            { id: 'signal', label: '1. Problem Signal' },
            { id: 'infra', label: '2. Baseline Deficit' },
            { id: 'priority', label: '3. Priority Breakdown' },
            { id: 'capital', label: '4. Capital Plan' },
            { id: 'outcome', label: '5. Projected Impact' }
          ].map((sec) => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              style={{
                fontSize: '0.72rem',
                fontWeight: activeSection === sec.id ? 700 : 500,
                padding: '0.3rem 0.65rem',
                borderRadius: '6px',
                border: activeSection === sec.id ? '1px solid #2563eb' : '1px solid var(--border-subtle)',
                background: activeSection === sec.id ? '#eff6ff' : 'var(--bg-surface-elevated)',
                color: activeSection === sec.id ? '#1d4ed8' : 'var(--text-secondary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Scrollable Dossier Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Primary "Why This Recommendation?" Plain-Language Banner */}
          <div
            style={{
              padding: '1.25rem',
              background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(2, 132, 199, 0.08) 100%)',
              border: '1px solid #bfdbfe',
              borderRadius: '12px',
              borderLeft: '4px solid #2563eb'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.4rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Sparkles size={15} color="#2563eb" />
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#1d4ed8', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
                  WHY THIS RECOMMENDATION? — EXECUTIVE DECISION RATIONALE
                </span>
              </div>
              <ProvenanceBadge label="[BOUNDED SYNTHESIS]" type="recommended" />
            </div>

            <div style={{ fontSize: '0.92rem', color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5, marginBottom: '0.85rem' }}>
              "{dossier.plainLanguageWhy}"
            </div>

            {/* Decision Brief Trigger Action */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(37, 99, 235, 0.15)',
                flexWrap: 'wrap',
                gap: '0.5rem'
              }}
            >
              <span style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
                Synthesize grounded decision memo for municipal approval:
              </span>
              <button
                onClick={handleGenerateBrief}
                disabled={isGeneratingBrief}
                style={{
                  padding: '0.4rem 0.85rem',
                  borderRadius: '6px',
                  background: isGeneratingBrief ? 'var(--bg-surface)' : 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  color: '#ffffff',
                  border: 'none',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  cursor: isGeneratingBrief ? 'wait' : 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <Sparkles size={13} />
                <span>{isGeneratingBrief ? 'Synthesizing Brief...' : decisionBrief ? 'Regenerate Decision Brief' : 'Generate Decision Brief'}</span>
              </button>
            </div>
          </div>

          {/* Render Grounded Executive Decision Brief Card */}
          {decisionBrief && (
            <DecisionBriefCard
              brief={decisionBrief}
              onPrioritize={() => onPrioritize?.(dossier.incidentId)}
              onClose={() => setDecisionBrief(null)}
            />
          )}

          {/* Traceable Evidence Chain Stepper (Judge Trail) */}
          <div
            style={{
              padding: '1.25rem',
              background: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Activity size={15} color="#2563eb" />
                <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0 }}>
                  Traceable Evidence & Decision Chain
                </h3>
              </div>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                End-to-End Civic Provenance
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {dossier.evidenceChain.map((step, idx) => (
                <div
                  key={step.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.75rem',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: '#2563eb',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      marginTop: '0.15rem'
                    }}
                  >
                    {step.stepNumber}
                  </div>

                  <div style={{ flex: 1, paddingBottom: idx < dossier.evidenceChain.length - 1 ? '0.5rem' : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {step.stepName}
                      </span>
                      <ProvenanceBadge label={`[${step.classification}]`} />
                      <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        ID: {step.sourceId}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {step.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', marginTop: '0.15rem', lineHeight: 1.35 }}>
                      {step.detail}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section A: Problem Signal */}
          {(activeSection === 'all' || activeSection === 'signal') && (
            <div
              style={{
                padding: '1.25rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Radio size={15} color="#0284c7" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0 }}>
                    A. Problem Signal & Intake Pressure
                  </h3>
                </div>
                <ProvenanceBadge label="[OBSERVED]" type="observed" />
              </div>

              {/* Numerical Metrics Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.65rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Relevant Signals</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                    {dossier.problemSignal.requestCount}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Direct intake volume</div>
                </div>

                <div style={{ padding: '0.65rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Arrival Velocity</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                    {dossier.problemSignal.velocityPerHour.toFixed(1)}/hr
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#dc2626', fontWeight: 700, marginTop: '0.15rem' }}>
                    +{Math.round((dossier.problemSignal.surgeMultiplier - 1.0) * 100)}% Surge
                  </div>
                </div>

                <div style={{ padding: '0.65rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Intake Channels</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                    {dossier.problemSignal.signalChannels.length} Sources
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>
                    {dossier.problemSignal.signalChannels.map(c => c.replace('_', ' ')).join(', ')}
                  </div>
                </div>

                <div style={{ padding: '0.65rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Geographic Cluster</div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {dossier.problemSignal.locationName}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)', marginTop: '0.15rem' }}>Ward Cluster Centroid</div>
                </div>
              </div>

              {/* Representative Verbatim Citizen Quotes */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Representative Verbatim Citizen Signals ({dossier.problemSignal.representativeSignals.length} samples)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {dossier.problemSignal.representativeSignals.map((sig) => (
                    <div
                      key={sig.id}
                      style={{
                        padding: '0.65rem 0.85rem',
                        background: 'var(--bg-surface)',
                        borderRadius: '8px',
                        border: '1px solid var(--border-subtle)',
                        borderLeft: '3px solid #0284c7'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#0284c7', textTransform: 'capitalize' }}>
                            {sig.channel.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>• {sig.authorHandle}</span>
                        </div>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {sig.timestamp}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontStyle: 'italic', lineHeight: 1.35 }}>
                        "{sig.rawText}"
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Section B: Infrastructure Context */}
          {(activeSection === 'all' || activeSection === 'infra') && (
            <div
              style={{
                padding: '1.25rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Building2 size={15} color="#475569" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0 }}>
                    B. Baseline Infrastructure Context & Deficit
                  </h3>
                </div>
                <ProvenanceBadge label="[BASELINE CONTEXT]" type="baseline" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.65rem', marginBottom: '1rem' }}>
                <div style={{ padding: '0.65rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Current Infra Index</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#b45309', fontFamily: 'var(--font-mono)' }}>
                    {dossier.infrastructureContext.infrastructureIndex}/100
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Standard benchmark: 80+</div>
                </div>

                <div style={{ padding: '0.65rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Deficit Score</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                    {dossier.infrastructureContext.infrastructureDeficitScore}/25
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Capacity gap penalty</div>
                </div>

                <div style={{ padding: '0.65rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Nearest Facility</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {dossier.infrastructureContext.nearestFacilityName}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>
                    {dossier.infrastructureContext.nearestFacilityDistanceMeters.toLocaleString()}m transit distance
                  </div>
                </div>

                <div style={{ padding: '0.65rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Capacity Utilization</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                    {dossier.infrastructureContext.capacityUtilizationPercent}%
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#dc2626', fontWeight: 700 }}>Near critical overload</div>
                </div>
              </div>

              {/* Affected Population Breakdown */}
              <div style={{ padding: '0.75rem 0.95rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={13} color="#2563eb" />
                    Demographic Vulnerability & Exposure Profile
                  </span>
                  <ProvenanceBadge label="[BASELINE CONTEXT]" type="baseline" />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.5rem', marginBottom: '0.75rem' }}>
                  <div style={{ padding: '0.5rem 0.65rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Total Population</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                      {dossier.affectedPopulation.totalEstimate.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Ward Baseline [BASELINE]</div>
                  </div>

                  <div style={{ padding: '0.5rem 0.65rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Vulnerable Population</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#dc2626', fontFamily: 'var(--font-mono)' }}>
                      {dossier.affectedPopulation.vulnerableEstimate.toLocaleString()}
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Modeled count [BASELINE]</div>
                  </div>

                  <div style={{ padding: '0.5rem 0.65rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Demographic Ratio</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#d97706', fontFamily: 'var(--font-mono)' }}>
                      {(dossier.affectedPopulation.vulnerabilityRatio * 100).toFixed(1)}%
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Calculated ratio [CALCULATED]</div>
                  </div>

                  <div style={{ padding: '0.5rem 0.65rem', background: 'var(--bg-surface-elevated)', borderRadius: '6px', border: '1px solid var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.62rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Vulnerability Index</div>
                    <div style={{ fontSize: '1rem', fontWeight: 800, color: '#b91c1c', fontFamily: 'var(--font-mono)' }}>
                      {dossier.affectedPopulation.vulnerabilityScore ?? 91}/100
                    </div>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-secondary)' }}>Socio-hazard index [CALCULATED]</div>
                  </div>
                </div>

                <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                  Includes <strong>{dossier.affectedPopulation.vulnerableEstimate.toLocaleString()} vulnerable residents</strong> in the modeled population ({(dossier.affectedPopulation.vulnerabilityRatio * 100).toFixed(1)}% demographic ratio of {dossier.affectedPopulation.totalEstimate.toLocaleString()} total residents). Vulnerability Index is evaluated at <strong>{dossier.affectedPopulation.vulnerabilityScore ?? 91}/100</strong>. Primary economic zone: {dossier.affectedPopulation.primaryLivelihoodZone}.
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                  {dossier.affectedPopulation.sourceContext}
                </div>
              </div>
            </div>
          )}

          {/* Section D: Priority Calculation Breakdown */}
          {(activeSection === 'all' || activeSection === 'priority') && (
            <div
              style={{
                padding: '1.25rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <TrendingUp size={15} color="#059669" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0 }}>
                    C. Priority Calculation & 5-Factor Scoring Breakdown
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, color: dossier.priorityCalculation.overallScore >= 80 ? '#dc2626' : '#d97706', fontFamily: 'var(--font-mono)' }}>
                    OVERALL: {dossier.priorityCalculation.overallScore}/100 ({dossier.priorityCalculation.priorityLevel})
                  </span>
                  <ProvenanceBadge label="[CALCULATED]" type="calculated" />
                </div>
              </div>

              <p style={{ margin: '0 0 1rem 0', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {dossier.priorityCalculation.formulaExplanation}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {dossier.priorityCalculation.factors.map((f) => (
                  <div
                    key={f.factor}
                    style={{
                      padding: '0.75rem 0.95rem',
                      background: 'var(--bg-surface)',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '1rem'
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {f.factor}
                        </span>
                        <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#1d4ed8', padding: '0.1rem 0.35rem', borderRadius: '4px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                          Weight: {f.weightPercent}%
                        </span>
                        <ProvenanceBadge label="[CALCULATED]" type="calculated" />
                      </div>
                      <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)', lineHeight: 1.35 }}>
                        {f.evidence}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        Source: {f.source}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>Contribution</div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                        +{f.contribution} pts
                      </div>
                      <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                        Raw: {f.score}/100
                      </div>
                    </div>
                  </div>
                ))}

                {/* Total Deterministic Score Reconciliation Row */}
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    background: 'var(--bg-surface)',
                    borderRadius: '8px',
                    border: '1.5px solid var(--border-subtle)',
                    borderLeft: '4px solid #059669',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '0.25rem'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.15rem' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        Total Deterministic Priority Score
                      </span>
                      <ProvenanceBadge label="[CALCULATED]" type="calculated" />
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                      Sum of 5 weighted pillar contributions (100% total weight)
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                      {dossier.priorityCalculation.overallScore} / 100
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      Level {dossier.priorityCalculation.priorityLevel}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Section E: Capital Requirement */}
          {(activeSection === 'all' || activeSection === 'capital') && (
            <div
              style={{
                padding: '1.25rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <DollarSign size={15} color="#2563eb" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0 }}>
                    D. Capital Requirement & Intervention Plan
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ProvenanceBadge label="[RECOMMENDED]" type="recommended" />
                  <ProvenanceBadge label="[CALCULATED CAPEX]" type="calculated" />
                </div>
              </div>

              <div style={{ padding: '0.85rem 1rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                    Recommended Project Title
                  </span>
                  <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#b45309', fontFamily: 'var(--font-mono)' }}>
                    ₹{dossier.capitalRequirement.estimatedCostLakhs} Lakhs
                  </span>
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {dossier.capitalRequirement.recommendedProjectTitle}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.35rem', lineHeight: 1.4 }}>
                  <strong>Intervention:</strong> {dossier.capitalRequirement.recommendedIntervention}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                  Lead Agency: <strong>{dossier.capitalRequirement.primaryDepartment}</strong>
                </div>
              </div>

              {/* Implementation Considerations */}
              <div>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                  Implementation Considerations & DPR Clearances
                </div>
                <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {dossier.capitalRequirement.implementationConsiderations.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Section F: Projected Outcome */}
          {(activeSection === 'all' || activeSection === 'outcome') && (
            <div
              style={{
                padding: '1.25rem',
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <CheckCircle2 size={15} color="#0891b2" />
                  <h3 style={{ fontSize: '0.92rem', fontWeight: 800, margin: 0 }}>
                    E. Projected Outcome & Simulation Indicators
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <ProvenanceBadge label="[PROJECTED]" type="projected" />
                  <ProvenanceBadge label="[SIMULATION]" type="simulation" />
                </div>
              </div>

              <div
                style={{
                  padding: '0.55rem 0.85rem',
                  background: '#fef3c7',
                  border: '1px solid #fcd34d',
                  borderRadius: '6px',
                  color: '#92400e',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem'
                }}
              >
                <AlertTriangle size={14} color="#b45309" />
                <span>Notice: Projected scenario simulation derived deterministically from developmentImpactEngine. Not real-world measured impact.</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.65rem' }}>
                <div style={{ padding: '0.65rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Infra Index Gain</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                    +{dossier.projectedOutcome.infrastructureIndexGain} pts
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Capacity restoration</div>
                </div>

                <div style={{ padding: '0.65rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Distance Reduction</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0284c7', fontFamily: 'var(--font-mono)' }}>
                    {dossier.projectedOutcome.travelDistanceReductionPercent}%
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>To functional facility</div>
                </div>

                <div style={{ padding: '0.65rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Demand Drop</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#059669', fontFamily: 'var(--font-mono)' }}>
                    {dossier.projectedOutcome.demandPressureDrop} pts
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>Reduced distress signal demand</div>
                </div>

                <div style={{ padding: '0.65rem', background: 'var(--bg-surface)', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>Service Access Score</div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#7c3aed', fontFamily: 'var(--font-mono)' }}>
                    +{dossier.projectedOutcome.serviceAccessGain} pts
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-secondary)' }}>SDG alignment gain</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer Actions */}
        <div
          style={{
            padding: '1rem 1.5rem',
            background: 'var(--bg-surface-elevated)',
            borderTop: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--text-secondary)' }}>
            <ProvenanceBadge label="[EVIDENCE PROVENANCE]" type="calculated" />
            <span>Deterministic engine-backed evidence</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              onClick={onClose}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: '6px',
                border: '1px solid var(--border-medium)',
                background: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Return to Board
            </button>

            {onPrioritize && (
              <button
                onClick={() => onPrioritize(dossier.incidentId)}
                style={{
                  padding: '0.45rem 1rem',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <span>Continue to Decision</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
