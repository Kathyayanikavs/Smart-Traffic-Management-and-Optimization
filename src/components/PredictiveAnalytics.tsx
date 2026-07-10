import React, { useState } from 'react';

interface PredictiveAnalyticsProps {
  weather: 'sunny' | 'rainy' | 'snowy';
  dbTraffic?: any[];
  isLoading?: boolean;
  error?: string | null;
}

export const PredictiveAnalytics: React.FC<PredictiveAnalyticsProps> = ({ 
  weather,
  dbTraffic = [],
  isLoading = false,
  error = null
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  
  // Base 24 hours of traffic load data
  const baseData = [
    { hour: '00:00', actual: 12, predicted: 15 },
    { hour: '02:00', actual: 8, predicted: 10 },
    { hour: '04:00', actual: 15, predicted: 12 },
    { hour: '06:00', actual: 35, predicted: 38 },
    { hour: '08:00', actual: 82, predicted: 85 }, // Morning Peak
    { hour: '10:00', actual: 60, predicted: 58 },
    { hour: '12:00', actual: 65, predicted: 68 }, // Midday Lunch
    { hour: '14:00', actual: 55, predicted: 54 },
    { hour: '16:00', actual: 78, predicted: 75 }, // Evening Peak Starts
    { hour: '18:00', actual: 88, predicted: 82 }, // Evening Peak Peak
    { hour: '20:00', actual: 48, predicted: 50 },
    { hour: '22:00', actual: 25, predicted: 22 },
  ];

  // Scale curves according to current weather impact
  const weatherMultiplier = weather === 'rainy' ? 1.18 : weather === 'snowy' ? 1.35 : 1.0;
  
  let data = baseData.map(d => ({
    hour: d.hour,
    actual: Math.min(98, Math.round(d.actual * weatherMultiplier)),
    predicted: Math.min(98, Math.round(d.predicted * weatherMultiplier)),
  }));

  // Overlay database actual traffic metrics if loaded
  if (dbTraffic && dbTraffic.length > 0) {
    const hourGroups: { [key: string]: { sum: number; count: number } } = {};
    
    dbTraffic.forEach(row => {
      // Find row timestamp, handle potential variations (timestamp / date)
      const timeStr = row.timestamp || row.Timestamp;
      if (!timeStr) return;
      
      const date = new Date(timeStr);
      if (isNaN(date.getTime())) return;
      
      const hourNum = date.getHours();
      // Round to nearest 2-hour interval
      const nearestTwo = Math.round(hourNum / 2) * 2 % 24;
      const key = `${nearestTwo.toString().padStart(2, '0')}:00`;
      
      // Compute congestion level from database values
      const rawCongestion = row.congestion_level !== undefined ? row.congestion_level : (row.vehicle_count / 40);
      const val = Math.min(100, Math.max(0, Math.round(rawCongestion * 100)));
      
      if (!hourGroups[key]) {
        hourGroups[key] = { sum: 0, count: 0 };
      }
      hourGroups[key].sum += val;
      hourGroups[key].count += 1;
    });

    data = data.map(d => {
      const group = hourGroups[d.hour];
      return {
        ...d,
        actual: group ? Math.min(98, Math.round(group.sum / group.count)) : d.actual,
      };
    });
  }

  // SVG Chart bounds
  const width = 450;
  const height = 140;
  const paddingX = 40;
  const paddingY = 20;

  // Scale functions
  const getX = (index: number) => {
    return paddingX + (index / (data.length - 1)) * (width - 2 * paddingX);
  };

  const getY = (value: number) => {
    return height - paddingY - (value / 100) * (height - 2 * paddingY);
  };

  // Generate path strings
  let actualPath = '';
  let predictedPath = '';
  let actualArea = '';

  data.forEach((d, i) => {
    const x = getX(i);
    const yActual = getY(d.actual);
    const yPredicted = getY(d.predicted);

    if (i === 0) {
      actualPath = `M ${x} ${yActual}`;
      predictedPath = `M ${x} ${yPredicted}`;
      actualArea = `M ${x} ${height - paddingY} L ${x} ${yActual}`;
    } else {
      actualPath += ` L ${x} ${yActual}`;
      predictedPath += ` L ${x} ${yPredicted}`;
      actualArea += ` L ${x} ${yActual}`;
    }

    if (i === data.length - 1) {
      actualArea += ` L ${x} ${height - paddingY} Z`;
    }
  });

  return (
    <div className="glass-panel">
      <div className="panel-title">
        <span>
          <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
            <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
          </svg>
          ML Congestion Forecasting (24h)
        </span>
        <span className={`badge-ui ${error ? 'badge-red' : dbTraffic.length > 0 ? 'badge-green' : 'badge-yellow'}`} style={{ fontSize: '10px' }}>
          {isLoading ? 'Syncing...' : error ? 'Offline' : dbTraffic.length > 0 ? 'Azure SQL Live' : 'Azure ML Model'}
        </span>
      </div>

      <div className="stats-grid" style={{ marginBottom: '14px' }}>
        <div className="stat-card" style={{ padding: '8px 12px' }}>
          <span className="stat-label">Peak hour forecast</span>
          <span className="stat-value purple" style={{ fontSize: '16px' }}>17:30 - 18:45</span>
        </div>
        <div className="stat-card" style={{ padding: '8px 12px' }}>
          <span className="stat-label">AI mitigation impact</span>
          <span className="stat-value green" style={{ fontSize: '16px' }}>-22% Wait Time</span>
        </div>
      </div>

      <div className="chart-container" style={{ height: '140px', position: 'relative' }}>
        {isLoading ? (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 14, 26, 0.6)', color: 'var(--accent-cyan)', fontSize: '11px', zIndex: 10 }}>
            Syncing predictive feeds...
          </div>
        ) : error ? (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 14, 26, 0.6)', color: 'var(--traffic-red)', fontSize: '11px', zIndex: 10, fontWeight: 'bold' }}>
            ⚠️ Forecast Sync Failed: {error}
          </div>
        ) : null}

        <svg className="chart-svg" viewBox={`0 0 ${width} ${height}`}>
          <defs>
            <linearGradient id="cyan-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#00f2fe" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Gridlines */}
          {[0, 25, 50, 75, 100].map(val => (
            <g key={`grid-${val}`}>
              <line
                x1={paddingX}
                y1={getY(val)}
                x2={width - paddingX}
                y2={getY(val)}
                className="chart-grid"
              />
              <text x={paddingX - 10} y={getY(val) + 3} textAnchor="end" className="chart-label">
                {val}%
              </text>
            </g>
          ))}

          {/* Paths */}
          <path d={actualArea} className="chart-area-actual" />
          <path d={actualPath} className="chart-line-actual" />
          <path d={predictedPath} className="chart-line-predicted" />

          {/* Interaction vertical lines */}
          {data.map((_, i) => {
            const x = getX(i);
            return (
              <g key={`hit-${i}`}>
                {/* Hit Box */}
                <line
                  x1={x}
                  y1={paddingY}
                  x2={x}
                  y2={height - paddingY}
                  stroke="transparent"
                  strokeWidth="20"
                  style={{ cursor: 'pointer' }}
                  onMouseEnter={() => setHoverIndex(i)}
                  onMouseLeave={() => setHoverIndex(null)}
                />
                
                {hoverIndex === i && (
                  <line
                    x1={x}
                    y1={paddingY}
                    x2={x}
                    y2={height - paddingY}
                    stroke="rgba(255,255,255,0.2)"
                    strokeWidth="1"
                    strokeDasharray="2,2"
                  />
                )}
              </g>
            );
          })}

          {/* Hour labels on X axis */}
          {data.filter((_, i) => i % 2 === 0).map((d, i) => {
            const index = i * 2;
            return (
              <text
                key={`label-${d.hour}`}
                x={getX(index)}
                y={height - 4}
                textAnchor="middle"
                className="chart-label"
              >
                {d.hour}
              </text>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoverIndex !== null && (
          <div
            className="chart-tooltip"
            style={{
              left: `${getX(hoverIndex) - 50}px`,
              top: `${getY(Math.max(data[hoverIndex].actual, data[hoverIndex].predicted)) - 55}px`,
            }}
          >
            <div style={{ fontWeight: 'bold', color: 'var(--text-primary)' }}>{data[hoverIndex].hour}</div>
            <div style={{ color: 'var(--accent-cyan)' }}>Actual: {data[hoverIndex].actual}%</div>
            <div style={{ color: 'var(--accent-purple)' }}>Forecast: {data[hoverIndex].predicted}%</div>
          </div>
        )}
      </div>

      <div className="chart-legend">
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--accent-cyan)' }}></span>
          <span>Actual Load</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot" style={{ background: 'var(--accent-purple)', border: '1px dashed var(--accent-purple)' }}></span>
          <span>Azure ML Prediction</span>
        </div>
      </div>
    </div>
  );
};
