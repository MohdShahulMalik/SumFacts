# SumFacts: AI-Powered News Summarizer & Fact-Checker

**SumFacts** is a full-stack web application designed to tackle information overload and the spread of misinformation. It provides users with AI-generated summaries of the latest news and an on-demand tool to fact-check claims using Google Search grounding.

[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

---

## Overview

In today's fast-paced digital world, staying informed is a challenge. We are constantly bombarded with vast amounts of information, making it difficult to keep up with current events. Furthermore, the rise of social media has amplified the spread of misinformation, making it hard to distinguish fact from fiction.

SumFacts addresses these challenges by offering a dual-purpose platform that leverages the power of Generative AI to provide clarity and promote media literacy.

## Key Features & Technical Strengths

- **AI-Powered News Summarization**: Aggregates top news stories from the GNews API across eight different categories. The backend then uses the **Google Gemini API** to generate concise, easy-to-read bullet-point summaries, allowing users to grasp key information in seconds.

- **On-Demand Fact-Checking**: Empowers users to verify claims or news they encounter. By leveraging **Google's Gemini API with Search grounding**, the tool assesses the factuality of a statement and provides references from trusted web sources, directly combating misinformation.

- **Efficient Backend Caching**: To optimize performance and reduce redundant API calls, the backend implements a caching system using **SurrealDB**. Summaries for a given day are stored and served directly from the database on subsequent requests, ensuring a fast user experience and efficient resource management.

- **Secure Authentication**: User authentication is handled securely using **Auth0**, providing a robust and reliable login system. Protected routes ensure that users must be logged in to access personalized content.

- **Modern, Responsive UI**: The frontend is built with **React 19** and styled with **Sass/SCSS**, featuring a clean, intuitive, and fully responsive user interface that provides a seamless experience across all devices.

- **Full-Stack TypeScript**: The entire project is developed using **TypeScript**, ensuring type safety, improved code quality, and better maintainability across both the React frontend and the Node.js backend.

---

## Video Tutorial

A comprehensive video tutorial is available to guide you through the features and functionality of SumFacts. Watch the video below to see the app in action.

[![SumFacts Video Demonstration](https://img.youtube.com/vi/2IqoANI8Neg/0.jpg.jpg)](https://www.youtube.com/watch?v=2IqoANI8Neg)

## Tech Stack & Architecture

This project is a monorepo containing a React frontend and a Node.js backend. The frontend communicates with the backend via a REST API, which in turn interacts with external services (GNews, Google AI) and the SurrealDB database.

### Frontend (`news-summary-app`)

| Technology | Description |
| :-- | :-- |
| **React 19** | A JavaScript library for building user interfaces. |
| **TypeScript** | Typed superset of JavaScript for robust, scalable code. |
| **Vite** | Next-generation frontend tooling for fast development. |
| **Sass/SCSS** | CSS preprocessor for maintainable and modular styling. |
| **React Router** | Declarative routing for React applications. |
| **Auth0** | Secure authentication and user management. |
| **Day.js** | Lightweight date/time manipulation library. |

### Backend (`news-app-backend`)

| Technology | Description |
| :-- | :-- |
| **Node.js** | JavaScript runtime for building server-side applications. |
| **Express.js** | Fast, unopinionated, minimalist web framework for Node.js. |
| **TypeScript** | Ensures type safety and improves code quality. |
| **SurrealDB** | An innovative, multi-model database for modern applications. |
| **Google Gemini API** | Used for summarizing news articles. |
| **GNews API** | Fetches the latest news articles from various sources. |
| **Cheerio** | Parses markup and provides an API for traversing/manipulating the resulting data structure. |
| **Article Extractor** | Extracts the main content from news article URLs. |
| **Jasmine** | A behavior-driven development framework for testing JavaScript code. |

---

## Getting Started

To run this project locally, follow these steps:

### Prerequisites

- Node.js (v18 or later)
- pnpm (or your preferred package manager)
- A running SurrealDB instance

### 1. Clone the Repository

```bash
git clone https://github.com/MohdShahulMalik/SumFacts.git
cd SumFacts
```

### 2. Install Dependencies

Install dependencies in each package (there is no root workspace):

```bash
cd news-app-backend && pnpm install
cd ../news-summary-app && pnpm install
```

### 3. Environment Variables

> [!NOTE]
> Page URLs are derived from `window.location.origin` at runtime and API calls are same-origin relative paths, so the app needs **no URL-related environment variables** — nothing to adjust per environment.

You need one `.env` file per package, containing only secrets. Each package ships a `.env.example` with the exact variable names the code reads — copy it to `.env` and fill in your values:

- Backend: copy `news-app-backend/.env.example` to `news-app-backend/.env`
- Frontend: copy `news-summary-app/.env.example` to `news-summary-app/.env` (optional — unset values fall back to the hardcoded dev-tenant Auth0 credentials)

The backend variables are `PORT`, `SURREAL_URL`, `SURREAL_USER`, `SURREAL_PASS`, `SURREAL_NS`, `SURREAL_DB`, `GNEWS_API_KEY` and `GOOGLE_API_KEY` (the same key powers both news summarization and fact-checking, both of which run server-side).

### 4. Run the Application

You can run both the frontend and backend concurrently from the root directory.

**Run Backend Server:**

```bash
pnpm --filter news-app-backend dev
```

**Run Frontend Development Server:**

```bash
pnpm --filter news-summary-app dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`. In development, the Vite dev server proxies `/news-summaries`, `/fact-check` and `/health` requests to the backend, so no CORS configuration is needed.

---

## Deployment (single Docker service)

The frontend and backend are deployed together as **one Docker container**: Express serves the built React app and the REST API from a single origin. No CORS or URL configuration is required — the API is reached via same-origin relative paths, and nothing is hardcoded to a specific host.

### Files involved

| File | Purpose |
| :-- | :-- |
| `Dockerfile` | Multi-stage build: compiles the Vite frontend, compiles the backend TypeScript, then builds a slim runtime image containing only production dependencies. |
| `docker-compose.yml` | Runs the app container, maps port `8080`, passes secrets from `news-app-backend/.env` via `env_file`, and defines a `/health`-based healthcheck. |
| `.dockerignore` | Keeps secrets, `node_modules` and build artifacts out of the image build context. |

### 1. Configure secrets

Copy `news-app-backend/.env.example` to `news-app-backend/.env` and fill in your SurrealDB credentials (use `wss://...` for a hosted instance) and API keys. The variable names must match `.env.example` exactly — the code reads `SURREAL_URL`, `SURREAL_USER`, `SURREAL_PASS`, `SURREAL_NS`, `SURREAL_DB`, `GNEWS_API_KEY` and `GOOGLE_API_KEY`.

### 2. Build and run

```bash
docker compose up -d --build
```

The app listens on port `8080` inside the container; set `APP_PORT` (for example in a root-level `.env` or with `export APP_PORT=3000`) to publish a different host port.

### 3. Check that it is healthy

```bash
curl http://localhost:8080/health
# {"status":"ok"}
```

If SurrealDB is unreachable, the app retries for about a minute and exits non-zero; Docker's restart policy brings it back up once the database is available. View readiness state with `docker compose ps` and logs with `docker compose logs app`.

### Auth0

Add the deployed URL (e.g. `https://your-domain.com/summaries`, or `http://localhost:8080/summaries` when testing locally) to your Auth0 application's **Allowed Callback URLs / Logout URLs / Web Origins** so sign-in works.

---

## Author

**Shahul Malik**

- [GitHub](https://github.com/MohdShahulMalik)
- [LinkedIn](https://www.linkedin.com/in/shahul-malik-b140682ab)
