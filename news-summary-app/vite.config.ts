import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // In dev, the Vite dev server proxies API calls to the backend,
  // so no CORS configuration is needed.
  server: {
    proxy: {
      // Bypass the proxy for browser page loads (text/html GETs) so client
      // routes that share a prefix with the API (e.g. /fact-check) still work.
      "/news-summaries": {
        target: "http://localhost:5000",
        bypass(req) {
          if (req.method === "GET" && req.headers.accept?.includes("text/html")) {
            return req.url;
          }
        },
      },
      "/fact-check": {
        target: "http://localhost:5000",
        bypass(req) {
          if (req.method === "GET" && req.headers.accept?.includes("text/html")) {
            return req.url;
          }
        },
      },
      "/health": "http://localhost:5000",
    },
  },
  // Emit the production build into the backend package, from where
  // Express serves it in a single-service (frontend + API) deployment.
  build: {
    outDir: "../news-app-backend/frontend-dist",
    emptyOutDir: true,
  },
});
