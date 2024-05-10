import { readFileSync } from "fs";
import { requireEnv } from "./helper";
import { DatabaseService } from "@svector/client";
import Bottleneck from "bottleneck";
import { gunzipSync } from "zlib";

const ENDPOINT_URL = process.env.ENDPOINT_URL ?? "https://us-east-2.api.svectordb.com"
const DATABASE_ID = requireEnv("DATABASE_ID");
const API_KEY = requireEnv("API_KEY");

const database = new DatabaseService({
    endpoint: ENDPOINT_URL,
    apiKey: API_KEY,
});

const limiter = new Bottleneck({
    reservoir: 100,
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 1000,
    maxConcurrent: 100,
    minTime: 10,
});

gunzipSync(readFileSync('./data/embedded.jsonl.gz'))
    .toString('utf8')
    .split('\n')
    .map(x => JSON.parse(x))
    .map(x => limiter.schedule(() => database.setItem({
        databaseId: DATABASE_ID,
        key: x.key,
        value: Buffer.from(x.value),
        vector: x.vector,
    })))

const interval = setInterval(async () => {
    console.log(new Date())
    console.log({
        ...limiter.counts(),
        DONE: await limiter.done()
    });
    
    if (limiter.empty()) {
        clearInterval(interval);
    }
}, 1000);