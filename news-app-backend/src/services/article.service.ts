import { ArticleData, extract } from "@extractus/article-extractor";
import { load } from "cheerio";
import { httpsAgent } from "../config/app-config.js";

export async function extractArticleTexts(urls: string[]): Promise<string[]> {
  const articles: string[] = [];

  const articlesDataPromises: Promise<ArticleData | null>[] = [];
  for (const url of urls) {
    const articleDataPromise: Promise<ArticleData | null> = extract(
      url,
      undefined,
      { agent: httpsAgent },
    );
    articlesDataPromises.push(articleDataPromise);
  }
  const articlesData: (ArticleData | null)[] =
    await Promise.all(articlesDataPromises);
  articlesData.filter((articleData) => articleData !== null);
  for (const articleData of articlesData) {
    if (articleData && articleData.content) {
      const $ = load(articleData.content);
      const text = $.text();
      articles.push(text);
    } else {
      continue;
    }
  }

  return articles;
}
