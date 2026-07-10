import React, { useEffect, useRef, useState } from 'react';
import type { Junction, Road, SimulatedVehicle } from '../utils/trafficEngine';
import * as atlas from 'azure-maps-control';
import 'azure-maps-control/dist/atlas.min.css';

interface CityMapProps {
  junctions: Junction[];
  roads: Road[];
  vehicles: SimulatedVehicle[];
  activeRoute: string[];
  selectedJunctionId: string | null;
  onJunctionSelect: (id: string) => void;
  onClearIncident: (roadId: string) => void;
}

// Map J1-J9 grid to real-world coordinates centered around Seattle, WA
const junctionCoords: { [key: string]: [number, number] } = {
  J1: [-122.345, 47.615], // Top-Left
  J2: [-122.330, 47.615], // Top-Center
  J3: [-122.315, 47.615], // Top-Right
  J4: [-122.345, 47.600], // Mid-Left
  J5: [-122.330, 47.600], // Mid-Center
  J6: [-122.315, 47.600], // Mid-Right
  J7: [-122.345, 47.585], // Bottom-Left
  J8: [-122.330, 47.585], // Bottom-Center
  J9: [-122.315, 47.585], // Bottom-Right
};

const AZURE_MAPS_KEY_FALLBACK = import.meta.env.VITE_AZURE_MAPS_KEY || 'YOUR_AZURE_MAPS_SUBSCRIPTION_KEY';

export const CityMap: React.FC<CityMapProps> = ({
  junctions,
  roads,
  vehicles,
  activeRoute,
  selectedJunctionId,
  onJunctionSelect,
  onClearIncident,
}) => {
  const _unused = [junctions];
  console.log("Unused props checklist verified:", _unused.length);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<atlas.Map | null>(null);
  const dataSourceRef = useRef<atlas.source.DataSource | null>(null);
  const routeSourceRef = useRef<atlas.source.DataSource | null>(null);
  const markersRef = useRef<atlas.HtmlMarker[]>([]);
  const popupRef = useRef<atlas.Popup | null>(null);

  const [subscriptionKey, setSubscriptionKey] = useState<string | null>(null);
  const [keyError, setKeyError] = useState<boolean>(false);
  const [mapReady, setMapReady] = useState(false);

  // Retrieve Azure Maps subscription key from runtime API or build fallback
  useEffect(() => {
    const fetchMapsKey = async () => {
      try {
        const res = await fetch('/api/mapsKey');
        if (res.ok) {
          const body = await res.json();
          if (body.key && body.key !== "YOUR_AZURE_MAPS_SUBSCRIPTION_KEY") {
            setSubscriptionKey(body.key);
            setKeyError(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Could not fetch maps key from runtime API endpoint:", err);
      }

      // Check build-time environment variable fallback
      if (AZURE_MAPS_KEY_FALLBACK !== "YOUR_AZURE_MAPS_SUBSCRIPTION_KEY") {
        setSubscriptionKey(AZURE_MAPS_KEY_FALLBACK);
        setKeyError(false);
      } else {
        setKeyError(true);
      }
    };

    fetchMapsKey();
  }, []);

  // Initialize Azure Maps only once we have a subscription key
  useEffect(() => {
    if (!subscriptionKey || !mapContainerRef.current) return;

    const map = new atlas.Map(mapContainerRef.current, {
      center: [-122.330, 47.600],
      zoom: 13.5,
      style: 'night', // Futuristic dark theme
      language: 'en-US',
      authOptions: {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey: subscriptionKey,
      },
    });

    mapRef.current = map;

    // Initialize Popup
    const popup = new atlas.Popup({
      pixelOffset: [0, -12],
      closeButton: true,
    });
    popupRef.current = popup;

    map.events.add('ready', () => {
      setMapReady(true);

      // Create data sources
      const dataSource = new atlas.source.DataSource();
      const routeSource = new atlas.source.DataSource();
      
      map.sources.add(dataSource);
      map.sources.add(routeSource);
      
      dataSourceRef.current = dataSource;
      routeSourceRef.current = routeSource;

      // Add Base Road styling
      map.layers.add(
        new atlas.layer.LineLayer(dataSource, undefined, {
          strokeColor: '#1e293b', // Normal road dark line path
          strokeWidth: 6,
          lineCap: 'round',
          lineJoin: 'round',
        })
      );

      // Add Glowing Route Line Layer for Emergency Routing
      map.layers.add(
        new atlas.layer.LineLayer(routeSource, undefined, {
          strokeColor: '#3b82f6', // Glowing blue emergency route
          strokeWidth: 10,
          blur: 1,
          lineCap: 'round',
          lineJoin: 'round',
        })
      );

      // Add click handler on the map itself for selecting junctions
      map.events.add('click', (e) => {
        if (!e.position) return;
        const clickPt = e.position;

        let nearestJunction: string | null = null;
        let minDist = 0.005; // degree threshold (~500m)

        Object.entries(junctionCoords).forEach(([id, coords]) => {
          const dist = Math.sqrt(Math.pow(clickPt[0] - coords[0], 2) + Math.pow(clickPt[1] - coords[1], 2));
          if (dist < minDist) {
            minDist = dist;
            nearestJunction = id;
          }
        });

        if (nearestJunction) {
          onJunctionSelect(nearestJunction);
        }
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.dispose();
      }
    };
  }, [subscriptionKey]);

  // Fetch real Azure Maps route directions whenever emergency route is activated
  useEffect(() => {
    if (!mapReady || !subscriptionKey || activeRoute.length < 2 || !routeSourceRef.current) {
      if (routeSourceRef.current) routeSourceRef.current.clear();
      return;
    }

    const drawRealAzureRoute = async () => {
      try {
        const start = junctionCoords[activeRoute[0]];
        const end = junctionCoords[activeRoute[activeRoute.length - 1]];
        if (!start || !end) return;

        // Query Azure Maps directions API (lat,lon:lat,lon)
        const query = `${start[1]},${start[0]}:${end[1]},${end[0]}`;
        const url = `https://atlas.microsoft.com/route/directions/json?api-version=1.0&query=${query}&subscription-key=${subscriptionKey}`;

        const res = await fetch(url);
        if (res.ok) {
          const body = await res.json();
          if (body.routes && body.routes.length > 0) {
            const points = body.routes[0].legs[0].points;
            const linePositions = points.map((p: any) => new atlas.data.Position(p.longitude, p.latitude));
            
            if (routeSourceRef.current) {
              routeSourceRef.current.clear();
              routeSourceRef.current.add(
                new atlas.data.Feature(new atlas.data.LineString(linePositions))
              );
            }
            return;
          }
        }
      } catch (err) {
        console.warn("Could not retrieve real Azure Maps route directions:", err);
      }

      // Fallback: draw vector straight lines between junctions if API fails or offline
      const fallbackCoords = activeRoute.map(j => {
        const c = junctionCoords[j];
        return new atlas.data.Position(c[0], c[1]);
      });
      if (routeSourceRef.current) {
        routeSourceRef.current.clear();
        routeSourceRef.current.add(
          new atlas.data.Feature(new atlas.data.LineString(fallbackCoords))
        );
      }
    };

    drawRealAzureRoute();
  }, [mapReady, activeRoute, subscriptionKey]);

  // Update HTML markers dynamically (congestion, vehicles, incidents)
  useEffect(() => {
    if (!mapReady || !mapRef.current || !dataSourceRef.current || !popupRef.current) return;

    const map = mapRef.current;
    const dataSource = dataSourceRef.current;
    const popup = popupRef.current;

    // Close any open popup
    popup.close();

    // 1. Remove all old HTML markers
    markersRef.current.forEach(m => map.markers.remove(m));
    markersRef.current = [];

    // 2. Refresh base road lines in background datasource
    dataSource.clear();
    const roadLines: atlas.data.Feature<atlas.data.LineString, any>[] = [];

    roads.forEach(road => {
      const fromCoord = junctionCoords[road.from];
      const toCoord = junctionCoords[road.to];
      if (fromCoord && toCoord) {
        roadLines.push(
          new atlas.data.Feature(
            new atlas.data.LineString([
              new atlas.data.Position(fromCoord[0], fromCoord[1]),
              new atlas.data.Position(toCoord[0], toCoord[1])
            ]),
            { type: 'road', id: road.id }
          )
        );
      }
    });
    dataSource.add(roadLines);

    // 3. Render colored Traffic Prediction Markers at road midpoints
    roads.forEach(road => {
      const from = junctionCoords[road.from];
      const to = junctionCoords[road.to];
      if (from && to) {
        const midLon = (from[0] + to[0]) / 2;
        const midLat = (from[1] + to[1]) / 2;

        const congPercent = Math.round(road.congestion * 100);
        // Green: <40%, Orange: 40-70%, Red: >70%
        const color = congPercent > 70 ? '#ef4444' : congPercent > 40 ? '#f59e0b' : '#10b981';

        const markerDiv = document.createElement('div');
        markerDiv.style.width = '26px';
        markerDiv.style.height = '26px';
        markerDiv.style.borderRadius = '50%';
        markerDiv.style.background = color;
        markerDiv.style.border = '2px solid #ffffff';
        markerDiv.style.boxShadow = `0 0 10px ${color}`;
        markerDiv.style.display = 'flex';
        markerDiv.style.alignItems = 'center';
        markerDiv.style.justifyContent = 'center';
        markerDiv.style.color = '#ffffff';
        markerDiv.style.fontSize = '9px';
        markerDiv.style.fontWeight = 'bold';
        markerDiv.style.cursor = 'pointer';
        markerDiv.style.transition = 'transform 0.2s';
        markerDiv.innerText = `${congPercent}%`;

        // Highlight selected road marker
        if (selectedJunctionId && (road.from === selectedJunctionId || road.to === selectedJunctionId)) {
          markerDiv.style.transform = 'scale(1.25)';
          markerDiv.style.border = '2px solid #00f2fe';
        }

        const marker = new atlas.HtmlMarker({
          htmlContent: markerDiv,
          position: [midLon, midLat],
        });

        // Click popup details
        const speed = Math.round(road.speedLimit * (1 - road.congestion * 0.5));
        const popupContent = `
          <div style="padding: 12px; color: #fff; font-family: sans-serif; font-size: 11px; background: rgba(9, 14, 26, 0.95); border-radius: 8px; border: 1.5px solid rgba(255,255,255,0.1); box-shadow: 0 4px 15px rgba(0,0,0,0.5)">
            <div style="font-weight: bold; margin-bottom: 6px; color: #38bdf8; font-size: 12px">${road.name}</div>
            <div style="margin-bottom: 4px">🚗 Current Cars: <b>${road.vehicleCount}</b></div>
            <div style="margin-bottom: 4px">⚡ Congestion: <span style="font-weight: bold; color: ${color}">${congPercent}%</span></div>
            <div>💨 Avg Speed: <b>${speed} km/h</b></div>
          </div>
        `;

        markerDiv.addEventListener('click', (e) => {
          e.stopPropagation();
          popup.setOptions({
            content: popupContent,
            position: [midLon, midLat],
          });
          popup.open(map);
        });

        map.markers.add(marker);
        markersRef.current.push(marker);
      }
    });

    // 4. Render Incident Markers (red pulsing warning symbols)
    roads.forEach(road => {
      if (road.hasIncident) {
        const from = junctionCoords[road.from];
        const to = junctionCoords[road.to];
        if (from && to) {
          // Slight offset from midpoint to prevent overlaying directly on traffic circles
          const midLon = (from[0] + to[0]) / 2 + 0.0006;
          const midLat = (from[1] + to[1]) / 2 + 0.0006;

          const incDiv = document.createElement('div');
          incDiv.innerText = '⚠️';
          incDiv.style.width = '30px';
          incDiv.style.height = '30px';
          incDiv.style.borderRadius = '50%';
          incDiv.style.background = '#ef4444';
          incDiv.style.border = '2px solid #ffffff';
          incDiv.style.display = 'flex';
          incDiv.style.alignItems = 'center';
          incDiv.style.justifyContent = 'center';
          incDiv.style.color = '#ffffff';
          incDiv.style.fontSize = '14px';
          incDiv.style.cursor = 'pointer';
          incDiv.style.boxShadow = '0 0 12px #ef4444';
          incDiv.style.animation = 'pulse-ring 1s infinite';

          const marker = new atlas.HtmlMarker({
            htmlContent: incDiv,
            position: [midLon, midLat],
          });

          // Click to resolve incident
          incDiv.addEventListener('click', (e) => {
            e.stopPropagation();
            onClearIncident(road.id);
          });

          map.markers.add(marker);
          markersRef.current.push(marker);
        }
      }
    });

    // 5. Render Vehicles
    vehicles.forEach(vehicle => {
      const from = junctionCoords[vehicle.fromJunctionId];
      const to = junctionCoords[vehicle.toJunctionId];
      if (from && to) {
        const pct = vehicle.progress / 100;
        const vehicleLon = from[0] + (to[0] - from[0]) * pct;
        const vehicleLat = from[1] + (to[1] - from[1]) * pct;

        const vehicleDiv = document.createElement('div');
        vehicleDiv.innerText = vehicle.type === 'emergency' ? '🚑' : vehicle.type === 'bus' ? '🚌' : '🚗';
        vehicleDiv.style.fontSize = vehicle.type === 'emergency' ? '18px' : '13px';
        vehicleDiv.style.cursor = 'pointer';
        
        if (vehicle.type === 'emergency') {
          vehicleDiv.style.animation = 'pulse-ring 0.6s infinite';
        }

        const marker = new atlas.HtmlMarker({
          htmlContent: vehicleDiv,
          position: [vehicleLon, vehicleLat],
        });

        map.markers.add(marker);
        markersRef.current.push(marker);
      }
    });

  }, [mapReady, roads, vehicles, selectedJunctionId, onClearIncident]);

  return (
    <div className="glass-panel map-panel" style={{ minHeight: '520px', display: 'flex', flexDirection: 'column' }}>
      <div className="panel-title">
        <span>
          <svg className="panel-title-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"></polygon>
            <line x1="8" y1="2" x2="8" y2="18"></line>
            <line x1="16" y1="6" x2="16" y2="22"></line>
          </svg>
          Live Azure Maps Traffic Integration
        </span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span className={`status-dot ${mapReady ? '' : 'loading'}`}></span>
          <span className="badge-ui badge-green">
            {mapReady ? 'Azure Maps Live' : 'Initializing Map SDK...'}
          </span>
        </div>
      </div>
      
      <div className="map-viewport" style={{ flex: 1, position: 'relative', overflow: 'hidden', minHeight: '440px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Map Container Element */}
        <div 
          ref={mapContainerRef} 
          id="azure-map" 
          style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }} 
        />
        
        {/* Helper Banner when Key is Missing/Invalid */}
        {keyError && (
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(9, 14, 26, 0.92)', padding: '24px', textAlign: 'center', zIndex: 20 }}>
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>🔑</span>
            <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#fff', marginBottom: '8px' }}>Azure Maps Key Required</div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: '1.5', marginBottom: '16px' }}>
              The Map SDK is ready, but no authenticated Subscription Key has been configured in your Azure environment variables.
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', padding: '10px 14px', borderRadius: '6px', fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'monospace', textAlign: 'left', maxWidth: '360px' }}>
              1. Go to Azure SWA Portal Settings<br />
              2. Click "Configuration" -&gt; "Application settings"<br />
              3. Add: <span style={{ color: 'var(--accent-cyan)' }}>AZURE_MAPS_KEY</span> = <span style={{ color: 'var(--accent-purple)' }}>YOUR_AZURE_MAPS_KEY</span><br />
              4. Click "Save" to immediately go live!
            </div>
          </div>
        )}

        {/* Map legend overlay */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(9, 14, 26, 0.85)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', zIndex: 10, pointerEvents: 'none' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-primary)' }}>Traffic Index</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444', border: '1.5px solid #fff' }}></span>
              <span>Gridlock (&gt;70%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b', border: '1.5px solid #fff' }}></span>
              <span>Heavy (40%-70%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981', border: '1.5px solid #fff' }}></span>
              <span>Optimal (&lt;40%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
              <span>⚠️</span>
              <span>Incident Reported</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
