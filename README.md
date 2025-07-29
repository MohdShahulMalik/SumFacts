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

## Visual Demonstrations

### News Summarizer in Action

Watch a brief demonstration of the news summarizer feature, showcasing how users can browse categories and view AI-generated summaries for different days.

<p align="center">
  <!-- Placeholder for News Summarizer Video -->
  <em>Video coming soon...</em>
</p>

### Fact-Checker in Action

This video demonstrates the on-demand fact-checking tool. See how a user can input a claim and receive a grounded, factual assessment with references.

<p align="center">
  <!-- Placeholder for Fact-Checker Video -->
  <em>Video coming soon...</em>
</p>

---

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
| **Google Gemini API** | Powers the on-demand fact-checking feature. |

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
git clone https://github.com/your-username/SumFacts.git
cd SumFacts
```

### 2. Install Dependencies

Install dependencies for both the frontend and backend from the root directory.

```bash
pnpm install
```

### 3. Environment Variables

You will need to create two `.env` files, one for the frontend and one for the backend.

**Backend (`/news-app-backend/.env`):**

```
# Server Configuration
PORT=5000
FRONTEND_URL=http://localhost:5173

# SurrealDB Credentials
SURREAL_URL=ws://localhost:8000/rpc
SURREAL_USER=your-surreal-user
SURREAL_PASS=your-surreal-pass
SURREAL_NS=your-namespace
SURREAL_DB=your-database

# API Keys
GNEWS_API_KEY=your-gnews-api-key
GOOGLE_API_KEY=your-google-api-key
```

**Frontend (`/news-summary-app/.env`):**

```
# Vite Port
VITE_PORT=5173

# Auth0 Credentials
VITE_AUTH0_DOMAIN=your-auth0-domain
VITE_AUTH0_CLIENT_ID=your-auth0-client-id

# API Endpoints
VITE_NEWS_ENDPOINT=http://localhost:5000/news-summaries
VITE_GEMINI_API_KEY=your-gemini-api-key
```

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

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:5000`.

---

## Author

**Shahul Malik**

- [GitHub](https://github.com/MohdShahulMalik)
- [LinkedIn](https://www.linkedin.com/in/shahul-malik-b140682ab)
