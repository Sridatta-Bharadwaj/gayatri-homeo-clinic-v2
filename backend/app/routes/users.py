from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from werkzeug.security import generate_password_hash
from app import db
from app.models import User

bp = Blueprint('users', __name__, url_prefix='/api/users')


def admin_required(f):
    """Decorator to require admin role"""
    from functools import wraps
    
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.role != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function


@bp.route('/doctors', methods=['GET'])
@login_required
def get_doctors():
    """Get list of all doctors (for sharing dropdown)"""
    try:
        # Get all active users except current user
        doctors = User.query.filter(
            User.id != current_user.id,
            User.is_active == True
        ).all()
        
        return jsonify([{
            'id': doc.id,
            'username': doc.username,
            'full_name': doc.full_name,
            'role': doc.role
        } for doc in doctors]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('', methods=['GET'])
@login_required
@admin_required
def get_all_users():
    """Get all users (admin only)"""
    try:
        users = User.query.all()
        return jsonify([user.to_dict() for user in users]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('', methods=['POST'])
@login_required
@admin_required
def create_user():
    """Create new user (admin only)"""
    try:
        data = request.json
        
        # Validate input
        if not data.get('username') or not data.get('password') or not data.get('full_name'):
            return jsonify({'error': 'Username, password, and full name are required'}), 400
        
        if len(data['password']) < 8:
            return jsonify({'error': 'Password must be at least 8 characters'}), 400
        
        # Check if username already exists
        if User.query.filter_by(username=data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        # Create user
        user = User(
            username=data['username'],
            password_hash=generate_password_hash(data['password'], method='pbkdf2:sha256'),
            full_name=data['full_name'],
            role=data.get('role', 'doctor'),
            is_active=data.get('is_active', True)
        )
        
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'message': 'User created successfully',
            'user': user.to_dict()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:id>', methods=['PUT'])
@login_required
@admin_required
def update_user(id):
    """Update user (admin only)"""
    try:
        user = User.query.get_or_404(id)
        data = request.json
        
        # Update fields
        if 'full_name' in data:
            user.full_name = data['full_name']
        
        if 'role' in data:
            user.role = data['role']
        
        if 'is_active' in data:
            user.is_active = data['is_active']
        
        # Only update password if provided
        if 'password' in data and data['password']:
            if len(data['password']) < 8:
                return jsonify({'error': 'Password must be at least 8 characters'}), 400
            user.password_hash = generate_password_hash(data['password'], method='pbkdf2:sha256')
        
        db.session.commit()
        
        return jsonify({
            'message': 'User updated successfully',
            'user': user.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:id>', methods=['DELETE'])
@login_required
@admin_required
def delete_user(id):
    """Delete user (admin only)"""
    try:
        user = User.query.get_or_404(id)
        
        # Prevent deleting self
        if user.id == current_user.id:
            return jsonify({'error': 'Cannot delete your own account'}), 400
        
        # Prevent deleting last admin
        if user.role == 'admin':
            admin_count = User.query.filter_by(role='admin', is_active=True).count()
            if admin_count <= 1:
                return jsonify({'error': 'Cannot delete the last admin user'}), 400
        
        db.session.delete(user)
        db.session.commit()
        
        return jsonify({'message': 'User deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
