import { useState, useEffect, useRef } from 'react';
import { 
  initialJunctions, 
  initialRoads, 
  initialParking, 
  initialSectors, 
  generateInitialVehicles, 
  updateSimulationStep
} from './utils/trafficEngine';
import type { 
  SimulatedVehicle,
  Junction,
  Road,
  SectorAQI
} from './utils/trafficEngine';
import { CityMap } from './components/CityMap';
import { TelemetryTable } from './components/TelemetryTable';
import { EmergencyControl } from './components/EmergencyControl';
import { PredictiveAnalytics } from './components/PredictiveAnalytics';
import { PollutionTracker } from './components/PollutionTracker';
import { SmartParking } from './components/SmartParking';
import { PublicTransitTracker } from './components/PublicTransitTracker';
import { IncidentManager } from './components/IncidentManager';
import { WeatherAlertSelector } from './components/WeatherAlertSelector';

interface SystemAlert {
  id: string;
  text: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  time: string;
}

export default function App() {
  // State variables
  const [junctions, setJunctions] = useState<Junction[]>(initialJunctions);
  const [roads, setRoads] = useState<Road[]>(initialRoads);
  const [vehicles, setVehicles] = useState<SimulatedVehicle[]>(generateInitialVehicles());
  const [parking, setParking] = useState(initialParking);
  const [sectors, setSectors] = useState<SectorAQI[]>(initialSectors);
  const [weather, setWeather] = useState<'sunny' | 'rainy' | 'snowy'>('sunny');
  const [subContact, setSubContact] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  const [selectedJunctionId, setSelectedJunctionId] = useState<string | null>(null);
  const [activeRoute, setActiveRoute] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(true);
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 2x, 5x
  const [alerts, setAlerts] = useState<SystemAlert[]>([
    { id: '1', text: 'Traffic Management System Initialized.', type: 'success', time: '23:02:44' },
    { id: '2', text: 'IoT telemetry feed established at all 9 intersections.', type: 'info', time: '23:02:45' },
    { id: '3', text: 'Azure ML forecasting models loaded for traffic loads.', type: 'info', time: '23:02:46' },
  ]);

  const tickCount = useRef(0);
  const selectedJunction = junctions.find(j => j.id === selectedJunctionId) || null;

  // Add alert helper
  const addAlert = (text: string, type: 'info' | 'success' | 'warning' | 'danger') => {
    const time = new Date().toTimeString().split(' ')[0];
    setAlerts(prev => [
      { id: Date.now().toString() + Math.random(), text, type, time },
      ...prev.slice(0, 24) // limit to 25 alerts
    ]);
  };

  // 1. Simulation Loop Ticker
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      tickCount.current += 1;
      
      setVehicles(prevVehicles => {
        // Move current vehicles
        const step = updateSimulationStep(
          junctions,
          roads,
          prevVehicles,
          parking,
          sectors,
          tickCount.current,
          weather
        );

        // Update state dependencies synced
        setJunctions(step.junctions);
        setRoads(step.roads);
        setParking(step.parking);
        setSectors(step.sectors);

        // Check if emergency vehicle reached destination
        const emergencyUnit = prevVehicles.find(v => v.type === 'emergency');
        const nextEmergencyUnit = step.vehicles.find(v => v.type === 'emergency');
        
        if (emergencyUnit && !nextEmergencyUnit) {
          // It despawned/ended path
          setActiveRoute([]);
          addAlert('Emergency Services Unit reached destination. Reverting signal overrides.', 'success');
        }

        // Randomly generate background congestion alerts
        if (tickCount.current % 12 === 0) {
          // Check for roads with high congestion
          const highlyCongested = step.roads.find(r => r.congestion > 0.75 && !r.hasIncident);
          if (highlyCongested) {
            addAlert(`High congestion alert on ${highlyCongested.name}. Traffic density at ${(highlyCongested.congestion * 100).toFixed(0)}%.`, 'warning');
            
            // Trigger toast alert subscription
            if (subContact) {
              setToastMessage(`[ALERT BROADCAST] Message sent to ${subContact}: Gridlock detected on ${highlyCongested.name}! Expect delays.`);
              setTimeout(() => setToastMessage(null), 5000);
            }
          }
        }

        return step.vehicles;
      });
    }, 1000 / simSpeed);

    return () => clearInterval(interval);
  }, [isSimulating, simSpeed, junctions, roads, parking, sectors, weather, subContact]);

  // Fetch initial incident reports from Azure Function API (with graceful fallback)
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        const res = await fetch('/api/incidents');
        if (res.ok) {
          const body = await res.json();
          if (body.success && body.incidents) {
            // Apply backend incidents to local simulation roads state
            setRoads(prev => prev.map(r => {
              const matched = body.incidents.find((inc: any) => inc.roadId === r.id);
              return matched ? { ...r, hasIncident: true, incidentType: matched.type } : r;
            }));
            addAlert('Synced incidents from Azure Functions API.', 'success');
          }
        }
      } catch (e) {
        console.warn('Azure Functions API not active, running with client-side mocked API fallback.');
      }
    };
    fetchIncidents();
  }, []);

  // Handle emergency vehicle dispatch
  const handleDispatchEmergency = (route: string[]) => {
    setActiveRoute(route);
    addAlert(`Emergency Vehicle Dispatched along route: ${route.join(' ➔ ')}. Triggering Green Wave priority.`, 'danger');

    // Create simulated emergency vehicle
    const firstFrom = route[0];
    const firstTo = route[1];
    const startRoad = roads.find(r => r.from === firstFrom && r.to === firstTo);

    if (startRoad) {
      const newEmergencyVehicle: SimulatedVehicle = {
        id: `EMERGENCY_UNIT_${Math.floor(100 + Math.random() * 900)}`,
        type: 'emergency',
        currentRoadId: startRoad.id,
        fromJunctionId: firstFrom,
        toJunctionId: firstTo,
        progress: 0,
        speed: startRoad.speedLimit * 1.2,
        route: route,
        routeIndex: 0,
      };

      setVehicles(prev => [newEmergencyVehicle, ...prev.filter(v => v.type !== 'emergency')]);
    }
  };

  const handleClearEmergency = () => {
    setActiveRoute([]);
    setVehicles(prev => prev.filter(v => v.type !== 'emergency'));
    addAlert('Emergency dispatch cancelled. Priority signals released.', 'info');
  };

  // Toggle Junction AI optimization vs standard manual control
  const handleToggleJunctionMode = (id: string) => {
    setJunctions(prev => prev.map(j => {
      if (j.id === id) {
        const nextMode = j.mode === 'ai' ? 'standard' : 'ai';
        addAlert(`Junction ${j.id} (${j.name}) switched to ${nextMode.toUpperCase()} optimization mode.`, nextMode === 'ai' ? 'success' : 'info');
        return { ...j, mode: nextMode };
      }
      return j;
    }));
  };

  const handleToggleAllAI = (enable: boolean) => {
    setJunctions(prev => prev.map(j => ({ ...j, mode: enable ? 'ai' : 'standard' })));
    addAlert(
      enable 
        ? 'AI adaptive optimization enabled at all 9 intersections. Re-calculating wait-times...' 
        : 'Reverted all signals to standard fixed cycles.', 
      enable ? 'success' : 'info'
    );
  };

  // Report/Clear road accidents
  const handleReportIncident = async (roadId: string, type: 'accident' | 'construction' | 'hazard') => {
    const targetRoad = roads.find(r => r.id === roadId);
    if (!targetRoad) return;

    const isClearing = targetRoad.hasIncident;

    // 1. Try to sync to Azure API backend
    try {
      await fetch('/api/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roadId, type, clear: isClearing })
      });
    } catch (e) {
      console.warn('API sync failed, updating simulation state locally.');
    }

    // 2. Perform state update locally
    setRoads(prev => prev.map(r => {
      if (r.id === roadId) {
        return { ...r, hasIncident: !isClearing, incidentType: isClearing ? undefined : type };
      }
      return r;
    }));

    if (isClearing) {
      addAlert(`Resolved accident report on ${targetRoad.name}. Reopening lanes.`, 'success');
      // If active route passes through this cleared road, re-route calculations could optimize
    } else {
      addAlert(`CRITICAL: Incident reported on ${targetRoad.name}. Smart emergency routes will bypass.`, 'danger');
      if (subContact) {
        setToastMessage(`[ALERT BROADCAST] SMS/Email alert sent to ${subContact}: Emergency hazard (${type}) detected on ${targetRoad.name}! Routing recalculated.`);
        setTimeout(() => setToastMessage(null), 6000);
      }
    }
  };

  const handleReserveSpot = (garageId: string) => {
    setParking(prev => prev.map(p => {
      if (p.id === garageId && p.occupiedSpots < p.totalSpots) {
        addAlert(`Reserved spot at ${p.name}. Spot ID allocated.`, 'success');
        return { ...p, occupiedSpots: p.occupiedSpots + 1 };
      }
      return p;
    }));
  };

  const handleDispatchBus = () => {
    const busId = `BUS_EXP_${Math.floor(300 + Math.random() * 100)}`;
    const startRoad = roads.find(r => r.from === 'J1' && r.to === 'J2');
    if (startRoad) {
      const newBus: SimulatedVehicle = {
        id: busId,
        type: 'bus',
        currentRoadId: startRoad.id,
        fromJunctionId: 'J1',
        toJunctionId: 'J2',
        progress: 0,
        speed: startRoad.speedLimit * 0.8,
        route: ['J1', 'J2', 'J3', 'J6', 'J9', 'J8', 'J7', 'J4', 'J1'],
        routeIndex: 0,
      };
      setVehicles(prev => [...prev, newBus]);
      addAlert(`Dispatched peak-hour Express Bus ${busId.replace('BUS_', '')} on Outer Loop.`, 'success');
    }
  };

  // Compute average wait time across all junctions
  const avgWaitTime = Math.round(
    junctions.reduce((acc, j) => acc + (j.queueH + j.queueV) * 1.8, 0) / junctions.length
  );

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header */}
      <header className="app-header">
        <div className="logo-container">
          <div className="logo-icon">🚦</div>
          <div className="logo-text">
            <h1>OptimaCity</h1>
            <p>Smart Traffic Management Console</p>
          </div>
        </div>

        {/* Console stats indicators */}
        <div className="system-status">
          <div className="status-badge">
            <span className="status-dot"></span>
            <span>Adaptive Mode: <b>{junctions.filter(j => j.mode === 'ai').length}/9 Node Controllers</b></span>
          </div>

          <div className="status-badge" style={{ borderColor: avgWaitTime > 15 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)' }}>
            <span style={{ color: 'var(--text-muted)' }}>Avg Queue Wait:</span>
            <span style={{ color: avgWaitTime > 15 ? 'var(--traffic-red)' : 'var(--traffic-green)', fontWeight: 'bold' }}>
              {avgWaitTime}s
            </span>
          </div>

          {/* Pause / Speed Toggles */}
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <button 
              className={`btn btn-secondary btn-sm ${!isSimulating ? 'btn-outline-glow' : ''}`}
              onClick={() => setIsSimulating(!isSimulating)}
            >
              {isSimulating ? '⏸ Pause Console' : '▶ Resume Console'}
            </button>
            <select
              value={simSpeed}
              onChange={(e) => setSimSpeed(Number(e.target.value))}
              className="form-select"
              style={{ padding: '4px 8px', fontSize: '11px', width: '70px' }}
            >
              <option value="1">1x Speed</option>
              <option value="2">2x Speed</option>
              <option value="4">4x Speed</option>
            </select>
          </div>
        </div>
      </header>

      {/* Grid Dashboard */}
      <div className="dashboard-grid">
        {/* Main interactive visual map & sensor lists */}
        <div className="main-column">
          <CityMap 
            junctions={junctions}
            roads={roads}
            vehicles={vehicles}
            activeRoute={activeRoute}
            selectedJunctionId={selectedJunctionId}
            onJunctionSelect={setSelectedJunctionId}
            onClearIncident={(roadId) => handleReportIncident(roadId, 'accident')}
          />
          
          <div className="dashboard-row">
            <TelemetryTable 
              roads={roads}
              onTriggerIncident={(roadId) => handleReportIncident(roadId, 'accident')}
            />
            <IncidentManager
              roads={roads}
              onReportIncident={(roadId, type) => handleReportIncident(roadId, type)}
              onClearIncident={(roadId) => handleReportIncident(roadId, 'accident')}
            />
          </div>

          <div className="dashboard-row">
            <PredictiveAnalytics weather={weather} />
            <PollutionTracker sectors={sectors} />
          </div>

          <div className="dashboard-row">
            <PublicTransitTracker 
              vehicles={vehicles}
              roads={roads}
              onDispatchBus={handleDispatchBus}
            />
            <SmartParking 
              parking={parking}
              onReserveSpot={handleReserveSpot}
            />
          </div>
        </div>

        {/* Sidebar analytics and signal managers */}
        <div className="side-column">
          {/* Signal Control Manager panel */}
          <div className="glass-panel">
            <div className="panel-title">
              <span>
                <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="9" y1="3" x2="9" y2="21"></line>
                </svg>
                Signal Controller Central
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  className="btn btn-primary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleToggleAllAI(true)}
                >
                  Enable All AI (Adaptive)
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ flex: 1 }}
                  onClick={() => handleToggleAllAI(false)}
                >
                  Standard Fixed
                </button>
              </div>

              {/* Selected Node Details */}
              <div style={{ background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)', marginTop: '6px' }}>
                {selectedJunction ? (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>{selectedJunction.name} ({selectedJunction.id})</span>
                      <span className={`badge-ui ${selectedJunction.mode === 'ai' ? 'badge-green' : 'badge-yellow'}`}>
                        {selectedJunction.mode === 'ai' ? 'Adaptive' : 'Fixed Standard'}
                      </span>
                    </div>
                    
                    <div className="settings-overlay" style={{ margin: '8px 0', fontSize: '12px' }}>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>QUEUE HORIZONTAL</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedJunction.queueH} cars</div>
                      </div>
                      <div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '10px' }}>QUEUE VERTICAL</div>
                        <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{selectedJunction.queueV} cars</div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                      <button
                        className="btn btn-outline-glow btn-sm"
                        style={{ flex: 1 }}
                        onClick={() => handleToggleJunctionMode(selectedJunction.id)}
                      >
                        Toggle Mode
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '12px', padding: '10px 0' }}>
                    Click an intersection node on the map to modify signal patterns.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Emergency vehicle route calculations */}
          <EmergencyControl 
            junctions={junctions}
            roads={roads}
            activeRoute={activeRoute}
            onDispatch={handleDispatchEmergency}
            onClearRoute={handleClearEmergency}
          />

          {/* Weather Settings & SMS Alerts Subscription */}
          <WeatherAlertSelector
            weather={weather}
            onWeatherChange={setWeather}
            onSubscribe={(contact: string) => {
              setSubContact(contact);
              addAlert(`Alert subscriptions activated for ${contact}.`, 'success');
            }}
            subscriptionContact={subContact}
            onCancelSubscription={() => {
              setSubContact(null);
              addAlert('Alert subscriptions cancelled.', 'info');
            }}
          />



          {/* Live Incident/System logs */}
          <div className="glass-panel" style={{ flex: 1, minHeight: '240px', display: 'flex', flexDirection: 'column' }}>
            <div className="panel-title">
              <span>
                <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Live Event log feed
              </span>
            </div>
            
            <div className="alert-feed" style={{ flex: 1 }}>
              {alerts.map(a => (
                <div key={a.id} className={`alert-item ${a.type === 'danger' ? 'danger' : a.type === 'warning' ? 'warning' : a.type === 'success' ? 'success' : ''}`}>
                  <div className="alert-content">
                    <div>{a.text}</div>
                    <div className="alert-time">{a.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating alert subscriber notification popup */}
      {toastMessage && (
        <div 
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: 'rgba(239, 68, 68, 0.98)',
            border: '1.5px solid rgba(255, 255, 255, 0.15)',
            color: '#fff',
            padding: '16px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.5), 0 0 20px rgba(239, 68, 68, 0.4)',
            zIndex: 1000,
            fontSize: '12px',
            fontWeight: 'bold',
            maxWidth: '360px',
            animation: 'slide-in 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '20px' }}>📲</span>
          <div>{toastMessage}</div>
        </div>
      )}
    </div>
  );
}
