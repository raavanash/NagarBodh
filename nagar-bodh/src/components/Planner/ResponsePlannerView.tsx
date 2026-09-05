import React, { useState } from 'react';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Send,
  ShieldAlert,
  Truck,
  Users,
  Wrench
} from 'lucide-react';
import { useCivic } from '../../context/CivicContext';

export const ResponsePlannerView: React.FC = () => {
  const { incidents, approveDispatch, setSelectedIncidentId, setActiveTab } = useCivic();
  const [selectedPlanId, setSelectedPlanId] = useState<string>('incident-waterlogging-1');
  const [notes, setNotes] = useState('');

  const activeIncidents = incidents.filter(i => i.actionPlan);
  const currentIncident = activeIncidents.find(i => i.id === selectedPlanId) || activeIncidents[0];
  const plan = currentIncident?.actionPlan;

  return (
    <div style={{ padding: '1.5rem', height: '100%', overflowY: 'auto', background: 'var(--bg-canvas)' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <Send size={20} color="var(--cyan-400)" />
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
            AI Response Planner & Multi-Agency Dispatch
          </h2>
        </div>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
          Standard Operating Procedure (SOP) generator matching emergency severity, vulnerable infrastructure, and departmental assets with 1-click human verification.
        </p>
      </div>

      {/* Grid Layout: Left List of Plans, Right Selected Action Plan Dossier */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.25rem', alignItems: 'start' }}>
        {/* Left Column: Action Plans Queue */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.72rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--text-muted)' }}>
            Active Dispatch Queue ({activeIncidents.length})
          </div>

          {activeIncidents.map(inc => {
            const isSelected = inc.id === currentIncident?.id;
            const isApproved = inc.actionPlan?.status === 'approved';
            const isP1 = inc.priority.overallScore >= 80;

            return (
              <div
                key={inc.id}
                onClick={() => setSelectedPlanId(inc.id)}
                style={{
                  background: isSelected
                    ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(30, 41, 59, 0.9) 100%)'
                    : 'var(--bg-surface)',
                  border: isSelected ? '1px solid var(--cyan-400)' : '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '1rem',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                  <span
                    style={{
                      fontSize: '0.66rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: isApproved ? '#34d399' : isP1 ? '#f87171' : 'var(--amber-400)'
                    }}
                  >
                    {isApproved ? 'DISPATCHED' : inc.actionPlan?.priorityLevel}
                  </span>
                  <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                    ETA: {inc.actionPlan?.etaMinutes}m
                  </span>
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', marginBottom: '0.3rem' }}>
                  {inc.title}
                </div>

                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                  {inc.actionPlan?.primaryDepartment}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Dispatch Plan Card */}
        {currentIncident && plan ? (
          <div className="card" style={{ padding: '1.5rem', background: 'var(--bg-surface-elevated)' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <div>
                <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', fontWeight: 800, color: 'var(--cyan-400)', letterSpacing: '0.04em' }}>
                  {plan.priorityLevel} SOP DISPATCH ORDER #{plan.id}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', marginTop: '0.2rem' }}>
                  {currentIncident.title}
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <MapPin size={13} color="var(--cyan-400)" />
                    {plan.targetLocation}
                  </span>
                  <span>•</span>
                  <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>
                    Incident Priority: {currentIncident.priority.overallScore}/100
                  </span>
                </div>
              </div>

              {/* View in Map or Dossier button */}
              <button
                onClick={() => {
                  setSelectedIncidentId(currentIncident.id);
                  setActiveTab('live_map');
                }}
                className="sim-btn"
                style={{ fontSize: '0.75rem' }}
              >
                <span>View on Live Map</span>
                <ExternalLink size={13} />
              </button>
            </div>

            {/* Department Coordination */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div style={{ background: 'rgba(7, 10, 19, 0.5)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.3rem' }}>
                  <Building2 size={14} color="#38bdf8" />
                  <span>Lead Responding Agency</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#fff' }}>
                  {plan.primaryDepartment}
                </div>
              </div>

              <div style={{ background: 'rgba(7, 10, 19, 0.5)', padding: '0.85rem', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '0.3rem' }}>
                  <Users size={14} color="#c084fc" />
                  <span>Supporting Coordinated Agencies</span>
                </div>
                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#e2e8f0' }}>
                  {plan.secondaryDepartment || 'Traffic Police & Civil Defence'}
                </div>
              </div>
            </div>

            {/* SOP Action Items Checklist */}
            <div style={{ marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--cyan-400)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Wrench size={15} />
                <span>Standard Operating Procedure (SOP) Action Checklist</span>
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {plan.actions.map((action, i) => (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.6rem',
                      padding: '0.65rem 0.85rem',
                      background: 'rgba(7, 10, 19, 0.4)',
                      borderRadius: '6px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.82rem',
                      color: '#f8fafc'
                    }}
                  >
                    <span style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(6, 182, 212, 0.2)',
                      color: 'var(--cyan-400)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      flexShrink: 0
                    }}>
                      {i + 1}
                    </span>
                    <span>{action}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Equipment & Resource Roster */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.82rem', textTransform: 'uppercase', fontWeight: 700, color: 'var(--cyan-400)', marginBottom: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Truck size={15} />
                <span>Heavy Machinery & Equipment Deployment Roster</span>
              </h4>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Resource Item</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Quantity</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Assigned Unit</th>
                    <th style={{ padding: '0.5rem 0.75rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {plan.equipment.map((eq, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.65rem 0.75rem', fontWeight: 600, color: '#f8fafc' }}>{eq.name}</td>
                      <td style={{ padding: '0.65rem 0.75rem', fontFamily: 'var(--font-mono)' }}>x{eq.count}</td>
                      <td style={{ padding: '0.65rem 0.75rem', color: 'var(--text-secondary)' }}>{eq.assignedUnit}</td>
                      <td style={{ padding: '0.65rem 0.75rem' }}>
                        <span style={{
                          fontSize: '0.68rem',
                          fontWeight: 700,
                          padding: '0.15rem 0.45rem',
                          borderRadius: '4px',
                          background: plan.status === 'approved' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                          color: plan.status === 'approved' ? '#34d399' : '#fbbf24'
                        }}>
                          {plan.status === 'approved' ? 'DEPLOYED ON SITE' : 'STAGED FOR DISPATCH'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Approval Execution Footer */}
            {plan.status === 'approved' ? (
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.15) 100%)',
                  border: '1px solid rgba(16, 185, 129, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: '1rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={24} color="#34d399" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                      Dispatch Authorized & Active in Field
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#a7f3d0' }}>
                      Authorized By: {plan.approvedBy} • Timestamp: {plan.dispatchedAt}
                    </div>
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.84rem', color: '#34d399' }}>
                  Target Arrival ETA: ~{plan.etaMinutes} minutes
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button
                  className="dispatch-action-btn"
                  onClick={() => approveDispatch(currentIncident.id, notes)}
                >
                  <Send size={18} />
                  <span>APPROVE & DISPATCH ACTION PLAN (1-CLICK EXECUTION)</span>
                </button>
                <div style={{ textAlign: 'center', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  This triggers automated digital work-orders to MCD Zone East and Traffic Control Room.
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            No action plan available.
          </div>
        )}
      </div>
    </div>
  );
};
