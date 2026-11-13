import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { ArticleUrls } from "../types.js";
import { httpsAgent } from "../config/app-config.js";
import { logger } from "../logger.js";
import { describeHttpError } from "../http-error.js";

export async function fetchArticleUrls(
  dayjsDay: Dayjs,
  category: string,
  numNews: number,
): Promise<ArticleUrls> {
  const urls: ArticleUrls = [];

  const utcStartDate =
    dayjsDay.startOf("day").utc().format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
  const utcEndDate = dayjsDay.isBefore(dayjs(), "day")
    ? dayjsDay.endOf("day").utc().format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
    : dayjs().utc().format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";

  let response;
  try {
    response = await axios.get(
      `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=in&max=${numNews}&from=${utcStartDate}&to=${utcEndDate}&apikey=${process.env.GNEWS_API_KEY}`,
      { httpsAgent, timeout: 15_000 },
    );
  } catch (error) {
    throw new Error(`GNews request failed: ${describeHttpError(error)}`);
  }

  const articles = response.data?.articles;
  if (!Array.isArray(articles)) {
    logger.error("GNews response missing articles array", undefined, {
      category,
      status: response.status,
      keys: response.data ? Object.keys(response.data) : [],
    });
    throw new Error("GNews response did not include an articles array");
  }

  for (const article of articles) {
    if (article && article.url) {
      urls.push(article.url);
    } else {
      logger.warn("Skipped a GNews article with no url", { category });
    }
  }

  logger.info("Fetched article urls from GNews", {
    category,
    requested: numNews,
    received: articles.length,
    usable: urls.length,
    totalAvailable: response.data?.totalArticles,
  });

  return urls;
}
