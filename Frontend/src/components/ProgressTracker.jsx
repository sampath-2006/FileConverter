'use client';

import { useEffect, useState, useRef } from 'react';
import { pollStatus, downloadFile } from '@/lib/api';
import styles from './ProgressTracker.module.css';

/**
 * Polls the backend for job status and shows a progress bar + download button.
 * @param {Object} props
 * @param {string} props.jobId
 * @param {string} [props.downloadName] - Filename for the download
 * @param {function} [props.onComplete] - Called when job completes with response text (for AI)
 * @param {boolean} [props.showResultText] - If true, fetch result as text instead of download
 */
export default function ProgressTracker({ jobId, downloadName, onComplete, showResultText }) {
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState(null);
  const [resultText, setResultText] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;

    const poll = async () => {
      try {
        const data = await pollStatus(jobId);
        setStatus(data.status);

        if (data.status === 'completed') {
          clearInterval(intervalRef.current);
          if (showResultText) {
            // For AI results, fetch the text content
            const API_BASE = 'http://127.0.0.1:5000/api/v1';
            const res = await fetch(`${API_BASE}/download/${jobId}`);
            const text = await res.text();
            setResultText(text);
            onComplete?.(text);
          }
        } else if (data.status === 'failed') {
          clearInterval(intervalRef.current);
          setError(data.error_message || 'Processing failed.');
        }
      } catch (err) {
        clearInterval(intervalRef.current);
        setError(err.message);
      }
    };

    // Initial poll
    poll();
    // Poll every 1.5 seconds
    intervalRef.current = setInterval(poll, 1500);

    return () => clearInterval(intervalRef.current);
  }, [jobId]);

  const handleDownload = () => {
    downloadFile(jobId, downloadName);
  };

  return (
    <div className={styles.tracker} id="progress-tracker">
      {/* Status Indicator */}
      <div className={styles.statusRow}>
        <div className={`${styles.dot} ${styles[status]}`} />
        <span className={styles.statusLabel}>
          {status === 'pending' && 'Queued...'}
          {status === 'processing' && 'Processing your file...'}
          {status === 'completed' && 'Complete!'}
          {status === 'failed' && 'Failed'}
        </span>
      </div>

      {/* Progress Bar */}
      {(status === 'pending' || status === 'processing') && (
        <div className={styles.progressBar}>
          <div
            className={`${styles.progressFill} ${status === 'processing' ? styles.animating : ''}`}
          />
        </div>
      )}

      {/* Completed — Download or Text */}
      {status === 'completed' && !showResultText && (
        <button className="btn btn-success" onClick={handleDownload} id="download-btn">
          ⬇ Download File
        </button>
      )}

      {status === 'completed' && showResultText && resultText && (
        <div className="result-viewer">{resultText}</div>
      )}

      {/* Error */}
      {error && <div className="error-message">⚠ {error}</div>}
    </div>
  );
}
