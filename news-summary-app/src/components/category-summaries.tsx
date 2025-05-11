import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../styles/category-summaries.module.scss";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import ReactMarkdown from "react-markdown";
import previousDayBtn from "../assets/left.png";
import nextDayBtn from "../assets/right.png";
import LoadingSkeleton from "./loading-skeleton";

dayjs.extend(advancedFormat);

export default function CategorySummaries() {
    let { category } = useParams();
    category = category as string;
    const [summaries, setSummaries] = useState<string[]>([]);
    const [urls, setUrls] = useState<string[]>([]);
    const [date, setDate] = useState(dayjs());

    useEffect(() => {
        setSummaries([]);

        const previouosDate = date.subtract(1, "day").toISOString();
        const currentDate = date.toISOString();

        const previousDayNewsFetch = fetch(`${import.meta.env.VITE_NEWS_ENDPOINT}/${category}`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                day: previouosDate,
                numNews: 10,
            })
        });

        const currentDayNewsFetch = fetch(`${import.meta.env.VITE_NEWS_ENDPOINT}/${category}`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                day: currentDate,
                numNews: 5
            })
        });

        Promise.all([previousDayNewsFetch, currentDayNewsFetch]).then(([previousDayNewsRes, currentDayNewsRes]) => {
            // console.log("Prev Status: ", previousDayNewsFetch.status);
            // console.log("Current Status: ", currentDayNewsFetch.status);
            if (previousDayNewsRes.ok && currentDayNewsRes.ok){
                return Promise.all([previousDayNewsRes.json(), currentDayNewsRes.json()]);
            }else{
                throw new Error("Failed to fetch the summaries");
            }
        }).then(([previousDayNews, currentDayNews]) => {
            console.log(previousDayNews);
            console.log(currentDayNews);
            const previousDaySummaries = previousDayNews.summarizedArticles;
            const previousDaySummariesUrls = previousDayNews.urls;
            const currentDaySummaries = currentDayNews.summarizedArticles;
            const currentDaySummariesUrls = currentDayNews.urls;
            const allSummaries = [...currentDaySummaries, ...previousDaySummaries];
            const allUrls = [...currentDaySummariesUrls, ...previousDaySummariesUrls];
            setSummaries(allSummaries);
            setUrls(allUrls);

        }).catch((error) => {
            console.error(error.message);
        });
    }, [date]);

    return (
        <main className = {styles["summaries-body"]}>
            <div className = {styles["summaries-header"]}>
                <button onClick = {() => setDate(date.subtract(1, "day"))}>
                    <img src = {previousDayBtn} alt = "Previous Day" />
                </button>
                <div className = {styles["summaries-details"]}>
                    <h1 className = {styles["category-name"]}>{category?.charAt(1).toUpperCase()  + category?.slice(2)}</h1>
                    <h2>{date.format("Do MMMM")}</h2>
                    <h2>{date.format("YYYY")}</h2>
                </div>
                <button onClick = {() => {
                    if (date.isSame(dayjs(), "day")){
                        return;
                    }else{
                        setDate(date.add(1, "day"));
                    }
                }}><img src = {nextDayBtn} alt = "Next Day" /></button>
            </div>
            <hr className = {styles["divider"]}/>
            {
                summaries.length > 0 ? ( 
                    summaries.map((summary, i) => (
                        <a href = {urls[i]} className = {styles["articles-link"]} target = "_blank" key = {i}>
                            <ReactMarkdown>{summary}</ReactMarkdown>
                        </a>
                    ))
                )
                :
                (<LoadingSkeleton/>)
            }
        </main>
    );
}