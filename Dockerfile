# SumFacts — single production image (React UI + Express API in one container).
#
# Stage 1 builds the Vite app; it emits its build output directly into the
# backend's frontend-dist directory (see news-summary-app/vite.config.ts).
# Stage 2 compiles the backend TypeScript.
# Stage 3 runs production dependencies only, serving the compiled backend and
# the built frontend from a single origin.

# ---------- Frontend build ----------
FROM node:22-slim AS frontend-build

RUN corepack enable
WORKDIR /src

COPY news-summary-app/package.json news-summary-app/pnpm-lock.yaml news-summary-app/pnpm-workspace.yaml ./news-summary-app/
RUN cd news-summary-app && pnpm install --frozen-lockfile

COPY news-summary-app/ ./news-summary-app/
RUN cd news-summary-app && pnpm build

# ---------- Backend build ----------
FROM node:22-slim AS backend-build

RUN corepack enable
WORKDIR /src

COPY news-app-backend/package.json news-app-backend/pnpm-lock.yaml news-app-backend/pnpm-workspace.yaml ./news-app-backend/
RUN cd news-app-backend && pnpm install --frozen-lockfile

COPY news-app-backend/ ./news-app-backend/
RUN cd news-app-backend && pnpm build

# ---------- Runtime ----------
FROM node:22-slim

RUN corepack enable
WORKDIR /app

COPY news-app-backend/package.json news-app-backend/pnpm-lock.yaml news-app-backend/pnpm-workspace.yaml ./
RUN corepack pnpm install --prod --frozen-lockfile

COPY --from=backend-build /src/news-app-backend/dist ./dist
COPY --from=frontend-build /src/news-app-backend/frontend-dist ./frontend-dist

ENV NODE_ENV=production
EXPOSE 8080

CMD [ "node", "dist/src/index.js" ]
