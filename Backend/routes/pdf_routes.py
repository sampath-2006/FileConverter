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


@pdf_bp.route('/protect', methods=['POST'])
def protect_pdf_route():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
        
    file = request.files['file']
    password = request.form.get('password', None)
    
    if not file or not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Must be a valid PDF file'}), 400
        
    if not password:
        return jsonify({'error': 'Must provide a password to protect the PDF.'}), 400
        
    secure_name = generate_secure_filename(file.filename)
    upload_path = os.path.join(Config.UPLOAD_FOLDER, secure_name)
    file.save(upload_path)
    
    job_id = str(uuid.uuid4())
    create_job(job_id)
    
    output_filename = f"protected_{job_id}.pdf"
    output_path = os.path.join(Config.CONVERTED_FOLDER, output_filename)
    
    enqueue_pdf_job(job_id, 'protect', upload_path, output_path, password=password)
    
    return jsonify({'message': 'PDF protection started.', 'job_id': job_id}), 202


@pdf_bp.route('/unlock', methods=['POST'])
def unlock_pdf_route():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
        
    file = request.files['file']
    password = request.form.get('password', None)
    
    if not file or not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Must be a valid PDF file'}), 400
        
    if not password:
        return jsonify({'error': 'Must provide the current password to unlock the PDF.'}), 400
        
    secure_name = generate_secure_filename(file.filename)
    upload_path = os.path.join(Config.UPLOAD_FOLDER, secure_name)
    file.save(upload_path)
    
    job_id = str(uuid.uuid4())
    create_job(job_id)
    
    output_filename = f"unlocked_{job_id}.pdf"
    output_path = os.path.join(Config.CONVERTED_FOLDER, output_filename)
    
    enqueue_pdf_job(job_id, 'unlock', upload_path, output_path, password=password)
    
    return jsonify({'message': 'PDF unlock started.', 'job_id': job_id}), 202


@pdf_bp.route('/redact', methods=['POST'])
def redact_pdf_route():
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
        
    file = request.files['file']
    words = request.form.get('words', '')
    password = request.form.get('password', None)
    
    if not file or not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'Must be a valid PDF file'}), 400
        
    if not words:
        return jsonify({'error': 'Must provide a comma-separated list of words to redact.'}), 400
        
    secure_name = generate_secure_filename(file.filename)
    upload_path = os.path.join(Config.UPLOAD_FOLDER, secure_name)
    file.save(upload_path)
    
    job_id = str(uuid.uuid4())
    create_job(job_id)
    
    output_filename = f"redacted_{job_id}.pdf"
    output_path = os.path.join(Config.CONVERTED_FOLDER, output_filename)
    
    enqueue_pdf_job(job_id, 'redact', upload_path, output_path, words=words, password=password)
    
    return jsonify({'message': 'PDF redaction started.', 'job_id': job_id}), 202


@pdf_bp.route('/sign', methods=['POST'])
def sign_pdf_route():
    if 'file' not in request.files or 'signature' not in request.files:
        return jsonify({'error': 'Must provide both a PDF file and a signature image.'}), 400
        
    file = request.files['file']
    signature = request.files['signature']
    password = request.form.get('password', None)
    
    if not file or not file.filename.lower().endswith('.pdf'):
        return jsonify({'error': 'First file must be a valid PDF.'}), 400
        
    if not signature or not any(signature.filename.lower().endswith(ext) for ext in ['.png', '.jpg', '.jpeg']):
        return jsonify({'error': 'Signature must be a PNG or JPG image.'}), 400
        
    # Save both files
    pdf_secure_name = generate_secure_filename(file.filename)
    pdf_upload_path = os.path.join(Config.UPLOAD_FOLDER, pdf_secure_name)
    file.save(pdf_upload_path)
    
    sig_secure_name = generate_secure_filename(signature.filename)
    sig_upload_path = os.path.join(Config.UPLOAD_FOLDER, sig_secure_name)
    signature.save(sig_upload_path)
    
    job_id = str(uuid.uuid4())
    create_job(job_id)
    
    output_filename = f"signed_{job_id}.pdf"
    output_path = os.path.join(Config.CONVERTED_FOLDER, output_filename)
    
    # Pass both paths to the queue
    enqueue_pdf_job(job_id, 'sign', [pdf_upload_path, sig_upload_path], output_path, password=password)
    
    return jsonify({'message': 'PDF signing started.', 'job_id': job_id}), 202
