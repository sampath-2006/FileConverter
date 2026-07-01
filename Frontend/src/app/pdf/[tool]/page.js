'use client';

import { useState } from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import FileDropZone from '@/components/FileDropZone';
import ProgressTracker from '@/components/ProgressTracker';
import { mergePdfs, splitPdf, compressPdf, protectPdf, unlockPdf, redactPdf, signPdf } from '@/lib/api';
import { getPdfToolBySlug, PDF_TOOLS } from '@/lib/conversions';
import styles from './page.module.css';

export default function PdfToolLandingPage() {
  const { tool } = useParams();
  const config = getPdfToolBySlug(tool);

  const [files, setFiles] = useState([]);
  const [signature, setSignature] = useState([]); // For Sign tool
  const [fileB, setFileB] = useState([]); // For Compare tool

  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [words, setWords] = useState('');

  if (!config) {
    notFound();
  }

  // --- COMPARE TOOL SPECIAL UI ---
  if (config.tool === 'compare') {
    return (
      <section className="section">
        <div className={styles.hero}>
          <div className={styles.iconBadge}>{config.icon}</div>
          <h1 className={styles.headline}>{config.headline}</h1>
          <p className={styles.subtext}>{config.subtext}</p>
        </div>

        <div className={styles.compareGrid}>
          <div className={styles.compareColumn}>
            <h3>Document A</h3>
            <FileDropZone onFilesSelected={setFiles} accept=".pdf" label="Upload Version A" />
            {files.length > 0 && (
              <div className={styles.pdfViewer}>
                <iframe src={URL.createObjectURL(files[0])} className={styles.iframe} title="Doc A" />
              </div>
            )}
          </div>
          <div className={styles.compareColumn}>
            <h3>Document B</h3>
            <FileDropZone onFilesSelected={setFileB} accept=".pdf" label="Upload Version B" />
            {fileB.length > 0 && (
              <div className={styles.pdfViewer}>
                <iframe src={URL.createObjectURL(fileB[0])} className={styles.iframe} title="Doc B" />
              </div>
            )}
          </div>
        </div>
      </section>
    );
  }

  // --- OTHER TOOLS UI ---
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
      } else if (config.tool === 'protect') {
        data = await protectPdf(files[0], password);
      } else if (config.tool === 'unlock') {
        data = await unlockPdf(files[0], password);
      } else if (config.tool === 'redact') {
        data = await redactPdf(files[0], words, password || undefined);
      } else if (config.tool === 'sign') {
        if (signature.length === 0) throw new Error("Please upload a signature image");
        data = await signPdf(files[0], signature[0], password || undefined);
      }
      setJobId(data.job_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadName = `${config.tool}ed.pdf`;
  const otherTools = PDF_TOOLS.filter((t) => t.slug !== config.slug);

  return (
    <section className="section">
      <div className={styles.hero}>
        <div className={styles.iconBadge}>{config.icon}</div>
        <h1 className={styles.headline}>{config.headline}</h1>
        <p className={styles.subtext}>{config.subtext}</p>
      </div>

      <div className={styles.toolCard}>
        <FileDropZone
          onFilesSelected={setFiles}
          multiple={config.tool === 'merge'}
          accept=".pdf"
          label={config.tool === 'merge' ? 'Drop up to 10 PDFs here' : 'Drop your PDF here'}
          subtitle="Only .pdf files accepted"
        />

        {/* Second drop zone for Sign tool */}
        {config.tool === 'sign' && files.length > 0 && (
          <div style={{ marginTop: '1rem' }}>
            <FileDropZone
              onFilesSelected={setSignature}
              accept="image/png, image/jpeg"
              label="Drop your Signature Image here"
              subtitle="Only PNG or JPG accepted"
            />
          </div>
        )}

        {files.length > 0 && (
          <div className={styles.formArea}>
            {/* Split-specific fields */}
            {config.tool === 'split' && (
              <div className={styles.pageRange}>
                <div className="form-group">
                  <label className="form-label">Start Page</label>
                  <input type="number" className="form-input" value={startPage} onChange={(e) => setStartPage(e.target.value)} min="1" placeholder="1" />
                </div>
                <div className="form-group">
                  <label className="form-label">End Page</label>
                  <input type="number" className="form-input" value={endPage} onChange={(e) => setEndPage(e.target.value)} min="1" placeholder="5" />
                </div>
              </div>
            )}

            {/* Redact-specific fields */}
            {config.tool === 'redact' && (
              <div className="form-group">
                <label className="form-label">Words to Redact (comma-separated)</label>
                <textarea
                  className="form-input"
                  value={words}
                  onChange={(e) => setWords(e.target.value)}
                  placeholder="e.g. John Doe, 555-0199, Secret Project"
                  rows={3}
                />
              </div>
            )}

            {/* Password field */}
            <div className="form-group">
              <label className="form-label">
                {config.tool === 'protect' ? 'Set a Password' : config.tool === 'unlock' ? 'Current Password' : 'Password (optional if encrypted)'}
              </label>
              <input
                type="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={config.tool === 'protect' ? 'Enter new password' : config.tool === 'unlock' ? 'Enter current password' : 'Leave blank if not encrypted'}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleSubmit}
              disabled={loading || 
                (config.tool === 'split' && (!startPage || !endPage)) ||
                (config.tool === 'protect' && !password) ||
                (config.tool === 'unlock' && !password) ||
                (config.tool === 'redact' && !words) ||
                (config.tool === 'sign' && signature.length === 0)
              }
            >
              {loading ? '⏳ Processing...' : `${config.icon} ${config.headline}`}
            </button>
          </div>
        )}

        {error && <div className="error-message">⚠ {error}</div>}
        {jobId && <ProgressTracker jobId={jobId} downloadName={downloadName} />}
      </div>

      <div className={styles.otherTools}>
        <h2 className={styles.otherTitle}>Other PDF Tools</h2>
        <div className={styles.otherGrid}>
          {otherTools.map((t) => (
            <Link key={t.slug} href={`/pdf/${t.slug}`} className={styles.otherCard}>
              <span className={styles.otherIcon}>{t.icon}</span>
              <span className={styles.otherLabel}>{t.headline}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
