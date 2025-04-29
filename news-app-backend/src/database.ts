import { Surreal, RecordId } from "surrealdb";
import { surrealdbNodeEngines } from "@surrealdb/node";
import dotenv from "dotenv";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc.js";

dotenv.config();
dayjs.extend(utc);

const db = new Surreal({
    engines: surrealdbNodeEngines(),
});

export async function startDatabase(){
    try{
        await db.connect(process.env.SURREAL_URL!);
        await db.signin({
            username: process.env.SURREAL_USER!,
            password: process.env.SURREAL_PASSWORD!,
        });
        
        await db.use({
            namespace: process.env.SURREAL_NS!,
            database: process.env.SURREAL_DB!
        });
    }catch(error){
        console.error("Failed to connect to surrealdb: ", error instanceof Error ? error.message : error);
        db.close();
    }
}

export async function addSummaries(day: Dayjs, summaries: string[]) {
    
}