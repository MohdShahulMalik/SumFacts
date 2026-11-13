// Minimal structured logger: one JSON object per line so Render/log drains
// can index entries. No dependencies — keep it that way.

type LogLevel = "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

function serializeError(error: unknown): Record<string, unknown> {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
      cause: (error as { cause?: unknown }).cause instanceof Error ? ((error as { cause?: unknown }).cause as Error).message : (error as { cause?: unknown }).cause,
    };
  }
  return { message: String(error) };
}

function write(level: LogLevel, message: string, context?: LogContext): void {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...context,
  };
  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => write("info", message, context),
  warn: (message: string, context?: LogContext) => write("warn", message, context),
  error: (message: string, error?: unknown, context?: LogContext) =>
    write("error", message, { ...context, ...(error !== undefined ? { error: serializeError(error) } : {}) }),
};
