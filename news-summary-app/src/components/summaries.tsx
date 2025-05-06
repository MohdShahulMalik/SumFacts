import { useAuth0 } from "@auth0/auth0-react";
import { NewsCategory } from "../types.js";
import styles from "../styles/summaries.module.scss";
import { Link } from "react-router-dom";
import generalImg from "../assets/general.jpg";
import worldImg from "../assets/world.jpg";
import nationImg from "../assets/nation.jpg";
import businessImg from "../assets/business.jpg";
import technologyImg from "../assets/technology.jpg";
import sportsImg from "../assets/sports.jpg";
import scienceImg from "../assets/science.jpg";
import healthImg from "../assets/health.jpg";

export default function Summaries() {
    const newsCategories: NewsCategory[] = ["General", "World", "Nation", "Business", "Technology", "Sports", "Science", "Health"];
    const newsCategoriesDescription: string[] = ["Top daily stories", "Global news updates", "Local or national news", "Market and economy", "Tech and Innovation", "Games and athletes", "Discoveries and research", "Wellness and medicne"];

    const newsOptions: Record<NewsCategory, string> = Object.fromEntries(
        newsCategories.map((category, i): [NewsCategory, string] => [category, newsCategoriesDescription[i]])
    ) as Record<NewsCategory, string>;

    const categoryImages: Record<string, string> = {
        general: generalImg,
        world: worldImg,
        nation: nationImg,
        business: businessImg,
        technology: technologyImg,
        sports: sportsImg,
        science: scienceImg,
        health: healthImg
    };

    const { user, isLoading, logout } = useAuth0();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    return (
        <main className = {styles["summaries-body"]}>
            <div className  = {styles["user-header"]}>
                <img className = {styles["user-pfp"]} src = {user?.picture}/>
                <div className= {styles["user-interaction"]}>
                    <h2 className = {styles["user-name"]}>{user?.name}</h2>
                    <h3 className = {styles["user-message"]}>Stay Informed</h3>
                </div>
                <button className = {styles["logout"]} onClick = {() => logout({ logoutParams: {returnTo: `http://localhost:${import.meta.env.VITE_PORT}`} })}>Logout</button>
            </div>
            
            <p className = {styles["section-summary"]}>Summaries</p>
            <hr className = {styles["divider"]}/>

            <div className = {styles["news-categories"]}>
                <ul className = {styles["news-categories-list"]}>
                    {Object.entries(newsOptions).map(([category, description]) =>{
                        return (
                            <li key = {category} className = {styles["news-category"]}>
                                <Link to = {`/summaries/:${category.toLowerCase()}`} className = {styles["news-category-link"]}>
                                    <img className = {styles["news-category-img"]} src = {categoryImages[category.toLowerCase()]}/>
                                    <div className = {styles["news-category-detials"]}>
                                        <h3 className = {styles["news-category-name"]}>{category}</h3>
                                        <h4 className = {styles["news-category-description"]}>{description}</h4>
                                    </div>
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </main>
    );
}