import express, {
  Express,
  Response,
  Request,
  Router,
} from "express";
import cors from "cors";
import dayjs, { Dayjs } from "dayjs";
import type {
  NewsDay,
  ArticleUrls,
  SummarizedArticles,
  ErrorResponse,
  NewsCategoryParam,
  NewsSummariesRecord,
} from "./types.js";
import {
  addSummaries,
  getSummaries,
  recExists,
} from "./database.js";
import { fetchArticleUrls } from "./services/gnews.service.js";
import { extractArticleTexts } from "./services/article.service.js";
import { summarizeArticles } from "./services/gemini.service.js";

const app: Express = express();

app.use(express.json());
app.use(
  cors({
    origin: `${process.env.FRONTEND_URL}`,
    methods: ["POST"],
    allowedHeaders: ["Content-Type"],
  }),
);

const newsSummariesRouter: Router = Router();

newsSummariesRouter.post(
  "/:category",
  async (
    req: Request<
      NewsCategoryParam,
      SummarizedArticles | ErrorResponse,
      NewsDay,
      null
    >,
    res: Response,
  ) => {
    const { day, numNews }: NewsDay = req.body;
    const category: string = req.params.category.slice(1);
    if (!day || !numNews || !category) {
      res.status(400).json({
        error:
          "Day(as a dayjs object) and numNews fields should exists in the request body",
      });
      return;
    }
    const dayjsDay: Dayjs = dayjs(day);

    const urls: ArticleUrls = [];

    const summariesExist = await recExists(dayjsDay, category, numNews);
    if (summariesExist) {
      const newsRecord: NewsSummariesRecord | undefined = await getSummaries(
        dayjsDay,
        category,
        numNews,
      );
      const summaries = newsRecord?.summaries;
      const urls = newsRecord?.urls;
      res.json({
        summarizedArticles: summaries,
        urls,
      });
      return;
    }
    try {
      const fetchedUrls = await fetchArticleUrls(dayjsDay, category, numNews);
      urls.push(...fetchedUrls);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to fetch the articles ", error.message);
      } else {
        console.error("Failed to fetch the articles ", error);
      }

      res.status(500).json({ error: "Failed to fetch the articles" });
      return;
    }

    let articles: string[] = [];
    try {
      articles = await extractArticleTexts(urls);
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to extract an article ", error.message);
      } else {
        console.error("Failed to extract an article ", error);
      }
    }

    try {
      if (!articles) {
        res.status(500).json({ error: "failed to extract articles" });
        return;
      }

      const summarizedArticles: string[] =
        await summarizeArticles(articles);

      if (!dayjsDay.isSame(dayjs(), "day")) {
        await addSummaries(
          dayjsDay,
          summarizedArticles,
          urls,
          category,
          numNews,
        );
      }
      res.json({ summarizedArticles, urls });
    } catch (error) {
      if (error instanceof Error) {
        console.error("Failed to summarize the article ", error.message);
      } else {
        console.error("Failed to summarize the article ", error);
      }

      res.status(500).json({ error: "Failed to summarize the article " });
      return;
    }
  },
);

app.use("/news-summaries", newsSummariesRouter);

export default app;
