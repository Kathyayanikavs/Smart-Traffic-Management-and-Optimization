import React, { useState } from 'react';
import type { Road } from '../utils/trafficEngine';

interface IncidentManagerProps {
  roads: Road[];
  onReportIncident: (roadId: string, type: 'accident' | 'construction' | 'hazard') => void;
  onClearIncident: (roadId: string) => void;
}

export const IncidentManager: React.FC<IncidentManagerProps> = ({
  roads,
  onReportIncident,
  onClearIncident,
}) => {
  const [selectedRoadId, setSelectedRoadId] = useState('');
  const [incidentType, setIncidentType] = useState<'accident' | 'construction' | 'hazard'>('accident');

  const activeIncidents = roads.filter(r => r.hasIncident);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRoadId) {
      onReportIncident(selectedRoadId, incidentType);
      setSelectedRoadId('');
    }
  };

  const getIncidentIcon = (type?: string) => {
    switch (type) {
      case 'accident': return '🚗💥';
      case 'construction': return '🚧';
      case 'hazard': return '⚠️';
      default: return '🚨';
    }
  };

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="panel-title">
        <span>
          <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Incident Response Center
        </span>
        <span className="badge-ui badge-red" style={{ fontSize: '10px' }}>
          Active dispatch
        </span>
      </div>

      {/* Quick Report Form */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '14px', background: 'rgba(255, 255, 255, 0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.04)' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 'bold', textTransform: 'uppercase' }}>Log road block / hazard</div>
        
        <div className="settings-overlay" style={{ gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              value={selectedRoadId}
              onChange={(e) => setSelectedRoadId(e.target.value)}
              className="form-select"
              style={{ padding: '6px 8px', fontSize: '12px' }}
              required
            >
              <option value="">Select roadway...</option>
              {roads.filter(r => !r.hasIncident).map(r => (
                <option key={r.id} value={r.id}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              value={incidentType}
              onChange={(e) => setIncidentType(e.target.value as any)}
              className="form-select"
              style={{ padding: '6px 8px', fontSize: '12px' }}
            >
              <option value="accident">Accident (Crash)</option>
              <option value="construction">Construction (Work)</option>
              <option value="hazard">Debris (Hazard)</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary btn-sm"
          style={{ width: '100%', marginTop: '8px', padding: '5px' }}
          disabled={!selectedRoadId}
        >
          🚨 Report Lane Incident
        </button>
      </form>

      {/* Active Incident List */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: '150px' }}>
        <div className="form-label" style={{ marginBottom: '6px' }}>Active Incidents ({activeIncidents.length})</div>
        {activeIncidents.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '11px', padding: '20px 0' }}>
            ✓ All roadways clear. No current incidents.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeIncidents.map(inc => (
              <div
                key={inc.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(239, 68, 68, 0.05)',
                  border: '1px solid rgba(239, 68, 68, 0.15)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                }}
              >
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>{getIncidentIcon(inc.incidentType)}</span>
                    <span style={{ textTransform: 'capitalize' }}>{inc.incidentType || 'Accident'}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                    {inc.name}
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge-ui badge-yellow" style={{ fontSize: '9px' }}>
                    Bypassed (1000m weight)
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '2px 8px', fontSize: '10px', background: 'rgba(255, 255, 255, 0.05)' }}
                    onClick={() => onClearIncident(inc.id)}
                  >
                    Clear
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
