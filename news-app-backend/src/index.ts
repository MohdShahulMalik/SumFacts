import { closeDB } from "./database.js";
import { PORT } from "./config/app-config.js";
import { startDB } from "./database.js";
import app from "./app.js";

startDB();

const server = app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});

const shutdown = async () => {
  console.log("Shutting down the server...");
  server.close(async () => {
    console.log("The server has been closed");
    await closeDB();
    process.exit(0);
  });
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
