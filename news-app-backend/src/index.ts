import express, { Express, Request, Response } from "express";
import { ArticleData, extract } from "@extractus/article-extractor";
import { load } from "cheerio";
import dotenv from "dotenv";
import type { NewsDay, ArticleUrls, SummarizedArticles, ErrorResponse} from "./types.js";
import { startDatabase } from "./database.js";

dotenv.config();
const app: Express = express();
const PORT: number = parseInt(process.env.PORT as string);

app.use(express.json());
startDatabase();

app.post("/news-summaries", async (req: Request<null, SummarizedArticles | ErrorResponse, NewsDay, null>, res: Response) => {
    const { day, numNews }: NewsDay = req.body;
    if (!day || !numNews) {
        res.status(400).json({ error: "Day(as a dayjs object) and numNews fields should exists in the request body" });
        return;
    }

    if (numNews !== 10 && numNews !== 5){
        res.status(400).json({ error: "numNews should be 5 or 10" });
        return;
    }

    const urls: ArticleUrls = [];

    if (numNews === 10){
        try {

            const response = await fetch(`https://gnews.io/api/v4/top-headlines?category=general&lang=en&country=in&max=10&apikey=${process.env.GNEWS_API_KEY}`);
            const jsonResponse = await response.json();
            const articles = jsonResponse.articles;
            for (const article of articles) {
                urls.push(article.url);
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
    }else {
        try {

            const response = await fetch(`https://gnews.io/api/v4/top-headlines?category=general&lang=en&country=in&max=5&apikey=${process.env.GNEWS_API_KEY}`);
            const jsonResponse = await response.json();
            const articles = jsonResponse.articles;
            for (const article of articles) {
                urls.push(article.url);
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
                                {text: "Just summarize the following news article in few concise bullet points and highlight the main thing at the beggining of the point, give it a concise heading also, your response should contain nothing else: " + article}
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

        res.json({ summarizedArticles });
    }catch(error) {
        if (error instanceof Error){
            console.error("Failed to summarize the article ", error.message);
        }else {
            console.error("Failed to summarize the article ", error);
        }

        res.status(500).json({ error: "Failed to summarize the article " });
    }
});

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});