from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from config import Config
from utils.db_manager import create_user, get_user_by_email, get_user_by_id, get_api_key_by_user
from utils.auth import require_jwt

auth_bp = Blueprint('auth', __name__)

def generate_token(user_id):
    """Generate a JWT token valid for 7 days."""
    payload = {
        'user_id': user_id,
        'exp': datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, Config.JWT_SECRET, algorithm='HS256')

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required.'}), 400
        
    email = data['email'].strip().lower()
    password = data['password']
    
    if len(password) < 6:
        return jsonify({'error': 'Password must be at least 6 characters.'}), 400
        
    # Securely hash the password
    password_hash = generate_password_hash(password, method='pbkdf2:sha256')
    
    user_id = create_user(email, password_hash)
    if not user_id:
        return jsonify({'error': 'Email is already registered.'}), 409
        
    token = generate_token(user_id)
    
    return jsonify({
        'message': 'Account created successfully.',
        'token': token
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'error': 'Email and password are required.'}), 400
        
    email = data['email'].strip().lower()
    password = data['password']
    
    user = get_user_by_email(email)
    
    # Check if user exists and password hash matches
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({'error': 'Invalid email or password.'}), 401
        
    token = generate_token(user['user_id'])
    
    return jsonify({
        'message': 'Logged in successfully.',
        'token': token
    }), 200

@auth_bp.route('/me', methods=['GET'])
@require_jwt
def get_me(user_id):
    """Get the current user's profile and active API key."""
    user = get_user_by_id(user_id)
    if not user:
        return jsonify({'error': 'User not found.'}), 404
        
    api_key_record = get_api_key_by_user(user_id)
    
    return jsonify({
        'email': user['email'],
        'api_key': api_key_record['api_key'] if api_key_record else None,
        'requests_today': api_key_record['requests_today'] if api_key_record else 0,
        'daily_limit': api_key_record['daily_limit'] if api_key_record else 5,
        'created_at': api_key_record['created_at'] if api_key_record else None,
        'last_used_date': api_key_record['last_used_date'] if api_key_record else None
    }), 200
