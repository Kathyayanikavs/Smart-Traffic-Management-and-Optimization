import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";

export async function mapsKey(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {
    try {
        const key = process.env.AZURE_MAPS_KEY || "YOUR_AZURE_MAPS_SUBSCRIPTION_KEY";
        return {
            status: 200,
            jsonBody: { key }
        };
    } catch (err: any) {
        return {
            status: 500,
            jsonBody: { error: err.message }
        };
    }
}

app.http("mapsKey", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: mapsKey
});
