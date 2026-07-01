'use client';

import Link from 'next/link';
import { PDF_TOOLS } from '@/lib/conversions';
import styles from './page.module.css';

export default function PdfHubPage() {
  return (
    <section className="section">
      {/* Floating background orbs */}
      <div className={styles.bgOrbs} aria-hidden="true">
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      <div className={styles.hero}>
        <div className={styles.badge}>🔥 {PDF_TOOLS.length} Pro Tools Available</div>
        <h1 className={styles.headline}>Every tool you need to work with PDFs in one place</h1>
        <p className={styles.subtext}>
          All are 100% FREE and easy to use! Merge, split, compress, protect, unlock, redact, and sign PDFs with just a few clicks.
        </p>
      </div>

      <div className={styles.grid}>
        {PDF_TOOLS.map((tool, i) => (
          <Link
            key={tool.slug}
            href={`/pdf/${tool.slug}`}
            className={styles.card}
            style={{
              '--icon-color': tool.color,
              '--icon-bg': `${tool.color}15`,
              '--card-delay': `${i * 0.06}s`,
            }}
          >
            <div className={styles.cardGlow} />
            <div className={styles.iconContainer}>
              {tool.icon}
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.cardTitle}>{tool.headline}</h3>
              <p className={styles.cardDesc}>{tool.subtext}</p>
            </div>
            <div className={styles.cardAction}>
              Open tool →
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
