import React from 'react';

// Configuration placeholders for future Azure AD / Power BI Embedded service integration
const POWERBI_REPORT_URL = import.meta.env.VITE_POWERBI_REPORT_URL || '';
const POWERBI_WORKSPACE_ID = import.meta.env.VITE_POWERBI_WORKSPACE_ID || '';
const POWERBI_REPORT_ID = import.meta.env.VITE_POWERBI_REPORT_ID || '';
const POWERBI_EMBED_URL = import.meta.env.VITE_POWERBI_EMBED_URL || '';

export const PowerBiAnalytics: React.FC = () => {
  // Determine if we open the local PBIX template or the cloud Service URL
  const DEFAULT_LOCAL_PBIX = '/traffic_report.pbix';
  const openUrl = POWERBI_REPORT_URL || DEFAULT_LOCAL_PBIX;

  const handleOpenReport = () => {
    window.open(openUrl, '_blank');
  };

  /* 
    FUTURE POWER BI EMBEDDED INTEGRATION BLUEPRINT:
    When you are ready to transition to fully inline Power BI Embedded inside the dashboard:
    
    1. Run: npm install powerbi-client-react powerbi-client
    2. Import the components:
       import { PowerBIEmbed } from 'powerbi-client-react';
       import { models } from 'powerbi-client';
    
    3. Retrieve the Azure AD Bearer token from your backend server:
       const [accessToken, setAccessToken] = useState('');
       
    4. Replace the mock container below with the <PowerBIEmbed> component:
       <PowerBIEmbed
         embedConfig={{
           type: 'report',
           id: POWERBI_REPORT_ID,
           embedUrl: POWERBI_EMBED_URL,
           accessToken: accessToken,
           tokenType: models.TokenType.Embed,
           settings: {
             panes: {
               filters: { expanded: false, visible: true },
               pageNavigation: { visible: true }
             },
             background: models.BackgroundType.Transparent
           }
         }}
         cssClassName="powerbi-embed-iframe"
       />
  */

  return (
    <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div className="panel-title">
        <span>
          <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="20" x2="18" y2="10"></line>
            <line x1="12" y1="20" x2="12" y2="4"></line>
            <line x1="6" y1="20" x2="6" y2="14"></line>
          </svg>
          Power BI Analytics
        </span>
        <span className="badge-ui badge-green" style={{ fontSize: '10px' }}>
          Ready for Azure
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        
        {/* Mock/Placeholder Embed Sandbox Container */}
        <div 
          style={{ 
            flex: 1, 
            background: 'rgba(15, 23, 42, 0.4)', 
            border: '1px dashed rgba(255,255,255,0.1)', 
            borderRadius: '8px', 
            minHeight: '160px', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '20px',
            textAlign: 'center'
          }}
        >
          <span style={{ fontSize: '28px', marginBottom: '8px' }}>📊</span>
          <div style={{ fontWeight: 'bold', fontSize: '12px', color: '#fff', marginBottom: '4px' }}>
            Power BI Report Connected (Ready for Azure Deployment)
          </div>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', maxWidth: '280px', lineHeight: '1.4' }}>
            Click button below to open the local report file (.pbix) or configure cloud Service Urls.
          </div>
        </div>

        {/* Configuration Metadata Placeholders */}
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
          <div style={{ gridColumn: 'span 2', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span style={{ color: 'var(--text-muted)' }}>Embed URL: </span>
            <span style={{ fontFamily: 'monospace' }}>{POWERBI_EMBED_URL || 'Pending Config'}</span>
          </div>
        </div>

        {/* Open Button */}
        <button 
          className="btn btn-primary" 
          onClick={handleOpenReport}
          style={{ width: '100%', marginTop: 'auto' }}
        >
          Open Power BI Report
        </button>

      </div>
    </div>
  );
};
