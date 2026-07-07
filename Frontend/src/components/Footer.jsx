'use client';
import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        {/* Brand Column */}
        <div className={styles.brandSection}>
          <div className={styles.brand}>
            <span className={styles.logo}>◆</span>
            <span className={styles.name}>FileForge</span>
          </div>
          <p className={styles.copy}>
            Premium file conversion platform powered by AI. Convert, compress, merge, and analyze files with lightning speed.
          </p>
        </div>

        {/* Product Column */}
        <div className={styles.column}>
          <h4 className={styles.colTitle}>PRODUCT</h4>
          <ul className={styles.linkList}>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/#feature-convert">Features</Link></li>
            <li><Link href="/pricing">Pricing</Link></li>
            <li><Link href="/convert">Tools</Link></li>
            <li><Link href="/faq">FAQ</Link></li>
          </ul>
        </div>

        {/* Resources Column */}
        <div className={styles.column}>
          <h4 className={styles.colTitle}>RESOURCES</h4>
          <ul className={styles.linkList}>
            <li><Link href="/download">FileForge Desktop</Link></li>
            <li><a href="/FileConverter.apk" download>Download Android App (.apk)</a></li>
            <li><Link href="/pdf/sign">FileForge Sign</Link></li>
            <li><Link href="/developer">FileForge API</Link></li>
            <li><Link href="/convert/jpg">FileForge IMG</Link></li>
          </ul>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.bottomBar}>
        <p className={styles.copy}>
          © {new Date().getFullYear()} FileForge. Built for speed, security, and intelligence.
        </p>
        <p className={styles.copy}>
          Designed and developed by {' '}
          <a 
            href="https://www.linkedin.com/in/sampath-kumar-ponduru-5aa694356/" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: '500' }}
          >
            Ponduru Sampath Kumar
          </a>
        </p>
      </div>
    </footer>
  );
}
