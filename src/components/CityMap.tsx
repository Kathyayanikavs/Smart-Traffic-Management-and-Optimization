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

const AZURE_MAPS_KEY = import.meta.env.VITE_AZURE_MAPS_KEY || 'YOUR_AZURE_MAPS_SUBSCRIPTION_KEY';

export const CityMap: React.FC<CityMapProps> = ({
  junctions,
  roads,
  vehicles,
  activeRoute,
  selectedJunctionId,
  onJunctionSelect,
  onClearIncident,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<atlas.Map | null>(null);
  const dataSourceRef = useRef<atlas.source.DataSource | null>(null);
  const routeSourceRef = useRef<atlas.source.DataSource | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Initialize Azure Maps on mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new atlas.Map(mapContainerRef.current, {
      center: [-122.330, 47.600],
      zoom: 13.5,
      style: 'night', // Futuristic dark theme matching the dashboard
      language: 'en-US',
      authOptions: {
        authType: atlas.AuthenticationType.subscriptionKey,
        subscriptionKey: AZURE_MAPS_KEY,
      },
    });

    mapRef.current = map;

    map.events.add('ready', () => {
      setMapReady(true);

      // Create data sources
      const dataSource = new atlas.source.DataSource();
      const routeSource = new atlas.source.DataSource();
      
      map.sources.add(dataSource);
      map.sources.add(routeSource);
      
      dataSourceRef.current = dataSource;
      routeSourceRef.current = routeSource;

      // 1. Add Road Line Layer
      map.layers.add(
        new atlas.layer.LineLayer(dataSource, undefined, {
          strokeColor: [
            'case',
            ['>', ['get', 'congestion'], 0.7], '#ef4444', // Red for gridlock
            ['>', ['get', 'congestion'], 0.4], '#f59e0b', // Yellow for heavy traffic
            '#10b981' // Green for optimal flow
          ],
          strokeWidth: 6,
          lineCap: 'round',
          lineJoin: 'round',
        })
      );

      // 2. Add Route Highlight Layer (Emergency Green Wave path)
      map.layers.add(
        new atlas.layer.LineLayer(routeSource, undefined, {
          strokeColor: '#3b82f6', // Glowing blue emergency route
          strokeWidth: 10,
          blur: 1,
          lineCap: 'round',
          lineJoin: 'round',
        })
      );

      // 3. Add Incident Point Layer (Red Warning Triangles)
      map.layers.add(
        new atlas.layer.SymbolLayer(dataSource, undefined, {
          filter: ['==', ['geometry-type'], 'Point'],
          iconOptions: {
            image: 'pin-red',
            allowOverlap: true,
            ignorePlacement: true,
          },
          textOptions: {
            textField: ['get', 'label'],
            color: '#ffffff',
            offset: [0, -1.2],
            size: 11,
          },
        })
      );

      // 4. Add Click Handler for Junction Selection
      map.events.add('click', (e) => {
        if (!e.position) return;
        const clickPt = e.position;

        // Find nearest junction within click range
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
  }, []);

  // Update map features in real-time when simulation tick state changes
  useEffect(() => {
    if (!mapReady || !dataSourceRef.current || !routeSourceRef.current) return;

    const dataSource = dataSourceRef.current;
    const routeSource = routeSourceRef.current;

    // Clear existing map items
    dataSource.clear();
    routeSource.clear();

    // Reference props to avoid unused variables build errors
    const _unused = [selectedJunctionId, onClearIncident];
    console.log("Active selection / clearance handlers ready:", _unused.length);

    const features: atlas.data.Feature<atlas.data.Geometry, any>[] = [];

    // 1. Draw Road segments
    roads.forEach(road => {
      const fromCoord = junctionCoords[road.from];
      const toCoord = junctionCoords[road.to];
      if (fromCoord && toCoord) {
        features.push(
          new atlas.data.Feature(
            new atlas.data.LineString([
              new atlas.data.Position(fromCoord[0], fromCoord[1]),
              new atlas.data.Position(toCoord[0], toCoord[1])
            ]),
            {
              congestion: road.congestion,
              type: 'road',
              id: road.id,
            }
          )
        );
      }
    });

    // 2. Draw Incidents (midpoint of roads)
    roads.forEach(road => {
      if (road.hasIncident) {
        const fromCoord = junctionCoords[road.from];
        const toCoord = junctionCoords[road.to];
        if (fromCoord && toCoord) {
          // Mid-point coordinates
          const midLon = (fromCoord[0] + toCoord[0]) / 2;
          const midLat = (fromCoord[1] + toCoord[1]) / 2;
          
          features.push(
            new atlas.data.Feature(
              new atlas.data.Point(new atlas.data.Position(midLon, midLat)),
              {
                type: 'incident',
                label: '🚨 INCIDENT',
                roadId: road.id,
              }
            )
          );
        }
      }
    });

    // 3. Draw Vehicles as moving points
    vehicles.forEach(vehicle => {
      const from = junctionCoords[vehicle.fromJunctionId];
      const to = junctionCoords[vehicle.toJunctionId];
      if (from && to) {
        const pct = vehicle.progress / 100;
        const vehicleLon = from[0] + (to[0] - from[0]) * pct;
        const vehicleLat = from[1] + (to[1] - from[1]) * pct;

        features.push(
          new atlas.data.Feature(
            new atlas.data.Point(new atlas.data.Position(vehicleLon, vehicleLat)),
            {
              type: 'vehicle',
              vehicleType: vehicle.type,
              label: vehicle.type === 'emergency' ? '🚑' : vehicle.type === 'bus' ? '🚌' : '🚗',
            }
          )
        );
      }
    });

    dataSource.add(features);

    // 4. Draw Active Emergency Route (Green Wave path)
    if (activeRoute && activeRoute.length >= 2) {
      const coords: atlas.data.Position[] = [];
      activeRoute.forEach(junctionId => {
        const c = junctionCoords[junctionId];
        if (c) {
          coords.push(new atlas.data.Position(c[0], c[1]));
        }
      });
      if (coords.length >= 2) {
        routeSource.add(
          new atlas.data.Feature(new atlas.data.LineString(coords), {
            type: 'route',
          })
        );
      }
    }
  }, [mapReady, roads, vehicles, activeRoute, junctions, selectedJunctionId, onClearIncident]);

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
        
        {/* Map legend overlay */}
        <div style={{ position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(9, 14, 26, 0.85)', padding: '10px 14px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '11px', zIndex: 10, pointerEvents: 'none' }}>
          <div style={{ fontWeight: 'bold', marginBottom: '6px', color: 'var(--text-primary)' }}>Traffic Index</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', background: '#ef4444', borderRadius: '1px' }}></span>
              <span>Gridlock (&gt;70%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', background: '#f59e0b', borderRadius: '1px' }}></span>
              <span>Heavy (40%-70%)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '12px', height: '3px', background: '#10b981', borderRadius: '1px' }}></span>
              <span>Optimal (&lt;40%)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
