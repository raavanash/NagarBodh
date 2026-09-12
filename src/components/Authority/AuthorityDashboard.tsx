import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronRight,
  Compass,
  FileSpreadsheet,
  Filter,
  Globe,
  Info,
  Layers,
  MapPin,
  PieChart,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  Users
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { DevelopmentContextDataLayer } from '../../engine/context/DevelopmentContextDataLayer';
import { clusterDevelopmentRequests } from '../../engine/developmentDemandClusterEngine';
import {
  getIndiaDevelopmentPolicyBoard,
  PolicyLeaderboardRow
} from '../../engine/policyBoardEngine';
import { DevelopmentContext, DevelopmentDemandHotspot } from '../../types/development';

export const AuthorityDashboard: React.FC = () => {
  const { signals, setSelectedIncidentId, setActiveTab } = useCivic();

  // State Filters
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Policy Board Data State
  const [leaderboardRows, setLeaderboardRows] = useState<PolicyLeaderboardRow[]>([]);
  const [selectedRow, setSelectedRow] = useState<PolicyLeaderboardRow | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const loadPolicyBoardData = async () => {
      setIsLoading(true);
      const dataLayer = new DevelopmentContextDataLayer('sample');

      // Fetch all regional contexts
      const contexts: DevelopmentContext[] = await dataLayer.getAllContexts();

      // Cluster development requests from signals or mock requests
      const hotspots: DevelopmentDemandHotspot[] = await clusterDevelopmentRequests([], dataLayer);

      const rows = getIndiaDevelopmentPolicyBoard(hotspots, contexts, {
        state: selectedState,
        district: selectedDistrict,
        category: selectedCategory
      });

      if (isMounted) {
        setLeaderboardRows(rows);
        if (rows.length > 0 && !selectedRow) {
          setSelectedRow(rows[0]);
        }
        setIsLoading(false);
      }
    };

    loadPolicyBoardData();

    return () => {
      isMounted = false;
    };
  }, [selectedState, selectedDistrict, selectedCategory]);

  // Extract available states and districts for dropdowns
  const availableStates = ['ALL', 'Delhi NCR', 'Maharashtra', 'Karnataka', 'Uttar Pradesh', 'Tamil Nadu'];
  const availableDistricts = ['ALL', 'Central Delhi', 'East Delhi', 'Mumbai Suburban', 'Bengaluru Urban', 'Gautam Buddha Nagar'];

  // Summary Metrics
  const p1Count = leaderboardRows.filter(r => r.priorityLevel === 'P1').length;
  const totalPopulation = leaderboardRows.reduce((sum, r) => sum + r.affectedPopulation, 0);
  const totalInvestmentGapLakhs = leaderboardRows.reduce((sum, r) => sum + r.investmentGapLakhs, 0);
  const topSector = leaderboardRows.length > 0 ? leaderboardRows[0].developmentNeed : 'Healthcare Access';

  return (
    <div className="policy-board-container" style={{ padding: '1.5rem', height: '100%', overflowY: 'auto', background: 'var(--bg-canvas)' }}>
      
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{ padding: '0.5rem', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid var(--border-accent)' }}>
              <Globe size={22} color="var(--cyan-400)" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                  Policy Board
                </h2>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'rgba(6, 182, 212, 0.2)', color: 'var(--cyan-400)', padding: '2px 8px', borderRadius: '999px', fontFamily: 'var(--font-mono)' }}>
                  INDIA DEVELOPMENT POLICY BOARD
                </span>
              </div>
              <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.88rem', color: '#0284c7', fontWeight: 600 }}>
                "Where should national/state policymakers focus?"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CASCADING GEOGRAPHIC HIERARCHY FILTER BAR */}
      <div className="card" style={{ padding: '0.9rem 1.2rem', marginBottom: '1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', fontSize: '0.8rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontWeight: 700 }}>
            <Compass size={16} color="var(--cyan-400)" />
            <span>GEOGRAPHY:</span>
          </div>

          {/* Country (India Fixed) */}
          <div style={{ background: 'var(--bg-canvas)', padding: '0.4rem 0.75rem', borderRadius: '6px', border: '1px solid var(--border-subtle)', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span>🇮🇳 India</span>
          </div>

          <ChevronRight size={14} color="var(--text-muted)" />

          {/* State Selector */}
          <div>
            <select
              value={selectedState}
              onChange={e => {
                setSelectedState(e.target.value);
                setSelectedDistrict('ALL');
              }}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', background: 'var(--bg-canvas)', border: '1px solid var(--border-accent)', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, outline: 'none' }}
            >
              <option value="ALL">All States (National View)</option>
              {availableStates.filter(s => s !== 'ALL').map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <ChevronRight size={14} color="var(--text-muted)" />

          {/* District Selector */}
          <div>
            <select
              value={selectedDistrict}
              onChange={e => setSelectedDistrict(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', background: 'var(--bg-canvas)', border: '1px solid var(--border-accent)', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, outline: 'none' }}
            >
              <option value="ALL">All Districts</option>
              {availableDistricts.filter(d => d !== 'ALL').map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Sector Category Selector */}
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Filter size={14} color="var(--text-muted)" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', borderRadius: '6px', background: 'var(--bg-canvas)', border: '1px solid var(--border-subtle)', color: 'var(--text-primary)', fontSize: '0.8rem', fontWeight: 600, outline: 'none' }}
            >
              <option value="ALL">All Development Sectors</option>
              <option value="HEALTHCARE">Healthcare Access</option>
              <option value="EDUCATION">Education Capacity</option>
              <option value="WATER">Drinking Water & Drainage</option>
              <option value="ROADS">Roads & Transport Corridor</option>
              <option value="SANITATION">Sanitation & Waste</option>
              <option value="ELECTRICITY">Power Grid Reliability</option>
            </select>
          </div>

        </div>
      </div>

      {/* POLICY EXECUTIVE KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        
        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #ef4444' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>P1 National High Priority</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f87171', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            {p1Count} Regions
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Crossed 80/100 Priority Threshold</div>
        </div>

        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--cyan-400)' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Top Development Need</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--cyan-400)', marginTop: '4px' }}>
            {topSector}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Highest nationwide deficit score</div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Target Affected Population</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            {totalPopulation.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Citizens across target districts</div>
        </div>

        <div className="card" style={{ padding: '1rem', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Unfunded Investment Gap</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fbbf24', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
            ₹{(totalInvestmentGapLakhs / 100).toFixed(1)} Cr
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '2px' }}>₹{totalInvestmentGapLakhs.toLocaleString()} Lakhs Capital Deficit</div>
        </div>

      </div>

      {/* MAIN TWO-COLUMN VIEW: LEADERBOARD TABLE (LEFT) & POLICY DETAIL DRAWER (RIGHT) */}
      <div style={{ display: 'grid', gridTemplateColumns: selectedRow ? '1.4fr 1fr' : '1fr', gap: '1.25rem', alignItems: 'start' }}>
        
        {/* LEADERBOARD TABLE */}
        <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              National Development Priority Leaderboard
            </h3>
            <span style={{ fontSize: '0.72rem', color: 'var(--cyan-400)', fontFamily: 'var(--font-mono)' }}>
              {leaderboardRows.length} Regions Ranked
            </span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)', fontSize: '0.7rem', textTransform: 'uppercase' }}>
                  <th style={{ padding: '0.5rem 0.6rem' }}>Rank</th>
                  <th style={{ padding: '0.5rem 0.6rem' }}>State</th>
                  <th style={{ padding: '0.5rem 0.6rem' }}>District</th>
                  <th style={{ padding: '0.5rem 0.6rem' }}>Development Need</th>
                  <th style={{ padding: '0.5rem 0.6rem' }}>Demand</th>
                  <th style={{ padding: '0.5rem 0.6rem' }}>Infra Gap</th>
                  <th style={{ padding: '0.5rem 0.6rem' }}>Investment Gap</th>
                  <th style={{ padding: '0.5rem 0.6rem' }}>Affected Pop.</th>
                  <th style={{ padding: '0.5rem 0.6rem' }}>Priority</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardRows.map(row => {
                  const isSelected = selectedRow?.id === row.id;

                  return (
                    <tr
                      key={row.id}
                      onClick={() => setSelectedRow(row)}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background: isSelected ? 'var(--civic-blue-50)' : 'transparent',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease'
                      }}
                    >
                      <td style={{ padding: '0.65rem 0.6rem', fontWeight: 800, color: row.rank === 1 ? '#ef4444' : row.rank <= 3 ? '#f59e0b' : 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        #{row.rank}
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {row.state}
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem', color: 'var(--cyan-400)', fontWeight: 700 }}>
                        {row.district}
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem', color: 'var(--text-primary)' }}>
                        {row.developmentNeed}
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {row.demandScore}
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem', fontFamily: 'var(--font-mono)' }}>
                        {row.infrastructureGap}
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem', fontFamily: 'var(--font-mono)', color: '#fbbf24' }}>
                        ₹{row.investmentGapLakhs} L
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem', fontFamily: 'var(--font-mono)' }}>
                        {row.affectedPopulation.toLocaleString()}
                      </td>
                      <td style={{ padding: '0.65rem 0.6rem' }}>
                        <span style={{
                          fontSize: '0.74rem',
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: '4px',
                          background: row.priorityScore >= 80 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: row.priorityScore >= 80 ? '#f87171' : '#fbbf24',
                          fontFamily: 'var(--font-mono)'
                        }}>
                          {row.priorityScore} ({row.priorityLevel})
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* POLICY INTELLIGENCE DETAIL DRAWER */}
        {selectedRow && (
          <div className="card" style={{ padding: '1.25rem', background: 'var(--bg-surface-elevated)', border: '1px solid var(--cyan-400)', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            
            {/* Header */}
            <div style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.2rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--cyan-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  POLICY INTELLIGENCE DOSSIER #{selectedRow.rank}
                </span>
                <span style={{ fontSize: '0.68rem', fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', fontWeight: 800 }}>
                  PRIORITY: {selectedRow.priorityScore}/100
                </span>
              </div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {selectedRow.district}, {selectedRow.state}
              </h3>
            </div>

            {/* CONCISE GEMINI POLICYMAKER EXPLANATION */}
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', padding: '0.85rem', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.72rem', fontWeight: 800, color: 'var(--cyan-400)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                <Sparkles size={14} />
                Gemini Policymaker Explanation Narrative
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.45, fontStyle: 'italic' }}>
                "{selectedRow.geminiExplanation}"
              </div>
            </div>

            {/* POLICY BREAKDOWN CARDS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.78rem' }}>
              
              {/* Citizen Demand */}
              <div style={{ background: 'var(--bg-canvas)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>1. Citizen Demand Context</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginTop: '2px' }}>
                  Demand Score: <span style={{ color: 'var(--cyan-400)' }}>{selectedRow.demandScore}/100</span>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '2px' }}>
                  {selectedRow.hotspot ? `${selectedRow.hotspot.requestCount} citizen reports (+${selectedRow.hotspot.requestVelocity} req/h)` : 'High citizen demand volume'}
                </div>
              </div>

              {/* Demographics */}
              <div style={{ background: 'var(--bg-canvas)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>2. Demographics & Vulnerability</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                  Population: <strong>{selectedRow.affectedPopulation.toLocaleString()}</strong>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '2px' }}>
                  Vulnerable Population: <strong>{selectedRow.context.demographic.vulnerablePopulation.toLocaleString()}</strong> ({((selectedRow.context.demographic.vulnerablePopulation / selectedRow.affectedPopulation) * 100).toFixed(0)}%)
                </div>
              </div>

              {/* Infrastructure */}
              <div style={{ background: 'var(--bg-canvas)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>3. Infrastructure Indices</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                  Deficit Index: <strong style={{ color: '#f87171' }}>{selectedRow.infrastructureGap}/100</strong>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '2px' }}>
                  Healthcare: {selectedRow.context.infrastructure.healthcareIndex}/100 • Education: {selectedRow.context.infrastructure.educationIndex}/100 • Water: {selectedRow.context.infrastructure.waterIndex}/100
                </div>
              </div>

              {/* Investment */}
              <div style={{ background: 'var(--bg-canvas)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>4. Public Investment Deficit</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: 600, marginTop: '2px' }}>
                  Unfunded Gap: <strong style={{ color: '#fbbf24' }}>₹{selectedRow.investmentGapLakhs} Lakhs</strong>
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '2px' }}>
                  Existing Outlay: ₹{selectedRow.context.investment.existingInvestment} Lakhs | Planned: ₹{selectedRow.context.investment.plannedInvestment} Lakhs
                </div>
              </div>

              {/* Recommended Project */}
              {selectedRow.recommendedProject && (
                <div style={{ background: 'var(--bg-canvas)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--cyan-400)' }}>
                  <div style={{ color: 'var(--cyan-400)', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>5. Recommended Candidate Project</div>
                  <div style={{ fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px', fontSize: '0.84rem' }}>
                    {selectedRow.recommendedProject.title}
                  </div>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: '3px', fontStyle: 'italic' }}>
                    "{selectedRow.recommendedProject.recommendedIntervention}"
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.4rem', fontSize: '0.7rem', color: '#34d399', fontWeight: 700 }}>
                    <span>Cost: ₹{selectedRow.recommendedProject.estimatedCostLakhs} Lakhs</span>
                    <span>• Beneficiaries: {selectedRow.recommendedProject.expectedBeneficiaries.toLocaleString()}</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>

    </div>
  );
};
