import dotenv from "dotenv";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { Agent } from "https";
import tls from "tls";

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);

// Fallback to 5000 when PORT is unset (e.g. running outside Docker/Render).
const parsedPort = parseInt(process.env.PORT ?? "", 10);
export const PORT: number = Number.isInteger(parsedPort) && parsedPort > 0 ? parsedPort : 5000;

export const httpsAgent = new Agent({ family: 4, ciphers: tls.DEFAULT_CIPHERS });

// GNews-supported news categories, used to validate user input before it is
// interpolated into the outbound GNews request.
export const NEWS_CATEGORIES = [
  "general",
  "world",
  "nation",
  "business",
  "technology",
  "sports",
  "science",
  "health",
] as const;

// Keeps a single request from triggering an arbitrarily expensive
// GNews + Gemini run.
export const MAX_NUM_NEWS = 10;

// Upper bound for the fact-check claim length, in characters.
export const MAX_FACT_CHECK_LENGTH = 10_000;
