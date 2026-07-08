import React from 'react';
import type { Junction, Road, SimulatedVehicle } from '../utils/trafficEngine';

interface CityMapProps {
  junctions: Junction[];
  roads: Road[];
  vehicles: SimulatedVehicle[];
  activeRoute: string[];
  selectedJunctionId: string | null;
  onJunctionSelect: (id: string) => void;
  onClearIncident: (roadId: string) => void;
}

export const CityMap: React.FC<CityMapProps> = ({
  junctions,
  roads,
  vehicles,
  activeRoute,
  selectedJunctionId,
  onJunctionSelect,
  onClearIncident,
}) => {
  // Helper to get coordinates for a junction ID
  const getJunctionCoords = (id: string) => {
    const j = junctions.find(item => item.id === id);
    return j ? { x: j.x, y: j.y } : { x: 0, y: 0 };
  };

  // Interpolate vehicle coordinates along a road
  const getVehicleCoords = (v: SimulatedVehicle) => {
    const from = getJunctionCoords(v.fromJunctionId);
    const to = getJunctionCoords(v.toJunctionId);
    const pct = v.progress / 100;
    
    // Calculate position
    const x = from.x + (to.x - from.x) * pct;
    const y = from.y + (to.y - from.y) * pct;
    
    // Calculate rotation angle
    const angle = Math.atan2(to.y - from.y, to.x - from.x) * (180 / Math.PI);

    return { x, y, angle };
  };

  // Get mid-point of a road for incident marker
  const getRoadMidpoint = (road: Road) => {
    const from = getJunctionCoords(road.from);
    const to = getJunctionCoords(road.to);
    return {
      x: (from.x + to.x) / 2,
      y: (from.y + to.y) / 2,
    };
  };

  // Draw active emergency route path
  const renderRoutePath = () => {
    if (activeRoute.length < 2) return null;
    let pathD = '';
    
    for (let i = 0; i < activeRoute.length; i++) {
      const coords = getJunctionCoords(activeRoute[i]);
      if (i === 0) {
        pathD = `M ${coords.x} ${coords.y}`;
      } else {
        pathD += ` L ${coords.x} ${coords.y}`;
      }
    }
    
    return <path d={pathD} className="routing-path" />;
  };

  return (
    <div className="glass-panel map-panel">
      <div className="panel-title">
        <span>
          <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
          Live Interactive Traffic Map
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge-ui badge-green">Green Wave Enabled</span>
        </div>
      </div>
      
      <div className="map-viewport">
        {/* Simulation Stats Overlay */}
        {/* The SVG City Layout */}
        <svg className="map-svg" viewBox="0 0 800 700">
          <defs>
            <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="1" />
              <stop offset="100%" stopColor="#4facfe" stopOpacity="1" />
            </linearGradient>
          </defs>

          {/* Grid Background Lines (Optional visual guide) */}
          <rect width="100%" height="100%" fill="#090e1a" />
          <g stroke="rgba(255,255,255,0.01)" strokeWidth="1">
            {Array.from({ length: 16 }).map((_, i) => (
              <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="700" />
            ))}
            {Array.from({ length: 14 }).map((_, i) => (
              <line key={`h-${i}`} x1="0" y1={i * 50} x2="800" y2={i * 50} />
            ))}
          </g>

          {/* 1. Roads (Background layer) */}
          {roads.map(road => {
            const from = getJunctionCoords(road.from);
            const to = getJunctionCoords(road.to);
            // Deduplicate lines in rendering (draw once for bidirectional)
            if (road.id.includes('J2_J1') || road.id.includes('J3_J2') || road.id.includes('J5_J4') || road.id.includes('J6_J5') || road.id.includes('J8_J7') || road.id.includes('J9_J8') || road.id.includes('J4_J1') || road.id.includes('J7_J4') || road.id.includes('J5_J2') || road.id.includes('J8_J5') || road.id.includes('J6_J3') || road.id.includes('J9_J6')) {
              return null; // Don't draw reverse path as a separate road shape, draw once
            }

            // High congestion highlights
            const maxCongestion = Math.max(
              road.congestion,
              roads.find(r => r.from === road.to && r.to === road.from)?.congestion || 0
            );
            
            let strokeColor = '#1e293b'; // normal empty road
            if (maxCongestion > 0.7) {
              strokeColor = '#4c1d1d'; // gridlock tint
            } else if (maxCongestion > 0.4) {
              strokeColor = '#3b2f1d'; // minor congestion tint
            }

            return (
              <g key={`road-group-${road.id}`}>
                {/* Road Width */}
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  stroke={strokeColor}
                  strokeWidth="32"
                  className="road-bg"
                />
                {/* Double yellow / center separator line */}
                <line
                  x1={from.x}
                  y1={from.y}
                  x2={to.x}
                  y2={to.y}
                  className="road-lane-line"
                />
              </g>
            );
          })}

          {/* 2. Render route highlights */}
          {renderRoutePath()}

          {/* 3. Incidents Overlay */}
          {roads.filter(r => r.hasIncident).map(road => {
            const mid = getRoadMidpoint(road);
            return (
              <g 
                key={`incident-${road.id}`} 
                transform={`translate(${mid.x}, ${mid.y})`} 
                className="incident-marker"
                onClick={(e) => {
                  e.stopPropagation();
                  onClearIncident(road.id);
                }}
              >
                <circle r="12" fill="#ef4444" opacity="0.2" />
                <polygon points="0,-9 9,7 -9,7" fill="#ef4444" stroke="#fff" strokeWidth="1.5" />
                <text y="5" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">!</text>
                <title>Incident reported: Click to resolve accident/hazard</title>
              </g>
            );
          })}

          {/* 4. Vehicles */}
          {vehicles.map(v => {
            const { x, y, angle } = getVehicleCoords(v);
            
            // Draw different markers based on type
            if (v.type === 'emergency') {
              return (
                <g key={v.id} transform={`translate(${x}, ${y}) rotate(${angle})`} className="vehicle">
                  <rect x="-8" y="-5" width="16" height="10" rx="2" className="vehicle-body emergency" />
                  <polygon points="4,0 0,-3 0,3" fill="#fff" />
                  {/* Flashing strobe ring */}
                  <circle r="10" fill="none" stroke="#ef4444" strokeWidth="1.5" opacity="0.6">
                    <animate attributeName="r" values="8;16;8" dur="0.5s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0;0.8" dur="0.5s" repeatCount="indefinite" />
                  </circle>
                  <title>Emergency Services Vehicle ({v.id})</title>
                </g>
              );
            }
            
            if (v.type === 'bus') {
              return (
                <g key={v.id} transform={`translate(${x}, ${y}) rotate(${angle})`} className="vehicle">
                  <rect x="-10" y="-4" width="20" height="8" rx="1.5" className="vehicle-body bus" />
                  <rect x="2" y="-3" width="6" height="6" fill="#000" opacity="0.3" />
                  <title>Public Transit Bus ({v.id})</title>
                </g>
              );
            }

            // Normal car
            return (
              <g key={v.id} transform={`translate(${x}, ${y}) rotate(${angle})`} className="vehicle">
                <rect x="-6" y="-3.5" width="12" height="7" rx="1" className="vehicle-body" />
                <title>IoT Vehicle Tracker ({v.id})</title>
              </g>
            );
          })}

          {/* 5. Traffic Lights and Signal Status */}
          {junctions.map(j => {
            const hLightColor = j.lightState === 'H' ? 'green' : j.lightState === 'HY' ? 'yellow' : 'red';
            const vLightColor = j.lightState === 'V' ? 'green' : j.lightState === 'VY' ? 'yellow' : 'red';
            
            return (
              <g key={`signals-${j.id}`}>
                {/* Horizontal approach signal */}
                <circle cx={j.x - 22} cy={j.y} r="5" className={`traffic-light ${hLightColor}`} />
                <circle cx={j.x + 22} cy={j.y} r="5" className={`traffic-light ${hLightColor}`} />
                
                {/* Vertical approach signal */}
                <circle cx={j.x} cy={j.y - 22} r="5" className={`traffic-light ${vLightColor}`} />
                <circle cx={j.x} cy={j.y + 22} r="5" className={`traffic-light ${vLightColor}`} />
              </g>
            );
          })}

          {/* 6. Junction Nodes (Clickable for details) */}
          {junctions.map(j => {
            const isSelected = selectedJunctionId === j.id;
            
            return (
              <g 
                key={`node-${j.id}`} 
                transform={`translate(${j.x}, ${j.y})`}
                onClick={() => onJunctionSelect(j.id)}
              >
                {/* Node outer glow */}
                <circle r="22" className={`junction-halo ${isSelected ? 'active' : ''}`} />
                
                {/* Node Main Block */}
                <rect x="-14" y="-14" width="28" height="28" rx="6" className="junction-node" />
                
                {/* Display Mode Indicator (AI vs STD) */}
                <circle cx="0" cy="0" r="8" fill={j.mode === 'ai' ? '#00f2fe' : '#334155'} />
                <text 
                  x="0" 
                  y="3" 
                  textAnchor="middle" 
                  fill={j.mode === 'ai' ? '#080c14' : '#94a3b8'} 
                  fontSize="8" 
                  fontWeight="bold"
                >
                  {j.mode === 'ai' ? 'AI' : 'S'}
                </text>

                {/* Queue display tags */}
                {(j.queueH > 4 || j.queueV > 4) && (
                  <g transform="translate(0, -25)">
                    <rect x="-18" y="-7" width="36" height="13" rx="3" fill="#1e293b" stroke="#ef4444" strokeWidth="1" />
                    <text x="0" y="3" textAnchor="middle" fill="#f87171" fontSize="9" fontWeight="bold">
                      {Math.max(j.queueH, j.queueV)}
                    </text>
                  </g>
                )}

                {/* Text Label */}
                <text x="0" y="34" textAnchor="middle" fill="#cbd5e1" fontSize="10" fontWeight="600">
                  {j.name}
                </text>
                <text x="0" y="44" textAnchor="middle" fill="#64748b" fontSize="8">
                  {j.id} ({j.mode === 'ai' ? 'Adaptive' : 'Fixed'})
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Map Legend */}
      <div className="chart-legend" style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '10px' }}>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#00f2fe' }}></span>
          <span>AI Junction</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#334155' }}></span>
          <span>Fixed Junction</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#3b82f6' }}></span>
          <span>IoT Vehicle</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#8b5cf6' }}></span>
          <span>Bus Route</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#ef4444' }}></span>
          <span>Emergency Vehicle</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: '#ef4444', borderRadius: '50%' }}></span>
          <span>Accident Incident</span>
        </div>
      </div>
    </div>
  );
};
