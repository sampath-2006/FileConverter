'use client';

import { useRef, useState } from 'react';
import styles from './FileDropZone.module.css';

/**
 * Reusable drag-and-drop file upload component.
 * @param {Object} props
 * @param {function} props.onFilesSelected - Callback with selected File[]
 * @param {boolean} [props.multiple=false] - Allow multiple files
 * @param {string} [props.accept] - Accept attribute e.g. ".pdf"
 * @param {string} [props.label] - Label text
 */
export default function FileDropZone({ onFilesSelected, multiple = false, accept, label, subtitle }) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const inputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      onFilesSelected(files);
    }
  };

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      setSelectedFiles(files);
      onFilesSelected(files);
    }
  };

  const removeFile = (index) => {
    const updated = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(updated);
    onFilesSelected(updated);
  };

  return (
    <div>
      <div
        className={`${styles.dropzone} ${isDragging ? styles.dragging : ''} ${selectedFiles.length > 0 ? styles.hasFiles : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        id="file-drop-zone"
      >
        <input
          ref={inputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleChange}
          className={styles.hiddenInput}
        />

        <div className={styles.content}>
          <div className={styles.icon}>
            {selectedFiles.length > 0 ? '✓' : '↑'}
          </div>
          <p className={styles.title}>
            {selectedFiles.length > 0
              ? `${selectedFiles.length} file${selectedFiles.length > 1 ? 's' : ''} selected`
              : label || 'Drop your file here or click to browse'}
          </p>
          <p className={styles.subtitle}>
            {selectedFiles.length > 0
              ? 'Click to change selection'
              : subtitle || 'Supports PDF, Images, Documents, Audio & Video'}
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className={styles.fileList}>
          {selectedFiles.map((file, i) => (
            <div key={i} className={styles.fileItem}>
              <span className={styles.fileName}>{file.name}</span>
              <span className={styles.fileSize}>
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </span>
              <button
                className={styles.removeBtn}
                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
