import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getConnection } from "../database";

export async function trafficPrediction(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // Fallback predictions in case database query fails or is empty
    const fallbackPredictions = [
        { hour: '00:00', load: 15, delayMinutes: 2 },
        { hour: '02:00', load: 10, delayMinutes: 1 },
        { hour: '04:00', load: 12, delayMinutes: 1 },
        { hour: '06:00', load: 38, delayMinutes: 4 },
        { hour: '08:00', load: 85, delayMinutes: 18 },
        { hour: '10:00', load: 58, delayMinutes: 8 },
        { hour: '12:00', load: 68, delayMinutes: 11 },
        { hour: '14:00', load: 54, delayMinutes: 7 },
        { hour: '16:00', load: 75, delayMinutes: 14 },
        { hour: '18:00', load: 82, delayMinutes: 16 },
        { hour: '20:00', load: 50, delayMinutes: 9 },
        { hour: '22:00', load: 22, delayMinutes: 3 }
    ];

    let predictions = fallbackPredictions;
    let isRealData = false;
    let dbErrorMessage = "";

    try {
        const pool = await getConnection();
        const result = await pool.request().query("SELECT * FROM TrafficData;");
        if (result.recordset && result.recordset.length > 0) {
            predictions = result.recordset.map(row => ({
                hour: row.hour || row.Hour,
                load: Number(row.load || row.Load || row.trafficLoad || 0),
                delayMinutes: Number(row.delayMinutes || row.DelayMinutes || row.delay || 0)
            }));
            isRealData = true;
            context.log("Successfully retrieved traffic forecasting data from Azure SQL Database.");
        } else {
            context.log("TrafficData table query succeeded but returned 0 records. Using local mock predictions.");
        }
    } catch (err: any) {
        dbErrorMessage = err.message;
        context.warn("Could not query Azure SQL Database. Details: ", err.message);
        context.log("Gracefully falling back to hardcoded predictions.");
    }

    return {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        jsonBody: {
            success: true,
            model: "Azure ML Random Forest Regressor V2",
            databaseConnected: isRealData,
            dbError: dbErrorMessage || null,
            timestamp: new Date().toISOString(),
            data: predictions
        }
    };
}

app.http('trafficPrediction', {
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: trafficPrediction
});
