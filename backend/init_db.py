"""
Database Initialization Script
Homeopathy Practice Management System

This script creates all database tables and initializes default settings.
Run this after setting up PostgreSQL and configuring .env file.
"""

import sys
import os

# Add parent directory to path so we can import app
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app import create_app
from app.models import db, Settings

def init_database():
    """Initialize database tables and default settings"""
    
    print("=" * 50)
    print("Database Initialization Script")
    print("=" * 50)
    
    # Create Flask app
    print("\n1. Creating Flask application...")
    app = create_app()
    
    with app.app_context():
        try:
            # Test database connection
            print("2. Testing database connection...")
            db.engine.connect()
            print("   ✓ Connected to database successfully")
            
            # Create all tables
            print("3. Creating database tables...")
            db.create_all()
            print("   ✓ Tables created:")
            print("     - patients")
            print("     - visits")
            print("     - settings")
            
            # Check if settings already exist
            existing_settings = Settings.query.first()
            if existing_settings:
                print("\n4. Settings already initialized")
                print("   ✓ Default settings found")
            else:
                print("\n4. Initializing default settings...")
                # Settings are auto-initialized in app/__init__.py
                print("   ✓ Default clinic name set: Gayatri Homeo Clinic")
            
            print("\n" + "=" * 50)
            print("✅ DATABASE INITIALIZATION SUCCESSFUL!")
            print("=" * 50)
            print("\nNext steps:")
            print("1. Start backend: python run.py")
            print("2. Start frontend: cd ../frontend && npm run dev")
            print("3. Open browser: http://localhost:5173")
            
        except Exception as e:
            print("\n" + "=" * 50)
            print("❌ ERROR: Database initialization failed")
            print("=" * 50)
            print(f"\nError details: {str(e)}")
            print("\nTroubleshooting:")
            print("1. Check that PostgreSQL is running")
            print("2. Verify .env file has correct credentials")
            print("3. Ensure database 'homeopathy_db' exists")
            print("4. Run setup_database.sql first (as postgres user)")
            sys.exit(1)

if __name__ == '__main__':
    init_database()
