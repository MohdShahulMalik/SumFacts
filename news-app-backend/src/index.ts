import express, { Express, Request, Response } from "express";
import { extract, Article } from "@extractus/article-extractor";
import { load } from "cheerio";

const app: Express = express();
const PORT: number = 8080;

type SrcUrl = {
    url: string;
}

app.get("/extract", async (req: Request<{}, {}, {}, SrcUrl>, res: Response) => {
    const { url } = req.query;

    if (!url) {
        res.status(400).json({ error: "Missing 'url' query parameter" });
        return;
    }

    try {
        const article: Article | null = await extract(url);
        
        if (!article) {
            res.status(404).json({ error: "Could not extract the article" });
            return;
        }
        const $ = await load(article.content ?? "");
        const content = $.text();
        res.json({content});
    }catch (error) {
        if (error instanceof Error){
            console.error("Failed to extract the article ", error.message);
        }else {
            console.error("Failed to extract the article ", error);
        }

        res.status(500).json({ error: "Failed to extract the article " });
    }
});

app.listen(PORT, () => {
    console.log(`Listening at http://localhost:${PORT}/extract`);
});