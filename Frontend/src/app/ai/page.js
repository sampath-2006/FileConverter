'use client';

import { useState } from 'react';
import FileDropZone from '@/components/FileDropZone';
import ProgressTracker from '@/components/ProgressTracker';
import { summarizeDoc, extractData } from '@/lib/api';
import styles from './page.module.css';

const tabs = [
  { id: 'summarize', label: '📝 Summarize', desc: 'Get a detailed, professional summary of your document.' },
  { id: 'extract', label: '🔍 Extract Data', desc: 'Pull out key names, dates, organizations, and figures.' },
];

export default function AiPage() {
  const [activeTab, setActiveTab] = useState('summarize');
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resultText, setResultText] = useState(null);

  const reset = () => {
    setFile(null);
    setJobId(null);
    setError(null);
    setResultText(null);
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    reset();
  };

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
      if (activeTab === 'summarize') {
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

  return (
    <section className="section">
      <div className="page-header">
        <h1>AI Tools</h1>
        <p>Analyze your documents instantly with advanced AI models.</p>
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

        <div className={styles.supportedBadge}>
          Supports .pdf and .txt files
        </div>

        <FileDropZone
          onFilesSelected={handleFilesSelected}
          accept=".pdf,.txt"
          label="Drop your document here for AI analysis"
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
                : activeTab === 'summarize'
                  ? '🧠 Summarize Document'
                  : '🔍 Extract Data'}
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
    </section>
  );
}
