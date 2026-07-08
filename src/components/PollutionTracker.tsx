import React from 'react';
import type { SectorAQI } from '../utils/trafficEngine';

interface PollutionTrackerProps {
  sectors: SectorAQI[];
}

export const PollutionTracker: React.FC<PollutionTrackerProps> = ({ sectors }) => {
  // Calculate average AQI
  const avgAqi = Math.round(sectors.reduce((acc, s) => acc + s.aqi, 0) / sectors.length);
  const totalCo2Savings = sectors.reduce((acc, s) => acc + s.co2Savings, 0);

  // Determine color theme for AQI
  const getAqiColor = (val: number) => {
    if (val < 50) return 'var(--traffic-green)';
    if (val < 100) return 'var(--traffic-yellow)';
    return 'var(--traffic-red)';
  };

  const getAqiLabel = (val: number) => {
    if (val < 50) return 'Good';
    if (val < 100) return 'Moderate';
    return 'Unhealthy';
  };

  // Radial progress calculations (stroke-dashoffset)
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const clampedAqi = Math.min(150, Math.max(0, avgAqi));
  const fillPercentage = clampedAqi / 150; // max value plotted is 150
  const strokeDashoffset = circumference - fillPercentage * circumference;

  return (
    <div className="glass-panel">
      <div className="panel-title">
        <span>
          <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          Eco-Impact & Pollution Tracker
        </span>
      </div>

      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {/* Radial AQI Gauge */}
        <div className="aqi-radial">
          <svg className="aqi-radial-svg">
            <circle cx="35" cy="35" r={radius} className="aqi-radial-bg" />
            <circle
              cx="35"
              cy="35"
              r={radius}
              className="aqi-radial-fill"
              stroke={getAqiColor(avgAqi)}
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
            />
          </svg>
          <div className="aqi-radial-text">
            {avgAqi}
            <span>AQI</span>
          </div>
        </div>

        {/* Global Stats */}
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>City Air Quality</div>
          <div style={{ fontSize: '18px', fontWeight: '800', color: getAqiColor(avgAqi) }}>
            {getAqiLabel(avgAqi)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            CO₂ emissions dropping due to optimized green-light flow patterns.
          </div>
        </div>
      </div>

      {/* CO2 Savings Counter */}
      <div className="stat-card" style={{ margin: '14px 0', padding: '10px 14px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)' }}>
        <div className="stat-label" style={{ color: 'var(--traffic-green)' }}>Cumulative Carbon Savings</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span className="stat-value green" style={{ fontFamily: 'var(--font-display)', fontSize: '26px' }}>
            {totalCo2Savings.toFixed(1)}
          </span>
          <span style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--traffic-green)' }}>kg CO₂</span>
        </div>
      </div>

      {/* Sector Breakdown */}
      <div className="sector-list" style={{ marginTop: '12px' }}>
        <div className="form-label" style={{ marginBottom: '4px' }}>Sector AQI breakdown</div>
        {sectors.map(sector => (
          <div className="sector-row" key={sector.name}>
            <span className="sector-name">{sector.name}</span>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div className="sector-bar-container">
                <div
                  className="sector-bar"
                  style={{
                    width: `${Math.min(100, (sector.aqi / 150) * 100)}%`,
                    background: getAqiColor(sector.aqi),
                  }}
                ></div>
              </div>
              <span className="sector-value" style={{ color: getAqiColor(sector.aqi), fontWeight: 'bold' }}>
                {sector.aqi}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
