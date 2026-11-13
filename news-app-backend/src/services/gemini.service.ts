import axios from "axios";
import { httpsAgent } from "../config/app-config.js";
import { logger } from "../logger.js";
import { describeHttpError } from "../http-error.js";

export async function summarizeArticles(articles: string[]): Promise<string[]> {
  const summarizedArticles: string[] = [];

  const geminiPromises = articles.map((article, index) =>
    axios
      .post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${process.env.GOOGLE_API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text:
                    "Only Summarize the following news article in few concise bullet points(bullet list format) and highlight the main thing at the beggining of the point, give it only 1 concise heading(level 3 heading), your response should contain nothing else: " +
                    article,
                },
              ],
            },
          ],
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          httpsAgent,
          timeout: 60_000,
        },
      )
      .then((response) => ({ index, response }))
      .catch((error: unknown) => ({ index, error })),
  );

  // settle individually so one bad article doesn't fail the whole batch
  const settled = await Promise.all(geminiPromises);
  let failures = 0;
  for (const outcome of settled) {
    if ("error" in outcome) {
      failures++;
      logger.error("Gemini summarize request failed", new Error(describeHttpError(outcome.error)), {
        articleIndex: outcome.index,
      });
      continue;
    }
    const summarizedArticle =
      outcome.response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (summarizedArticle) {
      summarizedArticles.push(summarizedArticle);
    } else {
      failures++;
      logger.warn("Gemini returned no summary text", {
        articleIndex: outcome.index,
        finishReason: outcome.response.data?.candidates?.[0]?.finishReason,
      });
    }
  }

  logger.info("Gemini summarization finished", {
    requested: articles.length,
    succeeded: summarizedArticles.length,
    failed: failures,
  });

  if (summarizedArticles.length === 0 && articles.length > 0) {
    throw new Error(`All ${articles.length} Gemini summarize requests failed`);
  }

  return summarizedArticles;
}
