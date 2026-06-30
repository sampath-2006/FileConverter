import Link from 'next/link';
import { POPULAR_CONVERSIONS } from '@/lib/conversions';
import styles from './page.module.css';

const features = [
  {
    icon: '⚡',
    title: 'File Converter',
    description: 'Convert images, videos, audio, and documents between any format in seconds.',
    href: '/convert',
    gradient: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
  },
  {
    icon: '📄',
    title: 'PDF Toolkit',
    description: 'Merge, split, and compress PDFs with military-grade security. Password support included.',
    href: '/pdf',
    gradient: 'linear-gradient(135deg, #ec4899, #f59e0b)',
  },
  {
    icon: '🧠',
    title: 'AI Analysis',
    description: 'Summarize documents and extract key data using Llama 3.1 — powered by LangChain.',
    href: '/ai',
    gradient: 'linear-gradient(135deg, #06b6d4, #10b981)',
  },
];

const stats = [
  { value: '50+', label: 'Formats Supported' },
  { value: '200MB', label: 'Max File Size' },
  { value: 'AI', label: 'Llama 3.1 Powered' },
  { value: '100%', label: 'Privacy Secured' },
];

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span>✦</span> AI-Powered File Platform
          </div>
          <h1 className={styles.heroTitle}>
            Convert. Compress.
            <br />
            <span className={styles.heroGradient}>Analyze with AI.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            The premium file conversion platform that transforms your documents,
            images, and videos — then lets AI summarize them in seconds.
          </p>
          <div className={styles.heroCta}>
            <Link href="/convert" className="btn btn-primary" id="hero-cta-convert">
              Start Converting →
            </Link>
            <Link href="/ai" className="btn btn-secondary" id="hero-cta-ai">
              Try AI Tools
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats.map((stat, i) => (
            <div key={i} className={styles.statItem}>
              <span className={styles.statValue}>{stat.value}</span>
              <span className={styles.statLabel}>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="section">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Everything you need</h2>
          <p className={styles.sectionSubtitle}>
            Three powerful toolkits, one beautiful platform.
          </p>
        </div>

        <div className={`${styles.featuresGrid} stagger-children`}>
          {features.map((feature) => (
            <Link
              key={feature.title}
              href={feature.href}
              className={`${styles.featureCard} glass-card animate-fade-in-up`}
              id={`feature-${feature.href.slice(1)}`}
            >
              <div
                className={styles.featureIcon}
                style={{ background: feature.gradient }}
              >
                {feature.icon}
              </div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDesc}>{feature.description}</p>
              <span className={styles.featureArrow}>→</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Conversions (SEO) */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Popular Tools</h2>
          <p className={styles.sectionSubtitle}>Quick links to our most used converters.</p>
        </div>

        <div className={styles.popularGrid}>
          {POPULAR_CONVERSIONS.map((conv) => (
            <Link
              key={conv.slug}
              href={`/convert/${conv.slug}`}
              className={styles.popularCard}
            >
              <span className={styles.popularIcon}>{conv.icon}</span>
              <div className={styles.popularText}>
                <span className={styles.popularTitle}>{conv.from} to {conv.to}</span>
                <span className={styles.popularSubtitle}>Convert {conv.from} to {conv.to} format</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
