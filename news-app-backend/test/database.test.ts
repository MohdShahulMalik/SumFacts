import { startDB, closeDB, addSummaries, getSummaries } from "../src/database.js";
import dayjs from "dayjs";
import { NewsSummariesRecord } from "../src/types.js";
import { RecordId } from "surrealdb";

describe("Database Operations", () => {
    beforeEach(async () => {
        await startDB();
    });
    
    afterEach(async () => {
        await closeDB();
    });
    
    it("should add summaries to the database", async () => {
        const day = dayjs("2004-07-17");
        const summaries = ["Maxum was born", "Congress won the elections"];

        const result: NewsSummariesRecord = await addSummaries(day, summaries);

        expect(result.id).toEqual(new RecordId("summaries", day.format("YYYY-MM-DD")));
        expect(result.summaries).toEqual(summaries);
    });

    it("should retrieve summaries from a database", async () => {
        const day = dayjs("2004-07-17");
        const summaries = ["Maxum was born", "Congress won the elections"];

        const result: NewsSummariesRecord = await getSummaries(day);

        expect(result.id).toEqual(new RecordId("summaries", day.format("YYYY-MM-DD")));
        expect(result.summaries).toEqual(summaries);
    });
});