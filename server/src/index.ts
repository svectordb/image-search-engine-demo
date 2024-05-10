import { APIGatewayProxyEventV2, Context } from "aws-lambda";
import { getLogger, requireEnv } from "./helper";
import { Logger } from "pino";
import { DatabaseService, EmbeddingModel } from "@svector/client";

const ENDPOINT_URL = process.env.ENDPOINT_URL ?? "https://us-east-2.api.svectordb.com"
const DATABASE_ID = requireEnv("DATABASE_ID");
const API_KEY = requireEnv("API_KEY");

const database = new DatabaseService({
    endpoint: ENDPOINT_URL,
    apiKey: API_KEY,
});

export async function handler(event: APIGatewayProxyEventV2, context: Context) {
    const logger = getLogger(context);

    try {
        logger.info({ event }, "Received request");

        const searchQuery = event.queryStringParameters?.searchQuery;

        if (!searchQuery) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Missing searchQuery parameter" }),
            };
        }

        logger.info({ searchQuery }, "Searching for query");
        const startTime = performance.now();

        const result = await main(logger, searchQuery);

        const endTime = performance.now();
        logger.info({ duration: endTime - startTime }, "Request completed");

        return {
            statusCode: 200,
            isBase64Encoded: false,
            body: JSON.stringify(result),
        }
    } catch (e) {
        logger.error(e);

        return {
            statusCode: 500,
            isBase64Encoded: false,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
}

async function main(logger: Logger, searchQuery: string) {
    const embeddedQuery = await database.embed({
        model: EmbeddingModel.CLIP_VIT_BASE_PATH32,
        databaseId: DATABASE_ID,
        input: {
            text: searchQuery,
        },
    });

    const searchResults = await database.query({
        databaseId: DATABASE_ID,
        query: {
            vector: embeddedQuery.vector!,
        },
        maxResults: 16,
    });

    const results = (searchResults.results ?? [])
        .map(x => ({
            key: x.key,
            score: x.distance,
            ...JSON.parse(Buffer.from(x.value!).toString('utf8'))
        }));

    logger.info({ results }, `Found ${results.length} results`);

    return results;
}