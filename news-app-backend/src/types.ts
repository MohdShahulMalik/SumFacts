import { RecordId } from "surrealdb";

export type NewsCategoryParam = {
    category: "general" | "world" | "nation" | "business" | "technology" | "sports" | "science" | "health";
}

export type NewsCategory = "general" | "world" | "nation" | "business" | "technology" | "sports" | "science" | "health";

export type NewsDay = {
    day: string;
    numNews: number;
};

export type ArticleUrls = string[];

export type SummarizedArticles = {
    summarizedArticles: string[];
};

export type ErrorResponse = {
    error: string;
    
};

export type NewsSummaries = {
    summaries: string[];
    urls: string[];
}

export type NewsSummariesRecord = {
    id: RecordId;
    summaries: string[];
    urls: string[];
}