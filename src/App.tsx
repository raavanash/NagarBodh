import React from 'react';
import { CivicProvider, useCivic } from './context/CivicContext';
import { Navbar } from './components/Navbar';
import { WeatherBanner } from './components/WeatherBanner';
import { LiveMap } from './components/Map/LiveMap';
import { MapSidebarLeft } from './components/Map/MapSidebarLeft';
import { IncidentDossier } from './components/Dossier/IncidentDossier';
import { SignalExplorer } from './components/Signals/SignalExplorer';
import { InvestmentGapsView } from './components/Gaps/InvestmentGapsView';
import { ResponsePlannerView } from './components/Planner/ResponsePlannerView';
import { HumanApprovalModal } from './components/Planner/HumanApprovalModal';
import { AuthorityDashboard } from './components/Authority/AuthorityDashboard';
import { ResolutionTimeline } from './components/Timeline/ResolutionTimeline';
import { DemoCommandCenter } from './components/Demo/DemoCommandCenter';
import { MobileBottomNav } from './components/common/MobileBottomNav';
import { Activity, AlertTriangle, Building2, CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, incidents, ingestionMode, demoResetNotification } = useCivic();

  const totalHotspots = incidents.length;
  const criticalP1Count = incidents.filter(i => i.priority.overallScore >= 80).length;
  const recommendedProjectsCount = incidents.filter(i => i.actionPlan?.status === 'approved' || i.status === 'approved' || i.status === 'dispatched' || i.status === 'on_site').length;
  const measuredImpactCount = incidents.filter(i => i.status === 'verified' || i.status === 'resolved').length;

  return (
    <div className="app-container">
      {/* Top Command Navbar */}
      <Navbar />

      {/* Real-Time Contextual Weather Advisory Strip */}
      <WeatherBanner />

      {/* Main View Area */}
      <main className="main-content">
        {(activeTab === 'development_map' || activeTab === 'live_map') && (
          <div className="map-view-container">
            {/* Left Sidebar: Concise Development Demand List */}
            <MapSidebarLeft />

            {/* Hero Center Map Canvas */}
            <div className="map-canvas-column" style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <LiveMap />
              </div>

              {/* Bottom Operational City Metrics Strip */}
              <div className="bottom-metrics-strip">
                <div className="metric-item">
                  <Activity size={13} color="#1e3a8a" />
                  <span>Active Demand Hotspots: <strong>{totalHotspots}</strong></span>
                </div>
                <div className="metric-item">
                  <AlertTriangle size={13} color="#dc2626" />
                  <span>Critical Investment Gaps (P1): <strong>{criticalP1Count}</strong></span>
                </div>
                <div className="metric-item">
                  <Building2 size={13} color="#0284c7" />
                  <span>Approved Projects: <strong>{recommendedProjectsCount}</strong></span>
                </div>
                <div className="metric-item">
                  <CheckCircle2 size={13} color="#059669" />
                  <span>Verified Outcomes: <strong>{measuredImpactCount}</strong></span>
                </div>
              </div>
            </div>

            {/* Right Panel: Demand Intelligence Dossier */}
            <aside className="map-dossier-right">
              <IncidentDossier />
            </aside>
          </div>
        )}

        {(activeTab === 'demand_intelligence' || activeTab === 'dossier') && (
          <div style={{ width: '100%', height: '100%', maxWidth: '1000px', margin: '0 auto', overflowY: 'auto' }}>
            <IncidentDossier standalone={true} />
          </div>
        )}

        {(activeTab === 'citizen_signals' || activeTab === 'signals') && <SignalExplorer />}

        {activeTab === 'investment_gaps' && <InvestmentGapsView />}

        {(activeTab === 'project_priorities' || activeTab === 'dispatch') && <ResponsePlannerView />}

        {(activeTab === 'policy_board' || activeTab === 'authority') && <AuthorityDashboard />}

        {(activeTab === 'impact' || activeTab === 'timeline') && <ResolutionTimeline />}
      </main>

      {/* Responsive Mobile Bottom Navigation Dock */}
      <MobileBottomNav />

      {/* Floating Demo Control Pill (Visible only in SIMULATION mode) */}
      {ingestionMode === 'SIMULATION' && <DemoCommandCenter />}

      {/* Visible Demo Reset Notification Toast */}
      {demoResetNotification && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1e3a8a',
            color: '#ffffff',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)',
            border: '1px solid #60a5fa',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            zIndex: 3000,
            fontSize: '0.85rem',
            fontWeight: 700,
            animation: 'fadeIn 0.2s ease-out'
          }}
        >
          <RotateCcw size={16} color="#93c5fd" />
          <span>{demoResetNotification}</span>
        </div>
      )}

      {/* Global Human Approval Modal */}
      <HumanApprovalModal />
    </div>
  );
};

export function App() {
  return (
    <CivicProvider>
      <AppContent />
    </CivicProvider>
  );
}

export default App;
