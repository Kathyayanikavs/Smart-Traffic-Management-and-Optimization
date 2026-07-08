import React, { useState } from 'react';

interface WeatherAlertSelectorProps {
  weather: 'sunny' | 'rainy' | 'snowy';
  onWeatherChange: (w: 'sunny' | 'rainy' | 'snowy') => void;
  onSubscribe: (contact: string, channels: string[]) => void;
  subscriptionContact: string | null;
  onCancelSubscription: () => void;
}

export const WeatherAlertSelector: React.FC<WeatherAlertSelectorProps> = ({
  weather,
  onWeatherChange,
  onSubscribe,
  subscriptionContact,
  onCancelSubscription,
}) => {
  const [contactInput, setContactInput] = useState('');
  const [subscribeType, setSubscribeType] = useState('both'); // accidents, congestion, both

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (contactInput.trim()) {
      onSubscribe(contactInput.trim(), [subscribeType]);
    }
  };

  const getWeatherDescription = () => {
    switch (weather) {
      case 'rainy':
        return '🌧️ Rainy: Vehicles slow down by 25%. Roadway congestion indexes rise by 20% due to friction and slick surfaces.';
      case 'snowy':
        return '❄️ Snowy: Emergency hazard conditions. Speed limits drop by 45%. Congestion increases by 45%. Routing risk rises.';
      default:
        return '☀️ Sunny: Ideal driving conditions. Normal speeds and baseline congestion factors apply.';
    }
  };

  return (
    <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      {/* 1. Weather Impact Section */}
      <div>
        <div className="panel-title" style={{ marginBottom: '10px' }}>
          <span>
            <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
              <circle cx="12" cy="12" r="4"></circle>
            </svg>
            Weather & Forecast Impact
          </span>
        </div>

        <div className="control-tabs" style={{ marginBottom: '10px' }}>
          <button
            type="button"
            className={`tab-btn ${weather === 'sunny' ? 'active' : ''}`}
            onClick={() => onWeatherChange('sunny')}
          >
            ☀️ Sunny
          </button>
          <button
            type="button"
            className={`tab-btn ${weather === 'rainy' ? 'active' : ''}`}
            onClick={() => onWeatherChange('rainy')}
          >
            🌧️ Rainy
          </button>
          <button
            type="button"
            className={`tab-btn ${weather === 'snowy' ? 'active' : ''}`}
            onClick={() => onWeatherChange('snowy')}
          >
            ❄️ Snowy
          </button>
        </div>

        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.02)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
          {getWeatherDescription()}
        </div>
      </div>

      {/* 2. SMS/Email Alerts Section */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px' }}>
        <div className="panel-title" style={{ marginBottom: '10px' }}>
          <span>
            <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            SMS / Email Dispatch Alerts
          </span>
        </div>

        {subscriptionContact ? (
          <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.15)', padding: '12px', borderRadius: '8px' }}>
            <div style={{ fontSize: '11px', color: 'var(--traffic-green)', fontWeight: 'bold' }}>✓ ACTIVE SUBSCRIPTION</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', margin: '4px 0' }}>{subscriptionContact}</div>
            <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
              Monitoring incidents and gridlocks. SMS/Email alerts will trigger automatically.
            </div>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              style={{ width: '100%', marginTop: '10px', padding: '4px' }}
              onClick={onCancelSubscription}
            >
              Cancel Subscription
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubscribeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input
                type="text"
                placeholder="Email or Phone Number..."
                className="form-input"
                value={contactInput}
                onChange={(e) => setContactInput(e.target.value)}
                required
              />
            </div>

            <div className="settings-overlay" style={{ gridTemplateColumns: '2fr 1fr', gap: '8px' }}>
              <select
                value={subscribeType}
                onChange={(e) => setSubscribeType(e.target.value)}
                className="form-select"
                style={{ padding: '6px 8px', fontSize: '12px' }}
              >
                <option value="both">Accidents & Gridlocks</option>
                <option value="accidents">Accidents Only</option>
                <option value="congestion">Gridlocks Only</option>
              </select>

              <button
                type="submit"
                className="btn btn-primary btn-sm"
              >
                Subscribe
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
