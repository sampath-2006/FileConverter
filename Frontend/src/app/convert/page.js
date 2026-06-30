'use client';

import { useState } from 'react';
import FileDropZone from '@/components/FileDropZone';
import ProgressTracker from '@/components/ProgressTracker';
import { uploadFile } from '@/lib/api';
import styles from './page.module.css';

const formatGroups = {
  Images: ['png', 'jpg', 'jpeg', 'webp'],
  Video: ['mp4', 'avi', 'mov', 'gif'],
  Audio: ['mp3', 'wav', 'aac', 'flac'],
  Documents: ['pdf', 'docx', 'txt', 'xlsx'],
};

export default function ConvertPage() {
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('');
  const [jobId, setJobId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFilesSelected = (files) => {
    setFile(files[0] || null);
    setJobId(null);
    setError(null);
  };

  const handleConvert = async () => {
    if (!file || !targetFormat) return;
    setLoading(true);
    setError(null);
    setJobId(null);

    try {
      const data = await uploadFile(file, targetFormat);
      setJobId(data.job_id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const outputName = file
    ? `${file.name.split('.')[0]}.${targetFormat}`
    : 'converted-file';

  return (
    <section className="section">
      <div className="page-header">
        <h1>File Converter</h1>
        <p>Convert any file to any format — images, videos, audio, and documents.</p>
      </div>

      <div className={styles.converterCard}>
        <FileDropZone onFilesSelected={handleFilesSelected} />

        {file && (
          <div className={styles.options}>
            <div className="form-group">
              <label className="form-label">Convert to</label>
              <select
                className="form-select"
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                id="format-select"
              >
                <option value="">Select format...</option>
                {Object.entries(formatGroups).map(([group, formats]) => (
                  <optgroup key={group} label={group}>
                    {formats.map((fmt) => (
                      <option key={fmt} value={fmt}>
                        .{fmt.toUpperCase()}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleConvert}
              disabled={!targetFormat || loading}
              id="convert-btn"
            >
              {loading ? '⏳ Uploading...' : '⚡ Convert Now'}
            </button>
          </div>
        )}

        {error && <div className="error-message">⚠ {error}</div>}
        {jobId && <ProgressTracker jobId={jobId} downloadName={outputName} />}
      </div>
    </section>
  );
}
