import uuid
import os
from config import Config

def allowed_file(filename):
    """Check if the file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in Config.ALLOWED_EXTENSIONS

def generate_secure_filename(original_filename):
    """Generate a random UUID filename while keeping the original extension."""
    ext = original_filename.rsplit('.', 1)[1].lower()
    secure_name = f"{uuid.uuid4().hex}.{ext}"
    return secure_name
