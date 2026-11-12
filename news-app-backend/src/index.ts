import { closeDB, connectWithRetry } from "./database.js";
import { PORT } from "./config/app-config.js";
import app from "./app.js";
import http from "http";
import process from "process";

let server: http.Server | null = null;

// The start command of the container runs this. If a graceful shutdown is
// requested mid-retry (SIGINT/SIGTERM), connectWithRetry aborts, server is
// closed and the process exits with code 0.
connectWithRetry().catch(() => {
  console.error("Could not establish a connection with surrealdb, exiting...");
  if (server) {
    server.close(() => process.exit(1));
    return;
  }
  process.exit(1);
});

server = app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});

const shutdown = async () => {
  console.log("Shutting down the server...");
  // server is null while the connection is still retrying
  if (!server) {
    process.exit(0);
  }
  server.close(async () => {
    console.log("The server has been closed");
    await closeDB();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
