import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function trafficPrediction(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Http function processed request for url "${request.url}"`);

    // Simulated Azure ML traffic prediction results
    const predictions = [
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

    return {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        jsonBody: {
            success: true,
            model: "Azure ML Random Forest Regressor V2",
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
