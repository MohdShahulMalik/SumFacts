import styles from "../styles/loading-skeleton.module.scss";

export default function LoadingSkeleton() {
    return (
        <>
            {
                Array.from({ length: 10 }).map((_, i) => (
                    <div className = {styles["skeleton-container"]} key = {i}> 
                        <p className = {styles["skeleton-heading"]}></p>
                        <ul className = {styles["skeleton-list"]}>
                            {
                                Array.from({ length: 5 }).map((_, j) => (
                                    <li className = {styles["skeleton-points"]} key = {j}></li>
                                ))
                            }
                        </ul>
                    </div>
                ))
            }
        </>
    )
}