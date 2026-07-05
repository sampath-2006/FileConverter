'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.css';

export default function Navbar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState('dark');

  // Check auth state on load and route changes
  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('ff_token'));
    
    // Sync theme state with html attribute (set by layout.js script)
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    setTheme(currentTheme);
  }, [pathname]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('ff_theme', newTheme);
  };

  const handleLogout = () => {
    localStorage.removeItem('ff_token');
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <nav className={styles.navbar} id="main-nav">
      <div className={styles.container}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem', height: '100%' }}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>◆</span>
            <span className={styles.logoText}>FileForge</span>
          </Link>

          <div className={styles.links}>
            <Link href="/pdf" className={`${styles.link} ${pathname === '/pdf' ? styles.active : ''}`}>
              PDF TOOLS
            </Link>
            <Link href="/convert" className={`${styles.link} ${pathname === '/convert' ? styles.active : ''}`}>
              CONVERT
            </Link>

            {/* Mega Menu Dropdown */}
            <div className={styles.megaMenuWrapper}>
              <Link href="#" className={styles.link} style={{ cursor: 'default' }}>
                ALL TOOLS 
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginLeft: '4px' }}>
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </Link>
              
              <div className={styles.megaMenu}>
                {/* Column 1: Media Conversion */}
                <div className={styles.megaMenuColumn}>
                  <h4 className={styles.megaMenuTitle}>MEDIA CONVERSION</h4>
                  <ul className={styles.megaMenuLinks}>
                    <li><Link href="/convert/jpg" className={styles.megaMenuLink}><span className={styles.megaIcon}>🖼️</span> Image Converter</Link></li>
                    <li><Link href="/convert/mp4" className={styles.megaMenuLink}><span className={styles.megaIcon}>🎬</span> Video Converter</Link></li>
                    <li><Link href="/convert/mp3" className={styles.megaMenuLink}><span className={styles.megaIcon}>🎵</span> Audio Converter</Link></li>
                  </ul>
                </div>

                {/* Column 2: PDF Toolkit */}
                <div className={styles.megaMenuColumn}>
                  <h4 className={styles.megaMenuTitle}>PDF TOOLKIT</h4>
                  <ul className={styles.megaMenuLinks}>
                    <li><Link href="/pdf/merge" className={styles.megaMenuLink}><span className={styles.megaIcon}>🔗</span> Merge PDF</Link></li>
                    <li><Link href="/pdf/split" className={styles.megaMenuLink}><span className={styles.megaIcon}>✂️</span> Split PDF</Link></li>
                    <li><Link href="/pdf/compress" className={styles.megaMenuLink}><span className={styles.megaIcon}>🗜️</span> Compress PDF</Link></li>
                    <li><Link href="/pdf/protect" className={styles.megaMenuLink}><span className={styles.megaIcon}>🔒</span> Protect PDF</Link></li>
                    <li><Link href="/pdf/unlock" className={styles.megaMenuLink}><span className={styles.megaIcon}>🔓</span> Unlock PDF</Link></li>
                    <li><Link href="/pdf/sign" className={styles.megaMenuLink}><span className={styles.megaIcon}>✍️</span> Sign PDF</Link></li>
                  </ul>
                </div>

                {/* Column 3: AI Intelligence */}
                <div className={styles.megaMenuColumn}>
                  <h4 className={styles.megaMenuTitle}>AI INTELLIGENCE</h4>
                  <ul className={styles.megaMenuLinks}>
                    <li><Link href="/ai" className={styles.megaMenuLink}><span className={styles.megaIcon}>🧠</span> AI Summarizer</Link></li>
                    <li><Link href="/ai" className={styles.megaMenuLink}><span className={styles.megaIcon}>📊</span> Data Extractor</Link></li>
                  </ul>
                </div>

                {/* Column 4: Developers */}
                <div className={styles.megaMenuColumn}>
                  <h4 className={styles.megaMenuTitle}>DEVELOPERS</h4>
                  <ul className={styles.megaMenuLinks}>
                    <li><Link href="/developer" className={styles.megaMenuLink}><span className={styles.megaIcon}>🔑</span> API Dashboard</Link></li>
                    <li><Link href="/api-docs" className={styles.megaMenuLink}><span className={styles.megaIcon}>📚</span> API Documentation</Link></li>
                  </ul>
                </div>
              </div>
            </div>
            
          </div>
        </div>

        <div className={styles.rightSection}>
          {isLoggedIn ? (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <Link href="/developer" className={styles.loginBtn}>Dashboard</Link>
              <button onClick={handleLogout} className={styles.loginBtn} style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', color: 'var(--text-primary)' }}>Logout</button>
            </div>
          ) : (
            <>
              <Link href="/login" className={styles.loginBtn}>Login</Link>
              <Link href="/signup" className={styles.signupBtn}>Sign up</Link>
            </>
          )}
          <button className={styles.menuGrid} onClick={toggleTheme} title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}>
            {theme === 'light' ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>
          <button className={styles.menuGrid}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="7" cy="7" r="2.5" />
              <circle cx="17" cy="7" r="2.5" />
              <circle cx="7" cy="17" r="2.5" />
              <circle cx="17" cy="17" r="2.5" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
