'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import FileDropZone from '@/components/FileDropZone';
import ProgressTracker from '@/components/ProgressTracker';
import { summarizeDoc, extractData } from '@/lib/api';
import { getAiToolBySlug, AI_TOOLS } from '@/lib/conversions';
import styles from './page.module.css';

export default function AiToolLandingPage() {
  const { tool } = useParams();
  const config = getAiToolBySlug(tool);

  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultText, setResultText] = useState(null);

  if (!config) {
    notFound();
  }

  const handleFilesSelected = (files) => {
    setFile(files[0] || null);
    setJobId(null);
    setError(null);
    setResultText(null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setJobId(null);
    setResultText(null);

    try {
      let data;
      if (config.operation === 'summarize') {
        data = await summarizeDoc(file);
      } else {
        data = await extractData(file);
      }
      setJobId(data.job_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const otherTools = AI_TOOLS.filter((t) => t.slug !== config.slug);

  return (
    <section className="section">
      {/* Hero */}
      <div className={styles.hero}>
        <div className={styles.iconBadge}>{config.icon}</div>
        <h1 className={styles.headline}>{config.headline}</h1>
        <p className={styles.subtext}>{config.subtext}</p>
      </div>

      {/* Tool Card */}
      <div className={styles.toolCard}>
        <div className={styles.supportedBadge}>
          Optimized for {config.fileType} format
        </div>

        <FileDropZone
          onFilesSelected={handleFilesSelected}
          accept={config.acceptExt}
          label={`Drop your ${config.fileType} file here`}
          subtitle={`Only ${config.acceptExt} files accepted`}
        />

        {file && (
          <div className={styles.actions}>
            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading}
              id="ai-submit-btn"
            >
              {loading
                ? '⏳ Sending to AI...'
                : `${config.icon} ${config.operation === 'summarize' ? 'Summarize' : 'Extract Data'}`}
            </button>
          </div>
        )}

        {error && <div className="error-message">⚠ {error}</div>}

        {jobId && (
          <ProgressTracker
            jobId={jobId}
            showResultText={true}
            onComplete={(text) => setResultText(text)}
          />
        )}
      </div>

      {/* Other AI Tools */}
      <div className={styles.otherTools}>
        <h2 className={styles.otherTitle}>Other AI Tools</h2>
        <div className={styles.otherGrid}>
          {otherTools.map((t) => (
            <Link
              key={t.slug}
              href={`/ai/${t.slug}`}
              className={styles.otherCard}
            >
              <span className={styles.otherIcon}>{t.icon}</span>
              <span className={styles.otherLabel}>{t.headline}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
