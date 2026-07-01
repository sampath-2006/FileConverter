'use client';

import Link from 'next/link';
import { CONVERSION_MAP } from '@/lib/conversions';
import styles from './page.module.css';

// Helper to group conversions
const groupedConversions = CONVERSION_MAP.reduce((acc, curr) => {
  if (!acc[curr.category]) acc[curr.category] = [];
  acc[curr.category].push(curr);
  return acc;
}, {});

// Category icons and colors
const categoryMeta = {
  image: { icon: '🖼️', color: '#ec4899', title: 'Image Conversions', gradient: 'linear-gradient(135deg, #ec4899, #f472b6)' },
  video: { icon: '🎬', color: '#f59e0b', title: 'Video Conversions', gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)' },
  audio: { icon: '🎵', color: '#8b5cf6', title: 'Audio Conversions', gradient: 'linear-gradient(135deg, #8b5cf6, #a78bfa)' },
  document: { icon: '📄', color: '#3b82f6', title: 'Document Conversions', gradient: 'linear-gradient(135deg, #3b82f6, #60a5fa)' },
};

export default function ConvertHubPage() {
  const categoryOrder = ['document', 'image', 'video', 'audio'];
  const totalTools = CONVERSION_MAP.length;

  return (
    <section className="section">
      {/* Floating background orbs */}
      <div className={styles.bgOrbs} aria-hidden="true">
        <div className={styles.orb1} />
        <div className={styles.orb2} />
        <div className={styles.orb3} />
      </div>

      <div className={styles.hero}>
        <div className={styles.badge}>⚡ {totalTools}+ Formats Supported</div>
        <h1 className={styles.headline}>The Ultimate File Converter</h1>
        <p className={styles.subtext}>
          Convert images, videos, audio, and documents across {totalTools}+ formats. Fast, secure, and 100% free.
        </p>
      </div>

      <div className={styles.container}>
        {categoryOrder.map((category, catIndex) => {
          const tools = groupedConversions[category];
          if (!tools) return null;

          const meta = categoryMeta[category];

          return (
            <div
              key={category}
              className={styles.categorySection}
              style={{ '--stagger-delay': `${catIndex * 0.1}s` }}
            >
              <div className={styles.categoryHeader}>
                <div
                  className={styles.categoryBadge}
                  style={{ '--cat-color': meta.color, '--cat-gradient': meta.gradient }}
                >
                  <span className={styles.categoryIcon}>{meta.icon}</span>
                  <h2 className={styles.categoryTitle}>{meta.title}</h2>
                </div>
                <span className={styles.categoryCount}>{tools.length} tools</span>
              </div>

              <div className={styles.grid}>
                {tools.map((tool, i) => (
                  <Link
                    key={tool.slug}
                    href={`/convert/${tool.slug}`}
                    className={styles.card}
                    style={{
                      '--icon-color': meta.color,
                      '--icon-bg': `${meta.color}12`,
                      '--card-delay': `${i * 0.05}s`,
                    }}
                  >
                    <div className={styles.cardGlow} />
                    <div className={styles.iconContainer}>
                      <span className={styles.formatFrom}>{tool.from}</span>
                      <span className={styles.arrow}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                        </svg>
                      </span>
                      <span className={styles.formatTo}>{tool.to}</span>
                    </div>
                    <div className={styles.cardContent}>
                      <h3 className={styles.cardTitle}>{tool.headline}</h3>
                      <p className={styles.cardDesc}>{tool.subtext}</p>
                    </div>
                    <div className={styles.cardAction}>
                      Convert now →
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
