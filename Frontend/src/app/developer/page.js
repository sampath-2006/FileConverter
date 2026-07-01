'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function DeveloperPage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('ff_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch('http://127.0.0.1:5000/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401) {
        localStorage.removeItem('ff_token');
        router.push('/login');
        return;
      }
      
      if (!res.ok) throw new Error('Failed to fetch profile');
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateKey = async () => {
    setGenerating(true);
    setError(null);
    const token = localStorage.getItem('ff_token');
    
    try {
      const res = await fetch('http://127.0.0.1:5000/api/v1/developer/generate-key', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate key');
      
      // Refresh profile to show new key
      await fetchProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const deleteKey = async () => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone and any apps using it will break.')) return;
    
    setGenerating(true);
    setError(null);
    const token = localStorage.getItem('ff_token');
    
    try {
      const res = await fetch('http://127.0.0.1:5000/api/v1/developer/key', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to revoke key');
      
      await fetchProfile();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };

  const formatKey = (key) => {
    if (!key) return '';
    return key.slice(0, 4) + '...' + key.slice(-4);
  };

  if (loading) {
    return (
      <section className="section" style={{ textAlign: 'center', paddingTop: '10vh' }}>
        <p>Loading API Keys...</p>
      </section>
    );
  }

  return (
    <section className="section" style={{ paddingTop: '5vh' }}>
      <div className={styles.hero}>
        <div className={styles.headerRow}>
          <div>
            <h1 className={styles.headline}>API Keys</h1>
            <p className={styles.subtext}>
              Manage your project API keys. Remember to keep your API keys safe to prevent unauthorized access.
            </p>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', padding: '0.5rem 1rem' }}
            onClick={generateKey}
            disabled={generating}
          >
            {generating ? 'Generating...' : '+ Create API Key'}
          </button>
        </div>
      </div>

      <div className={styles.dashboardContainer}>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>NAME</th>
                <th>SECRET KEY</th>
                <th>CREATED</th>
                <th>LAST USED</th>
                <th>EXPIRES</th>
                <th>USAGE (24HRS)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {profile?.api_key ? (
                <tr className={styles.tableRow}>
                  <td>default-key</td>
                  <td className={styles.monoText}>{formatKey(profile.api_key)}</td>
                  <td>{formatDate(profile.created_at)}</td>
                  <td>{formatDate(profile.last_used_date)}</td>
                  <td>Never</td>
                  <td>{profile.requests_today} API Calls</td>
                  <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                    <button className={`${styles.actionBtn} ${styles.delete}`} title="Revoke Key" onClick={deleteKey} disabled={generating}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="7">
                    <div className={styles.emptyState}>
                      <p>You have no active API keys.</p>
                      <button className="btn btn-primary" onClick={generateKey} disabled={generating} style={{ marginTop: '1rem' }}>
                        Generate your first key
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {error && <div style={{ padding: '1rem', color: '#ef4444', textAlign: 'center', background: 'rgba(239, 68, 68, 0.1)' }}>⚠ {error}</div>}
      </div>
    </section>
  );
}
