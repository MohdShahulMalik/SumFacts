import twoMen from "../assets/two-men.png";
import styles from "../styles/about.module.scss";
import { useAuth0 } from "@auth0/auth0-react";
import Footer from "./footer";

export default function About(){
    const { loginWithRedirect } = useAuth0();

    return (
        <main className = {styles["about-body"]}>
            <h1>About</h1>
            <p className={styles["description"]}>Discover summaries of latest top news and fact check the things you hear online. In this fast pace world, staying updated and knowing the facts is difficult. SumFacts helps you cut through the noise by providing clear, concise summaries of news articles and verifying the truth behind claims</p>
            <div className = {styles["globe-img"]}></div>
            <h2>Our Mission</h2>
            <p>At SumFacts, we provide our users with accurate news summaries and fact-checking services to empower them with trustworthy information. In a time when misinformation spreads fast—especially on social media—we try to expose lies and bring out the truth. Our goal is to make a positive impact by helping people see that they can still trust someone, even in today’s world. We want to be that reliable friend who helps you cut through the noise and stay informed with facts that actually matter.</p>
            <hr className = {styles["divider"]}/>
            <div className = {styles["visual-description"]}>
                <span className = {styles["visual-description-text"]}>Let's stay informed today!</span>
                <img className = {styles["two-men-img"]} src = {twoMen} alt = "two men discussing news"/>
            </div>
            <div className = {styles["get-started-container"]}>
                <div className = {styles["get-started-description"]}>
                    <h1 className = {styles["get-started-heading"]}>Get Started with SumFacts today!</h1>
                    <p className = {styles["get-started-paragraph"]}>Start exploring news summaries and fact checking services today.</p>
                    <button className = {styles["sign-up-btn"]} onClick = {() => loginWithRedirect()}>Sign up now</button>
                </div>
                <div className = {styles["get-started-img"]}></div>
            </div>
            <Footer/>
        </main>
    );
}