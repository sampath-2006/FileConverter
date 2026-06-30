import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <span className={styles.logo}>◆</span>
          <span className={styles.name}>FileForge</span>
        </div>
        <p className={styles.copy}>
          © {new Date().getFullYear()} FileForge. Built for speed, security, and intelligence.
        </p>
      </div>
    </footer>
  );
}
