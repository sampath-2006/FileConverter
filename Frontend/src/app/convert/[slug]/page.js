'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import FileDropZone from '@/components/FileDropZone';
import ProgressTracker from '@/components/ProgressTracker';
import { uploadFile } from '@/lib/api';
import { getConversionBySlug, CONVERSION_MAP } from '@/lib/conversions';
import styles from './page.module.css';

export default function ConversionLandingPage() {
  const { slug } = useParams();
  const config = getConversionBySlug(slug);

  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!config) {
    notFound();
  }

  const handleFilesSelected = (files) => {
    setFile(files[0] || null);
    setJobId(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setJobId(null);

    try {
      const data = await uploadFile(file, config.targetFormat);
      setJobId(data.job_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const outputName = file
    ? `${file.name.split('.')[0]}.${config.targetFormat}`
    : `converted.${config.targetFormat}`;

  // Get related conversions from same category (excluding current)
  const related = CONVERSION_MAP
    .filter((c) => c.category === config.category && c.slug !== config.slug)
    .slice(0, 4);

  return (
    <section className="section">
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.badge}>
          <span className={styles.badgeFrom}>{config.from}</span>
          <span className={styles.badgeArrow}>→</span>
          <span className={styles.badgeTo}>{config.to}</span>
        </div>
        <h1 className={styles.headline}>{config.headline}</h1>
        <p className={styles.subtext}>{config.subtext}</p>
      </div>

      {/* Converter Card */}
      <div className={styles.converterCard}>
        <FileDropZone
          onFilesSelected={handleFilesSelected}
          accept={config.fromExt}
          label={`Drop your ${config.from} file here`}
          subtitle={`Accepts ${config.fromExt} files — converts to ${config.to}`}
        />

        {file && (
          <div className={styles.actions}>
            <button
              className="btn btn-primary"
              onClick={handleConvert}
              disabled={loading}
              id="convert-btn"
            >
              {loading ? '⏳ Converting...' : `⚡ Convert to ${config.to}`}
            </button>
          </div>
        )}

        {error && <div className="error-message">⚠ {error}</div>}
        {jobId && <ProgressTracker jobId={jobId} downloadName={outputName} />}
      </div>

      {/* Related Conversions */}
      {related.length > 0 && (
        <div className={styles.related}>
          <h2 className={styles.relatedTitle}>Related Conversions</h2>
          <div className={styles.relatedGrid}>
            {related.map((item) => (
              <Link
                key={item.slug}
                href={`/convert/${item.slug}`}
                className={styles.relatedCard}
              >
                <span className={styles.relatedFrom}>{item.from}</span>
                <span className={styles.relatedArrow}>→</span>
                <span className={styles.relatedTo}>{item.to}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
