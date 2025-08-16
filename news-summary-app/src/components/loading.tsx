import styles from "../styles/loading.module.scss";

export default function Loading() {
  return (
    <div className={styles.loading_container}>
      <div className={styles.spinner_inner}></div>
    </div>
  );
}
