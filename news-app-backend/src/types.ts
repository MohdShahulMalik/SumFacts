import { RecordId } from "surrealdb";

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
}

export type NewsSummariesRecord = {
    id: RecordId;
    summaries: string[];
}