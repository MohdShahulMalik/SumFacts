import styles from "../styles/home.module.scss";
import "../styles/app.scss";
import summariesImg from "../assets/summaries.png";
import factCheckImg from "../assets/fact-check.png";
import timeSavingImg from "../assets/time-saving.png";
import { useAuth0 } from "@auth0/auth0-react";

export default function Home() {
  const { loginWithRedirect } = useAuth0();

  return (
    <main className={styles["home-body"]}>
      <div className={styles["app-description"]}>
        <h1 className={styles["tag"]}>Stay Informed, Save Time</h1>
        <h3 className={styles["extended-despricption"]}>
          SumFacts gives you short summaries of the top news stories from
          trusted sources, plus fact-checks on the claims you hear online.
          Read less. Miss nothing.
        </h3>
      </div>

      <button className={styles.login} onClick={() => loginWithRedirect()}>
        Get Started
      </button>

      <div className={styles["app-quick-descriptions"]}>
        <div
          className={`${styles["summary-description"]} ${styles["quick-description"]}`}
        >
          <img
            className={styles["quick-description-img"]}
            src={summariesImg}
            alt="summarize"
          />
          <h3>Summaries</h3>
          <h4>Short summaries of long news articles</h4>
        </div>

        <div
          className={`${styles["fact-check-description"]} ${styles["quick-description"]}`}
        >
          <img
            className={styles["quick-description-img"]}
            src={factCheckImg}
            alt="fact-check"
          />
          <h3>Fact Check</h3>
          <h4>Check whether a claim is actually true</h4>
        </div>

        <div
          className={`${styles["time-saving-description"]} ${styles["quick-description"]}`}
        >
          <img
            className={styles["quick-description-img"]}
            src={timeSavingImg}
            alt="save-time"
          />
          <h3>Save Time</h3>
          <h4>Stay informed in minutes, not hours</h4>
        </div>
      </div>
    </main>
  );
}
