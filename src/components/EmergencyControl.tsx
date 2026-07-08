import React, { useState, useEffect } from 'react';
import { calculateShortestPath } from '../utils/trafficEngine';
import type { Junction, Road } from '../utils/trafficEngine';

interface EmergencyControlProps {
  junctions: Junction[];
  roads: Road[];
  onDispatch: (route: string[]) => void;
  activeRoute: string[];
  onClearRoute: () => void;
}

export const EmergencyControl: React.FC<EmergencyControlProps> = ({
  junctions,
  roads,
  onDispatch,
  activeRoute,
  onClearRoute,
}) => {
  const [startJunction, setStartJunction] = useState('J1');
  const [endJunction, setEndJunction] = useState('J9');
  const [useAI, setUseAI] = useState(true);
  const [previewRoute, setPreviewRoute] = useState<string[]>([]);

  // Update preview route whenever selections or weights toggle
  useEffect(() => {
    if (startJunction && endJunction && startJunction !== endJunction) {
      const path = calculateShortestPath(startJunction, endJunction, roads, junctions, useAI);
      setPreviewRoute(path);
    } else {
      setPreviewRoute([]);
    }
  }, [startJunction, endJunction, useAI, roads, junctions]);

  const handleDispatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (previewRoute.length > 1) {
      onDispatch(previewRoute);
    }
  };

  // Helper to calculate total route distance in meters
  const calculateRouteDistance = (path: string[]) => {
    let dist = 0;
    for (let i = 0; i < path.length - 1; i++) {
      const r = roads.find(item => item.from === path[i] && item.to === path[i + 1]);
      if (r) dist += r.length;
    }
    return dist;
  };

  const previewDistance = calculateRouteDistance(previewRoute);
  const estTimeSeconds = Math.round((previewDistance / (60 / 3.6))); // assumes 60 km/h emergency speed (no delays)

  return (
    <div className="glass-panel">
      <div className="panel-title">
        <span>
          <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 22h20L12 2z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Emergency Vehicle Route Optimizer
        </span>
      </div>

      <form onSubmit={handleDispatch}>
        <div className="settings-overlay" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="form-group">
            <label className="form-label">Start Location</label>
            <select
              value={startJunction}
              onChange={(e) => setStartJunction(e.target.value)}
              className="form-select"
            >
              {junctions.map(j => (
                <option key={j.id} value={j.id}>
                  {j.id} - {j.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Emergency Destination</label>
            <select
              value={endJunction}
              onChange={(e) => setEndJunction(e.target.value)}
              className="form-select"
            >
              {junctions.map(j => (
                <option key={j.id} value={j.id} disabled={j.id === startJunction}>
                  {j.id} - {j.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '12px 0' }}>
          <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={useAI}
              onChange={(e) => setUseAI(e.target.checked)}
              style={{ width: '14px', height: '14px', accentColor: 'var(--accent-cyan)' }}
            />
            Avoid High Congestion / Blocked Areas (AI)
          </span>
        </div>

        {previewRoute.length > 1 ? (
          <div style={{ background: 'rgba(255, 255, 255, 0.02)', padding: '12px', borderRadius: '8px', marginBottom: '16px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>OPTIMIZED ROUTE:</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', margin: '4px 0', color: 'var(--accent-cyan)' }}>
              {previewRoute.join(' ➔ ')}
            </div>
            
            <div className="settings-overlay" style={{ marginTop: '8px' }}>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>TOTAL DISTANCE</div>
                <div style={{ fontSize: '15px', fontWeight: '800', fontFamily: 'var(--font-display)' }}>
                  {(previewDistance / 1000).toFixed(2)} km
                </div>
              </div>
              <div>
                <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>EST. TRANSIT TIME</div>
                <div style={{ fontSize: '15px', fontWeight: '800', fontFamily: 'var(--font-display)', color: 'var(--traffic-green)' }}>
                  {Math.floor(estTimeSeconds / 60)}m {estTimeSeconds % 60}s
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div style={{ color: 'var(--traffic-red)', fontSize: '12px', margin: '10px 0', textAlign: 'center' }}>
            Invalid locations selected.
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          {activeRoute.length > 0 ? (
            <button
              type="button"
              className="btn btn-danger"
              style={{ flex: 1 }}
              onClick={onClearRoute}
            >
              Cancel Dispatch
            </button>
          ) : (
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={previewRoute.length === 0}
            >
              ⚡ Dispatch Emergency Unit
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
