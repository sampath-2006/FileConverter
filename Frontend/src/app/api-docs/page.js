import Link from 'next/link';
import styles from './page.module.css';

export const metadata = {
  title: 'API Documentation | FileForge',
  description: 'Learn how to integrate FileForge conversion APIs into your own applications.',
};

export default function ApiDocsPage() {
  return (
    <main className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>API Documentation</h1>
        <p className={styles.subtitle}>
          Integrate powerful file conversion capabilities directly into your applications using our REST API.
        </p>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>1. Authentication</h2>
        <p className={styles.text}>
          All API requests must be authenticated using an API Key. You can generate a key from your{' '}
          <Link href="/developer" className="text-primary hover:underline">API Dashboard</Link>.
        </p>
        <p className={styles.text}>
          Include the API key in the headers of your requests as an <code>Authorization</code> Bearer token:
        </p>
        <div className={styles.codeBlock}>
          <code>
{`Headers: {
  "Authorization": "Bearer YOUR_API_KEY_HERE"
}`}
          </code>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>2. Convert a File</h2>
        <p className={styles.text}>
          Upload a file to be converted to a specific format. This endpoint starts an asynchronous conversion job.
        </p>
        
        <div className={styles.endpoint}>
          <span className={styles.method}>POST</span>
          <span className={styles.url}>/api/v1/developer/convert</span>
        </div>

        <p className={styles.text}><strong>Form Data Payload:</strong></p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Field</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>file</code></td>
              <td>File (Binary)</td>
              <td>The file you want to convert. Max size: 200MB.</td>
            </tr>
            <tr>
              <td><code>target_format</code></td>
              <td>String</td>
              <td>The desired output format (e.g., <code>jpg</code>, <code>pdf</code>, <code>mp3</code>, <code>mp4</code>).</td>
            </tr>
          </tbody>
        </table>

        <br/>
        <p className={styles.text}><strong>Example Request (cURL):</strong></p>
        <div className={styles.codeBlock}>
          <code>
{`curl -X POST https://api.fileforge.com/api/v1/developer/convert \\
  -H "Authorization: Bearer YOUR_API_KEY_HERE" \\
  -F "file=@document.docx" \\
  -F "target_format=pdf"`}
          </code>
        </div>

        <p className={styles.text}><strong>Success Response (202 Accepted):</strong></p>
        <div className={styles.codeBlock}>
          <code>
{`{
  "message": "Conversion job started successfully.",
  "job_id": "550e8400-e29b-41d4-a716-446655440000"
}`}
          </code>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>3. Check Job Status</h2>
        <p className={styles.text}>
          Since conversions happen asynchronously, use the <code>job_id</code> returned from the conversion endpoint to poll for status.
        </p>
        
        <div className={styles.endpoint}>
          <span className={styles.method} style={{ background: '#3b82f6' }}>GET</span>
          <span className={styles.url}>/api/v1/developer/status/&lt;job_id&gt;</span>
        </div>

        <p className={styles.text}><strong>Success Response (200 OK):</strong></p>
        <div className={styles.codeBlock}>
          <code>
{`{
  "job_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "completed",
  "download_url": "/api/v1/developer/download/550e8400..."
}`}
          </code>
        </div>
        <p className={styles.text}>Possible statuses are: <code>pending</code>, <code>processing</code>, <code>completed</code>, <code>failed</code>.</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>4. Download Converted File</h2>
        <p className={styles.text}>
          Once the job status is <code>completed</code>, you can download the file using the provided download URL.
        </p>
        
        <div className={styles.endpoint}>
          <span className={styles.method} style={{ background: '#3b82f6' }}>GET</span>
          <span className={styles.url}>/api/v1/developer/download/&lt;job_id&gt;</span>
        </div>

        <p className={styles.text}>
          <strong>Note:</strong> This endpoint returns the actual binary file data. Ensure your HTTP client is configured to save the response body to a file.
        </p>
      </section>
    </main>
  );
}
