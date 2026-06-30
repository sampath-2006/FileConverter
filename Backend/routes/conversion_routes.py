import os
import uuid
from flask import Blueprint, request, jsonify, send_file
from config import Config
from utils.security import allowed_file, generate_secure_filename
from utils.cleanup import cleanup_files
from utils.db_manager import create_job, get_job
from utils.job_queue import enqueue_job

conversion_bp = Blueprint('conversion', __name__)

@conversion_bp.route('/convert/file', methods=['POST'])
def convert_file_route():
    """
    Step 1: Upload the file and get a job ID immediately.
    """
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
    
    file = request.files['file']
    target_format = request.form.get('target_format', '').lower()

    if file.filename == '':
        return jsonify({'error': 'No file selected for uploading'}), 400
    
    if not target_format or target_format not in Config.ALLOWED_EXTENSIONS:
        return jsonify({'error': f'Invalid target format. Allowed: {Config.ALLOWED_EXTENSIONS}'}), 400

    if file and allowed_file(file.filename):
        secure_name = generate_secure_filename(file.filename)
        upload_path = os.path.join(Config.UPLOAD_FOLDER, secure_name)
        file.save(upload_path)
        
        output_filename = f"{secure_name.rsplit('.', 1)[0]}.{target_format}"
        output_path = os.path.join(Config.CONVERTED_FOLDER, output_filename)
        
        # Async Arch: Create a Job ID and put it in the database
        job_id = str(uuid.uuid4())
        create_job(job_id)
        
        # Hand off to the background worker
        enqueue_job(job_id, upload_path, output_path, target_format)
        
        # Return instantly
        return jsonify({
            'message': 'File uploaded and conversion started.',
            'job_id': job_id
        }), 202
    else:
        return jsonify({'error': 'File type not allowed'}), 400


@conversion_bp.route('/status/<job_id>', methods=['GET'])
def check_status(job_id):
    """
    Step 2: Frontend polls this route to check progress.
    """
    job = get_job(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
        
    response = {'job_id': job['job_id'], 'status': job['status']}
    
    if job['status'] == 'failed':
        response['error_message'] = job['error_message']
        
    return jsonify(response), 200


@conversion_bp.route('/download/<job_id>', methods=['GET'])
def download_file(job_id):
    """
    Step 3: Download the file once completed, and securely delete it.
    """
    job = get_job(job_id)
    if not job or job['status'] != 'completed' or not job['output_path']:
        return jsonify({'error': 'File not ready or job not found'}), 404
        
    output_path = job['output_path']
    upload_path = output_path.replace(Config.CONVERTED_FOLDER, Config.UPLOAD_FOLDER) # approximate upload path for cleanup
    
    # Actually, we need to know the upload path to clean it up perfectly. 
    # Let's derive it by matching the secure prefix.
    # The secure name prefix is the same for both.
    prefix = os.path.basename(output_path).rsplit('.', 1)[0]
    
    try:
        response = send_file(output_path, as_attachment=True)
        
        # Find the original uploaded file to clean it up too
        for file in os.listdir(Config.UPLOAD_FOLDER):
            if file.startswith(prefix):
                cleanup_files([os.path.join(Config.UPLOAD_FOLDER, file)])
                
        # Clean up the output file
        cleanup_files([output_path])
        
        return response
    except Exception as e:
        return jsonify({'error': str(e)}), 500
