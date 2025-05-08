import { Surreal, RecordId } from "surrealdb";
import { surrealdbNodeEngines } from "@surrealdb/node";
import dotenv from "dotenv";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc.js";
import { NewsSummaries } from "./types.js";

dotenv.config();
dayjs.extend(utc);

const db = new Surreal({
    engines: surrealdbNodeEngines(),
    // engines: {                                     //this engine is for testing purposes only
    //     kv: new Memory(),
    //     sql: new Memory(),
    // }
});

export async function startDB(){
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
    }catch(error){
        console.error("Failed to connect to surrealdb: ", error instanceof Error ? error.message : error);
        db.close();
    }
}

export async function closeDB(){
    try {
        await db.close();
        console.log("The connection with the surrealdb has been closed successfully!");
    }catch (error){
        console.error("Failed to close the database connection: ", error instanceof Error ? error.message: error);
    }
}

export async function addSummaries(day: Dayjs, summaries: string[], urls: string[], category: string, numNews: number) {
    const recordId = new RecordId(`summaries-${category}`, `${day.format("YYYY-MM-DD")}-${numNews}`);
    try{
        await db.create<NewsSummaries>(recordId, {
            summaries,
            urls
        });
    }catch(error){
        console.error("Failed to add summaries to the database: ", error instanceof Error ? error.message : error);
    }

    return;
}

export async function getSummaries(day: Dayjs, category: string, numNews: number) {
    const recordId = new RecordId(`summaries-${category}`, `${day.format("YYYY-MM-DD")}-${numNews}`);
    try{
        const record = await db.select<NewsSummaries>(recordId);
        return record;
    }catch(error){
        console.error("Failed to fetch the record from  the database: ", error instanceof Error ? error.message : error);
    }
}

export async function recExists(day: Dayjs, category: string, numNews: number): Promise<boolean>{
    const recId = new RecordId(`summaries-${category}`, `${day.format("YYYY-MM-DD")}-${numNews}`);
    
    const record = await db.select<NewsSummaries>(recId);

    if (record){
        return true;
    }

    return false;
}