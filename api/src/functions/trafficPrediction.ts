import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getConnection } from "../database";

export async function trafficPrediction(
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
                weather,
                timestamp
            FROM TrafficData
            ORDER BY timestamp DESC
        `);

        return {
            status: 200,
            jsonBody: result.recordset
        };

    } catch (err: any) {

        return {
            status: 500,
            jsonBody: {
                error: err.message
            }
        };
    }
}

app.http("trafficPrediction", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: trafficPrediction
});
