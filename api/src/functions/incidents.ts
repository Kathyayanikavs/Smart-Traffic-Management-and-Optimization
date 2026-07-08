import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

interface RoadIncident {
    id: string;
    roadId: string;
    type: string;
    severity: 'low' | 'medium' | 'high';
    reportedAt: string;
    description: string;
}

let activeIncidents: RoadIncident[] = [
    {
        id: "inc_01",
        roadId: "R_J4_J5",
        type: "accident",
        severity: "high",
        reportedAt: new Date(Date.now() - 3600000).toISOString(),
        description: "Fender bender blocking right lane"
    }
];

export async function handleIncidents(request: HttpRequest, context: InvocationContext): Promise<HttpResponseInit> {
    context.log(`Incidents HTTP trigger processed request for ${request.method}`);

    if (request.method === 'GET') {
        return {
            status: 200,
            headers: { 
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            jsonBody: { success: true, incidents: activeIncidents }
        };
    }

    if (request.method === 'POST') {
        try {
            const body = await request.json() as any;
            if (!body.roadId || !body.type) {
                return {
                    status: 400,
                    jsonBody: { success: false, error: "Missing required parameters: roadId, type" }
                };
            }

            // Check if clearing
            const existingIndex = activeIncidents.findIndex(inc => inc.roadId === body.roadId);
            if (existingIndex !== -1 && body.clear === true) {
                activeIncidents.splice(existingIndex, 1);
                return {
                    status: 200,
                    jsonBody: { success: true, message: "Incident cleared successfully", incidents: activeIncidents }
                };
            }

            const newIncident: RoadIncident = {
                id: `inc_${Math.random().toString(36).substring(2, 9)}`,
                roadId: body.roadId,
                type: body.type,
                severity: body.severity || 'medium',
                reportedAt: new Date().toISOString(),
                description: body.description || "Active road incident reported"
            };

            if (existingIndex === -1) {
                activeIncidents.push(newIncident);
            }

            return {
                status: 201,
                jsonBody: { success: true, incident: newIncident, incidents: activeIncidents }
            };
        } catch (err: any) {
            return {
                status: 500,
                jsonBody: { success: false, error: err.message }
            };
        }
    }

    return { status: 405, jsonBody: { success: false, error: "Method not allowed" } };
}

app.http('incidents', {
    methods: ['GET', 'POST'],
    authLevel: 'anonymous',
    handler: handleIncidents
});
