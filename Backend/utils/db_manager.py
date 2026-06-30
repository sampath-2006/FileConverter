import sqlite3
import os
from config import Config

DB_PATH = os.path.join(Config.BASE_DIR, 'jobs.db')

def init_db():
    """Initialize the SQLite database for job tracking."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS jobs (
            job_id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            output_path TEXT,
            error_message TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

def create_job(job_id):
    """Create a new job with pending status and auto-clean old jobs."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # 1. Clean jobs older than 24 hours to prevent DB bloat
    cursor.execute("DELETE FROM jobs WHERE created_at <= datetime('now', '-1 day')")
    
    # 2. Insert the new job
    cursor.execute('''
        INSERT INTO jobs (job_id, status) VALUES (?, ?)
    ''', (job_id, 'pending'))
    
    conn.commit()
    conn.close()

def update_job_status(job_id, status, output_path=None, error_message=None):
    """Update a job's status and optional fields."""
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    if output_path:
        cursor.execute('UPDATE jobs SET status = ?, output_path = ? WHERE job_id = ?', (status, output_path, job_id))
    elif error_message:
        cursor.execute('UPDATE jobs SET status = ?, error_message = ? WHERE job_id = ?', (status, error_message, job_id))
    else:
        cursor.execute('UPDATE jobs SET status = ? WHERE job_id = ?', (status, job_id))
    conn.commit()
    conn.close()

def get_job(job_id):
    """Retrieve a job's details."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM jobs WHERE job_id = ?', (job_id,))
    job = cursor.fetchone()
    conn.close()
    return dict(job) if job else None

# Initialize the DB when this module is imported
init_db()
