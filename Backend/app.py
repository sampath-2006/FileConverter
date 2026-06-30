from flask import Flask, jsonify
from flask_cors import CORS
from config import Config
from routes.conversion_routes import conversion_bp
from routes.pdf_routes import pdf_bp
from routes.ai_routes import ai_bp
from utils.cleanup import startup_sweep

def create_app():
    app = Flask(__name__)
    
    # Run the startup sweep to clear zombie files
    startup_sweep()
    
    # 3. Cure Open CORS - Lock down to specific domains
    CORS(app, resources={r"/api/*": {"origins": Config.CORS_ORIGINS}})
    
    # Load configuration
    app.config.from_object(Config)
    
    # Enable CORS for frontend integration
    CORS(app)
    
    # Register blueprints
    app.register_blueprint(conversion_bp, url_prefix='/api/v1')
    app.register_blueprint(pdf_bp, url_prefix='/api/v1/pdf')
    app.register_blueprint(ai_bp, url_prefix='/api/v1/ai')
    
    # Global error handler for file size limit exceeded
    @app.errorhandler(413)
    def request_entity_too_large(error):
        return jsonify({'error': 'File is too large. Maximum allowed size is 10MB.'}), 413

    @app.route('/health', methods=['GET'])
    def health_check():
        return jsonify({'status': 'healthy', 'version': '1.0'}), 200

    return app

if __name__ == '__main__':
    app = create_app()
    # Run the app. Debug is True for development, but must be False for production.
    app.run(host='0.0.0.0', port=5000, debug=True)
