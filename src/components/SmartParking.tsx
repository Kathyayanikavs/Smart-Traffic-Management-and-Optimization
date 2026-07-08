import React from 'react';
import type { ParkingGarage } from '../utils/trafficEngine';

interface SmartParkingProps {
  parking: ParkingGarage[];
  onReserveSpot: (garageId: string) => void;
}

export const SmartParking: React.FC<SmartParkingProps> = ({ parking, onReserveSpot }) => {
  const getOccupancyColor = (occupied: number, total: number) => {
    const ratio = occupied / total;
    if (ratio > 0.9) return 'var(--traffic-red)';
    if (ratio > 0.7) return 'var(--traffic-yellow)';
    return 'var(--traffic-green)';
  };

  return (
    <div className="glass-panel" style={{ flex: 1 }}>
      <div className="panel-title">
        <span>
          <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
            <circle cx="12" cy="12" r="5"></circle>
            <path d="M12 2v2M12 20v2M4 12H2M20 12h2"></path>
          </svg>
          Smart Parking Availability
        </span>
        <span className="badge-ui badge-green" style={{ fontSize: '10px' }}>
          Real-time
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {parking.map(p => {
          const occupancyRatio = p.occupiedSpots / p.totalSpots;
          const available = p.totalSpots - p.occupiedSpots;
          
          return (
            <div 
              key={p.id} 
              style={{
                background: 'rgba(255,255,255,0.01)',
                border: '1px solid rgba(255,255,255,0.03)',
                padding: '12px',
                borderRadius: '8px',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontWeight: '700', fontSize: '12.5px' }}>{p.name}</span>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '12px', color: 'var(--accent-cyan)' }}>
                  ${p.hourlyRate.toFixed(2)}/hr
                </span>
              </div>

              {/* Progress bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ flex: 1, height: '8px', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      background: getOccupancyColor(p.occupiedSpots, p.totalSpots),
                      width: `${occupancyRatio * 100}%`,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease-in-out'
                    }}
                  ></div>
                </div>
                <span style={{ fontSize: '11px', fontWeight: 'bold', width: '65px', textAlign: 'right' }}>
                  {p.occupiedSpots}/{p.totalSpots} ({Math.round(occupancyRatio * 100)}%)
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                <span style={{ fontSize: '11px', color: available > 10 ? 'var(--traffic-green)' : 'var(--traffic-red)' }}>
                  ● {available} spots available
                </span>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ padding: '3px 10px', fontSize: '10.5px' }}
                  disabled={available === 0}
                  onClick={() => onReserveSpot(p.id)}
                >
                  {available === 0 ? 'Full' : 'Reserve Spot'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
