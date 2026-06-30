'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import FileDropZone from '@/components/FileDropZone';
import ProgressTracker from '@/components/ProgressTracker';
import { mergePdfs, splitPdf, compressPdf } from '@/lib/api';
import { getPdfToolBySlug, PDF_TOOLS } from '@/lib/conversions';
import styles from './page.module.css';

export default function PdfToolLandingPage() {
  const { tool } = useParams();
  const config = getPdfToolBySlug(tool);

  const [files, setFiles] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');

  if (!config) {
    notFound();
  }

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    setJobId(null);

    try {
      let data;
      if (config.tool === 'merge') {
        data = await mergePdfs(files, password || undefined);
      } else if (config.tool === 'split') {
        data = await splitPdf(files[0], parseInt(startPage), parseInt(endPage), password || undefined);
      } else if (config.tool === 'compress') {
        data = await compressPdf(files[0], password || undefined);
      }
      setJobId(data.job_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadName = `${config.tool}ed.pdf`;

  // Other PDF tools for the sidebar
  const otherTools = PDF_TOOLS.filter((t) => t.slug !== config.slug);

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
        <FileDropZone
          onFilesSelected={setFiles}
          multiple={config.tool === 'merge'}
          accept=".pdf"
          label={config.tool === 'merge' ? 'Drop up to 10 PDFs here' : 'Drop your PDF here'}
          subtitle="Only .pdf files accepted"
        />

        {files.length > 0 && (
          <div className={styles.formArea}>
            {/* Split-specific fields */}
            {config.tool === 'split' && (
              <div className={styles.pageRange}>
                <div className="form-group">
                  <label className="form-label">Start Page</label>
                  <input
                    type="number"
                    className="form-input"
                    value={startPage}
                    onChange={(e) => setStartPage(e.target.value)}
                    min="1"
                    placeholder="1"
                    id="start-page-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Page</label>
                  <input
                    type="number"
                    className="form-input"
                    value={endPage}
                    onChange={(e) => setEndPage(e.target.value)}
                    min="1"
                    placeholder="5"
                    id="end-page-input"
                  />
                </div>
              </div>
            )}

            {/* Password field */}
            <div className="form-group">
              <label className="form-label">Password (optional — for encrypted PDFs)</label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Leave blank if not encrypted"
                id="password-input"
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || (config.tool === 'split' && (!startPage || !endPage))}
              id="pdf-submit-btn"
            >
              {loading
                ? '⏳ Processing...'
                : `${config.icon} ${config.headline}`}
            </button>
          </div>
        )}

        {error && <div className="error-message">⚠ {error}</div>}
        {jobId && <ProgressTracker jobId={jobId} downloadName={downloadName} />}
      </div>

      {/* Other PDF Tools */}
      <div className={styles.otherTools}>
        <h2 className={styles.otherTitle}>Other PDF Tools</h2>
        <div className={styles.otherGrid}>
          {otherTools.map((t) => (
            <Link
              key={t.slug}
              href={`/pdf/${t.slug}`}
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
