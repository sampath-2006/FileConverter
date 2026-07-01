from functools import wraps
from flask import request, jsonify
from utils.db_manager import validate_and_increment_key

def require_api_key(f):
    """
    Decorator to protect endpoints with an API key.
    Checks the 'X-API-Key' header.
    Validates the key and enforces the daily rate limit.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get('X-API-Key')
        
        if not api_key:
            return jsonify({'error': 'Unauthorized. Missing X-API-Key header.'}), 401
            
        is_valid, error_msg = validate_and_increment_key(api_key)
        
        if not is_valid:
            # If the error message mentions rate limit, return 429
            if 'Rate limit' in error_msg:
                return jsonify({'error': error_msg}), 429
            # Otherwise return 401 Unauthorized
            return jsonify({'error': error_msg}), 401
            
        return f(*args, **kwargs)
        
    return decorated_function

import jwt
from config import Config

def require_jwt(f):
    """
    Decorator to protect endpoints with a JWT.
    Checks the 'Authorization: Bearer <token>' header.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        
        if not auth_header or not auth_header.startswith('Bearer '):
            return jsonify({'error': 'Unauthorized. Missing or invalid Authorization header.'}), 401
            
        token = auth_header.split(' ')[1]
        
        try:
            payload = jwt.decode(token, Config.JWT_SECRET, algorithms=['HS256'])
            user_id = payload['user_id']
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Session expired. Please log in again.'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token. Please log in again.'}), 401
            
        # Pass user_id to the wrapped function
        return f(user_id, *args, **kwargs)
        
    return decorated_function
