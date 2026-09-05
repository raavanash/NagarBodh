import React from 'react';
import { CivicProvider, useCivic } from './context/CivicContext';
import { Navbar } from './components/Navbar';
import { WeatherBanner } from './components/WeatherBanner';
import { LiveMap } from './components/Map/LiveMap';
import { MapSidebarLeft } from './components/Map/MapSidebarLeft';
import { IncidentDossier } from './components/Dossier/IncidentDossier';
import { SignalExplorer } from './components/Signals/SignalExplorer';
import { ResponsePlannerView } from './components/Planner/ResponsePlannerView';
import { AuthorityDashboard } from './components/Authority/AuthorityDashboard';
import { ResolutionTimeline } from './components/Timeline/ResolutionTimeline';

const AppContent: React.FC = () => {
  const { activeTab, selectedIncident } = useCivic();

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
            {/* Left Sidebar: Filters & Incident List */}
            <MapSidebarLeft />

            {/* Center Map Canvas */}
            <LiveMap />

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
