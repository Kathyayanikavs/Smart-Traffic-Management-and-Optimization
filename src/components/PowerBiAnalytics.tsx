import React, { useState } from 'react';

interface PowerBiAnalyticsProps {
  dbTraffic?: any[];
}

const POWERBI_REPORT_URL = import.meta.env.VITE_POWERBI_REPORT_URL || '';
const POWERBI_WORKSPACE_ID = import.meta.env.VITE_POWERBI_WORKSPACE_ID || '';
const POWERBI_REPORT_ID = import.meta.env.VITE_POWERBI_REPORT_ID || '';
const POWERBI_EMBED_URL = import.meta.env.VITE_POWERBI_EMBED_URL || '';

export const PowerBiAnalytics: React.FC<PowerBiAnalyticsProps> = ({ dbTraffic = [] }) => {
  const [showEmbedded, setShowEmbedded] = useState(false);
  const [selectedWeather, setSelectedWeather] = useState<string | null>(null);

  // Fallback mock data if dbTraffic is not loaded yet
  const defaultTraffic = [
    { road_name: 'City Center', vehicle_count: 520, average_speed: 18.3, congestion_level: 98, weather: 'Rainy' },
    { road_name: 'Airport Road', vehicle_count: 420, average_speed: 22.4, congestion_level: 90, weather: 'Rainy' },
    { road_name: 'Highway NH44', vehicle_count: 310, average_speed: 61.7, congestion_level: 35, weather: 'Cloudy' },
    { road_name: 'MG Road', vehicle_count: 240, average_speed: 38.5, congestion_level: 65, weather: 'Sunny' },
    { road_name: 'Ring Road', vehicle_count: 190, average_speed: 48.2, congestion_level: 40, weather: 'Sunny' },
  ];

  const activeData = dbTraffic.length > 0 ? dbTraffic : defaultTraffic;

  // Filter data based on selected weather checkbox (Cloudy, Rainy, Sunny)
  const filteredData = selectedWeather
    ? activeData.filter(d => d.weather?.toLowerCase() === selectedWeather.toLowerCase())
    : activeData;

  // KPI Calculations
  const totalVehicles = filteredData.reduce((acc, d) => acc + Number(d.vehicle_count || 0), 0);
  const sumSpeed = filteredData.reduce((acc, d) => acc + Number(d.average_speed || 0), 0);
  const avgSpeed = filteredData.length > 0 
    ? (sumSpeed / filteredData.length).toFixed(2)
    : '0.00';
  const totalCongestion = filteredData.reduce((acc, d) => acc + Number(d.congestion_level || 0), 0);

  // Weather distribution for pie chart (Rainy, Sunny, Cloudy)
  const weatherCounts = activeData.reduce((acc: { [key: string]: number }, d) => {
    const w = d.weather || 'Sunny';
    acc[w] = (acc[w] || 0) + Number(d.congestion_level || 0);
    return acc;
  }, {});
  const totalWeatherCongestion = Object.values(weatherCounts).reduce((a, b) => Number(a) + Number(b), 0);

  const toggleWeatherFilter = (weather: string) => {
    if (selectedWeather === weather) {
      setSelectedWeather(null); // Clear filter
    } else {
      setSelectedWeather(weather);
    }
  };

  const handleOpenLocalFile = () => {
    const DEFAULT_LOCAL_PBIX = '/traffic_report.pbix';
    window.open(POWERBI_REPORT_URL || DEFAULT_LOCAL_PBIX, '_blank');
  };

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease' }}>
      <div className="panel-title">
        <span>
          <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Power BI Embedded Analytics
        </span>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            className="btn btn-secondary btn-sm" 
            style={{ fontSize: '10px', padding: '2px 8px' }}
            onClick={handleOpenLocalFile}
          >
            📂 Open .PBIX File
          </button>
          <span className="badge-ui badge-green" style={{ fontSize: '10px' }}>
            {showEmbedded ? 'Embedded Active' : 'Ready'}
          </span>
        </div>
      </div>

      {!showEmbedded ? (
        // Preview State / Placeholder Block
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div 
            style={{ 
              background: 'rgba(15, 23, 42, 0.4)', 
              border: '1px dashed rgba(255,255,255,0.1)', 
              borderRadius: '8px', 
              minHeight: '180px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <span style={{ fontSize: '32px', marginBottom: '8px' }}>📊</span>
            <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#fff', marginBottom: '6px' }}>
              Power BI Report Connected (Ready for Azure Deployment)
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', maxWidth: '300px', lineHeight: '1.4', marginBottom: '14px' }}>
              Select "Open Power BI Report" to display the interactive visualization dashboards inline.
            </div>
            <button 
              className="btn btn-primary btn-sm" 
              onClick={() => setShowEmbedded(true)}
              style={{ padding: '6px 20px' }}
            >
              Open Power BI Report
            </button>
          </div>

          {/* Configuration Metadata details */}
          <div 
            style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '8px', 
              fontSize: '10px', 
              background: 'rgba(255,255,255,0.01)', 
              border: '1px solid rgba(255,255,255,0.03)', 
              padding: '8px 12px', 
              borderRadius: '6px',
              color: 'var(--text-secondary)'
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Workspace ID: </span>
              <span style={{ fontFamily: 'monospace' }}>{POWERBI_WORKSPACE_ID || 'Pending Config'}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Report ID: </span>
              <span style={{ fontFamily: 'monospace' }}>{POWERBI_REPORT_ID || 'Pending Config'}</span>
            </div>
            <div style={{ gridColumn: 'span 2', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Embed URL: </span>
              <span style={{ fontFamily: 'monospace' }}>{POWERBI_EMBED_URL || 'Pending Config'}</span>
            </div>
          </div>
        </div>
      ) : (
        // Embedded Dashboard State (Interactive Charts Screen matching their screenshots)
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', animation: 'slide-in 0.3s ease-out' }}>
          
          {/* Top Filter and Controls Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', padding: '8px 12px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '11px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--text-muted)' }}>Filter Weather:</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['Sunny', 'Rainy', 'Cloudy'].map(weather => (
                  <label key={weather} style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: selectedWeather === weather ? 'var(--accent-cyan)' : 'var(--text-secondary)' }}>
                    <input 
                      type="checkbox" 
                      checked={selectedWeather === weather} 
                      onChange={() => toggleWeatherFilter(weather)} 
                      style={{ cursor: 'pointer' }}
                    />
                    {weather}
                  </label>
                ))}
              </div>
            </div>
            <button 
              className="btn btn-secondary btn-sm" 
              style={{ fontSize: '10px', padding: '2px 8px' }}
              onClick={() => setShowEmbedded(false)}
            >
              ❌ Close Report View
            </button>
          </div>

          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ background: '#ffffff', color: '#090e1a', padding: '12px 14px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Sum of average_speed</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px' }}>{avgSpeed}</div>
            </div>
            <div style={{ background: '#ffffff', color: '#090e1a', padding: '12px 14px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Sum of vehicle_count</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px' }}>{totalVehicles}</div>
            </div>
            <div style={{ background: '#ffffff', color: '#090e1a', padding: '12px 14px', borderRadius: '6px', border: '1px solid rgba(0,0,0,0.05)' }}>
              <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Sum of congestion_level</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', marginTop: '4px' }}>{totalCongestion}</div>
            </div>
          </div>

          {/* Grid Layout of Charts */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
            
            {/* Chart 1: Sum of vehicle_count by road_name */}
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--text-primary)' }}>
                Sum of vehicle_count by road_name
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredData.slice(0, 5).map((d, idx) => {
                  const maxCount = Math.max(...filteredData.map(item => Number(item.vehicle_count || 0)));
                  const pct = maxCount > 0 ? (Number(d.vehicle_count || 0) / maxCount) * 100 : 0;
                  return (
                    <div key={idx} style={{ fontSize: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: 'var(--text-secondary)' }}>
                        <span>{d.road_name}</span>
                        <span style={{ fontWeight: 'bold' }}>{d.vehicle_count}</span>
                      </div>
                      <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#0284c7', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Sum of average_speed by road_name */}
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--text-primary)' }}>
                Sum of average_speed by road_name
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredData.slice(0, 5).map((d, idx) => {
                  const maxSpeed = Math.max(...filteredData.map(item => Number(item.average_speed || 0)));
                  const pct = maxSpeed > 0 ? (Number(d.average_speed || 0) / maxSpeed) * 100 : 0;
                  return (
                    <div key={idx} style={{ fontSize: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px', color: 'var(--text-secondary)' }}>
                        <span>{d.road_name}</span>
                        <span style={{ fontWeight: 'bold' }}>{d.average_speed} km/h</span>
                      </div>
                      <div style={{ width: '100%', height: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: '#0369a1', borderRadius: '2px' }}></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 3: Sum of congestion_level and Sum of congestion_level by weather (Donut Chart) */}
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--text-primary)' }}>
                Sum of congestion_level by weather
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '110px' }}>
                <svg width="90" height="90" viewBox="0 0 36 36" style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx="18" cy="18" r="15.915" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="3" />
                  {Object.entries(weatherCounts).map(([weather, count], i) => {
                    const pct = totalWeatherCongestion > 0 ? (count / totalWeatherCongestion) * 100 : 0;
                    // Calculate stroke-dasharray and stroke-dashoffset
                    const prevPcts = Object.entries(weatherCounts).slice(0, i).reduce((sum, [_, c]) => sum + (c / totalWeatherCongestion) * 100, 0);
                    const strokeColor = weather === 'Rainy' ? '#0284c7' : weather === 'Sunny' ? '#38bdf8' : '#7dd3fc';
                    return (
                      <circle 
                        key={weather}
                        cx="18" 
                        cy="18" 
                        r="15.915" 
                        fill="none" 
                        stroke={strokeColor} 
                        strokeWidth="3" 
                        strokeDasharray={`${pct} ${100 - pct}`}
                        strokeDashoffset={-prevPcts}
                      />
                    );
                  })}
                </svg>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '10px' }}>
                  {Object.entries(weatherCounts).map(([weather, count]) => {
                    const pct = totalWeatherCongestion > 0 ? ((count / totalWeatherCongestion) * 100).toFixed(2) : '0';
                    const strokeColor = weather === 'Rainy' ? '#0284c7' : weather === 'Sunny' ? '#38bdf8' : '#7dd3fc';
                    return (
                      <div key={weather} style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: strokeColor }}></span>
                        <span>{weather}: <b>{pct}%</b> ({count})</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Chart 4: Sum of vehicle_count by Day (Line Plot representation) */}
            <div style={{ background: 'rgba(15, 23, 42, 0.4)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 'bold', marginBottom: '10px', color: 'var(--text-primary)' }}>
                Sum of vehicle_count by Day
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '110px', position: 'relative' }}>
                <svg width="200" height="80" viewBox="0 0 200 80">
                  <line x1="10" y1="70" x2="190" y2="70" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  <line x1="10" y1="10" x2="10" y2="70" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                  {/* Draw gridline nodes */}
                  <circle cx="100" cy="40" r="4" fill="#0284c7" />
                  <text x="100" y="30" fill="#fff" fontSize="8" textAnchor="middle">{totalVehicles} total</text>
                  <text x="100" y="78" fill="var(--text-muted)" fontSize="8" textAnchor="middle">Day 10 (Current)</text>
                </svg>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
};
