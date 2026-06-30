import os
import uuid
from flask import Blueprint, request, jsonify
from config import Config
from utils.security import allowed_file, generate_secure_filename
from utils.db_manager import create_job
from utils.job_queue import enqueue_ai_job

ai_bp = Blueprint('ai', __name__)

def handle_ai_request(operation):
    """Helper function to handle file upload and enqueue AI job."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
        
    file = request.files['file']
    
    if not file or file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400
        
    ext = file.filename.rsplit('.', 1)[1].lower() if '.' in file.filename else ''
    
    # We only support text extraction from PDFs and TXTs right now
    if ext not in ['pdf', 'txt']:
        return jsonify({'error': 'AI processing currently only supports .pdf and .txt files.'}), 400
        
    secure_name = generate_secure_filename(file.filename)
    upload_path = os.path.join(Config.UPLOAD_FOLDER, secure_name)
    file.save(upload_path)
    
    job_id = str(uuid.uuid4())
    create_job(job_id)
    
    output_filename = f"{operation}_{job_id}.txt"
    output_path = os.path.join(Config.CONVERTED_FOLDER, output_filename)
    
    enqueue_ai_job(job_id, operation, upload_path, output_path)
    
    return jsonify({
        'message': f'AI {operation} started.',
        'job_id': job_id
    }), 202


@ai_bp.route('/summarize', methods=['POST'])
def summarize_route():
    return handle_ai_request('summarize')


@ai_bp.route('/extract-data', methods=['POST'])
def extract_data_route():
    return handle_ai_request('extract')
