from flask import Flask
from flask_cors import CORS
from app.models import db, Settings
import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

# Load environment variables from .env file
load_dotenv()

def create_app():
    app = Flask(__name__)
    
    # Get the base directory (backend folder)
    basedir = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    
    # Create static folder (instance folder not needed for PostgreSQL)
    static_path = os.path.join(basedir, 'static')
    os.makedirs(static_path, exist_ok=True)
    
    # Configuration - PostgreSQL Database
    db_user = os.getenv('DB_USER', 'homeopathy_user')
    db_password = os.getenv('DB_PASSWORD', 'password')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '5432')
    db_name = os.getenv('DB_NAME', 'homeopathy_db')
    
    # URL-encode credentials to handle special characters
    db_user_encoded = quote_plus(db_user)
    db_password_encoded = quote_plus(db_password)
    
    app.config['SQLALCHEMY_DATABASE_URI'] = f'postgresql+psycopg://{db_user_encoded}:{db_password_encoded}@{db_host}:{db_port}/{db_name}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max upload
    
    # CORS setup for frontend
    CORS(app, resources={r"/api/*": {"origins": "http://localhost:5173"}})
    
    # Initialize database
    db.init_app(app)
    
    # Create tables and initialize default settings
    with app.app_context():
        db.create_all()
        
        # Initialize default settings if not exist
        default_settings = [
            ('clinic_name', 'Gayatri Homeo Clinic'),
            ('clinic_address', ''),
            ('clinic_contact', ''),
            ('clinic_email', ''),
            ('doctor_registration_number', ''),
            ('doctor_qualifications', ''),
            ('letterhead_path', '')
        ]
        
        for key, value in default_settings:
            existing = Settings.query.filter_by(key=key).first()
            if not existing:
                setting = Settings(key=key, value=value)
                db.session.add(setting)
        
        db.session.commit()
    
    # Register blueprints
    from app.routes import patients, visits, analytics, reports, settings
    app.register_blueprint(patients.bp)
    app.register_blueprint(visits.bp)
    app.register_blueprint(analytics.bp)
    app.register_blueprint(reports.bp)
    app.register_blueprint(settings.bp)
    
    return app
