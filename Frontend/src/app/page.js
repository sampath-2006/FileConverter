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
    description: 'Summarize documents and extract key data instantly using advanced AI.',
    href: '/ai',
    gradient: 'linear-gradient(135deg, #06b6d4, #10b981)',
  },
];

const stats = [
  { value: '50+', label: 'Formats Supported' },
  { value: '200MB', label: 'Max File Size' },
  { value: 'AI', label: 'AI Powered' },
  { value: '100%', label: 'Privacy Secured' },
];

export default function HomePage() {
  return (
    <>


      {/* Popular Conversions (SEO) */}
      <section className="section" style={{ paddingTop: '2rem' }}>
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

      {/* Developer Options */}
      <section className="section">
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Developer Options</h2>
          <p className={styles.sectionSubtitle}>
            Integrate our powerful conversion and AI engine directly into your own applications.
          </p>
        </div>
        
        <div className={`${styles.developerCard} glass-card`}>
          <div className={styles.developerContent}>
            <h3>Build with FileForge</h3>
            <p>
              Get a free API key with up to 5 conversions per day. 
              Access all image, video, audio, and PDF endpoints programmatically.
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: 'var(--text-secondary)' }}>
              <li>✅ Simple RESTful API</li>
              <li>✅ Secure JWT Authentication</li>
              <li>✅ Unlimited Free Sandbox Mode</li>
            </ul>
            <div className={styles.developerCta}>
              <Link href="/signup" className="btn btn-primary">Sign Up Free</Link>
              <Link href="/login" className="btn btn-secondary" style={{ marginLeft: '1rem' }}>Log In</Link>
              <Link href="/developer" className="btn" style={{ marginLeft: '1rem', background: 'rgba(255,255,255,0.05)' }}>Go to Dashboard</Link>
            </div>
          </div>
        </div>
      </section>


    </>
  );
}
