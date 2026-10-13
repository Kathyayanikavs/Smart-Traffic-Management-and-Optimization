# 🚦 Smart City Traffic Management & Optimization

> A full-stack, cloud-native smart city dashboard built with **React + TypeScript**, powered by **Azure Static Web Apps**, **Azure SQL**, **Azure IoT Hub**, **Azure Maps**, and **Power BI**.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Azure%20SWA-blue?logo=microsoft-azure)](https://zealous-field-01dba2e10.7.azurestaticapps.net/)
[![GitHub](https://img.shields.io/badge/GitHub-Repo-black?logo=github)](https://github.com/Kathyayanikavs/Smart-Traffic-Management-and-Optimization)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Live Demo](#live-demo)
- [Architecture](#architecture)
- [Azure Services](#azure-services)
- [Project Structure](#project-structure)
- [Frontend Components](#frontend-components)
- [Backend API Endpoints](#backend-api-endpoints)
- [IoT Simulator](#iot-simulator)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Deployment](#deployment)
- [Power BI Integration](#power-bi-integration)

---

## 🌟 Overview

The **Smart City Traffic Management & Optimization** platform is a real-time urban intelligence dashboard that monitors, predicts, and responds to city traffic conditions. It integrates live sensor data, AI-powered congestion forecasting, interactive city maps, emergency vehicle routing, incident reporting, and air quality monitoring — all in a single premium dark-mode web interface.

Key Highlights:
- 🗺️ **Azure Maps** with live incident markers, colored congestion pins, and emergency route overlays
- 🤖 **ML-style predictions** for vehicle count, speed, and congestion per road
- 📡 **Azure IoT Hub** telemetry simulation with a real device sending data every 10 seconds
- 🗃️ **Azure SQL** as the live data source for all traffic metrics
- 📊 **Power BI Analytics** panel with inline interactive charts
- 🚨 **Incident Manager** with live road block/hazard reporting
- 🅿️ **Smart Parking** tracker
- 🚌 **Public Transit** bus dispatcher
- 🌿 **Pollution & AQI** tracker per city sector
- ☀️ **Weather Alert** selector with conditional driving advice

---

## 🔗 Live Demo

**[https://zealous-field-01dba2e10.7.azurestaticapps.net/](https://zealous-field-01dba2e10.7.azurestaticapps.net/)**

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Azure Static Web Apps                        │
│   ┌─────────────────────┐    ┌────────────────────────────┐    │
│   │   React Frontend    │    │  Azure Functions Backend   │    │
│   │   (Vite + TS)       │◄──►│  (Node.js + TypeScript)   │    │
│   └─────────────────────┘    └────────────┬───────────────┘    │
└──────────────────────────────────────────┼────────────────────┘
                                           │
              ┌────────────────────────────┼───────────────────┐
              │                            │                   │
       ┌──────▼──────┐            ┌────────▼──────┐    ┌──────▼──────┐
       │  Azure SQL  │            │  Azure Maps   │    │  Azure IoT  │
       │  Database   │            │  (REST + SDK) │    │    Hub      │
       └─────────────┘            └───────────────┘    └─────────────┘
              │
       ┌──────▼──────┐
       │  Power BI   │
       │  Analytics  │
       └─────────────┘
```

---

## ☁️ Azure Services

| Service | Purpose |
|---|---|
| **Azure Static Web Apps** | Hosts the React frontend + Azure Functions backend |
| **Azure SQL Database** | Stores all live traffic data, incidents, and predictions |
| **Azure Maps** | Interactive city map with traffic pins, incident markers, and routing |
| **Azure IoT Hub** | Receives real-time telemetry from the IoT device simulator |
| **Power BI** | Analytics charts embedded inline (ready for Power BI Service deployment) |

---

## 📁 Project Structure

```
projectaz/
├── index.html                          # Root HTML entry
├── vite.config.ts                      # Vite build config
├── package.json                        # Frontend dependencies
├── staticwebapp.config.json            # Azure SWA routing + CSP headers
├── tsconfig.json
│
├── src/
│   ├── main.tsx                        # React app entry point
│   ├── App.tsx                         # Root component & state orchestration
│   ├── index.css                       # Global dark-mode design system
│   │
│   ├── components/
│   │   ├── CityMap.tsx                 # Azure Maps Web SDK map panel
│   │   ├── EmergencyControl.tsx        # Emergency vehicle dispatch
│   │   ├── IncidentManager.tsx         # Road incident reporting
│   │   ├── PollutionTracker.tsx        # AQI / sector pollution monitor
│   │   ├── PowerBiAnalytics.tsx        # Power BI inline charts panel
│   │   ├── PredictiveAnalytics.tsx     # ML congestion forecasting
│   │   ├── PublicTransitTracker.tsx    # Live bus tracker & dispatcher
│   │   ├── SmartParking.tsx            # Parking availability manager
│   │   ├── TelemetryTable.tsx          # Live traffic telemetry table
│   │   └── WeatherAlertSelector.tsx    # Weather condition alerts
│   │
│   └── utils/
│       └── trafficEngine.ts            # Simulation engine & type definitions
│
└── api/
    ├── host.json                       # Azure Functions host config
    ├── local.settings.json             # Local dev environment variables
    ├── package.json                    # API dependencies
    │
    └── src/
        ├── database.ts                 # Azure SQL connection pool
        ├── iotSimulator.ts             # IoT Hub device simulator
        │
        └── functions/
            ├── incidents.ts            # GET /api/incidents
            ├── mapsKey.ts              # GET /api/mapsKey
            ├── predictTraffic.ts       # GET /api/predictTraffic
            └── trafficPrediction.ts    # GET /api/trafficPrediction
```

---

## 🖥️ Frontend Components

### `App.tsx` — Root Orchestrator
- Manages all global state: traffic data, incidents, vehicles, parking, weather, ML predictions
- Polls `/api/trafficPrediction` and `/api/predictTraffic` every **30 seconds**
- Passes live data down to all child components as props

### `CityMap.tsx` — Azure Maps Integration
- Loads **Azure Maps Web SDK** (`azure-maps-control`)
- Fetches map subscription key from `/api/mapsKey` at runtime (safe key delivery)
- Renders colored **HTML markers** for each traffic prediction location:
  - 🟢 Green: congestion < 40%
  - 🟠 Orange: congestion 40–70%
  - 🔴 Red: congestion > 70%
- Renders **red incident markers** from `/api/incidents`
- Clickable **popup overlays** showing road name, vehicle count, congestion, speed
- **Emergency route line** drawn using Azure Maps Directions API (with straight-line fallback)
- Refreshes markers every **30 seconds**

### `PredictiveAnalytics.tsx` — ML Forecasting
- Connects to `/api/predictTraffic` endpoint
- Displays all 8 ML prediction fields per road:
  - Road Name, Current & Predicted Vehicle Count
  - Current & Predicted Speed, Current & Predicted Congestion, Weather
- Shows loading spinner & error card on failure
- Polls every **30 seconds**

### `IncidentManager.tsx` — Incident Reporting
- Live view of all incidents from `/api/incidents`
- Allows reporting new road blocks/hazards
- Posts new incidents and auto-refreshes the list

### `TelemetryTable.tsx` — Live Traffic Telemetry
- Tabular view of real-time traffic data from `/api/trafficPrediction`
- Columns: Sensor ID, Roadway Name, Cars, Avg Speed, Congestion, Actions

### `PowerBiAnalytics.tsx` — Power BI Charts Panel
- Two-state panel: placeholder view → full embedded interactive charts
- Click **"Open Power BI Report"** to expand inline dashboard:
  - 📊 KPI cards (Avg Speed, Total Vehicles, Total Congestion)
  - 📈 Bar chart: Vehicle count per road
  - 📈 Bar chart: Average speed per road
  - 🥧 Donut chart: Congestion distribution by weather condition
  - 📉 Day chart: Total vehicle count by day
- Supports **weather filter** (Sunny / Rainy / Cloudy checkboxes)
- Driven by live `dbTraffic` state from Azure SQL (with mock fallback)
- **Azure deployment-ready**: set Power BI Embedded env variables to enable full embedding

### `EmergencyControl.tsx`
- Dispatches emergency vehicles on selected roads
- Triggers route rendering on the Azure Maps panel

### `WeatherAlertSelector.tsx`
- Selects current weather condition
- Displays AI-generated driving condition advice based on weather

### `PollutionTracker.tsx`
- Monitors AQI levels across city sectors
- Visual severity indicators (Good / Moderate / Hazardous)

### `PublicTransitTracker.tsx`
- Live bus position tracker on the city road network
- Dispatch bus button adds new bus to route

### `SmartParking.tsx`
- Displays parking lot availability across the city
- Reserve spot button updates live availability count

---

## 🔌 Backend API Endpoints

All endpoints are **Azure Functions (v4)** deployed alongside the SWA at `/api/*`.

| Endpoint | Method | Description |
|---|---|---|
| `/api/trafficPrediction` | GET | Returns live traffic rows from Azure SQL `TrafficData` table |
| `/api/predictTraffic` | GET | Returns ML-style predictions (current + predicted values per road) |
| `/api/incidents` | GET | Returns all road incidents from Azure SQL `Incidents` table |
| `/api/mapsKey` | GET | Returns `AZURE_MAPS_KEY` env variable to client (safe key delivery) |

### Sample Response: `/api/trafficPrediction`
```json
[
  {
    "road_name": "MG Road",
    "vehicle_count": 240,
    "average_speed": 38.5,
    "congestion_level": 65,
    "weather": "Sunny",
    "timestamp": "2026-07-10T06:08:51.330Z"
  }
]
```

### Sample Response: `/api/predictTraffic`
```json
[
  {
    "road_name": "City Center",
    "current_vehicle_count": 520,
    "predicted_vehicle_count": 572,
    "current_speed": 18.3,
    "predicted_speed": 17.4,
    "current_congestion": 98,
    "predicted_congestion": 100,
    "weather": "Rainy"
  }
]
```

### Sample Response: `/api/incidents`
```json
[
  {
    "id": 1,
    "location": "MG Road",
    "incident_type": "Accident",
    "severity": "High",
    "status": "Open",
    "timestamp": "2026-07-10T06:08:51.333Z"
  }
]
```

---

## 📡 IoT Simulator

The file `api/src/iotSimulator.ts` is a standalone Node.js script that simulates a physical traffic sensor device connected to Azure IoT Hub.

**Run it locally:**
```bash
cd api
npm run iot-sim
```

**Behavior:**
- Connects to Azure IoT Hub using the device connection string
- Sends random traffic telemetry every **10 seconds**:

```json
{
  "road_name": "MG Road",
  "vehicle_count": 245,
  "average_speed": 36.8,
  "congestion_level": 68,
  "weather": "Sunny",
  "timestamp": "2026-07-10T20:30:00Z"
}
```

**Expected terminal output:**
```
Connecting IoT Device Simulator to Azure IoT Hub...
✅ Connected successfully! Starting periodic data transmission...
📤 Sending telemetry: {"road_name":"Airport Road","vehicle_count":312,...}
⚡ Telemetry sent successfully!
```

---

## 🔐 Environment Variables

### Azure SWA Application Settings (Portal → Configuration)

| Variable | Description |
|---|---|
| `DB_SERVER` | Azure SQL server hostname (e.g. `trafficserverkavya2026.database.windows.net`) |
| `DB_NAME` | Database name (e.g. `trafficdb`) |
| `DB_USER` | SQL login username |
| `DB_PASSWORD` | SQL login password |
| `AZURE_MAPS_KEY` | Azure Maps subscription key |

### Local Dev: `api/local.settings.json`

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node",
    "DB_SERVER": "trafficserverkavya2026.database.windows.net",
    "DB_NAME": "trafficdb",
    "DB_USER": "trafficadmin",
    "DB_PASSWORD": "YOUR_DB_PASSWORD",
    "IOTHUB_DEVICE_CONNECTION_STRING": "HostName=YOUR_IOTHUB.azure-devices.net;DeviceId=YOUR_DEVICE;SharedAccessKey=YOUR_KEY"
  }
}
```

### Optional: Power BI Embedded (`.env` file)

```env
VITE_POWERBI_REPORT_URL=https://app.powerbi.com/...
VITE_POWERBI_WORKSPACE_ID=your-workspace-id
VITE_POWERBI_REPORT_ID=your-report-id
VITE_POWERBI_EMBED_URL=https://app.powerbi.com/reportEmbed?...
```

---

## 🛠️ Local Setup

### Prerequisites
- Node.js 18+
- Azure Functions Core Tools: `npm install -g azure-functions-core-tools@4`
- An Azure account with IoT Hub, SQL Database, Maps, and Static Web Apps configured

### 1. Clone the repository
```bash
git clone https://github.com/Kathyayanikavs/Smart-Traffic-Management-and-Optimization.git
cd Smart-Traffic-Management-and-Optimization
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Install API dependencies
```bash
cd api
npm install
cd ..
```

### 4. Configure local settings
Edit `api/local.settings.json` and fill in your Azure credentials (DB server, IoT Hub, Maps Key).

### 5. Start the frontend dev server
```bash
npm run dev
```

### 6. Start Azure Functions locally (separate terminal)
```bash
cd api
npx func start
```

### 7. (Optional) Run the IoT device simulator
```bash
cd api
npm run iot-sim
```

---

## 🚀 Deployment

This project deploys automatically via **GitHub Actions** to **Azure Static Web Apps**.

### Steps:
1. Push to the `main` branch on GitHub
2. GitHub Actions workflow builds the Vite frontend + packages Azure Functions
3. Azure SWA deployment completes in ~2 minutes

### Post-deployment: Configure Azure SWA Application Settings
In the Azure Portal → Your SWA → **Configuration** → **Application Settings**, add:
- `DB_SERVER`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `AZURE_MAPS_KEY`

> ⚠️ **Never commit secrets** to the repository. GitHub Push Protection is enabled and will block any push that contains connection strings or API keys.

---

## 📊 Power BI Integration

The Power BI Analytics panel follows a two-stage integration lifecycle:

### Stage 1 (Current): Inline Charts powered by Azure SQL
- KPI cards, bar charts, donut chart, and day chart rendered inline using live SQL data
- **"Open .PBIX File"** button launches your local `.pbix` report in Power BI Desktop

### Stage 2 (Future): Full Power BI Embedded
To enable iframe embedding inside the dashboard:
1. Publish your `.pbix` report to **Power BI Service**
2. Set the following environment variables in Azure SWA Application Settings:
   ```
   VITE_POWERBI_REPORT_URL
   VITE_POWERBI_WORKSPACE_ID
   VITE_POWERBI_REPORT_ID
   VITE_POWERBI_EMBED_URL
   ```
3. Install the Power BI client library:
   ```bash
   npm install powerbi-client-react powerbi-client
   ```
4. Replace the placeholder `<div>` in `PowerBiAnalytics.tsx` with `<PowerBIEmbed>` component (full blueprint already in the file's comments)

---

## 🛡️ Security Notes

- Azure Maps key is **never exposed** in the frontend bundle — it is fetched at runtime from `/api/mapsKey`
- Database credentials are stored only in **Azure SWA Application Settings** (server-side environment)
- IoT Hub connection strings are kept in `local.settings.json` locally and never pushed to GitHub
- **GitHub Push Protection** is enabled and automatically blocks any accidental secret commits

---

## 📄 License

MIT © Kathyayanika VS — Smart City Traffic Management and Optimization

---

*Built with ❤️ using React, TypeScript, Azure Static Web Apps, Azure SQL, Azure Maps, Azure IoT Hub, and Power BI*
