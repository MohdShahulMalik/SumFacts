import { ArticleData, extract } from "@extractus/article-extractor";
import { load } from "cheerio";
import { httpsAgent } from "../config/app-config.js";
import { logger } from "../logger.js";

export async function extractArticleTexts(urls: string[]): Promise<string[]> {
  const articles: string[] = [];

  const articlesDataPromises: Promise<ArticleData | null>[] = [];
  for (const url of urls) {
    const articleDataPromise: Promise<ArticleData | null> = extract(
      url,
      undefined,
      { agent: httpsAgent },
    ).catch((error: unknown) => {
      // one unreachable/paywalled article must not sink the whole batch
      logger.warn("Article extraction failed for url", {
        url,
        reason: error instanceof Error ? error.message : String(error),
      });
      return null;
    });
    articlesDataPromises.push(articleDataPromise);
  }
  const articlesData: (ArticleData | null)[] =
    await Promise.all(articlesDataPromises);
  let nullCount = 0;
  for (const articleData of articlesData) {
    if (articleData && articleData.content) {
      const $ = load(articleData.content);
      const text = $.text();
      articles.push(text);
    } else {
      nullCount++;
    }
  }

  logger.info("Article extraction finished", {
    requested: urls.length,
    extracted: articles.length,
    failed: nullCount,
  });

  return articles;
}
