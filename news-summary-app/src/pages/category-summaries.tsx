import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import styles from "../styles/category-summaries.module.scss";
import advancedFormat from "dayjs/plugin/advancedFormat.js";
import ReactMarkdown from "react-markdown";
import previousDayBtn from "../assets/left.png";
import nextDayBtn from "../assets/right.png";
import LoadingSkeleton from "../components/loading-skeleton";

dayjs.extend(advancedFormat);

export default function CategorySummaries() {
  let { category } = useParams();
  category = category as string;
  const [summaries, setSummaries] = useState<string[]>([]);
  const [urls, setUrls] = useState<string[]>([]);
  const [date, setDate] = useState(dayjs());
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    setSummaries([]);
    setLoadError(null);

    const previouosDate = date.subtract(1, "day").toISOString();
    const currentDate = date.toISOString();

    const fetchSummaries = (day: string, numNews: number, label: string) =>
      fetch(`/news-summaries/${category}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ day, numNews }),
      }).then(async (res) => {
        if (!res.ok) {
          const body = await res.text().catch(() => "(unreadable body)");
          console.error(
            `[summaries] ${label} request failed: status=${res.status} category=${category} day=${day} numNews=${numNews} body=${body}`,
          );
          throw new Error(`${label} summaries request failed with status ${res.status}`);
        }
        return res.json();
      });

    Promise.all([
      fetchSummaries(previouosDate, 10, "previous-day"),
      fetchSummaries(currentDate, 5, "current-day"),
    ])
      .then(([previousDayNews, currentDayNews]) => {
        const previousDaySummaries = previousDayNews.summarizedArticles ?? [];
        const previousDaySummariesUrls = previousDayNews.urls ?? [];
        const currentDaySummaries = currentDayNews.summarizedArticles ?? [];
        const currentDaySummariesUrls = currentDayNews.urls ?? [];
        const allSummaries = [...currentDaySummaries, ...previousDaySummaries];
        const allUrls = [
          ...currentDaySummariesUrls,
          ...previousDaySummariesUrls,
        ];
        setSummaries(allSummaries);
        setUrls(allUrls);
      })
      .catch((error) => {
        console.error(
          `[summaries] failed to load summaries for ${category}:`,
          error instanceof Error ? error.message : error,
        );
        setLoadError(
          error instanceof Error ? error.message : "Failed to load summaries",
        );
      });
  }, [date]);

  return (
    <main className={styles["summaries-body"]}>
      <div className={styles["summaries-header"]}>
        <button onClick={() => setDate(date.subtract(1, "day"))}>
          <img src={previousDayBtn} alt="Previous Day" />
        </button>
        <div className={styles["summaries-details"]}>
          <h1 className={styles["category-name"]}>
            {category?.charAt(0).toUpperCase() + category?.slice(1)}
          </h1>
          <h2>{date.format("Do MMMM")}</h2>
          <h2>{date.format("YYYY")}</h2>
        </div>
        <button
          onClick={() => {
            if (date.isSame(dayjs(), "day")) {
              return;
            } else {
              setDate(date.add(1, "day"));
            }
          }}
        >
          <img src={nextDayBtn} alt="Next Day" />
        </button>
      </div>
      <hr className={styles["header-divider"]} />
      {summaries.length > 0 ? (
        summaries.map((summary, i) => (
          <>
            <a
              href={urls[i]}
              className={styles["articles-link"]}
              target="_blank"
              key={i}
            >
              <ReactMarkdown>{summary}</ReactMarkdown>
            </a>
            <hr className={styles["articles-divider"]} />
          </>
        ))
      ) : loadError ? (
        <p role="alert" className={styles["load-error"]}>
          Couldn’t load the summaries right now. Please try again.
        </p>
      ) : (
        <LoadingSkeleton />
      )}
    </main>
  );
}
