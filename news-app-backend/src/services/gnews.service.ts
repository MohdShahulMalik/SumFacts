import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { ArticleUrls } from "../types.js";
import { httpsAgent } from "../config/app-config.js";

export async function fetchArticleUrls(
  dayjsDay: Dayjs,
  category: string,
  numNews: number,
): Promise<ArticleUrls> {
  const urls: ArticleUrls = [];

  const utcStartDate =
    dayjsDay.startOf("day").utc().format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";
  const utcEndDate = dayjsDay.isBefore(dayjs(), "day")
    ? dayjsDay.endOf("day").utc().format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z"
    : dayjs().utc().format("YYYY-MM-DDTHH:mm:ss.SSS") + "Z";

  // console.log(utcStartDate);
  // console.log(utcEndDate);

  const response = await axios.get(
    `https://gnews.io/api/v4/top-headlines?category=${category}&lang=en&country=in&max=${numNews}&from=${utcStartDate}&to=${utcEndDate}&apikey=${process.env.GNEWS_API_KEY}`,
    { httpsAgent },
  );
  const articles = response.data.articles;
  console.log(articles);
  for (const article of articles) {
    if (article && article.url) {
      urls.push(article.url);
    } else {
      console.log("skipped a url");
    }
  }

  return urls;
}
