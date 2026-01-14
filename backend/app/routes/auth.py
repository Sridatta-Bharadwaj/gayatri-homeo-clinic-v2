from flask import Blueprint, request, jsonify
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash
from datetime import datetime
from app import db
from app.models import User

bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@bp.route('/check-setup', methods=['GET'])
def check_setup():
    """Check if initial setup is needed"""
    user_count = User.query.count()
    return jsonify({'needs_setup': user_count == 0})

@bp.route('/setup', methods=['POST'])
def setup():
    """First-time setup: Create admin user"""
    # Check if setup already done
    if User.query.count() > 0:
        return jsonify({'error': 'Setup already completed'}), 400
    
    data = request.json
    
    # Validate input
    if not data.get('username') or not data.get('password') or not data.get('full_name'):
        return jsonify({'error': 'Username, password, and full name are required'}), 400
    
    if len(data['password']) < 8:
        return jsonify({'error': 'Password must be at least 8 characters'}), 400
    
    # Create admin user
    user = User(
        username=data['username'],
        password_hash=generate_password_hash(data['password'], method='pbkdf2:sha256'),
        full_name=data['full_name'],
        role='admin'
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Auto-login after setup
    login_user(user, remember=False)
    
    return jsonify({
        'message': 'Setup completed successfully',
        'user': user.to_dict()
    }), 201

@bp.route('/login', methods=['POST'])
def login():
    """Login endpoint"""
    data = request.json
    
    if not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password required'}), 400
    
    user = User.query.filter_by(username=data['username']).first()
    
    if not user or not user.check_password(data['password']):
        return jsonify({'error': 'Invalid username or password'}), 401
    
    if not user.is_active:
        return jsonify({'error': 'Account is disabled'}), 403
    
    # Update last login
    user.last_login = datetime.utcnow()
    db.session.commit()
    
    # Create session
    login_user(user, remember=False)
    
    return jsonify({
        'message': 'Login successful',
        'user': user.to_dict()
    }), 200

@bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Logout endpoint"""
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200

@bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    """Get current logged-in user"""
    return jsonify({'user': current_user.to_dict()}), 200

@bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """Change password for current user"""
    data = request.json
    
    if not data.get('old_password') or not data.get('new_password'):
        return jsonify({'error': 'Old and new passwords required'}), 400
    
    if not current_user.check_password(data['old_password']):
        return jsonify({'error': 'Current password is incorrect'}), 401
    
    if len(data['new_password']) < 8:
        return jsonify({'error': 'New password must be at least 8 characters'}), 400
    
    current_user.password_hash = generate_password_hash(data['new_password'], method='pbkdf2:sha256')
    db.session.commit()
    
    return jsonify({'message': 'Password changed successfully'}), 200
