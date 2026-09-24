import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ChevronDown,
  Database,
  Globe2,
  HelpCircle,
  MapPin,
  Menu,
  Moon,
  Send,
  ShieldAlert,
  Sparkles,
  Sun,
  TrendingUp,
  UserCheck,
  X
} from 'lucide-react';
import { useCivic } from '../context/CivicContext';

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    incidents,
    ingestionMode,
    setIngestionMode,
    theme,
    toggleTheme,
    persistenceStatus,
    operationalClock
  } = useCivic();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  const criticalCount = incidents.filter(i => i.priority.overallScore >= 80).length;
  const pendingDispatchCount = incidents.filter(i => i.actionPlan?.status === 'pending_review' && i.priority.overallScore >= 70).length;

  // Primary 4 Decision Destinations matching Stitch & Product Specification
  const primaryNavItems = [
    {
      id: 'investment_gaps',
      label: 'INVEST',
      sublabel: 'Where should we intervene?',
      icon: TrendingUp,
      title: 'Civic Investment Board — Infrastructure Deficit & Capital Gap Analysis'
    },
    {
      id: 'development_map',
      label: 'MAP',
      sublabel: 'Where is the problem?',
      icon: MapPin,
      badge: criticalCount > 0 ? criticalCount : undefined,
      badgeBg: 'bg-red-500 text-white',
      title: 'Spatial Evidence Lens — Hotspot Clusters & Asset Vulnerability'
    },
    {
      id: 'project_priorities',
      label: 'DECIDE',
      sublabel: 'What intervention are we authorizing?',
      icon: Send,
      badge: pendingDispatchCount > 0 ? pendingDispatchCount : undefined,
      badgeBg: 'bg-amber-400 text-slate-900',
      title: 'Decision & Approvals Pipeline — Candidate Development Projects'
    },
    {
      id: 'impact',
      label: 'IMPACT',
      sublabel: 'What outcome did the intervention produce / project?',
      icon: CheckCircle2,
      title: 'Impact Verification & Outcome Accountability'
    }
  ];

  // Secondary & Advanced Capabilities (Disclosed under MORE)
  const secondaryNavItems = [
    {
      id: 'citizen_signals',
      label: 'Citizen Signals & Telemetry',
      sublabel: 'Multilingual citizen requests, Bluesky Jetstream feed',
      icon: Activity
    },
    {
      id: 'policy_board',
      label: 'National Policy Leaderboard',
      sublabel: 'National & State macro benchmarking across districts',
      icon: Sparkles
    },
    {
      id: 'demand_intelligence',
      label: 'Historical Incident Dossiers',
      sublabel: 'Diagnostic archives & raw incident telemetry',
      icon: ShieldAlert
    }
  ];

  const isMoreActive =
    activeTab === 'citizen_signals' || activeTab === 'signals' ||
    activeTab === 'policy_board' || activeTab === 'authority' ||
    activeTab === 'demand_intelligence' || activeTab === 'dossier';

  return (
    <header className="navbar bg-[#0f172a] text-white px-4 h-14 flex items-center justify-between sticky top-0 z-50 shadow-md border-b border-slate-800">
      <div className="navbar-top-bar flex items-center justify-between w-full gap-4 relative">
        
        {/* Brand Section */}
        <div className="brand-section flex items-center gap-3 flex-shrink-0" data-tour="brand">
          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white hover:bg-slate-800 transition-colors cursor-pointer flex items-center justify-center lg:hidden"
            title="Toggle Command Menu"
            aria-label="Toggle Command Menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="logo-badge w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center border border-blue-400/40 text-white font-headline font-black shadow-sm">
            <Globe2 size={20} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="brand-title text-base font-headline font-extrabold tracking-tight text-white">
                NagarBodh
              </h1>
              <span className="brand-tag-badge text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-950 border border-blue-400/40 text-blue-300">
                BRICS INTEL NODE
              </span>
            </div>

            <div className="brand-subtitle flex items-center gap-1.5 text-[11px] text-slate-300 font-medium mt-0.5">
              <Building2 size={11} className="text-blue-400" />
              <span>Civic Decision Intelligence • Digital Public Infrastructure</span>
            </div>
          </div>
        </div>

        {/* Primary Desktop Navigation Bar: INVEST | MAP | DECIDE | IMPACT | MORE ▾ */}
        <nav className="nav-tabs hidden lg:flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800 shadow-inner" aria-label="Command Views">
          {primaryNavItems.map(item => {
            const Icon = item.icon;
            const isActive =
              (item.id === 'investment_gaps' && activeTab === 'investment_gaps') ||
              (item.id === 'development_map' && (activeTab === 'development_map' || activeTab === 'live_map')) ||
              (item.id === 'project_priorities' && (activeTab === 'project_priorities' || activeTab === 'dispatch')) ||
              (item.id === 'impact' && (activeTab === 'impact' || activeTab === 'timeline'));

            let dataTourId = 'nav-invest';
            if (item.id === 'development_map') dataTourId = 'nav-map';
            if (item.id === 'project_priorities') dataTourId = 'nav-decide';
            if (item.id === 'impact') dataTourId = 'nav-impact';

            return (
              <button
                key={item.id}
                data-tour={dataTourId}
                className={`nav-tab-btn px-3.5 py-1.5 rounded-md text-xs font-bold tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'active bg-blue-600 text-white shadow-sm ring-1 ring-blue-400 font-extrabold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
                onClick={() => {
                  setActiveTab(item.id as any);
                  setIsMoreOpen(false);
                }}
                title={item.title}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${item.badgeBg}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="h-4 w-[1px] bg-slate-800 mx-1" />

          {/* MORE Dropdown Menu */}
          <div className="relative">
            <button
              onClick={() => setIsMoreOpen(!isMoreOpen)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                isMoreActive
                  ? 'bg-blue-900/70 text-blue-200 border border-blue-600/50'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
              title="Secondary & Advanced Capabilities"
            >
              <span>More</span>
              <ChevronDown size={13} className={`transition-transform duration-150 ${isMoreOpen ? 'rotate-180' : ''}`} />
              {isMoreActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              )}
            </button>

            {isMoreOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsMoreOpen(false)}
                />
                <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900 text-white rounded-lg shadow-2xl border border-slate-700 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold border-b border-slate-800">
                    Advanced Capabilities
                  </div>
                  {secondaryNavItems.map(item => {
                    const Icon = item.icon;
                    const isActive =
                      (item.id === 'citizen_signals' && (activeTab === 'citizen_signals' || activeTab === 'signals')) ||
                      (item.id === 'policy_board' && (activeTab === 'policy_board' || activeTab === 'authority')) ||
                      (item.id === 'demand_intelligence' && (activeTab === 'demand_intelligence' || activeTab === 'dossier'));
                    return (
                      <button
                        key={item.id}
                        data-tour={item.id === 'citizen_signals' ? 'nav-signals' : undefined}
                        onClick={() => {
                          setActiveTab(item.id as any);
                          setIsMoreOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-start gap-2.5 transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-blue-900/60 text-blue-200'
                            : 'hover:bg-slate-800 text-slate-300 hover:text-white'
                        }`}
                      >
                        <Icon size={16} className={isActive ? 'text-blue-400 mt-0.5' : 'text-slate-400 mt-0.5'} />
                        <div className="flex flex-col">
                          <span className="text-xs font-bold">{item.label}</span>
                          <span className="text-[10px] text-slate-400 leading-tight">{item.sublabel}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </nav>

        {/* Controls */}
        <div className="navbar-right-controls flex items-center gap-2 flex-shrink-0">
          {/* LIVE vs SIMULATION Ingestion Mode Switcher */}
          <div className="hidden sm:flex items-center bg-slate-900 p-1 rounded-lg border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setIngestionMode('LIVE')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                ingestionMode === 'LIVE' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Live ingestion via OpenWeather and Bluesky Jetstream WebSocket"
            >
              <span className={`w-2 h-2 rounded-full ${ingestionMode === 'LIVE' ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
              <span>● LIVE</span>
            </button>

            <button
              onClick={() => setIngestionMode('SIMULATION')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                ingestionMode === 'SIMULATION' ? 'bg-blue-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
              }`}
              title="Use deterministic simulation steps and demo dataset"
            >
              <span className={`w-2 h-2 rounded-full ${ingestionMode === 'SIMULATION' ? 'bg-white' : 'bg-slate-500'}`} />
              <span>◆ SIMULATION</span>
            </button>
          </div>


          {/* Clock Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono font-bold text-slate-300">
            <span className={`w-1.5 h-1.5 rounded-full ${ingestionMode === 'LIVE' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            <span>{operationalClock}</span>
          </div>

          {/* Commander / Decision Authority Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-bold text-white">
            <UserCheck size={14} className="text-blue-400" />
            <span className="hidden sm:inline">Decision Authority</span>
          </div>

          {/* Guided Tour Help Button */}
          <button
            data-tour="help-btn"
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-blue-400 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            onClick={() => window.dispatchEvent(new CustomEvent('nagarbodh:restart-tour'))}
            title="Restart Guided Tour"
            aria-label="Restart Guided Tour"
          >
            <HelpCircle size={15} />
          </button>

          {/* Theme Switcher Toggle Button */}
          <button
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
          >
            {theme === 'light' ? (
              <Sun size={15} className="text-amber-400" />
            ) : (
              <Moon size={15} className="text-sky-300" />
            )}
          </button>
        </div>

        {/* Hamburger Mobile Menu Drawer */}
        {isMenuOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[999999] flex flex-col">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsMenuOpen(false)}
            />

            <div className="fixed top-14 left-4 z-[1000000] w-80 bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl shadow-2xl border border-[var(--border-medium)] p-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-2 py-1.5 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                  Primary Decision Journey
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-500 font-bold px-1.5 py-0.5 rounded border border-blue-500/30">
                  4 STAGES
                </span>
              </div>

              <div className="py-1.5 flex flex-col gap-1">
                {primaryNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive =
                    (item.id === 'investment_gaps' && activeTab === 'investment_gaps') ||
                    (item.id === 'development_map' && (activeTab === 'development_map' || activeTab === 'live_map')) ||
                    (item.id === 'project_priorities' && (activeTab === 'project_priorities' || activeTab === 'dispatch')) ||
                    (item.id === 'impact' && (activeTab === 'impact' || activeTab === 'timeline'));

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[var(--civic-blue-50)] text-[var(--text-accent)] border border-[var(--border-accent)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? 'text-[var(--text-accent)]' : 'text-[var(--text-muted)]'} />
                        <div>
                          <div>{item.label}</div>
                          <div className="text-[10px] text-[var(--text-muted)] font-normal">{item.sublabel}</div>
                        </div>
                      </div>

                      {item.badge !== undefined && (
                        <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${item.badgeBg}`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] px-2 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                Advanced Capabilities
              </div>

              <div className="py-1 flex flex-col gap-1">
                {secondaryNavItems.map(item => {
                  const Icon = item.icon;
                  const isActive =
                    (item.id === 'citizen_signals' && (activeTab === 'citizen_signals' || activeTab === 'signals')) ||
                    (item.id === 'policy_board' && (activeTab === 'policy_board' || activeTab === 'authority')) ||
                    (item.id === 'demand_intelligence' && (activeTab === 'demand_intelligence' || activeTab === 'dossier'));

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[var(--civic-blue-50)] text-[var(--text-accent)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon size={14} className={isActive ? 'text-[var(--text-accent)]' : 'text-[var(--text-muted)]'} />
                        <span>{item.label}</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-[var(--border-subtle)] px-3 py-1 flex items-center justify-between text-[11px] text-[var(--text-muted)] font-medium">
                <span>Mode: <strong className="text-[var(--text-primary)]">{ingestionMode}</strong></span>
                <span>Clock: <strong className="text-[var(--text-primary)]">{operationalClock}</strong></span>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </header>
  );
};

export default Navbar;
