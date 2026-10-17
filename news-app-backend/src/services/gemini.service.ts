import axios from "axios";
import { httpsAgent } from "../config/app-config.js";

export async function summarizeArticles(articles: string[]): Promise<string[]> {
  const summarizedArticles: string[] = [];

  const geminiPromises = [];
  for (const article of articles) {
    const geminiPromise = axios.post(
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
      },
    );
    geminiPromises.push(geminiPromise);
  }

  const geminiResponses = await Promise.all(geminiPromises);
  for (const geminiResponse of geminiResponses) {
    const summarizedArticle =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (summarizedArticle) {
      summarizedArticles.push(summarizedArticle);
    }
  }

  return summarizedArticles;
}
