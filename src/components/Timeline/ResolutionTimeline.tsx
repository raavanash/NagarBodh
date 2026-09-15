import React, { useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Flame,
  Send,
  ShieldCheck,
  User,
  Zap
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';
import { ResolutionVerificationPanel } from '../Verification/ResolutionVerificationPanel';

export const ResolutionTimeline: React.FC = () => {
  const { auditLogs, selectedIncident, incidents } = useCivic();
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = auditLogs.filter(log => {
    if (filterType === 'all') return true;
    if (filterType === 'priority_spike' && (log.type === 'priority_spike' || log.type === 'incident_triaged')) return true;
    if (filterType === 'dispatch' && (log.type === 'dispatch_approved' || log.type === 'crew_dispatched')) return true;
    if (filterType === 'clustering' && (log.type === 'cluster_formed' || log.type === 'cluster_updated' || log.type === 'response_plan_generated')) return true;
    if (filterType === 'resolution' && (log.type === 'resolution_begun' || log.type === 'resolution_confirmed' || log.type === 'field_verification')) return true;
    return false;
  });

  return (
    <div className="timeline-view-container bg-slate-50 min-h-screen text-slate-900 p-4 md:p-6 overflow-y-auto font-body flex flex-col gap-6">
      
      {/* 1. Development Impact Measurement Dashboard (Stitch Screen 04 Split) */}
      <ResolutionVerificationPanel incident={selectedIncident || incidents[0]} />

      {/* 2. Auditable Impact Audit Trail Stream */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="mb-5 flex items-center justify-between flex-wrap gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="text-primary" size={20} />
              <h2 className="text-lg font-headline font-extrabold text-slate-900">
                Auditable Impact & Resolution Audit Trail
              </h2>
            </div>
            <p className="text-xs text-slate-500 font-medium">Immutable verification log tracking demand lifecycle and satellite evidence</p>
          </div>

          {/* Filter Pills */}
          <div className="timeline-filter-pills flex gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200 flex-wrap text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                filterType === 'all' ? 'bg-primary text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Events ({auditLogs.length})
            </button>
            <button
              onClick={() => setFilterType('priority_spike')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                filterType === 'priority_spike' ? 'bg-red-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Priority & Triaged
            </button>
            <button
              onClick={() => setFilterType('clustering')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                filterType === 'clustering' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Clustering & SOPs
            </button>
            <button
              onClick={() => setFilterType('dispatch')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                filterType === 'dispatch' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dispatches Executed
            </button>
            <button
              onClick={() => setFilterType('resolution')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer ${
                filterType === 'resolution' ? 'bg-cyan-600 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Resolutions & Verifications
            </button>
          </div>
        </div>

        {/* Timeline Stream */}
        <div className="timeline-stream-container relative pl-8 md:pl-10">
          {/* Continuous vertical line */}
          <div
            className="timeline-vertical-line absolute left-4 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-600 via-purple-500 to-emerald-500 opacity-30"
          />

          <div className="flex flex-col gap-4">
            {filteredLogs.map(log => {
              const isSpike = log.type === 'priority_spike' || log.type === 'incident_triaged';
              const isDispatch = log.type === 'dispatch_approved' || log.type === 'crew_dispatched';
              const isResolution = log.type === 'resolution_confirmed' || log.type === 'field_verification' || log.type === 'resolution_begun';
              const isCluster = log.type === 'cluster_formed' || log.type === 'cluster_updated' || log.type === 'response_plan_generated';

              let nodeBg = 'bg-slate-800';
              let nodeBorder = 'border-slate-300';
              let icon = <Activity size={16} />;
              let badgeStyle = 'bg-slate-100 text-slate-700 border-slate-200';

              if (isSpike) {
                nodeBg = 'bg-red-600';
                nodeBorder = 'border-red-200';
                icon = <Flame size={18} />;
                badgeStyle = 'bg-red-50 text-red-700 border-red-200';
              } else if (isDispatch) {
                nodeBg = 'bg-emerald-600';
                nodeBorder = 'border-emerald-200';
                icon = <Send size={16} />;
                badgeStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
              } else if (isResolution) {
                nodeBg = 'bg-cyan-600';
                nodeBorder = 'border-cyan-200';
                icon = <CheckCircle2 size={18} />;
                badgeStyle = 'bg-cyan-50 text-cyan-700 border-cyan-200';
              } else if (isCluster) {
                nodeBg = 'bg-purple-600';
                nodeBorder = 'border-purple-200';
                icon = <Zap size={16} />;
                badgeStyle = 'bg-purple-50 text-purple-700 border-purple-200';
              }

              return (
                <div key={log.id} className="relative group">
                  {/* Node icon */}
                  <div
                    className={`timeline-node-icon absolute -left-8 md:-left-10 top-1 w-8 h-8 rounded-full ${nodeBg} border-2 ${nodeBorder} flex items-center justify-center text-white shadow-xs z-10`}
                  >
                    {icon}
                  </div>

                  {/* Event Card */}
                  <div className="bg-slate-50 hover:bg-white border border-slate-200 rounded-xl p-4 transition-colors shadow-xs">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded border ${badgeStyle}`}>
                          {log.type.replace(/_/g, ' ')}
                        </span>
                        <span className="text-xs text-slate-500">
                          Actor: <strong className="text-slate-800 font-semibold">{log.actor}</strong>
                        </span>
                      </div>

                      <div className="font-mono text-xs text-blue-900 font-bold">
                        ⏱ {log.timeLabel}
                      </div>
                    </div>

                    <h3 className="text-sm font-headline font-bold text-slate-900 mb-1">
                      {log.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      {log.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResolutionTimeline;
