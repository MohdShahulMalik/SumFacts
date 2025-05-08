import { startDB, closeDB, addSummaries, getSummaries, recExists } from "../src/database.js";
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
    
    it("should add summaries to the database, retrieve them and check for their existence", async () => {
        const day = dayjs("2004-07-17");
        const summaries = ["Maxum was born", "Congress won the elections"];
        const category = "general";
        const urls = ["url1", "url2"];
        const numNews = 5;

        const result: NewsSummariesRecord = await addSummaries(day, summaries, urls, category, numNews);

        expect(result.id).toEqual(new RecordId(`summaries-${category}`, `${day.format("YYYY-MM-DD")}-${numNews}`));
        expect(result.summaries).toEqual(summaries);
        expect(result.urls).toEqual(urls);
    
        

        const result2: NewsSummariesRecord = await getSummaries(day, category, numNews);

        expect(result2.id).toEqual(new RecordId(`summaries-${category}`, `${day.format("YYYY-MM-DD")}-${numNews}`));
        expect(result2.summaries).toEqual(summaries);
        expect(result2.urls).toEqual(urls);
    

        const result3: boolean = await recExists(day, category, numNews);
        expect(result3).toBeTrue();
    });
});