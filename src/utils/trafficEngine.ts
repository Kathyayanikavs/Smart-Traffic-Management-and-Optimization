// Smart City Traffic Management and Optimization - Simulation Engine

export interface Junction {
  id: string;
  name: string;
  x: number;
  y: number;
  lightState: 'H' | 'V' | 'HY' | 'VY'; // H=Horizontal Green, V=Vertical Green, HY=Horiz Yellow, VY=Vert Yellow
  lightTimer: number; // seconds remaining in current phase
  mode: 'standard' | 'ai';
  queueH: number; // number of vehicles waiting horizontally
  queueV: number; // number of vehicles waiting vertically
}

export interface Road {
  id: string;
  from: string;
  to: string;
  name: string;
  length: number; // in meters
  speedLimit: number; // km/h
  vehicleCount: number;
  congestion: number; // 0.0 (empty) to 1.0 (gridlock)
  hasIncident: boolean;
  incidentType?: 'accident' | 'construction' | 'hazard';
}

export interface SimulatedVehicle {
  id: string;
  type: 'car' | 'bus' | 'emergency';
  currentRoadId: string;
  fromJunctionId: string;
  toJunctionId: string;
  progress: number; // 0 to 100% along the road
  speed: number; // current speed in km/h
  route: string[]; // array of junction IDs
  routeIndex: number;
}

export interface ParkingGarage {
  id: string;
  name: string;
  totalSpots: number;
  occupiedSpots: number;
  hourlyRate: number;
}

export interface SectorAQI {
  name: string;
  aqi: number;
  pm25: number;
  co2Savings: number; // cumulative CO2 saved in kg
}

// Initial Junctions (3x3 grid)
export const initialJunctions: Junction[] = [
  { id: 'J1', name: 'Northwest Plaza', x: 150, y: 150, lightState: 'H', lightTimer: 10, mode: 'standard', queueH: 2, queueV: 3 },
  { id: 'J2', name: 'Grand Avenue', x: 400, y: 150, lightState: 'V', lightTimer: 8, mode: 'standard', queueH: 4, queueV: 1 },
  { id: 'J3', name: 'Northeast Station', x: 650, y: 150, lightState: 'H', lightTimer: 12, mode: 'standard', queueH: 1, queueV: 5 },
  { id: 'J4', name: 'West Gate Crossing', x: 150, y: 350, lightState: 'V', lightTimer: 14, mode: 'standard', queueH: 5, queueV: 4 },
  { id: 'J5', name: 'City Center Hub', x: 400, y: 350, lightState: 'H', lightTimer: 15, mode: 'standard', queueH: 8, queueV: 7 },
  { id: 'J6', name: 'East Boulevard', x: 650, y: 350, lightState: 'V', lightTimer: 6, mode: 'standard', queueH: 2, queueV: 2 },
  { id: 'J7', name: 'Southwest Park', x: 150, y: 550, lightState: 'H', lightTimer: 10, mode: 'standard', queueH: 3, queueV: 1 },
  { id: 'J8', name: 'Central Terminal', x: 400, y: 550, lightState: 'V', lightTimer: 11, mode: 'standard', queueH: 6, queueV: 8 },
  { id: 'J9', name: 'Southeast Gate', x: 650, y: 550, lightState: 'H', lightTimer: 9, mode: 'standard', queueH: 2, queueV: 3 },
];

// Initial Roads connecting the grid
export const initialRoads: Road[] = [
  // Horizontal Roads
  { id: 'R_J1_J2', from: 'J1', to: 'J2', name: 'Avenue A (Eastbound)', length: 500, speedLimit: 50, vehicleCount: 12, congestion: 0.3, hasIncident: false },
  { id: 'R_J2_J1', from: 'J2', to: 'J1', name: 'Avenue A (Westbound)', length: 500, speedLimit: 50, vehicleCount: 8, congestion: 0.2, hasIncident: false },
  { id: 'R_J2_J3', from: 'J2', to: 'J3', name: 'Avenue A Extension (Eastbound)', length: 500, speedLimit: 50, vehicleCount: 15, congestion: 0.4, hasIncident: false },
  { id: 'R_J3_J2', from: 'J3', to: 'J2', name: 'Avenue A Extension (Westbound)', length: 500, speedLimit: 50, vehicleCount: 10, congestion: 0.25, hasIncident: false },
  
  { id: 'R_J4_J5', from: 'J4', to: 'J5', name: 'Main Street (Eastbound)', length: 500, speedLimit: 60, vehicleCount: 22, congestion: 0.6, hasIncident: false },
  { id: 'R_J5_J4', from: 'J5', to: 'J4', name: 'Main Street (Westbound)', length: 500, speedLimit: 60, vehicleCount: 18, congestion: 0.5, hasIncident: false },
  { id: 'R_J5_J6', from: 'J5', to: 'J6', name: 'Broadway Boulevard (Eastbound)', length: 500, speedLimit: 60, vehicleCount: 28, congestion: 0.75, hasIncident: false },
  { id: 'R_J6_J5', from: 'J6', to: 'J5', name: 'Broadway Boulevard (Westbound)', length: 500, speedLimit: 60, vehicleCount: 14, congestion: 0.35, hasIncident: false },

  { id: 'R_J7_J8', from: 'J7', to: 'J8', name: 'South Highway (Eastbound)', length: 500, speedLimit: 50, vehicleCount: 6, congestion: 0.15, hasIncident: false },
  { id: 'R_J8_J7', from: 'J8', to: 'J7', name: 'South Highway (Westbound)', length: 500, speedLimit: 50, vehicleCount: 7, congestion: 0.18, hasIncident: false },
  { id: 'R_J8_J9', from: 'J8', to: 'J9', name: 'South Highway Ext (Eastbound)', length: 500, speedLimit: 50, vehicleCount: 9, congestion: 0.22, hasIncident: false },
  { id: 'R_J9_J8', from: 'J9', to: 'J8', name: 'South Highway Ext (Westbound)', length: 500, speedLimit: 50, vehicleCount: 11, congestion: 0.28, hasIncident: false },

  // Vertical Roads
  { id: 'R_J1_J4', from: 'J1', to: 'J4', name: '1st Avenue (Southbound)', length: 400, speedLimit: 50, vehicleCount: 14, congestion: 0.4, hasIncident: false },
  { id: 'R_J4_J1', from: 'J4', to: 'J1', name: '1st Avenue (Northbound)', length: 400, speedLimit: 50, vehicleCount: 11, congestion: 0.3, hasIncident: false },
  { id: 'R_J4_J7', from: 'J4', to: 'J7', name: '1st Avenue Loop (Southbound)', length: 400, speedLimit: 50, vehicleCount: 8, congestion: 0.2, hasIncident: false },
  { id: 'R_J7_J4', from: 'J7', to: 'J4', name: '1st Avenue Loop (Northbound)', length: 400, speedLimit: 50, vehicleCount: 9, congestion: 0.22, hasIncident: false },

  { id: 'R_J2_J5', from: 'J2', to: 'J5', name: 'Central Parkway (Southbound)', length: 400, speedLimit: 50, vehicleCount: 20, congestion: 0.55, hasIncident: false },
  { id: 'R_J5_J2', from: 'J5', to: 'J2', name: 'Central Parkway (Northbound)', length: 400, speedLimit: 50, vehicleCount: 16, congestion: 0.45, hasIncident: false },
  { id: 'R_J5_J8', from: 'J5', to: 'J8', name: 'Central Parkway South (Southbound)', length: 400, speedLimit: 50, vehicleCount: 25, congestion: 0.7, hasIncident: false },
  { id: 'R_J8_J5', from: 'R_J8_J5', to: 'J5', name: 'Central Parkway South (Northbound)', length: 400, speedLimit: 50, vehicleCount: 19, congestion: 0.5, hasIncident: false },

  { id: 'R_J3_J6', from: 'J3', to: 'J6', name: 'Express Link (Southbound)', length: 400, speedLimit: 60, vehicleCount: 10, congestion: 0.25, hasIncident: false },
  { id: 'R_J6_J3', from: 'J6', to: 'J3', name: 'Express Link (Northbound)', length: 400, speedLimit: 60, vehicleCount: 8, congestion: 0.2, hasIncident: false },
  { id: 'R_J6_J9', from: 'J6', to: 'J9', name: 'Express Link South (Southbound)', length: 400, speedLimit: 60, vehicleCount: 12, congestion: 0.32, hasIncident: false },
  { id: 'R_J9_J6', from: 'J9', to: 'J6', name: 'Express Link South (Northbound)', length: 400, speedLimit: 60, vehicleCount: 15, congestion: 0.4, hasIncident: false },
];

// Clean up mismatched from/to in initialRoads
// Make sure from/to references match the actual node IDs and target links are correct.
// Let's verify R_J8_J5 from is J8 and to is J5. In the array above, it was:
// { id: 'R_J8_J5', from: 'R_J8_J5', to: 'J5', ...} - let's fix that.
initialRoads.forEach(r => {
  if (r.id === 'R_J8_J5') {
    r.from = 'J8';
  }
});

// Parking lots
export const initialParking: ParkingGarage[] = [
  { id: 'P1', name: 'Plaza Terminal Garage', totalSpots: 200, occupiedSpots: 145, hourlyRate: 3.5 },
  { id: 'P2', name: 'City Center Underground', totalSpots: 450, occupiedSpots: 390, hourlyRate: 5.0 },
  { id: 'P3', name: 'South Park Parking Lot', totalSpots: 150, occupiedSpots: 45, hourlyRate: 2.0 },
];

// Sectors for AQI
export const initialSectors: SectorAQI[] = [
  { name: 'North Sector', aqi: 62, pm25: 16.4, co2Savings: 150 },
  { name: 'Downtown Center', aqi: 115, pm25: 41.2, co2Savings: 340 },
  { name: 'South Transit Zone', aqi: 54, pm25: 13.1, co2Savings: 110 },
  { name: 'East Business Loop', aqi: 88, pm25: 29.8, co2Savings: 210 },
];

// Dijkstra shortest path calculator
// Finds path from source junction to target junction
export function calculateShortestPath(
  startJunction: string,
  endJunction: string,
  roads: Road[],
  junctions: Junction[],
  useAIWeights: boolean = true
): string[] {
  const dist: { [key: string]: number } = {};
  const prev: { [key: string]: string | null } = {};
  const nodes = junctions.map(j => j.id);

  nodes.forEach(node => {
    dist[node] = Infinity;
    prev[node] = null;
  });

  dist[startJunction] = 0;
  const unvisited = new Set(nodes);

  while (unvisited.size > 0) {
    // Get node with minimum distance
    let u: string | null = null;
    unvisited.forEach(node => {
      if (u === null || dist[node] < dist[u]) {
        u = node;
      }
    });

    if (u === null || dist[u] === Infinity || u === endJunction) {
      break;
    }

    unvisited.delete(u);

    // Find outgoing roads from u
    const outgoingRoads = roads.filter(r => r.from === u);

    for (const road of outgoingRoads) {
      const v = road.to;
      if (!unvisited.has(v)) continue;

      // Calculate weight
      let weight = road.length;

      if (useAIWeights) {
        // AI router penalizes congestion and incidents
        const congestionMultiplier = 1 + road.congestion * 3; // up to 4x penalty for high congestion
        const incidentPenalty = road.hasIncident ? 1000 : 0; // major penalty for accidents/blocks
        weight = road.length * congestionMultiplier + incidentPenalty;
      } else if (road.hasIncident) {
        weight = road.length + 500; // standard router is less smart, just small static penalty
      }

      const alt = dist[u] + weight;
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = u;
      }
    }
  }

  // Reconstruct path
  const path: string[] = [];
  let curr: string | null = endJunction;
  while (curr !== null) {
    path.unshift(curr);
    curr = prev[curr];
  }

  return path[0] === startJunction ? path : [];
}

// Find road ID by connecting junctions
export function findRoad(from: string, to: string, roads: Road[]): Road | undefined {
  return roads.find(r => r.from === from && r.to === to);
}

// AI optimization signal control logic
// Checks queues and adjusts light timings dynamically
export function optimizeSignals(junction: Junction, roads: Road[]): { nextState: 'H' | 'V' | 'HY' | 'VY'; nextTimer: number } {
  // Find roads feeding into this junction
  const incoming = roads.filter(r => r.to === junction.id);
  
  // Classify incoming roads as Horizontal or Vertical
  // Horizontal approach roads are those running East/West, which end at J (e.g. from J1 or J3 to J2)
  let queueH = 0;
  let queueV = 0;

  incoming.forEach(road => {
    // If the from junction shares y coordinate, it's horizontal
    const fromNode = initialJunctions.find(j => j.id === road.from);
    const toNode = initialJunctions.find(j => j.id === road.to);
    
    if (fromNode && toNode) {
      if (Math.abs(fromNode.y - toNode.y) < 10) {
        queueH += Math.round(road.congestion * 15 + road.vehicleCount * 0.4);
      } else {
        queueV += Math.round(road.congestion * 15 + road.vehicleCount * 0.4);
      }
    }
  });

  // Default values
  let nextState = junction.lightState;
  let nextTimer = junction.lightTimer;

  if (junction.mode === 'ai') {
    // AI Mode: Dynamic signal switching
    if (junction.lightState === 'H' && junction.lightTimer <= 2) {
      // If H is green, but V has massive queue and H is clearing up, switch early
      if (queueV > queueH + 5 && junction.lightTimer > 0) {
        nextState = 'HY'; // switch to yellow
        nextTimer = 3;
      } else if (junction.lightTimer === 0) {
        nextState = 'HY';
        nextTimer = 3;
      }
    } else if (junction.lightState === 'V' && junction.lightTimer <= 2) {
      // If V is green, but H is backed up, switch early
      if (queueH > queueV + 5 && junction.lightTimer > 0) {
        nextState = 'VY'; // switch to yellow
        nextTimer = 3;
      } else if (junction.lightTimer === 0) {
        nextState = 'VY';
        nextTimer = 3;
      }
    } else if (junction.lightState === 'HY' && junction.lightTimer === 0) {
      nextState = 'V';
      // Allocate green time dynamically based on queue length: base 10s + up to 15s
      nextTimer = Math.min(25, Math.max(10, Math.round(10 + queueV * 1.5)));
    } else if (junction.lightState === 'VY' && junction.lightTimer === 0) {
      nextState = 'H';
      // Allocate green time dynamically
      nextTimer = Math.min(25, Math.max(10, Math.round(10 + queueH * 1.5)));
    }
  } else {
    // Standard Mode: Fixed cycles (H green 15s -> HY yellow 3s -> V green 15s -> VY yellow 3s)
    if (junction.lightTimer === 0) {
      if (junction.lightState === 'H') {
        nextState = 'HY';
        nextTimer = 3;
      } else if (junction.lightState === 'HY') {
        nextState = 'V';
        nextTimer = 15;
      } else if (junction.lightState === 'V') {
        nextState = 'VY';
        nextTimer = 3;
      } else if (junction.lightState === 'VY') {
        nextState = 'H';
        nextTimer = 15;
      }
    }
  }

  return { nextState, nextTimer, ... { queueH, queueV } };
}

// Generate next tick state of the city simulation (seconds increments)
export function updateSimulationStep(
  junctions: Junction[],
  roads: Road[],
  vehicles: SimulatedVehicle[],
  parking: ParkingGarage[],
  sectors: SectorAQI[],
  _tickCount: number,
  weather: 'sunny' | 'rainy' | 'snowy' = 'sunny'
): {
  junctions: Junction[];
  roads: Road[];
  vehicles: SimulatedVehicle[];
  parking: ParkingGarage[];
  sectors: SectorAQI[];
} {
  // 1. Update Junction Signals timer
  const updatedJunctions = junctions.map(j => {
    const timerVal = j.lightTimer > 0 ? j.lightTimer - 1 : 0;
    const tempJunction = { ...j, lightTimer: timerVal };
    const opt = optimizeSignals(tempJunction, roads);
    
    // Fetch calculated queues
    const incoming = roads.filter(r => r.to === j.id);
    let queueH = 0;
    let queueV = 0;
    incoming.forEach(road => {
      const fromNode = junctions.find(node => node.id === road.from);
      if (fromNode) {
        if (Math.abs(fromNode.y - j.y) < 10) {
          queueH += Math.round(road.congestion * 8 + road.vehicleCount * 0.2);
        } else {
          queueV += Math.round(road.congestion * 8 + road.vehicleCount * 0.2);
        }
      }
    });

    return {
      ...j,
      lightState: opt.nextState,
      lightTimer: opt.nextState !== j.lightState ? opt.nextTimer : timerVal,
      queueH: Math.max(0, queueH),
      queueV: Math.max(0, queueV),
    };
  });

  // 2. Simulate Parking Lot changes (random in/out flow)
  const updatedParking = parking.map(p => {
    const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
    const spots = Math.min(p.totalSpots, Math.max(5, p.occupiedSpots + change));
    return { ...p, occupiedSpots: spots };
  });

  // 3. Move vehicles along their routes
  const updatedVehicles = vehicles.map(v => {
    const currentRoad = roads.find(r => r.id === v.currentRoadId);
    if (!currentRoad) return v;

    // Check if vehicle reached junction
    let progress = v.progress + (v.speed / (currentRoad.length * 3.6)) * 100; // progress step
    let routeIndex = v.routeIndex;
    let currentRoadId = v.currentRoadId;
    let fromJunctionId = v.fromJunctionId;
    let toJunctionId = v.toJunctionId;
    let speed = v.speed;

    const targetJunction = updatedJunctions.find(j => j.id === v.toJunctionId);
    let isRed = false;

    if (progress >= 95 && targetJunction) {
      // Determine approach direction
      const fromNode = updatedJunctions.find(j => j.id === v.fromJunctionId);
      if (fromNode) {
        const isHorizontal = Math.abs(fromNode.y - targetJunction.y) < 10;
        
        // Check light state
        if (isHorizontal) {
          isRed = targetJunction.lightState === 'V' || targetJunction.lightState === 'VY';
        } else {
          isRed = targetJunction.lightState === 'H' || targetJunction.lightState === 'HY';
        }
      }

      // EMERGENCY VEHICLE RED-LIGHT OVERRIDE (Green Wave)
      if (v.type === 'emergency') {
        isRed = false;
        // Force the junction light state to align with the emergency vehicle approach
        const fromNode = updatedJunctions.find(j => j.id === v.fromJunctionId);
        if (fromNode) {
          const isHorizontal = Math.abs(fromNode.y - targetJunction.y) < 10;
          if (isHorizontal && (targetJunction.lightState === 'V' || targetJunction.lightState === 'VY')) {
            targetJunction.lightState = 'H';
            targetJunction.lightTimer = 5; // force green horizontal for 5s
          } else if (!isHorizontal && (targetJunction.lightState === 'H' || targetJunction.lightState === 'HY')) {
            targetJunction.lightState = 'V';
            targetJunction.lightTimer = 5; // force green vertical for 5s
          }
        }
      }
    }

    if (progress >= 100) {
      if (isRed) {
        // Stop at light
        progress = 98;
        speed = 0;
      } else {
        // Move to next road on route
        if (routeIndex + 1 < v.route.length - 1) {
          routeIndex += 1;
          const nextFrom = v.route[routeIndex];
          const nextTo = v.route[routeIndex + 1];
          const nextRoad = findRoad(nextFrom, nextTo, roads);
          if (nextRoad) {
            currentRoadId = nextRoad.id;
            fromJunctionId = nextFrom;
            toJunctionId = nextTo;
            progress = 0;
            speed = nextRoad.speedLimit * (1 - nextRoad.congestion * 0.5);
          } else {
            // End of route (despawn/restart route)
            progress = 0;
            routeIndex = 0;
            fromJunctionId = v.route[0];
            toJunctionId = v.route[1];
            const startRoad = findRoad(fromJunctionId, toJunctionId, roads);
            currentRoadId = startRoad?.id || v.currentRoadId;
            speed = (startRoad?.speedLimit || 50) * 0.8;
          }
        } else {
          // Restart route
          progress = 0;
          routeIndex = 0;
          fromJunctionId = v.route[0];
          toJunctionId = v.route[1];
          const startRoad = findRoad(fromJunctionId, toJunctionId, roads);
          currentRoadId = startRoad?.id || v.currentRoadId;
          speed = (startRoad?.speedLimit || 50) * 0.8;
        }
      }
    } else {
      // Adjust speed based on congestion, incident, and weather
      const weatherFactor = weather === 'rainy' ? 0.75 : weather === 'snowy' ? 0.55 : 1.0;
      const baseSpeed = currentRoad.speedLimit * (1 - currentRoad.congestion * 0.6) * weatherFactor;
      speed = isRed && progress >= 90 ? Math.max(0, speed - 15) : Math.max(10, baseSpeed);
    }

    return {
      ...v,
      currentRoadId,
      fromJunctionId,
      toJunctionId,
      progress,
      speed,
      routeIndex,
    };
  });

  // 4. Update road congestion based on vehicle counts and simulation metrics
  const updatedRoads = roads.map(r => {
    // Count simulator vehicles currently on this road
    const simCarsOnRoad = updatedVehicles.filter(v => v.currentRoadId === r.id);
    
    // Background fluctuations + simulator vehicles
    const baseCount = r.hasIncident ? 35 : Math.max(2, r.vehicleCount + (Math.floor(Math.random() * 3) - 1));
    const finalCount = Math.max(simCarsOnRoad.length, baseCount);

    // Congestion calculation (from 0 to 1)
    let congestion = finalCount / 40; // 40 cars capacity before gridlock
    if (weather === 'rainy') congestion *= 1.20; // rain increases congestion
    if (weather === 'snowy') congestion *= 1.45; // snow increases congestion significantly
    if (r.hasIncident) congestion = Math.min(1.0, congestion + 0.4); // incident makes it highly congested
    congestion = Math.min(1.0, Math.max(0.05, congestion));

    return {
      ...r,
      vehicleCount: finalCount,
      congestion,
    };
  });

  // 5. Update Sector Air Quality (AQI) and Carbon footprint reduction calculations
  const totalAICount = updatedJunctions.filter(j => j.mode === 'ai').length;
  const optimizationLevel = totalAICount / updatedJunctions.length; // 0 to 1

  const updatedSectors = sectors.map((s, idx) => {
    // Calculate sector average congestion
    let sectorCongestion = 0.2;
    if (idx === 0) { // North Sector (J1, J2, J3)
      const rIds = ['R_J1_J2', 'R_J2_J1', 'R_J2_J3', 'R_J3_J2'];
      const sectorRoads = updatedRoads.filter(r => rIds.includes(r.id));
      sectorCongestion = sectorRoads.reduce((acc, r) => acc + r.congestion, 0) / sectorRoads.length;
    } else if (idx === 1) { // Downtown Center (J5, J4, J6, J8)
      const rIds = ['R_J4_J5', 'R_J5_J4', 'R_J5_J6', 'R_J6_J5', 'R_J2_J5', 'R_J5_J2', 'R_J5_J8', 'R_J8_J5'];
      const sectorRoads = updatedRoads.filter(r => rIds.includes(r.id));
      sectorCongestion = sectorRoads.reduce((acc, r) => acc + r.congestion, 0) / sectorRoads.length;
    } else if (idx === 2) { // South Zone (J7, J8, J9)
      const rIds = ['R_J7_J8', 'R_J8_J7', 'R_J8_J9', 'R_J9_J8'];
      const sectorRoads = updatedRoads.filter(r => rIds.includes(r.id));
      sectorCongestion = sectorRoads.reduce((acc, r) => acc + r.congestion, 0) / sectorRoads.length;
    } else { // East business loop (J3, J6, J9)
      const rIds = ['R_J3_J6', 'R_J6_J3', 'R_J6_J9', 'R_J9_J6'];
      const sectorRoads = updatedRoads.filter(r => rIds.includes(r.id));
      sectorCongestion = sectorRoads.reduce((acc, r) => acc + r.congestion, 0) / sectorRoads.length;
    }

    // AQI is base index (30) + 120 * average congestion
    // AI signals reduce idling/stop-start emissions, reducing PM2.5 and AQI
    const reductionFactor = 1 - (optimizationLevel * 0.3); // up to 30% reduction in pollution index
    
    const targetAqi = Math.round((30 + sectorCongestion * 130) * reductionFactor);
    const targetPm25 = parseFloat(((5 + sectorCongestion * 45) * reductionFactor).toFixed(1));
    
    // Accumulate CO2 savings in kg: AI optimizations save 0.05kg of CO2 per second per active AI junction
    const hourlySavings = totalAICount * 0.03; // kg CO2 saved per simulated tick
    
    return {
      ...s,
      aqi: targetAqi,
      pm25: targetPm25,
      co2Savings: parseFloat((s.co2Savings + hourlySavings).toFixed(2)),
    };
  });

  return {
    junctions: updatedJunctions,
    roads: updatedRoads,
    vehicles: updatedVehicles,
    parking: updatedParking,
    sectors: updatedSectors,
  };
}

// Generate initial mock vehicles moving in loops
export function generateInitialVehicles(): SimulatedVehicle[] {
  return [
    // Bus route 1: Outer loop
    {
      id: 'BUS_101',
      type: 'bus',
      currentRoadId: 'R_J1_J2',
      fromJunctionId: 'J1',
      toJunctionId: 'J2',
      progress: 10,
      speed: 40,
      route: ['J1', 'J2', 'J3', 'J6', 'J9', 'J8', 'J7', 'J4', 'J1'],
      routeIndex: 0,
    },
    // Bus route 2: Center cross loop
    {
      id: 'BUS_202',
      type: 'bus',
      currentRoadId: 'R_J2_J5',
      fromJunctionId: 'J2',
      toJunctionId: 'J5',
      progress: 30,
      speed: 35,
      route: ['J2', 'J5', 'J8', 'J7', 'J4', 'J5', 'J2'],
      routeIndex: 0,
    },
    // Simulated passenger cars
    {
      id: 'CAR_01',
      type: 'car',
      currentRoadId: 'R_J4_J5',
      fromJunctionId: 'J4',
      toJunctionId: 'J5',
      progress: 50,
      speed: 45,
      route: ['J4', 'J5', 'J6', 'J9', 'J8', 'J5', 'J4'],
      routeIndex: 0,
    },
    {
      id: 'CAR_02',
      type: 'car',
      currentRoadId: 'R_J3_J6',
      fromJunctionId: 'J3',
      toJunctionId: 'J6',
      progress: 70,
      speed: 50,
      route: ['J3', 'J6', 'J5', 'J2', 'J3'],
      routeIndex: 0,
    },
    {
      id: 'CAR_03',
      type: 'car',
      currentRoadId: 'R_J8_J7',
      fromJunctionId: 'J8',
      toJunctionId: 'J7',
      progress: 20,
      speed: 45,
      route: ['J8', 'J7', 'J4', 'J1', 'J2', 'J5', 'J8'],
      routeIndex: 0,
    },
  ];
}
