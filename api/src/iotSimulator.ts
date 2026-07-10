import { Mqtt } from 'azure-iot-device-mqtt';
import { Client, Message } from 'azure-iot-device';

import * as fs from 'fs';
import * as path from 'path';

let connectionString: string = process.env.IOTHUB_DEVICE_CONNECTION_STRING || "";

if (!connectionString) {
  try {
    const settingsPath = path.resolve(__dirname, '../../local.settings.json');
    if (fs.existsSync(settingsPath)) {
      const rawSettings = fs.readFileSync(settingsPath, 'utf-8');
      const settings = JSON.parse(rawSettings);
      if (settings.Values && settings.Values.IOTHUB_DEVICE_CONNECTION_STRING) {
        connectionString = settings.Values.IOTHUB_DEVICE_CONNECTION_STRING;
      }
    }
  } catch (err) {
    // Ignore error and fall back
  }
}

if (!connectionString) {
  connectionString = "HostName=YOUR_IOTHUB_NAME.azure-devices.net;DeviceId=YOUR_DEVICE_ID;SharedAccessKey=YOUR_KEY";
}

const roads = [
  "MG Road",
  "Avenue A",
  "Avenue B",
  "Expressway",
  "Junction Road",
  "Broadway",
  "Market Street",
  "High Street",
  "Station Road"
];

const weatherTypes = ["Sunny", "Rainy", "Snowy", "Overcast"];

function generateTelemetry() {
  const road = roads[Math.floor(Math.random() * roads.length)];
  const vehicleCount = Math.floor(Math.random() * 260) + 15;
  const speed = parseFloat((25 + Math.random() * 55).toFixed(1));
  const congestion = Math.min(100, Math.max(5, Math.round((vehicleCount / 300) * 100)));
  const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
  
  return {
    road_name: road,
    vehicle_count: vehicleCount,
    average_speed: speed,
    congestion_level: congestion,
    weather: weather,
    timestamp: new Date().toISOString()
  };
}

async function startSimulator() {
  console.log("Connecting IoT Device Simulator to Azure IoT Hub...");
  
  if (connectionString.includes("YOUR_IOTHUB_NAME")) {
    console.warn("⚠️ Warning: IOTHUB_DEVICE_CONNECTION_STRING is currently using placeholder values.");
    console.warn("Please configure the actual device connection string in environment variables or your local config to stream live telemetry.");
    process.exit(1);
  }

  const client = Client.fromConnectionString(connectionString, Mqtt);

  client.open((err) => {
    if (err) {
      console.error("❌ Could not connect to IoT Hub:", err.message);
      return;
    }
    console.log("✅ Connected successfully! Starting periodic data transmission...");

    setInterval(() => {
      const telemetry = generateTelemetry();
      const message = new Message(JSON.stringify(telemetry));
      
      console.log("📤 Sending telemetry:", JSON.stringify(telemetry));
      
      client.sendEvent(message, (sendErr) => {
        if (sendErr) {
          console.error("❌ Failed to send telemetry message:", sendErr.toString());
        } else {
          console.log("⚡ Telemetry sent successfully!");
        }
      });
    }, 10000);
  });
}

startSimulator();
