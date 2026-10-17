import dotenv from "dotenv";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";
import { Agent } from "https";
import tls from "tls";

dotenv.config();
dayjs.extend(utc);
dayjs.extend(timezone);

export const PORT: number = parseInt(process.env.PORT as string);

export const httpsAgent = new Agent({ family: 4, ciphers: tls.DEFAULT_CIPHERS });
