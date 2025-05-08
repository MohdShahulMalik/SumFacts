import dayjs from "dayjs";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 100000; // Set the default timeout to 10 seconds

describe("API Endpoint Tests", () => {
    it("Should ping with status 200 and return a valid response", async () => {
        const response = await fetch("http://localhost:5000/news-summaries/:health", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                day: dayjs().toISOString(),
                numNews: 5
            }),
        });

        expect(response.status).toBe(200);
    
        const data =  await response.json();
        console.log(data);          //this was for testing purposes only(yeah I know, a test inside a test, how amazing😅)

        expect(data).toBeDefined();
        expect(data).toEqual(jasmine.any(Object));
        expect("summarizedArticles" in data).toBeTrue();
        expect("urls" in data).toBeTrue();
        expect(data.summarizedArticles).toEqual(jasmine.any(Array));
        expect(data.summarizedArticles.length).toBe(5);

        const allStrings = data.summarizedArticles.every((item: string): item is string => typeof item === "string");
        expect(allStrings).toBeTrue();
    });
});
