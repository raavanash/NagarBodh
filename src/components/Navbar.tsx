import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Activity,
  AlertTriangle,
  Building2,
  CheckCircle2,
  Database,
  Globe2,
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

  const criticalCount = incidents.filter(i => i.priority.overallScore >= 80).length;
  const pendingDispatchCount = incidents.filter(i => i.actionPlan?.status === 'pending_review' && i.priority.overallScore >= 70).length;

  const navItems = [
    {
      id: 'development_map',
      label: 'Development Map',
      icon: MapPin,
      badge: criticalCount > 0 ? criticalCount : undefined,
      badgeBg: 'bg-red-500 text-white',
      title: 'Geospatial Hotspots Map',
      isPrimary: false
    },
    {
      id: 'demand_intelligence',
      label: 'Demand Intelligence',
      icon: ShieldAlert,
      title: 'Priority & Context Analysis Dossier',
      isPrimary: false
    },
    {
      id: 'citizen_signals',
      label: 'Citizen Signals',
      icon: Activity,
      title: 'Multilingual Citizen Requests',
      isPrimary: false
    },
    {
      id: 'investment_gaps',
      label: 'Investment Board',
      icon: TrendingUp,
      title: 'Civic Investment Board — Infrastructure Deficit & Capital Gap Analysis',
      isPrimary: true
    },
    {
      id: 'project_priorities',
      label: 'Investment Pipeline',
      icon: Send,
      badge: pendingDispatchCount > 0 ? pendingDispatchCount : undefined,
      badgeBg: 'bg-amber-400 text-slate-900',
      title: 'Candidate Development Projects & Governance Approval Pipeline',
      isPrimary: true
    },
    {
      id: 'policy_board',
      label: 'Priority Leaderboard',
      icon: Sparkles,
      title: 'National & State Investment Priority Leaderboard',
      isPrimary: false
    },
    {
      id: 'impact',
      label: 'Impact Measurement',
      icon: CheckCircle2,
      title: 'Post-Intervention Impact Verification & Outcome Accountability',
      isPrimary: true
    }
  ];

  return (
    <header className="navbar bg-[#1e3a8a] text-white px-4 h-14 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <div className="navbar-top-bar flex items-center justify-between w-full gap-4 relative">
        
        {/* Brand Section */}
        <div className="brand-section flex items-center gap-3 flex-shrink-0">
          {/* Hamburger Menu Toggle Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-1.5 rounded-lg bg-blue-900/80 border border-blue-700/60 text-white hover:bg-blue-800 transition-colors cursor-pointer flex items-center justify-center"
            title="Toggle Command Menu"
            aria-label="Toggle Command Menu"
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <div className="logo-badge w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center border border-blue-400/30 text-white font-headline font-black shadow-sm">
            <Globe2 size={20} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="brand-title text-base font-headline font-extrabold tracking-tight text-white">
                NagarBodh
              </h1>
              <span className="brand-tag-badge text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-blue-900/60 border border-blue-400/30 text-blue-200">
                BRICS INTEL NODE
              </span>
            </div>

            <div className="brand-subtitle flex items-center gap-1.5 text-[11px] text-blue-200/80 font-medium mt-0.5">
              <Building2 size={11} className="text-blue-300" />
              <span>National Policy Command • Digital Public Infrastructure</span>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="nav-tabs hidden lg:flex items-center gap-1 bg-blue-950/60 p-1 rounded-lg border border-blue-800/60" aria-label="Command Views">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id
              || (item.id === 'development_map' && (activeTab === 'live_map'))
              || (item.id === 'demand_intelligence' && activeTab === 'dossier')
              || (item.id === 'citizen_signals' && activeTab === 'signals')
              || (item.id === 'project_priorities' && activeTab === 'dispatch')
              || (item.id === 'policy_board' && activeTab === 'authority')
              || (item.id === 'impact' && activeTab === 'timeline');
            const isPrimary = item.isPrimary;
            return (
              <button
                key={item.id}
                className={`nav-tab-btn px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isActive
                    ? 'active bg-white text-[#1e3a8a] shadow-sm font-extrabold ring-2 ring-blue-300'
                    : isPrimary
                    ? 'text-amber-200 hover:bg-blue-900/60 hover:text-white border border-amber-400/30 bg-blue-950/40'
                    : 'text-blue-100 hover:bg-blue-900/50 hover:text-white'
                }`}
                onClick={() => setActiveTab(item.id as any)}
                title={item.title}
              >
                <Icon size={14} />
                <span>{item.label}</span>
                {isPrimary && !isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" title="Primary Decision Journey" />
                )}
                {item.badge !== undefined && (
                  <span className={`text-[10px] font-extrabold px-1.5 py-0.2 rounded-full ${item.badgeBg}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Controls */}
        <div className="navbar-right-controls flex items-center gap-2 flex-shrink-0">
          {/* LIVE vs SIMULATION Ingestion Mode Switcher */}
          <div className="hidden sm:flex items-center bg-blue-950/70 p-1 rounded-lg border border-blue-800/60 text-xs font-semibold">
            <button
              onClick={() => setIngestionMode('LIVE')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                ingestionMode === 'LIVE' ? 'bg-emerald-500 text-white shadow-xs' : 'text-blue-200 hover:text-white'
              }`}
              title="Live ingestion via OpenWeather and Bluesky Jetstream WebSocket"
            >
              <span className={`w-2 h-2 rounded-full ${ingestionMode === 'LIVE' ? 'bg-white animate-pulse' : 'bg-blue-300'}`} />
              <span>LIVE</span>
            </button>

            <button
              onClick={() => setIngestionMode('SIMULATION')}
              className={`px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5 font-bold ${
                ingestionMode === 'SIMULATION' ? 'bg-blue-600 text-white shadow-xs' : 'text-blue-200 hover:text-white'
              }`}
              title="Use deterministic simulation steps and demo dataset"
            >
              <span className={`w-2 h-2 rounded-full ${ingestionMode === 'SIMULATION' ? 'bg-white' : 'bg-blue-300'}`} />
              <span>SIM</span>
            </button>
          </div>

          {/* Persistence Layer Status Badge */}
          <div
            className={`hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold ${
              persistenceStatus?.isLive
                ? 'bg-emerald-950/80 border-emerald-500/50 text-emerald-300'
                : 'bg-blue-900/60 border-blue-400/30 text-blue-200'
            }`}
            title={
              persistenceStatus?.isLive
                ? 'Firebase Firestore live persistence active'
                : 'Operating in deterministic Replay/Simulation fallback mode.'
            }
          >
            <Database size={12} className={persistenceStatus?.isLive ? 'text-emerald-400' : 'text-blue-300'} />
            <span>{persistenceStatus?.isLive ? 'FIREBASE LIVE' : 'DEMO FALLBACK'}</span>
          </div>

          {/* Clock Badge */}
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-950/60 border border-blue-800/60 text-[11px] font-mono font-bold text-blue-100">
            <span className={`w-1.5 h-1.5 rounded-full ${ingestionMode === 'LIVE' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
            <span>{operationalClock}</span>
          </div>

          {/* Commander Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-900/60 border border-blue-700/60 text-xs font-bold text-white">
            <UserCheck size={14} className="text-blue-300" />
            <span className="hidden sm:inline">Commander</span>
          </div>

          {/* Theme Switcher Toggle Button */}
          <button
            className="p-1.5 rounded-lg bg-blue-900/60 border border-blue-700/60 text-blue-200 hover:bg-blue-800 hover:text-white transition-colors cursor-pointer"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
          >
            {theme === 'light' ? (
              <Sun size={15} className="text-amber-300" />
            ) : (
              <Moon size={15} className="text-sky-300" />
            )}
          </button>
        </div>

        {/* Hamburger Dropdown Drawer Navigation (Portaled to document.body for top-level z-index) */}
        {isMenuOpen && typeof document !== 'undefined' && createPortal(
          <div className="fixed inset-0 z-[999999] flex flex-col">
            {/* Dark Backdrop Overlay */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Top-Level Drawer Container */}
            <div className="fixed top-14 left-4 z-[1000000] w-72 bg-[var(--bg-surface)] text-[var(--text-primary)] rounded-xl shadow-2xl border border-[var(--border-medium)] p-2 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 border-b border-[var(--border-subtle)] flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                  Command Navigation
                </span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 font-bold px-1.5 py-0.5 rounded border border-blue-500/30">
                  6 VIEWS
                </span>
              </div>

              <div className="py-1 flex flex-col gap-1">
                {navItems.map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id || (item.id === 'development_map' && activeTab === 'live_map') || (item.id === 'demand_intelligence' && activeTab === 'dossier') || (item.id === 'citizen_signals' && activeTab === 'signals') || (item.id === 'project_priorities' && activeTab === 'dispatch') || (item.id === 'policy_board' && activeTab === 'authority');
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-[var(--civic-blue-50)] text-[var(--text-accent)] border border-[var(--border-accent)]'
                          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={16} className={isActive ? 'text-[var(--text-accent)]' : 'text-[var(--text-muted)]'} />
                        <span>{item.label}</span>
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
