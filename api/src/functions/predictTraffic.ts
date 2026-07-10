import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getConnection } from "../database";

export async function predictTraffic(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {

    try {

        const pool = await getConnection();

        const result = await pool.request().query(`
            SELECT
                road_name,
                vehicle_count,
                average_speed,
                congestion_level,
                weather
            FROM TrafficData
        `);

        const predictions = result.recordset.map((road: any) => {

            const predictedVehicleCount =
                Math.round(road.vehicle_count * 1.10);

            const predictedAverageSpeed =
                Number((road.average_speed * 0.95).toFixed(1));

            const predictedCongestion =
                Math.min(
                    100,
                    Math.round(road.congestion_level * 1.08)
                );

            return {

                road_name: road.road_name,

                current_vehicle_count: road.vehicle_count,

                predicted_vehicle_count: predictedVehicleCount,

                current_speed: road.average_speed,

                predicted_speed: predictedAverageSpeed,

                current_congestion: road.congestion_level,

                predicted_congestion: predictedCongestion,

                weather: road.weather
            };

        });

        return {

            status: 200,

            jsonBody: predictions

        };

    }
    catch (err: any) {

        return {

            status: 500,

            jsonBody: {

                error: err.message

            }

        };

    }

}

app.http("predictTraffic", {

    methods: ["GET"],

    authLevel: "anonymous",

    handler: predictTraffic

});
