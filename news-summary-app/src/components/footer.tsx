import styles from "../styles/footer.module.scss";

export default function Footer() {
    return (
            <footer className = {styles["app-footer"]}>
                <div className= {styles["footer-content"]}>
                    <hr className = {styles["divider"]}/>
                    <h3 className = {styles["app-name"]}>SumFacts</h3>
                    <span className = {styles["copyrights"]}>2025 &copy; SumFacts</span>
                    <span className = {styles["rights"]}>All rights reserves.</span>
                </div>
            </footer>
    );
}