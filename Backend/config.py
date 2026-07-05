import os
from dotenv import load_dotenv

# Path to the .env file in the root directory (above Backend/)
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
load_dotenv(env_path)

class Config:
    # Security: Max upload size increased to 200MB for Video/Audio
    MAX_CONTENT_LENGTH = 200 * 1024 * 1024
    
    # API Keys & Secrets
    GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
    JWT_SECRET = os.environ.get("JWT_SECRET", "super-secret-dev-key-change-in-prod")
    
    # Base directory
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    
    # Upload and Converted directories
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'uploads')
    CONVERTED_FOLDER = os.path.join(BASE_DIR, 'converted')
    
    # Allowed Extensions for Phase 1a (Images, Video, Audio, Docs)
    ALLOWED_EXTENSIONS = {
        # Images
        'png', 'jpg', 'jpeg', 'webp', 'heic', 'svg',
        # Video
        'mp4', 'avi', 'mov', 'gif',
        # Audio
        'mp3', 'wav', 'aac', 'flac',
        # Documents
        'pdf', 'docx', 'pptx', 'xlsx', 'txt'
    }
    
    # Security: CORS Allowed Origins
    cors_env = os.environ.get("CORS_ORIGINS", "http://localhost:3000")
    CORS_ORIGINS = [origin.strip() for origin in cors_env.split(",")]
    
    # Create directories if they don't exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(CONVERTED_FOLDER, exist_ok=True)
