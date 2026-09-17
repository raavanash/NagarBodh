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
  Users,
  AlertTriangle,
  Droplets,
  Wallet,
  Search,
  Hourglass,
  ArrowUpRight
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { DevelopmentContextDataLayer } from '../../engine/context/DevelopmentContextDataLayer';
import { clusterDevelopmentRequests } from '../../engine/developmentDemandClusterEngine';
import {
  getIndiaDevelopmentPolicyBoard,
  PolicyLeaderboardRow
} from '../../engine/policyBoardEngine';
import { DevelopmentContext, DevelopmentDemandHotspot } from '../../types/development';
import { PriorityBadge, GeminiExplanationCard, HumanReviewStateBadge } from '../common';

export const AuthorityDashboard: React.FC = () => {
  const { signals, setSelectedIncidentId, setActiveTab } = useCivic();

  // State Filters
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
        if (rows.length > 0) {
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

  // Filtered Rows by search query
  const filteredRows = leaderboardRows.filter(r => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.district.toLowerCase().includes(query) ||
      r.state.toLowerCase().includes(query) ||
      r.developmentNeed.toLowerCase().includes(query)
    );
  });

  // Summary Metrics
  const p1Count = leaderboardRows.filter(r => r.priorityLevel === 'P1').length;
  const totalPopulation = leaderboardRows.reduce((sum, r) => sum + r.affectedPopulation, 0);
  const totalInvestmentGapLakhs = leaderboardRows.reduce((sum, r) => sum + r.investmentGapLakhs, 0);
  const topSector = leaderboardRows.length > 0 ? leaderboardRows[0].developmentNeed : 'Healthcare Access';

  return (
    <div className="bg-[var(--bg-canvas)] text-[var(--text-primary)] font-body antialiased flex flex-col h-full overflow-y-auto select-none p-4 md:p-6 space-y-4">
      
      {/* ================= SUB-HEADER BANNER & BREADCRUMB (Stitch Screen 03) ================= */}
      <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-xs text-[var(--text-muted)] mb-1">
            <span className="font-medium text-[var(--text-secondary)]">BRICS Development Intelligence</span>
            <ChevronRight size={14} className="text-[var(--text-muted)]" />
            <span>National Executive Council</span>
            <ChevronRight size={14} className="text-[var(--text-muted)]" />
            <span className="text-primary font-semibold">Policy Board & Decision Intelligence Workstation</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-headline font-extrabold text-[var(--text-primary)] tracking-tight">
              NagarBodh — Policy Board & Decision Intelligence Workstation
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
              DPG Sovereign Engine v4.2
            </span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            National & State Policymaker Decision Leaderboard • AI-Assisted Recommendation & Human Policy Review
          </p>
        </div>
        
        {/* Banner Actions */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[var(--text-primary)] bg-[var(--bg-surface-elevated)] border border-[var(--border-medium)] rounded-lg hover:bg-[var(--bg-card-hover)] transition-colors cursor-pointer">
            <FileSpreadsheet size={15} className="text-[var(--text-muted)]" />
            Export Intelligence (JSON)
          </button>
          <button className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors cursor-pointer">
            <Sparkles size={15} className="text-amber-400" />
            Simulate Interventions
          </button>
        </div>
      </div>

      {/* ================= CASCADING GEOGRAPHIC & SECTOR FILTER BAR ================= */}
      <section className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] px-6 py-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Geo Cascades */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/30 rounded-md font-semibold text-emerald-400">
              <ShieldAlert size={14} className="text-emerald-400" />
              <span>India 🇮🇳 (DPG Certified)</span>
            </div>
            
            <div className="flex items-center">
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mr-1.5">State:</label>
              <select
                value={selectedState}
                onChange={e => {
                  setSelectedState(e.target.value);
                  setSelectedDistrict('ALL');
                }}
                className="text-xs font-semibold bg-[var(--bg-surface-elevated)] border border-[var(--border-medium)] text-[var(--text-primary)] rounded-md pl-2.5 pr-7 py-1 focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer outline-none"
              >
                <option value="ALL">All States (National View)</option>
                {availableStates.filter(s => s !== 'ALL').map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center">
              <label className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mr-1.5">District:</label>
              <select
                value={selectedDistrict}
                onChange={e => setSelectedDistrict(e.target.value)}
                className="text-xs font-semibold bg-[var(--bg-surface-elevated)] border border-[var(--border-medium)] text-[var(--text-primary)] rounded-md pl-2.5 pr-7 py-1 focus:ring-1 focus:ring-primary focus:border-primary cursor-pointer outline-none"
              >
                <option value="ALL">All Districts</option>
                {availableDistricts.filter(d => d !== 'ALL').map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <span className="text-[11px] font-mono text-[var(--text-muted)] hidden xl:inline-flex items-center gap-1 ml-2">
              <Sparkles size={13} className="text-amber-500" />
              Matrix Cycle: 2026-Q3 (Active Run)
            </span>
          </div>

          {/* Sector Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedCategory('ALL')}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer ${
                selectedCategory === 'ALL'
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
              }`}
            >
              All Sectors ({leaderboardRows.length})
            </button>
            <button
              onClick={() => setSelectedCategory('WATER')}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer ${
                selectedCategory === 'WATER'
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
              }`}
            >
              Water & Sanitation
            </button>
            <button
              onClick={() => setSelectedCategory('HEALTHCARE')}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer ${
                selectedCategory === 'HEALTHCARE'
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
              }`}
            >
              Healthcare Access
            </button>
            <button
              onClick={() => setSelectedCategory('ROADS')}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer ${
                selectedCategory === 'ROADS'
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
              }`}
            >
              Roads & Corridor
            </button>
            <button
              onClick={() => setSelectedCategory('ELECTRICITY')}
              className={`px-2.5 py-1 text-xs rounded-full font-medium transition-colors cursor-pointer ${
                selectedCategory === 'ELECTRICITY'
                  ? 'bg-primary text-white font-semibold shadow-xs'
                  : 'border border-[var(--border-subtle)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-elevated)]'
              }`}
            >
              Power Grid
            </button>
          </div>
        </div>
      </section>

      {/* ================= TOP SUMMARY KPI CARDS (4 GRID STITCH) ================= */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 shadow-xs relative overflow-hidden">
          <div className="absolute right-3 top-3 w-10 h-10 rounded-lg bg-red-500/15 flex items-center justify-center text-red-500">
            <AlertTriangle size={22} />
          </div>
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            P1 National High Priority Regions
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-headline font-extrabold text-[var(--text-primary)] font-mono">{p1Count} Regions</span>
            <span className="text-xs font-semibold text-red-400 bg-red-500/15 px-2 py-0.5 rounded border border-red-500/30">Critical Escalation</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2 flex items-center gap-1 font-mono">
            <AlertCircle size={13} className="text-red-500" />
            &gt;80 Vulnerability Score • Immediate Action Mandate
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 shadow-xs relative overflow-hidden">
          <div className="absolute right-3 top-3 w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center text-primary">
            <Building2 size={22} />
          </div>
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Top Macro Sector Need
          </div>
          <div className="text-base font-headline font-bold text-[var(--text-primary)] truncate">
            {topSector}
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2 flex items-center gap-1">
            <MapPin size={13} className="text-[var(--text-muted)]" />
            Highest nationwide infrastructure deficit score
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 shadow-xs relative overflow-hidden">
          <div className="absolute right-3 top-3 w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center text-purple-400">
            <Users size={22} />
          </div>
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Target Affected Population
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-headline font-extrabold text-[var(--text-primary)] font-mono">{totalPopulation.toLocaleString()}</span>
            <span className="text-xs text-[var(--text-muted)]">Citizens</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2 flex items-center gap-1 font-mono">
            <PieChart size={13} className="text-purple-400" />
            High Vulnerability Ratio 28.4%
          </p>
        </div>

        {/* Card 4 */}
        <div className="bg-[var(--bg-surface)] rounded-xl border border-[var(--border-subtle)] p-4 shadow-xs relative overflow-hidden">
          <div className="absolute right-3 top-3 w-10 h-10 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <TrendingUp size={22} />
          </div>
          <div className="text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-1">
            Total Unfunded Investment Gap
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-headline font-extrabold text-[var(--text-primary)] font-mono">₹{(totalInvestmentGapLakhs / 100).toFixed(1)} Cr</span>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2 flex items-center gap-1 font-mono">
            <span className="text-emerald-400 font-bold">₹{totalInvestmentGapLakhs.toLocaleString()} Lakhs</span>
            <span>Capital Pool Gap</span>
          </p>
        </div>
      </section>

      {/* ================= MAIN TWO-COLUMN WORKSPACE (8 COLS TABLE + 4 COLS DRAWER) ================= */}
      <main className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* LEFT COLUMN: Policy Leaderboard Table (8 of 12 cols) */}
        <section className={`${selectedRow ? 'lg:col-span-7 xl:col-span-8' : 'col-span-12'} bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xs flex flex-col overflow-hidden`}>
          
          {/* Table Header & Search */}
          <div className="p-4 border-b border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-surface)]">
            <div className="flex items-center gap-3">
              <h2 className="text-sm font-headline font-bold text-[var(--text-primary)] flex items-center gap-2">
                <span>National & State Policy Leaderboard</span>
                <span className="bg-[var(--bg-surface-elevated)] text-[var(--text-secondary)] text-xs px-2 py-0.5 rounded-full font-mono font-medium border border-[var(--border-subtle)]">
                  {filteredRows.length} Regions Ranked
                </span>
              </h2>
            </div>
            
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative w-48 sm:w-56">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search Ward / District..."
                  className="w-full pl-8 pr-2 py-1 text-xs bg-[var(--bg-surface-elevated)] border border-[var(--border-medium)] rounded-md text-[var(--text-primary)] focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                />
              </div>
            </div>
          </div>

          {/* Table Container */}
          {isLoading ? (
            <div className="py-16 text-center text-[var(--text-muted)] text-xs font-semibold">
              Loading Sovereign Policy Matrix...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[var(--bg-surface-elevated)] border-b border-[var(--border-subtle)] text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider font-label">
                    <th className="py-2.5 px-3 text-center w-12">Rank</th>
                    <th className="py-2.5 px-3">Territory / District</th>
                    <th className="py-2.5 px-3">Primary Sector Need</th>
                    <th className="py-2.5 px-3 text-center">Priority</th>
                    <th className="py-2.5 px-3 text-center">Infra Deficit</th>
                    <th className="py-2.5 px-3 text-right">Unfunded CapEx</th>
                    <th className="py-2.5 px-3 text-right">Affected Citizens</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filteredRows.map(row => {
                    const isSelected = selectedRow?.id === row.id;
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedRow(row)}
                        className={`transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-[var(--civic-blue-50)] font-semibold border-l-4 border-l-primary'
                            : 'hover:bg-[var(--bg-card-hover)]'
                        }`}
                      >
                        <td className="py-3 px-3 text-center font-mono font-bold text-[var(--text-primary)]">
                          <span className={`w-6 h-6 inline-flex items-center justify-center rounded-full text-xs ${isSelected ? 'bg-primary text-white' : 'bg-[var(--bg-surface-elevated)] text-[var(--text-primary)]'}`}>
                            #{row.rank}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-bold text-[var(--text-primary)] text-xs">{row.district}</div>
                          <div className="text-[11px] text-[var(--text-muted)] font-mono">{row.state}</div>
                        </td>
                        <td className="py-3 px-3">
                          <div className="font-medium text-[var(--text-primary)]">{row.developmentNeed}</div>
                          <div className="text-[10px] text-[var(--text-muted)]">{row.category}</div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <PriorityBadge level={row.priorityLevel} score={row.priorityScore} />
                        </td>
                        <td className="py-3 px-3 text-center font-mono font-semibold text-[var(--text-primary)]">
                          <div className="flex items-center justify-center gap-1.5">
                            <span>{row.priorityScore}%</span>
                            <div className="w-12 bg-[var(--bg-surface-elevated)] h-1.5 rounded-full overflow-hidden border border-[var(--border-subtle)]">
                              <div
                                className={`h-full ${row.priorityLevel === 'P1' ? 'bg-red-600' : row.priorityLevel === 'P2' ? 'bg-amber-500' : 'bg-blue-600'}`}
                                style={{ width: `${row.priorityScore}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-[var(--text-primary)]">
                          ₹{row.investmentGapLakhs} L
                        </td>
                        <td className="py-3 px-3 text-right font-mono text-[var(--text-secondary)]">
                          {row.affectedPopulation.toLocaleString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN: Policy Detail Drawer (4 of 12 cols) */}
        {selectedRow && (
          <aside className="lg:col-span-5 xl:col-span-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-xs p-5 flex flex-col gap-4 sticky top-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-[11px] font-mono font-bold text-blue-400 bg-blue-500/15 px-2 py-0.5 rounded border border-blue-500/30">
                  RANK #{selectedRow.rank} REGION DOSSIER
                </span>
                <h3 className="text-lg font-headline font-extrabold text-[var(--text-primary)] mt-1">
                  {selectedRow.district}
                </h3>
                <p className="text-xs text-[var(--text-muted)]">{selectedRow.state} • India</p>
              </div>
              <PriorityBadge level={selectedRow.priorityLevel} score={selectedRow.priorityScore} />
            </div>

            {/* Metric Grid */}
            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="bg-[var(--bg-surface-elevated)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                <div className="text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-wider">Primary Need</div>
                <div className="font-bold text-[var(--text-primary)] mt-0.5 truncate">{selectedRow.developmentNeed}</div>
              </div>
              <div className="bg-[var(--bg-surface-elevated)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                <div className="text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-wider">Affected Citizens</div>
                <div className="font-mono font-bold text-[var(--text-primary)] mt-0.5">{selectedRow.affectedPopulation.toLocaleString()}</div>
              </div>
              <div className="bg-[var(--bg-surface-elevated)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                <div className="text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-wider">Infra Deficit Index</div>
                <div className="font-mono font-bold text-red-500 mt-0.5">{selectedRow.priorityScore}/100</div>
              </div>
              <div className="bg-[var(--bg-surface-elevated)] p-2.5 rounded-lg border border-[var(--border-subtle)]">
                <div className="text-[var(--text-muted)] font-bold text-[10px] uppercase tracking-wider">Capital Deficit</div>
                <div className="font-mono font-bold text-amber-500 mt-0.5">₹{selectedRow.investmentGapLakhs} Lakhs</div>
              </div>
            </div>

            {/* Gemini Rationale Card */}
            <GeminiExplanationCard
              explanation={selectedRow.geminiExplanation || `High priority candidate for state capital intervention in ${selectedRow.developmentNeed}. Recommend immediate project feasibility allocation.`}
            />

            {/* Action Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-[var(--border-subtle)]">
              <button
                onClick={() => {
                  setSelectedIncidentId(selectedRow.id);
                  setActiveTab('demand_intelligence');
                }}
                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-primary hover:bg-blue-900 rounded-lg shadow-xs transition-colors text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>Inspect Demand Dossier</span>
                <ArrowUpRight size={14} />
              </button>
              <button
                onClick={() => {
                  setActiveTab('project_priorities');
                }}
                className="flex-1 py-2 px-3 text-xs font-bold text-[var(--text-primary)] bg-[var(--bg-surface-elevated)] hover:bg-[var(--bg-card-hover)] border border-[var(--border-medium)] rounded-lg transition-colors text-center cursor-pointer"
              >
                Draft Project Proposal
              </button>
            </div>
          </aside>
        )}

      </main>
    </div>
  );
};

export default AuthorityDashboard;
