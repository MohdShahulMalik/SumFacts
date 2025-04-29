import { Dayjs } from "dayjs";

export type NewsDay = {
    day: Dayjs;
    numNews: number;
};

export type ArticleUrls = string[];

export type SummarizedArticles = {
    summarizedArticles: string[];
};

export type ErrorResponse = {
    error: string;
    
};

export type NewSummaries = {
    date: string;
    summaries: string[];
}