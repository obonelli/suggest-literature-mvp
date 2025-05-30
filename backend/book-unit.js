/**
 * Lambda que reserva una unidad y la persiste en DynamoDB.
 */
const { DynamoDBClient, PutItemCommand } = require("@aws-sdk/client-dynamodb");
const db = new DynamoDBClient({});

exports.handler = async (event) => {
    /* CORS pre-flight */
    if (event.requestContext?.http?.method === "OPTIONS") {
        return { statusCode: 204, headers: corsHeaders(), body: "" };
    }

    /* Parseo */
    let body;
    try {
        body = JSON.parse(event.body || "{}");
    } catch {
        return resp(400, { error: "Invalid JSON body" });
    }

    const { width, height, depth, price } = body;
    if (!width || !height || !depth || !price) {
        return resp(400, { error: "Missing fields" });
    }

    /* Guardar */
    const bookingId = `bk_${Date.now().toString(36)}`;
    const timestamp = new Date().toISOString();

    await db.send(
        new PutItemCommand({
            TableName: process.env.TABLE_NAME,
            Item: {
                bookingId: { S: bookingId },
                createdAt: { S: timestamp },
                width: { N: String(width) },
                height: { N: String(height) },
                depth: { N: String(depth) },
                price: { N: String(price) }
            }
        })
    );

    return resp(201, { bookingId, timestamp });
};

/* helpers */
const corsHeaders = () => ({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST,OPTIONS"
});

const resp = (statusCode, body) => ({
    statusCode,
    headers: corsHeaders(),
    body: JSON.stringify(body)
});
