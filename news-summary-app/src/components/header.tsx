import NavBar from "./navbar";
import logo from "../assets/logo.png";
import styles from "../styles/header.module.scss";
import { Link } from "react-router-dom";

export default function Header() {

    return (
        <header>
            <div className = {styles.logo}>
                <Link to = "/home" className= {styles["logo-icon-link"]}><img className = {styles["logo-icon"]} src={logo} alt="Logo" /></Link>
                <Link to = "/home" className = {styles["logo-name-link"]}><h3>SumFacts</h3></Link>
            </div>
            <NavBar position = "header"/>
        </header>
    );
}