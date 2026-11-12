import { Surreal, RecordId, createRemoteEngines, NotFoundError } from "surrealdb";
import { createNodeEngines } from "@surrealdb/node";
import dotenv from "dotenv";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { NewsSummaries, NewsSummariesRecord } from "./types.js";

dotenv.config();
dayjs.extend(utc);

const db = new Surreal({
    engines: { ...createRemoteEngines(), ...createNodeEngines() },
});

export async function startDB(): Promise<boolean>{
    try{
        await db.connect(process.env.SURREAL_URL!);
        await db.signin({
            username: process.env.SURREAL_USER!,
            password: process.env.SURREAL_PASS!,
        });

        await db.use({
            namespace: process.env.SURREAL_NS!,
            database: process.env.SURREAL_DB!
        });

        console.log("Connection to surrealdb has been successfully established!");
        return true;
    }catch(error){
        console.error("Failed to connect to surrealdb: ", error instanceof Error ? error.message : error);
        db.close();
        return false;
    }
}

// The database might be slower to start than the app (typical when both run
// from the same compose project), so retry for a bounded amount of time instead
// of giving up on the first attempt. Bubbles the failure up to the caller so
// the process can exit instead of serving traffic without a database.
export async function connectWithRetry(
    attempts = 10,
    delayMs = 5000,
): Promise<void> {
    for (let attempt = 1; attempt <= attempts; attempt++) {
        if (await startDB()) {
            return;
        }
        if (attempt < attempts) {
            console.log(`Retrying to connect to surrealdb in ${delayMs}ms (attempt ${attempt}/${attempts})`);
            await new Promise((resolve) => setTimeout(resolve, delayMs));
        }
    }
    throw new Error("SurrealDB is unreachable");
}

export async function closeDB(){
    try {
        await db.close();
        console.log("The connection with the surrealdb has been closed successfully!");
    }catch (error){
        console.error("Failed to close the database connection: ", error instanceof Error ? error.message: error);
    }
}

export async function addSummaries(day: Dayjs, summaries: string[], urls: string[], category: string, numNews: number): Promise<NewsSummariesRecord | undefined> {
    const recordId = new RecordId(`summaries-${category}`, `${day.format("YYYY-MM-DD")}-${numNews}`);
    try{
       const rec = await db
            .create<NewsSummaries>(recordId)
            .content({ summaries, urls });

        return rec;
    }catch(error){
        console.error("Failed to add summaries to the database: ", error instanceof Error ? error.message : error);
    }

}

export async function getSummaries(day: Dayjs, category: string, numNews: number): Promise<NewsSummariesRecord | undefined> {
    const recordId = new RecordId(`summaries-${category}`, `${day.format("YYYY-MM-DD")}-${numNews}`);
    try{
        const record = await db.select<NewsSummaries>(recordId);
        return record;
    }catch(error){
        if (error instanceof NotFoundError) {
            return undefined;
        }
        console.error("Failed to fetch the record from  the database: ", error instanceof Error ? error.message : error);
    }
}

export async function recExists(day: Dayjs, category: string, numNews: number): Promise<boolean>{
    const recId = new RecordId(`summaries-${category}`, `${day.format("YYYY-MM-DD")}-${numNews}`);

    try {
        await db.select<NewsSummaries>(recId);
        return true;
    }catch(error){
        if (error instanceof NotFoundError) {
            // SDK v2 throws instead of returning undefined when a table or
            // record has never been written; that simply means a cache miss.
            return false;
        }
        throw error;
    }
}
