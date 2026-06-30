import os
import uuid
from flask import Blueprint, request, jsonify
from config import Config
from utils.security import allowed_file, generate_secure_filename
from utils.db_manager import create_job
from utils.job_queue import enqueue_pdf_job

pdf_bp = Blueprint('pdf', __name__)

@pdf_bp.route('/merge', methods=['POST'])
def merge_pdfs_route():
    files = request.files.getlist('files')
    password = request.form.get('password', None)
    
    if not files or len(files) < 2:
        return jsonify({'error': 'Please provide at least 2 PDF files to merge.'}), 400
        
    if len(files) > 10:
        return jsonify({'error': 'Maximum of 10 files allowed per merge request to prevent memory exhaustion.'}), 400
        
    upload_paths = []
    
    for file in files:
        if file and allowed_file(file.filename) and file.filename.lower().endswith('.pdf'):
            secure_name = generate_secure_filename(file.filename)
            upload_path = os.path.join(Config.UPLOAD_FOLDER, secure_name)
            file.save(upload_path)
            upload_paths.append(upload_path)
        else:
            return jsonify({'error': 'All files must be valid PDFs.'}), 400
            
    job_id = str(uuid.uuid4())
    create_job(job_id)
    
    output_filename = f"merged_{job_id}.pdf"
    output_path = os.path.join(Config.CONVERTED_FOLDER, output_filename)
    
    enqueue_pdf_job(job_id, 'merge', upload_paths, output_path, password=password)
    
    return jsonify({
        'message': 'PDF merge started.',
        'job_id': job_id
    }), 202


@pdf_bp.route('/split', methods=['POST'])
def split_pdf_route():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
        
    file = request.files['file']
    start_page = request.form.get('start_page', type=int)
    end_page = request.form.get('end_page', type=int)
    password = request.form.get('password', None)
    
    if not file or not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Must be a valid PDF file'}), 400
        
    if start_page is None or end_page is None:
        return jsonify({'error': 'Must provide start_page and end_page'}), 400
        
    secure_name = generate_secure_filename(file.filename)
    upload_path = os.path.join(Config.UPLOAD_FOLDER, secure_name)
    file.save(upload_path)
    
    job_id = str(uuid.uuid4())
    create_job(job_id)
    
    output_filename = f"split_{job_id}.pdf"
    output_path = os.path.join(Config.CONVERTED_FOLDER, output_filename)
    
    enqueue_pdf_job(job_id, 'split', upload_path, output_path, start_page=start_page, end_page=end_page, password=password)
    
    return jsonify({
        'message': 'PDF split started.',
        'job_id': job_id
    }), 202


@pdf_bp.route('/compress', methods=['POST'])
def compress_pdf_route():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
        
    file = request.files['file']
    password = request.form.get('password', None)
    
    if not file or not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Must be a valid PDF file'}), 400
        
    secure_name = generate_secure_filename(file.filename)
    upload_path = os.path.join(Config.UPLOAD_FOLDER, secure_name)
    file.save(upload_path)
    
    job_id = str(uuid.uuid4())
    create_job(job_id)
    
    output_filename = f"compressed_{job_id}.pdf"
    output_path = os.path.join(Config.CONVERTED_FOLDER, output_filename)
    
    enqueue_pdf_job(job_id, 'compress', upload_path, output_path, password=password)
    
    return jsonify({
        'message': 'PDF compression started.',
        'job_id': job_id
    }), 202
