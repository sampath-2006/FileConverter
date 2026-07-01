import sqlite3
import os
from config import Config

DB_PATH = os.path.join(Config.BASE_DIR, 'jobs.db')

def init_db():
    """Initialize the SQLite database for job tracking."""
    conn = sqlite3.connect(DB_PATH, timeout=10)
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
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            user_id TEXT PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('DROP TABLE IF EXISTS api_keys')
    cursor.execute('''
        CREATE TABLE api_keys (
            api_key TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            tier TEXT DEFAULT 'free',
            requests_today INTEGER DEFAULT 0,
            daily_limit INTEGER DEFAULT 5,
            last_used_date TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(user_id) REFERENCES users(user_id)
        )
    ''')
    conn.commit()
    conn.close()

def create_job(job_id):
    """Create a new job with pending status and auto-clean old jobs."""
    conn = sqlite3.connect(DB_PATH, timeout=10)
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
    conn = sqlite3.connect(DB_PATH, timeout=10)
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
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM jobs WHERE job_id = ?', (job_id,))
    job = cursor.fetchone()
    conn.close()
    return dict(job) if job else None

# Initialize the DB when this module is imported
init_db()

import uuid
from datetime import date

def create_user(email, password_hash):
    """Create a new user. Returns user_id or None if email exists."""
    user_id = str(uuid.uuid4())
    conn = sqlite3.connect(DB_PATH, timeout=10)
    cursor = conn.cursor()
    try:
        cursor.execute('''
            INSERT INTO users (user_id, email, password_hash)
            VALUES (?, ?, ?)
        ''', (user_id, email, password_hash))
        conn.commit()
    except sqlite3.IntegrityError:
        user_id = None
    finally:
        conn.close()
    return user_id

def get_user_by_email(email):
    """Fetch user dict by email."""
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE email = ?', (email,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None
    
def get_user_by_id(user_id):
    """Fetch user dict by user_id."""
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM users WHERE user_id = ?', (user_id,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def get_api_key_by_user(user_id):
    """Get the active API key for a user."""
    conn = sqlite3.connect(DB_PATH, timeout=10)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM api_keys WHERE user_id = ?', (user_id,))
    key = cursor.fetchone()
    conn.close()
    return dict(key) if key else None

def generate_api_key(user_id, tier='free', limit=5):
    """Generate and store a new API key for a user (max 1)."""
    # First delete any existing keys for this user
    conn = sqlite3.connect(DB_PATH, timeout=10)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM api_keys WHERE user_id = ?', (user_id,))
    
    api_key = f"ff_{uuid.uuid4().hex}"
    cursor.execute('''
        INSERT INTO api_keys (api_key, user_id, tier, daily_limit)
        VALUES (?, ?, ?, ?)
    ''', (api_key, user_id, tier, limit))
    conn.commit()
    conn.close()
    return api_key

def delete_api_key(user_id):
    """Delete the API key for a user."""
    conn = sqlite3.connect(DB_PATH, timeout=10)
    cursor = conn.cursor()
    cursor.execute('DELETE FROM api_keys WHERE user_id = ?', (user_id,))
    conn.commit()
    conn.close()

def validate_and_increment_key(api_key):
    """
    Check if a key is valid and has not exceeded its daily limit.
    Returns (True, None) if valid.
    Returns (False, error_message) if invalid or rate-limited.
    """
    today = str(date.today())
    conn = sqlite3.connect(DB_PATH, timeout=10)
    cursor = conn.cursor()
    
    # 1. Check if key exists
    cursor.execute('SELECT * FROM api_keys WHERE api_key = ?', (api_key,))
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        return False, "Invalid API Key."
        
    tier, requests_today, daily_limit, last_used_date = row[2], row[3], row[4], row[5]
    
    # 2. Reset counter if it's a new day
    if last_used_date != today:
        requests_today = 0
        
    # 3. Check rate limit
    if requests_today >= daily_limit:
        conn.close()
        return False, f"Rate limit exceeded. Your key is limited to {daily_limit} requests per day."
        
    # 4. Increment usage
    cursor.execute('''
        UPDATE api_keys 
        SET requests_today = ?, last_used_date = ? 
        WHERE api_key = ?
    ''', (requests_today + 1, today, api_key))
    
    conn.commit()
    conn.close()
    
    return True, None
