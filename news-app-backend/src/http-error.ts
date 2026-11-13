import axios from "axios";

const MAX_BODY = 500;

function redact(text: string): string {
  let out = text;
  for (const key of [process.env.GNEWS_API_KEY, process.env.GOOGLE_API_KEY]) {
    if (key) out = out.split(key).join("[redacted]");
  }
  return out;
}

function truncate(text: string): string {
  return text.length > MAX_BODY ? text.slice(0, MAX_BODY) + "…[truncated]" : text;
}

// Builds an error message that includes the upstream HTTP status and a
// truncated, API-key-redacted copy of the response body — axios's default
// "Request failed with status code 500" omits the actual reason.
export function describeHttpError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status ?? "no-response";
    const body = error.response?.data;
    const bodyStr = body === undefined
      ? "(empty body)"
      : typeof body === "string"
        ? body
        : JSON.stringify(body);
    return `axios ${error.code ?? "ERR"} status=${status} body=${truncate(redact(bodyStr))}`;
  }
  return error instanceof Error ? error.message : String(error);
}
