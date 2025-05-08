import express, { Express, Request, Response } from "express";
import { ArticleData, extract } from "@extractus/article-extractor";
import { load } from "cheerio";
import dotenv from "dotenv";
import type { NewsDay, ArticleUrls, SummarizedArticles, ErrorResponse, NewsCategoryParam, NewsSummariesRecord} from "./types.js";
import { addSummaries, closeDB, getSummaries, recExists, startDB } from "./database.js";
import dayjs, { Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc.js";

import timezone from "dayjs/plugin/timezone";;
import cors from "cors";

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);
const app: Express = express();
const PORT: number = parseInt(process.env.PORT as string);

app.use(express.json());
app.use(cors({
    origin: `${process.env.FRONTEND_URL}`,
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
}));

startDB();

app.post("/news-summaries/:category", async (req: Request<NewsCategoryParam, SummarizedArticles | ErrorResponse, NewsDay, null>, res: Response) => {
    const { day, numNews }: NewsDay = req.body;
    const category: string= req.params.category.slice(1);
    if (!day || !numNews || !category) {
        res.status(400).json({ error: "Day(as a dayjs object) and numNews fields should exists in the request body" });
        return;
    }
    const dayjsDay: Dayjs = dayjs(day);

    const urls: ArticleUrls = [];


    const summariesExist = await recExists(dayjsDay, category, numNews);
    if (summariesExist) {
        const newsRecord: NewsSummariesRecord | undefined = await getSummaries(dayjsDay, category, numNews);
        const summaries = newsRecord?.summaries;
        const urls = newsRecord?.urls;
        res.json({ 
            summarizedArticles: summaries,
            urls 
        });
        return;
    }
    try {
        const utcStartDate = dayjsDay.startOf("day").utc().format("YYYY-MM-DDThh:mm:ss") + "Z";
        const utcEndDate = dayjsDay.isBefore(dayjs(), "day") ? dayjsDay.endOf("day").utc().format("YYYY-MM-DDThh:mm:ss") + "Z": dayjs().utc().format("YYYY-MM-DDThh:mm:ss") + "Z";

        // console.log(utcStartDate);
        // console.log(utcEndDate);

        const response = await fetch(`https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=in&max=${numNews}&from=${utcStartDate}&to=${utcEndDate}&apikey=${process.env.GNEWS_API_KEY}`);
        const jsonResponse = await response.json();
        const articles = jsonResponse.articles;
        for (const article of articles) {
            if (article && article.url){
               urls.push(article.url);
            }else{
                console.log("skipped a url");
            }
        }

    }catch (error) {

        if (error instanceof Error){
            console.error("Failed to fetch the articles ", error.message);
        }else {
            console.error("Failed to fetch the articles ", error);
        }

        res.status(500).json({ error: "Failed to fetch the articles" });
        return;
    }


    const articles: string[] = [];
    try {
        const articlesDataPromises: Promise<ArticleData | null>[] = [];
        for (const url of urls) {
            const articleDataPromise: Promise<ArticleData | null> = extract(url);
            articlesDataPromises.push(articleDataPromise);
        }
        const articlesData: (ArticleData | null)[] = await Promise.all(articlesDataPromises);
        articlesData.filter((articleData) => articleData !== null);
        for (const articleData of articlesData) {
            if (articleData && articleData.content) {
                const $ = load(articleData.content);
                const text = $.text();
                articles.push(text);
            }else {
                continue;
            }
        }
        
    }catch (error) {
        if (error instanceof Error){
            console.error("Failed to extract the article ", error.message);
        }else {
            console.error("Failed to extract the article ", error);
        }

        res.status(500).json({ error: "Failed to extract the article " });
    }

    const summarizedArticles: string[] = [];
    try {
        const geminiPromises: Promise<globalThis.Response>[] = [];

        for (const article of articles){
            const response = fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GOOGLE_API_KEY}`,{
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {text: "Only Summarize the following news article in few concise bullet points(bullet list format) and highlight the main thing at the beggining of the point, give it only 1 concise heading(level 3 heading), your response should contain nothing else: " + article}
                            ]
                        }
                    ]
                })
            });
            // console.dir(jsonResponse, { depth: null });
            geminiPromises.push(response);
        }

        const geminiResponses: globalThis.Response[] = await Promise.all(geminiPromises);
        const geminiResponsesJson = await Promise.all(geminiResponses.map((response) => response.json()));
        for (const geminiJson of geminiResponsesJson){
            const summarizedArticle = geminiJson?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (summarizedArticle) {
                summarizedArticles.push(summarizedArticle);
            }
        }

        if (!dayjsDay.isSame(dayjs(), "day")){
            await addSummaries(dayjsDay, summarizedArticles, urls, category, numNews);
        }
        res.json({ summarizedArticles, urls });
    }catch(error) {
        if (error instanceof Error){
            console.error("Failed to summarize the article ", error.message);
        }else {
            console.error("Failed to summarize the article ", error);
        }

        res.status(500).json({ error: "Failed to summarize the article " });
    }
});

const server = app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});

const shutdown = async () => {
    console.log("Shutting down the server...");
    server.close(async () => {
        console.log("The server has been closed");
        await closeDB();
        process.exit(0);
    });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);