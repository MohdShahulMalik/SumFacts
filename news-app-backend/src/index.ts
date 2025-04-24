import express, { Express, Request, Response } from "express";
import { ArticleData, extract } from "@extractus/article-extractor";
import { load } from "cheerio";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();
const app: Express = express();
const PORT: number = parseInt(process.env.PORT as string);

app.use(express.json());

type ArticleUrls = {
    urls: string[];
};

type SummarizedArticles = {
    summarizedArticles: string[];
};

type ErrorResponse = {
    error: string;
    
};

type Claim = {
    claim: string;
};

type Assessment = {
    assement: string;
};

app.post("/summarize", async (req: Request<null, SummarizedArticles | ErrorResponse, ArticleUrls, null>, res: Response) => {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        res.status(400).json({ error: "Invalid body" });
        return;
    }

    const articlesContent: string[] = [];
    const summarizedArticles: string[] = [];
    try {
        for (const url of urls) {
            const article: ArticleData | null = await extract(url);
            
            if (!article) {
                continue;
            }
            const $ = await load(article.content ?? "");
            const content = $.text();
            if (content){
                articlesContent.push(content);
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

    try {
        for (const article of articlesContent){
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${process.env.GOOGLE_API_KEY}`,{
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
            
            const jsonResponse = await response.json();
            // console.dir(jsonResponse, { depth: null });
            const summarizedArticle = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
            summarizedArticles.push(summarizedArticle);
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

app.get("/fact-check", async (req: Request<null, Assessment | ErrorResponse, null, Claim>, res: Response) => {
    const { claim } = req.query;
    if (!claim) {
        res.status(400).json({ error: "Must provide a 'claim' query to fact check"});
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY2 });
        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                `assess the truthfulness of this claim(true or flase): "${claim}"`,
            ],
            config: {
                tools: [
                    {
                        googleSearch: {}
                    }
                ],
            },
        });
    
        res.json({ assessment: response.text });
    }catch(error) {
        if (error instanceof Error){
            console.error("Failed to fact-check the claim,", error.message);
        }else {
            console.error("Failed to fact-check the claim,", error);
        }

        res.status(500).json({ error: "Failed to fact-check the claim" });
    }
});

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}`);
});