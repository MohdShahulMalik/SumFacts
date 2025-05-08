import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../styles/category-summaries.module.scss";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import ReactMarkdown from "react-markdown";
import previousDayBtn from "../assets/left.png";
import nextDayBtn from "../assets/right.png";

dayjs.extend(advancedFormat);

export default function CategorySummaries() {
    const { category } = useParams();
    const [summaries, setSummaries] = useState<string[]>([]);
    const [urls, setUrls] = useState<string[]>([]);
    const [date, setDate] = useState(dayjs());

    useEffect(() => {
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
            if (previousDayNewsRes.ok && currentDayNewsRes.ok){
                return Promise.all([previousDayNewsRes.json(), currentDayNewsRes.json()]);
            }else{
                throw new Error("Failed to fetch the summaries");
            }
        }).then(([previousDayNews, currentDayNews]) => {

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

    if (summaries.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <main className = {styles["summaries-body"]}>
            <div className = {styles["summaries-header"]}>
                <button className = {styles["preivous-day-btn"]} onClick = {() => setDate(date.subtract(1, "day"))}>
                    <img src = {previousDayBtn} alt = "Previous Day" className = {styles["previous-day-img"]}/>
                </button>
                <div className = {styles["date-details"]}>
                    <h2 className = {styles["date-displaying"]}>{date.format("Do MMMM")}</h2>
                    <h2 className = {styles["year-displaying"]}>{date.format("YYYY")}</h2>
                </div>
                <button className = {styles["next-day-btn"]} onClick = {() => {
                    if (date.isSame(dayjs(), "day")){
                        return;
                    }else{
                        setDate(date.add(1, "day"));
                    }
                }}><img src = {nextDayBtn} alt = "Next Day" className = {styles["next-day-img"]} /></button>
            </div>
            <h2 className = {styles["category-name"]}>{category.slice(1)}</h2>
            <hr className = {styles["divider"]}/>
            {
                summaries.map((summary, i) => (
                    <a href = {urls[i]} className = {styles["articles-link"]} >
                        <ReactMarkdown>{summary}</ReactMarkdown>
                    </a>
                ))
            }
        </main>
    );
}