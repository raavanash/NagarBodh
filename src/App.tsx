import React from 'react';
import { CivicProvider, useCivic } from './context/CivicContext';
import { Navbar } from './components/Navbar';
import { WeatherBanner } from './components/WeatherBanner';
import { LiveMap } from './components/Map/LiveMap';
import { MapSidebarLeft } from './components/Map/MapSidebarLeft';
import { IncidentDossier } from './components/Dossier/IncidentDossier';
import { SignalExplorer } from './components/Signals/SignalExplorer';
import { ResponsePlannerView } from './components/Planner/ResponsePlannerView';
import { HumanApprovalModal } from './components/Planner/HumanApprovalModal';
import { AuthorityDashboard } from './components/Authority/AuthorityDashboard';
import { ResolutionTimeline } from './components/Timeline/ResolutionTimeline';
import { DemoCommandCenter } from './components/Demo/DemoCommandCenter';
import { Activity, AlertTriangle, ShieldCheck, Truck } from 'lucide-react';

const AppContent: React.FC = () => {
  const { activeTab, incidents, currentStep } = useCivic();

  const totalClusters = incidents.length;
  const criticalCount = incidents.filter(i => i.priority.overallScore >= 80).length;
  const activeDispatches = incidents.filter(i => i.actionPlan?.status === 'approved' || i.status === 'approved' || i.status === 'dispatched' || i.status === 'on_site').length;
  const verifiedCount = incidents.filter(i => i.status === 'verified' || i.status === 'resolved').length;

  return (
    <div className="app-container">
      {/* Top Command Navbar */}
      <Navbar />

      {/* Real-Time IMD Weather & Rainfall Advisory Strip */}
      <WeatherBanner />

      {/* Main View Area */}
      <main className="main-content">
        {activeTab === 'live_map' && (
          <div className="map-view-container">
            {/* Left Sidebar: Concise CivicPulse List */}
            <MapSidebarLeft />

            {/* Hero Center Map Canvas */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div style={{ flex: 1, position: 'relative' }}>
                <LiveMap />
              </div>

              {/* Bottom Operational City Metrics Strip */}
              <div className="bottom-metrics-strip">
                <div className="metric-item">
                  <Activity size={13} color="var(--cyan-400)" />
                  <span>Active Clusters: <strong>{totalClusters}</strong></span>
                </div>
                <div className="metric-item">
                  <AlertTriangle size={13} color="#ef4444" />
                  <span>Critical P1: <strong>{criticalCount}</strong></span>
                </div>
                <div className="metric-item">
                  <Truck size={13} color="#38bdf8" />
                  <span>Dispatched Teams: <strong>{activeDispatches}</strong></span>
                </div>
                <div className="metric-item">
                  <ShieldCheck size={13} color="#34d399" />
                  <span>Verified Resolutions: <strong>{verifiedCount}</strong></span>
                </div>
              </div>
            </div>

            {/* Right Panel: Incident Intelligence Dossier */}
            <aside className="map-dossier-right">
              <IncidentDossier />
            </aside>
          </div>
        )}

        {activeTab === 'dossier' && (
          <div style={{ width: '100%', height: '100%', maxWidth: '1000px', margin: '0 auto', overflowY: 'auto' }}>
            <IncidentDossier standalone={true} />
          </div>
        )}

        {activeTab === 'signals' && <SignalExplorer />}

        {activeTab === 'dispatch' && <ResponsePlannerView />}

        {activeTab === 'authority' && <AuthorityDashboard />}

        {activeTab === 'timeline' && <ResolutionTimeline />}
      </main>

      {/* Floating Demo Control Pill */}
      <DemoCommandCenter />

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
