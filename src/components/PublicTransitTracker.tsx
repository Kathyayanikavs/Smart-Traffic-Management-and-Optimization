import React from 'react';
import type { SimulatedVehicle, Road } from '../utils/trafficEngine';

interface PublicTransitTrackerProps {
  vehicles: SimulatedVehicle[];
  roads: Road[];
  onDispatchBus: () => void;
}

export const PublicTransitTracker: React.FC<PublicTransitTrackerProps> = ({
  vehicles,
  roads,
  onDispatchBus,
}) => {
  const buses = vehicles.filter(v => v.type === 'bus');

  // Calculate status based on average congestion of the route
  const getBusStatus = (bus: SimulatedVehicle) => {
    const currentRoad = roads.find(r => r.id === bus.currentRoadId);
    if (!currentRoad) return { label: 'In Depot', class: 'badge-yellow' };
    
    if (currentRoad.congestion > 0.7) {
      return { label: 'Heavy Delay', class: 'badge-red' };
    } else if (currentRoad.congestion > 0.45) {
      return { label: 'Slight Delay', class: 'badge-yellow' };
    }
    return { label: 'On Time', class: 'badge-green' };
  };

  // Mock passenger load calculation based on route index
  const getPassengerLoad = (busId: string) => {
    // deterministic mock passenger counts
    if (busId.includes('101')) return { count: 38, max: 60 };
    if (busId.includes('202')) return { count: 18, max: 60 };
    return { count: 28, max: 60 }; // newly dispatched
  };

  return (
    <div className="glass-panel" style={{ flex: 1 }}>
      <div className="panel-title">
        <span>
          <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="6" y="3" width="12" height="18" rx="2"></rect>
            <line x1="6" y1="8" x2="18" y2="8"></line>
            <line x1="6" y1="14" x2="18" y2="14"></line>
            <circle cx="9" cy="18" r="1"></circle>
            <circle cx="15" cy="18" r="1"></circle>
          </svg>
          Public Transit Integration
        </span>
        <button 
          className="btn btn-outline-glow btn-sm" 
          style={{ padding: '2px 8px', fontSize: '10px' }}
          onClick={onDispatchBus}
        >
          + Add Express Bus
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {buses.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '10px' }}>
            No active transit buses on the grid.
          </div>
        ) : (
          buses.map(bus => {
            const status = getBusStatus(bus);
            const load = getPassengerLoad(bus.id);
            const loadPct = (load.count / load.max) * 100;
            
            return (
              <div 
                key={bus.id} 
                style={{
                  background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.03)',
                  padding: '12px',
                  borderRadius: '8px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: '700', fontSize: '12.5px', color: 'var(--accent-purple)' }}>
                    🚌 Line {bus.id.replace('BUS_', '')}
                  </span>
                  <span className={`badge-ui ${status.class}`}>
                    {status.label}
                  </span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  <span>Route: <b>{bus.route.join(' ➔ ')}</b></span>
                  <span>Pos: {Math.round(bus.progress)}%</span>
                </div>

                {/* Passenger Load Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '75px' }}>Passenger Load:</span>
                  <div style={{ flex: 1, height: '6px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        height: '100%',
                        background: 'var(--accent-purple)',
                        width: `${loadPct}%`,
                        borderRadius: '3px'
                      }}
                    ></div>
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 'bold' }}>
                    {load.count}/{load.max}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
