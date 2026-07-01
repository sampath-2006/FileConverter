import os
import json
import pytest
from utils.db_manager import create_job, update_job_status
from config import Config

def test_health_check(client):
    res = client.get('/health')
    assert res.status_code == 200
    assert res.json['status'] == 'healthy'

def test_convert_file_success(client, dummy_image, mocker):
    mocker.patch('routes.conversion_routes.enqueue_job')
    
    with open(dummy_image, 'rb') as f:
        data = {
            'file': (f, 'dummy.jpg'),
            'target_format': 'PNG'
        }
        res = client.post('/api/v1/convert/file', data=data)
        
    assert res.status_code == 202
    assert 'job_id' in res.json

def test_convert_file_no_file(client):
    res = client.post('/api/v1/convert/file', data={'target_format': 'PNG'})
    assert res.status_code == 400
    assert 'No file part' in res.json['error']

def test_convert_file_invalid_format(client, dummy_image):
    with open(dummy_image, 'rb') as f:
        data = {
            'file': (f, 'dummy.jpg'),
            'target_format': 'INVALID'
        }
        res = client.post('/api/v1/convert/file', data=data)
        
    assert res.status_code == 400
    assert 'Invalid target format' in res.json['error']

import uuid

def test_status_check(client):
    job_id = str(uuid.uuid4())
    create_job(job_id)
    
    res = client.get(f'/api/v1/status/{job_id}')
    assert res.status_code == 200
    assert res.json['status'] == 'pending'

def test_status_check_not_found(client):
    res = client.get('/api/v1/status/does_not_exist')
    assert res.status_code == 404

def test_download_file(client, dummy_image):
    job_id = str(uuid.uuid4())
    create_job(job_id)
    update_job_status(job_id, 'completed', output_path=dummy_image)
    
    # Must copy dummy_image to a path resembling UPLOAD_FOLDER so cleanup doesn't fail
    # We will mock cleanup to avoid issues
    
    res = client.get(f'/api/v1/download/{job_id}')
    # It might fail in `cleanup_files` if we don't mock it, let's see.
    assert res.status_code == 200
    assert res.headers['Content-Disposition']

def test_auth_developer_routes(client, mocker):
    # 1. Signup to get a JWT
    res1 = client.post('/api/v1/auth/signup', json={'email': 'test@test.com', 'password': 'password123'})
    assert res1.status_code == 201
    assert 'token' in res1.json
    token = res1.json['token']
    
    # Login just to test the route
    res_login = client.post('/api/v1/auth/login', json={'email': 'test@test.com', 'password': 'password123'})
    assert res_login.status_code == 200
    
    # Get ME
    res_me = client.get('/api/v1/auth/me', headers={'Authorization': f'Bearer {token}'})
    assert res_me.status_code == 200
    
    # 2. Generate API Key
    res2 = client.post('/api/v1/developer/generate-key', headers={'Authorization': f'Bearer {token}'})
    assert res2.status_code == 201
    assert 'api_key' in res2.json
    api_key = res2.json['api_key']
    
    # 3. Test Developer Conversion Route (requires API key)
    mocker.patch('routes.developer_routes.enqueue_job')
    
    from io import BytesIO
    data = {
        'file': (BytesIO(b"dummy"), 'test.jpg'),
        'target_format': 'PNG'
    }
    
    res3 = client.post('/api/v1/developer/convert', data=data, headers={'X-API-KEY': api_key})
    assert res3.status_code == 202
    assert 'job_id' in res3.json
    job_id = res3.json['job_id']
    
    # 4. Test Developer Status Route
    res4 = client.get(f'/api/v1/developer/status/{job_id}', headers={'X-API-KEY': api_key})
    assert res4.status_code == 200
    
    # 5. Test Developer Download Route
    res5 = client.get(f'/api/v1/developer/download/{job_id}', headers={'X-API-KEY': api_key})
    # Will fail 400 because file is not completed yet
    assert res5.status_code == 400
    
def test_pdf_routes(client, dummy_single_page_pdf, mocker):
    mocker.patch('routes.pdf_routes.enqueue_pdf_job')
    
    with open(dummy_single_page_pdf, 'rb') as f:
        data = {
            'file': (f, 'single.pdf'),
            'password': 'test'
        }
        res = client.post('/api/v1/pdf/compress', data=data)
        assert res.status_code == 202

def test_ai_routes(client, dummy_text_file, mocker):
    mocker.patch('routes.ai_routes.enqueue_ai_job')
    
    with open(dummy_text_file, 'rb') as f:
        data = {
            'file': (f, 'dummy.txt')
        }
        res = client.post('/api/v1/ai/summarize', data=data)
        assert res.status_code == 202
