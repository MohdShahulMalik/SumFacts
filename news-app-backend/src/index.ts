import express, { Express, Request, Response } from "express";
import { ArticleData, extract } from "@extractus/article-extractor";
import { load } from "cheerio";

const app: Express = express();
const PORT: number = 8080;
app.use(express.json());

type ArticleUrls = {
    urls: string[];
} 

app.post("/summarize", async (req: Request<null, null, ArticleUrls, null>, res: Response) => {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
        res.status(400).json({ error: "Invalid body" });
        return;
    }

    const articlesContent: string[] = [];
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
        res.json(articlesContent);
    }catch (error) {
        if (error instanceof Error){
            console.error("Failed to extract the article ", error.message);
        }else {
            console.error("Failed to extract the article ", error);
        }

        res.status(500).json({ error: "Failed to extract the article " });
    }

    try {
        //TODO: Add a function to summarize the articlesContent array and return the summary
    }catch(error) {
        console.log(error);
    }
});

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}/summarize`);
});