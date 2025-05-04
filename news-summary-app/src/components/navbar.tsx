import { Link } from "react-router-dom";
import { Page, NavBarProp } from "../types.js";
import styles from "../styles/navbar.module.scss";

export default function NavBar({ position }: NavBarProp){
    const navPages: Page[] = ["Home", "Summaries", "Fact-Check", "About", "Contact"];

    return (
        <nav className = {styles[`${position}-nav`] }>
            <ul className = {styles[`${position}-nav-ul`]}>
                {navPages.map((page) => {
                    return (
                        <li className = {styles[`${position}-nav-li`]} key={page}><Link className = {styles[`${position}-nav-a`]} to={`/${page.toLowerCase()}`}>{page}</Link></li>
                    );
                })}
            </ul>
        </nav>
    );
}