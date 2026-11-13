import axios from "axios";
import { httpsAgent } from "../config/app-config.js";
import { describeHttpError } from "../http-error.js";

export type FactCheckResult = {
  assessment: string;
  searchHtml: string;
  references: string[];
  referenceTitles: string[];
};

const GEMINI_FACT_CHECK_MODEL = "gemini-3.5-flash-lite";
const GEMINI_FACT_CHECK_PROMPT =
  "Give the assessment of the truthfulness of the following claim (highlight the assessment):\n";

export async function factCheckClaim(claim: string): Promise<FactCheckResult> {
  let response;
  try {
    response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_FACT_CHECK_MODEL}:generateContent?key=${process.env.GOOGLE_API_KEY}`,
      {
        contents: [{ parts: [{ text: GEMINI_FACT_CHECK_PROMPT + claim }] }],
        tools: [{ googleSearch: {} }],
      },
      {
        headers: { "Content-Type": "application/json" },
        httpsAgent,
        timeout: 60_000,
      },
    );
  } catch (error) {
    throw new Error(`Gemini fact-check request failed: ${describeHttpError(error)}`);
  }

  const candidate = response.data?.candidates?.[0];
  const assessment: string | undefined = candidate?.content?.parts?.[0]?.text;
  if (!assessment) {
    throw new Error("Gemini returned no assessment text");
  }

  const searchHtml: string =
    candidate?.groundingMetadata?.searchEntryPoint?.renderedContent || "";

  const references: string[] = [];
  const referenceTitles: string[] = [];
  for (const referenceData of candidate?.groundingMetadata?.groundingChunks ?? []) {
    const uri = referenceData.web?.uri;
    const title = referenceData.web?.title;
    if (!uri || !title) {
      continue;
    }
    references.push(uri);
    referenceTitles.push(title);
  }

  return { assessment, searchHtml, references, referenceTitles };
}
