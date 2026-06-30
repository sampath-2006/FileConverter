'use client';

import { useState } from 'react';
import FileDropZone from '@/components/FileDropZone';
import ProgressTracker from '@/components/ProgressTracker';
import { mergePdfs, splitPdf, compressPdf } from '@/lib/api';
import styles from './page.module.css';

const tabs = [
  { id: 'merge', label: '📎 Merge', desc: 'Combine multiple PDFs into one' },
  { id: 'split', label: '✂️ Split', desc: 'Extract a range of pages' },
  { id: 'compress', label: '🗜️ Compress', desc: 'Reduce file size dramatically' },
];

export default function PdfPage() {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [password, setPassword] = useState('');
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');

  const reset = () => {
    setFiles([]);
    setJobId(null);
    setError(null);
    setPassword('');
    setStartPage('');
    setEndPage('');
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    reset();
  };

  const handleSubmit = async () => {
    if (files.length === 0) return;
    setLoading(true);
    setError(null);
    setJobId(null);

    try {
      let data;
      if (activeTab === 'merge') {
        data = await mergePdfs(files, password || undefined);
      } else if (activeTab === 'split') {
        data = await splitPdf(files[0], parseInt(startPage), parseInt(endPage), password || undefined);
      } else if (activeTab === 'compress') {
        data = await compressPdf(files[0], password || undefined);
      }
      setJobId(data.job_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadName = activeTab === 'merge'
    ? 'merged.pdf'
    : activeTab === 'split'
      ? 'split.pdf'
      : 'compressed.pdf';

  return (
    <section className="section">
      <div className="page-header">
        <h1>PDF Toolkit</h1>
        <p>Merge, split, and compress your PDFs with enterprise-grade security.</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => switchTab(tab.id)}
            id={`tab-${tab.id}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tool Card */}
      <div className={styles.toolCard}>
        <p className={styles.toolDesc}>
          {tabs.find((t) => t.id === activeTab)?.desc}
        </p>

        <FileDropZone
          onFilesSelected={setFiles}
          multiple={activeTab === 'merge'}
          accept=".pdf"
          label={
            activeTab === 'merge'
              ? 'Drop up to 10 PDFs here'
              : 'Drop your PDF here'
          }
        />

        {files.length > 0 && (
          <div className={styles.formArea}>
            {/* Split-specific fields */}
            {activeTab === 'split' && (
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

            {/* Password field (all tools) */}
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
              disabled={loading || (activeTab === 'split' && (!startPage || !endPage))}
              id="pdf-submit-btn"
            >
              {loading ? '⏳ Processing...' : `🚀 ${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} PDF`}
            </button>
          </div>
        )}

        {error && <div className="error-message">⚠ {error}</div>}
        {jobId && <ProgressTracker jobId={jobId} downloadName={downloadName} />}
      </div>
    </section>
  );
}
