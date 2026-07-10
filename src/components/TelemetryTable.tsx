import React, { useState } from 'react';
import type { Road } from '../utils/trafficEngine';

interface TelemetryTableProps {
  roads: Road[];
  onTriggerIncident: (roadId: string, type: 'accident' | 'construction' | 'hazard') => void;
  isLoading?: boolean;
  error?: string | null;
}

export const TelemetryTable: React.FC<TelemetryTableProps> = ({ 
  roads, 
  onTriggerIncident,
  isLoading = false,
  error = null
}) => {
  const [filterType, setFilterType] = useState<'all' | 'congested' | 'incidents'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRoads = roads.filter(road => {
    // Search filter
    const matchesSearch = road.name.toLowerCase().includes(searchTerm.toLowerCase()) || road.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    // Category filter
    if (filterType === 'congested') return road.congestion > 0.5;
    if (filterType === 'incidents') return road.hasIncident;
    return true;
  });

  const getCongestionBadgeClass = (level: number) => {
    if (level > 0.7) return 'badge-red';
    if (level > 0.4) return 'badge-yellow';
    return 'badge-green';
  };

  const getCongestionLabel = (level: number) => {
    if (level > 0.7) return 'Gridlock';
    if (level > 0.4) return 'Heavy';
    return 'Optimal';
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
      <div className="panel-title">
        <span>
          <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          IoT Sensor Telemetry & Road Congestion
        </span>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px' }}>
        <input
          type="text"
          placeholder="Filter by road name..."
          className="form-input"
          style={{ flex: 1, padding: '6px 12px', fontSize: '12px' }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        
        <div className="control-tabs" style={{ padding: '2px' }}>
          <button
            className={`tab-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => setFilterType('all')}
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            All
          </button>
          <button
            className={`tab-btn ${filterType === 'congested' ? 'active' : ''}`}
            onClick={() => setFilterType('congested')}
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            Congested
          </button>
          <button
            className={`tab-btn ${filterType === 'incidents' ? 'active' : ''}`}
            onClick={() => setFilterType('incidents')}
            style={{ padding: '4px 10px', fontSize: '11px' }}
          >
            Incidents
          </button>
        </div>
      </div>

      <div className="table-container" style={{ flex: 1, maxHeight: '280px', overflowY: 'auto' }}>
        <table className="telemetry-table">
          <thead>
            <tr>
              <th>Sensor ID</th>
              <th>Roadway Name</th>
              <th style={{ textAlign: 'center' }}>Cars</th>
              <th style={{ textAlign: 'center' }}>Avg Speed</th>
              <th style={{ textAlign: 'center' }}>Congestion</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--accent-cyan)', padding: '24px' }}>
                  <div className="status-dot loading" style={{ display: 'inline-block', marginRight: '8px' }}></div>
                  Connecting and reading live Azure SQL Database...
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--traffic-red)', padding: '24px', fontWeight: 'bold' }}>
                  ⚠️ API Fetch Error: {error}
                </td>
              </tr>
            ) : filteredRoads.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px' }}>
                  No active roadways fit the filter.
                </td>
              </tr>
            ) : (
              filteredRoads.map(road => (
                <tr key={road.id}>
                  <td style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                    S_{road.id.replace('R_', '')}
                  </td>
                  <td>
                    {road.name}
                    {road.hasIncident && (
                      <span className="badge-ui badge-red" style={{ marginLeft: '6px', fontSize: '8px' }}>
                        Accident
                      </span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: '500' }}>
                    {road.vehicleCount}
                  </td>
                  <td style={{ textAlign: 'center', fontFamily: 'var(--font-display)' }}>
                    {Math.round(road.speedLimit * (1 - road.congestion * 0.5))} km/h
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge-ui ${getCongestionBadgeClass(road.congestion)}`}>
                      {getCongestionLabel(road.congestion)} ({(road.congestion * 100).toFixed(0)}%)
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {road.hasIncident ? (
                      <button
                        className="btn btn-secondary btn-sm"
                        style={{ padding: '2px 8px', fontSize: '10px' }}
                        onClick={() => onTriggerIncident(road.id, 'accident')}
                      >
                        Clear
                      </button>
                    ) : (
                      <button
                        className="btn btn-danger btn-sm"
                        style={{ padding: '2px 8px', fontSize: '10px' }}
                        onClick={() => onTriggerIncident(road.id, 'accident')}
                      >
                        Report Accident
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
