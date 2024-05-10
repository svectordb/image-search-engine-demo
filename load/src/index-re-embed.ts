import { readFileSync } from "fs";
import { requireEnv } from "./helper";
import { DatabaseService, EmbeddingModel } from "@svector/client";
import Papa from "papaparse";
import Bottleneck from "bottleneck";

const ENDPOINT_URL = process.env.ENDPOINT_URL ?? "https://us-east-2.api.svectordb.com"
const DATABASE_ID = requireEnv("DATABASE_ID");
const API_KEY = requireEnv("API_KEY");

const database = new DatabaseService({
    endpoint: ENDPOINT_URL,
    apiKey: API_KEY,
});

const data = Papa
    .parse(readFileSync("./data/raw.csv", "utf-8"), {header: true, skipEmptyLines: true})
    .data as {path: string, tooltip: string, link: string}[];

const limiter = new Bottleneck({
    reservoir: 100,
    reservoirRefreshAmount: 100,
    reservoirRefreshInterval: 1000,
    maxConcurrent: 100,
    minTime: 10
});

const pendingPromises = data
    .map(x => limiter.schedule(() => insert(database, x.path, x.tooltip, x.link)));

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

async function insert(client: DatabaseService, path: string, tooltip: string, link: string) {
    const value = Buffer.from(JSON.stringify({
        title: tooltip,
        imageUrl: path,
        url: link,
    }));

    if (value.length > 1000) return; // Value max size is 1KB

    const image = await (await fetch(path)).arrayBuffer();

    const embedding = await client.embed({
        databaseId: DATABASE_ID,
        model: EmbeddingModel.CLIP_VIT_BASE_PATH32,
        input: {
            image: Buffer.from(image),
        },
    });

    const vector = embedding.vector;

    await client.setItem({
        databaseId: DATABASE_ID,
        key: link,
        vector,
        value,
    });
}