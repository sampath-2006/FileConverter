import os
import uuid
from flask import Blueprint, request, jsonify, send_file
from config import Config
from utils.security import allowed_file, generate_secure_filename
from utils.db_manager import create_job, get_job, generate_api_key
from utils.job_queue import enqueue_job
from utils.auth import require_api_key, require_jwt

developer_bp = Blueprint('developer', __name__)

@developer_bp.route('/generate-key', methods=['POST'])
@require_jwt
def generate_key_route(user_id):
    """
    Endpoint for generating a Developer API key.
    Requires a valid JWT token.
    """
    api_key = generate_api_key(user_id=user_id, tier='free', limit=5)
    return jsonify({
        'message': 'API Key generated successfully.',
        'api_key': api_key,
        'tier': 'free',
        'daily_limit': 5
    }), 201

@developer_bp.route('/key', methods=['DELETE'])
@require_jwt
def delete_key_route(user_id):
    """
    Endpoint for revoking/deleting a Developer API key.
    Requires a valid JWT token.
    """
    from utils.db_manager import delete_api_key
    delete_api_key(user_id)
    return jsonify({
        'message': 'API Key revoked successfully.'
    }), 200

@developer_bp.route('/convert', methods=['POST'])
@require_api_key
def dev_convert_file():
    """Protected endpoint to convert a file."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in the request'}), 400
        
    file = request.files['file']
    target_format = request.form.get('target_format', '').lower()
    
    if not file or not target_format:
        return jsonify({'error': 'File and target_format are required.'}), 400
        
    if not allowed_file(file.filename):
        return jsonify({'error': 'File type not allowed or no file selected.'}), 400
        
    # Save uploaded file
    secure_name = generate_secure_filename(file.filename)
    upload_path = os.path.join(Config.UPLOAD_FOLDER, secure_name)
    file.save(upload_path)
    
    # Create job
    job_id = str(uuid.uuid4())
    create_job(job_id)
    
    # Setup output path
    output_filename = f"{job_id}.{target_format}"
    output_path = os.path.join(Config.CONVERTED_FOLDER, output_filename)
    
    # Enqueue background job
    enqueue_job(job_id, upload_path, output_path, target_format)
    
    return jsonify({
        'message': 'Conversion job created successfully.',
        'job_id': job_id,
        'status_url': f'/api/v1/developer/status/{job_id}'
    }), 202

@developer_bp.route('/status/<job_id>', methods=['GET'])
@require_api_key
def dev_job_status(job_id):
    """Protected endpoint to check job status."""
    job = get_job(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
        
    response = {
        'job_id': job['job_id'],
        'status': job['status'],
        'created_at': job['created_at']
    }
    
    if job['status'] == 'failed':
        response['error_message'] = job['error_message']
    elif job['status'] == 'completed':
        response['download_url'] = f'/api/v1/developer/download/{job_id}'
        
    return jsonify(response), 200

@developer_bp.route('/download/<job_id>', methods=['GET'])
@require_api_key
def dev_download_file(job_id):
    """Protected endpoint to download the converted file."""
    job = get_job(job_id)
    if not job:
        return jsonify({'error': 'Job not found'}), 404
        
    if job['status'] != 'completed' or not job['output_path']:
        return jsonify({'error': 'File is not ready yet'}), 400
        
    if not os.path.exists(job['output_path']):
        return jsonify({'error': 'File has been deleted from the server (24 hour retention policy)'}), 410
        
    return send_file(job['output_path'], as_attachment=True)
