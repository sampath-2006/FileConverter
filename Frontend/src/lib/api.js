const API_BASE = 'http://127.0.0.1:5000/api/v1';

/**
 * Upload a file for conversion.
 * @param {File} file
 * @param {string} targetFormat
 * @returns {Promise<{job_id: string}>}
 */
export async function uploadFile(file, targetFormat) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('target_format', targetFormat);

  const res = await fetch(`${API_BASE}/convert/file`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Upload failed');
  }
  return res.json();
}

/**
 * Poll job status.
 * @param {string} jobId
 * @returns {Promise<{job_id: string, status: string, error_message?: string}>}
 */
export async function pollStatus(jobId) {
  const res = await fetch(`${API_BASE}/status/${jobId}`);
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Status check failed');
  }
  return res.json();
}

/**
 * Download a completed file.
 * @param {string} jobId
 * @param {string} [filename]
 */
export async function downloadFile(jobId, filename) {
  const res = await fetch(`${API_BASE}/download/${jobId}`);
  if (!res.ok) throw new Error('Download failed');

  let actualFilename = filename || 'converted-file';
  const disposition = res.headers.get('Content-Disposition');
  if (disposition && disposition.includes('filename=')) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      actualFilename = matches[1].replace(/['"]/g, '');
    }
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = actualFilename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Merge multiple PDF files.
 * @param {File[]} files
 * @param {string} [password]
 */
export async function mergePdfs(files, password) {
  const formData = new FormData();
  files.forEach((f) => formData.append('files', f));
  if (password) formData.append('password', password);

  const res = await fetch(`${API_BASE}/pdf/merge`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Merge failed');
  }
  return res.json();
}

/**
 * Split a PDF by page range.
 */
export async function splitPdf(file, startPage, endPage, password) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('start_page', startPage);
  formData.append('end_page', endPage);
  if (password) formData.append('password', password);

  const res = await fetch(`${API_BASE}/pdf/split`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Split failed');
  }
  return res.json();
}

/**
 * Compress a PDF file.
 */
export async function compressPdf(file, password) {
  const formData = new FormData();
  formData.append('file', file);
  if (password) formData.append('password', password);

  const res = await fetch(`${API_BASE}/pdf/compress`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Compression failed');
  }
  return res.json();
}

/**
 * AI Summarize a document.
 */
export async function summarizeDoc(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/ai/summarize`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Summarize failed');
  }
  return res.json();
}

/**
 * AI Extract data from a document.
 */
export async function extractData(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/ai/extract-data`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Extraction failed');
  }
  return res.json();
}

/**
 * Protect a PDF with a password.
 */
export async function protectPdf(file, password) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);

  const res = await fetch(`${API_BASE}/pdf/protect`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Protection failed');
  }
  return res.json();
}

/**
 * Unlock a PDF using a password.
 */
export async function unlockPdf(file, password) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('password', password);

  const res = await fetch(`${API_BASE}/pdf/unlock`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Unlock failed');
  }
  return res.json();
}

/**
 * Redact text from a PDF.
 */
export async function redactPdf(file, words, password) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('words', words);
  if (password) formData.append('password', password);

  const res = await fetch(`${API_BASE}/pdf/redact`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Redaction failed');
  }
  return res.json();
}

/**
 * Sign a PDF with an image signature.
 */
export async function signPdf(file, signature, password) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('signature', signature);
  if (password) formData.append('password', password);

  const res = await fetch(`${API_BASE}/pdf/sign`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Signing failed');
  }
  return res.json();
}

