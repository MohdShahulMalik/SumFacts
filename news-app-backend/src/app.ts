import express, {
  Express,
  Response,
  Request,
  RequestHandler,
  NextFunction,
  Router,
} from "express";
import path from "path";
import dayjs, { Dayjs } from "dayjs";
import type {
  NewsCategoryParam,
  SummarizedArticles,
  ErrorResponse,
  NewsDay,
  ArticleUrls,
  Claim,
  FactCheckResponse,
} from "./types.js";
import {
  addSummaries,
  getSummaries,
  recExists,
} from "./database.js";
import { fetchArticleUrls } from "./services/gnews.service.js";
import { extractArticleTexts } from "./services/article.service.js";
import { summarizeArticles } from "./services/gemini.service.js";
import { factCheckClaim } from "./services/fact-check.service.js";
import {
  NEWS_CATEGORIES,
  MAX_NUM_NEWS,
  MAX_FACT_CHECK_LENGTH,
} from "./config/app-config.js";
import { logger } from "./logger.js";

const app: Express = express();

app.disable("x-powered-by");
app.use(express.json({ limit: "100kb" }));

// Access log: one line per request with method, path, status, and duration.
// Registered before the routes so it captures everything they emit.
app.use((req, res, next) => {
  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const context = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs: Math.round(durationMs),
    };
    if (res.statusCode >= 500) {
      logger.error("request failed", undefined, context);
    } else if (res.statusCode >= 400) {
      logger.warn("request rejected", context);
    } else {
      logger.info("request completed", context);
    }
  });
  next();
});

// Small in-memory sliding-window rate limiter. The endpoints below fan out to
// paid GNews and Gemini calls, so they must not be freely spammable. It has no
// hop-away storage: sufficient for the single-instance deployment this project
// targets.
const buckets = new Map<string, number[]>();

function rateLimit(windowMs: number, max: number): RequestHandler {
  return (req, res, next) => {
    const now = Date.now();
    const ip = req.ip ?? "unknown";
    const hits = (buckets.get(ip) ?? []).filter(
      (stamp) => stamp > now - windowMs,
    );
    if (hits.length >= max) {
      res.status(429).json({ error: "Too many requests, try again later" });
      return;
    }
    hits.push(now);
    buckets.set(ip, hits);
    next();
  };
}

app.use("/news-summaries", rateLimit(60_000, 30));
app.use("/fact-check", rateLimit(60_000, 10));

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
    // Tolerate clients that prefix the category with a stray ":"
    // (older links used /news-summaries/:general).
    const category: string = req.params.category.replace(/^:+/, "");
    if (!category) {
      res.status(400).json({ error: "A category is required in the request path" });
      return;
    }
    if (!NEWS_CATEGORIES.includes(category as never)) {
      res
        .status(400)
        .json({ error: `Category must be one of: ${NEWS_CATEGORIES.join(", ")}` });
      return;
    }
    if (!day) {
      res
        .status(400)
        .json({ error: "A day field (ISO date string) is required in the body" });
      return;
    }
    const dayjsDay: Dayjs = dayjs(day);
    if (!dayjsDay.isValid() || dayjsDay.isAfter(dayjs(), "day")) {
      res.status(400).json({ error: "The chosen date is invalid or in the future" });
      return;
    }
    if (
      typeof numNews !== "number" ||
      !Number.isInteger(numNews) ||
      numNews < 1 ||
      numNews > MAX_NUM_NEWS
    ) {
      res
        .status(400)
        .json({ error: `numNews must be an integer from 1 to ${MAX_NUM_NEWS}` });
      return;
    }

    const urls: ArticleUrls = [];
    const requestContext = { category, day, numNews };

    // Cache lookup. Previously this ran outside any error boundary, so a
    // SurrealDB hiccup surfaced as an empty 500 with nothing in the logs.
    let summariesExist = false;
    try {
      summariesExist = await recExists(dayjsDay, category, numNews);
    } catch (error) {
      logger.error("Failed to check the summaries cache", error, requestContext);
      res.status(500).json({ error: "Failed to check the summaries cache" });
      return;
    }

    if (summariesExist) {
      try {
        const newsRecord = await getSummaries(dayjsDay, category, numNews);
        const summaries = newsRecord?.summaries;
        const cachedUrls = newsRecord?.urls;
        if (!summaries || !cachedUrls) {
          logger.warn("Cache record missing after existence check; regenerating", requestContext);
        } else {
          logger.info("Serving cached summaries", { ...requestContext, count: summaries.length });
          res.json({ summarizedArticles: summaries, urls: cachedUrls });
          return;
        }
      } catch (error) {
        logger.error("Failed to read the summaries cache", error, requestContext);
        res.status(500).json({ error: "Failed to read the summaries cache" });
        return;
      }
    }
    try {
      const fetchedUrls = await fetchArticleUrls(dayjsDay, category, numNews);
      urls.push(...fetchedUrls);
    } catch (error) {
      logger.error("Failed to fetch the articles", error, requestContext);
      res.status(500).json({ error: "Failed to fetch the articles" });
      return;
    }

    let articles: string[] = [];
    try {
      articles = await extractArticleTexts(urls);
    } catch (error) {
      logger.error("Failed to extract an article", error, { ...requestContext, urlCount: urls.length });
    }

    try {
      if (articles.length === 0) {
        logger.error("No articles extracted; cannot summarize", undefined, { ...requestContext, urlCount: urls.length });
        res.status(500).json({ error: "failed to extract articles" });
        return;
      }

      const summarizedArticles: string[] =
        await summarizeArticles(articles);

      logger.info("Summarized articles", {
        ...requestContext,
        articleCount: articles.length,
        summaryCount: summarizedArticles.length,
      });
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
      logger.error("Failed to summarize the article", error, { ...requestContext, articleCount: articles.length });
      res.status(500).json({ error: "Failed to summarize the article" });
      return;
    }
  },
);

const factCheckRouter: Router = Router();

factCheckRouter.post(
  "/",
  async (
    req: Request<Record<string, string>, FactCheckResponse | ErrorResponse, Claim>,
    res: Response,
  ) => {
    const { claim } = req.body ?? {};
    if (typeof claim !== "string" || claim.trim().length === 0) {
      res.status(400).json({ error: "A non-empty claim field is required" });
      return;
    }
    if (claim.length > MAX_FACT_CHECK_LENGTH) {
      res.status(413).json({
        error: `The claim exceeds the maximum length of ${MAX_FACT_CHECK_LENGTH} characters`,
      });
      return;
    }
    try {
      const { assessment, searchHtml, references, referenceTitles } =
        await factCheckClaim(claim.trim());
      res.json({ assessment, searchHtml, references, referenceTitles });
    } catch (error) {
      logger.error("Failed to fact-check the claim", error, { claimLength: claim.trim().length });
      res.status(500).json({ error: "Failed to fact-check the claim" });
    }
  },
);

app.use("/news-summaries", newsSummariesRouter);
app.use("/fact-check", factCheckRouter);

// Catch-all error handler: async route handlers that throw end up here
// instead of in Express's silent default 500. Log path + stack so the
// failure is visible in the deployment logs.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  logger.error("Unhandled error in request handler", err, {
    method: req.method,
    path: req.originalUrl,
  });
  if (res.headersSent) return;
  res.status(500).json({ error: "Internal server error" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Serve the built frontend (single-service deployment: API and UI share one origin)
const frontendDist = path.resolve(process.cwd(), "frontend-dist");
app.use(express.static(frontendDist));
app.use((req, res, next: NextFunction) => {
  if (req.method === "GET" && !req.path.startsWith("/news-summaries")) {
    res.sendFile(path.join(frontendDist, "index.html"));
    return;
  }
  next();
});

export default app;
