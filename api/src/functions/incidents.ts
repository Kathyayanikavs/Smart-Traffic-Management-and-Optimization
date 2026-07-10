import { app, HttpRequest, HttpResponseInit, InvocationContext } from "@azure/functions";
import { getConnection } from "../database";

export async function incidents(
    request: HttpRequest,
    context: InvocationContext
): Promise<HttpResponseInit> {

    try {

        const pool = await getConnection();

        const result = await pool.request().query(`
            SELECT *
            FROM Incidents
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

app.http("incidents", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: incidents
});
