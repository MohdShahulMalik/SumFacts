import { Link } from "react-router-dom";
import { Page } from "../types.js";
import styles from "../styles/navbar.module.scss";
import stylesHeader from "../styles/header.module.scss";

export default function NavBar(){
    const navPages: Page[] = [ "Summaries", "Fact-Check", "About"];

    return (
        <ul className = {`${styles["header-nav-ul"]} ${stylesHeader["header-nav-ul"]}`}>
            <li className = {`${styles["header-nav-li"]} ${stylesHeader["header-nav-li"]}`} key = "Home"><Link className = {`${styles["header-nav-a"]} ${stylesHeader["header-nav-a"]}`} to = "/">Home</Link></li>
            {navPages.map((page) => {
                return (
                    <li className = {`${styles["header-nav-li"]} ${stylesHeader["header-nav-li"]}`} key={page}><Link className = {`${styles["header-nav-a"]} ${stylesHeader["header-nav-a"]}` } to={`/${page.toLowerCase()}`}>{page}</Link></li>
                );
            })}
        </ul>
    );
}