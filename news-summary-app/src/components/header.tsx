import NavBar from "./navbar";
import logo from "../assets/logo.png";
import styles from "../styles/header.module.scss";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

export default function Header() {

    return (
        <header>
            <div className = {styles.logo}>
                <Link to = "/" className= {styles["logo-icon-link"]}><img className = {styles["logo-icon"]} src={logo} alt="Logo" /></Link>
                <Link to = "/" className = {styles["logo-name-link"]}><h3>SumFacts</h3></Link>
            </div>
            <nav className = {styles["desktop-nav"]}>
                <NavBar/>
            </nav>
            <nav className = {styles["mobile-nav"]}>
                <details className = {styles["mobile-nav-details"]}>
                    <summary className = {styles["mobile-nav-summary"]}>
                        <FontAwesomeIcon icon={faBars} />
                    </summary>
                    <NavBar />
                </details>
            </nav>
        </header>
    );
}