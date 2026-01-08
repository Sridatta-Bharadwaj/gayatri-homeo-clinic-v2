from flask import Blueprint, request, jsonify
from app.models import db, Settings
from werkzeug.utils import secure_filename
import os

bp = Blueprint('settings', __name__, url_prefix='/api/settings')

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@bp.route('', methods=['GET'])
def get_settings():
    """Get all settings as key-value object"""
    try:
        settings = Settings.query.all()
        result = {s.key: s.value for s in settings}
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<string:key>', methods=['PUT'])
def update_setting(key):
    """Update single setting"""
    try:
        data = request.json
        value = data.get('value', '')
        
        setting = Settings.query.filter_by(key=key).first()
        if setting:
            setting.value = value
        else:
            setting = Settings(key=key, value=value)
            db.session.add(setting)
        
        db.session.commit()
        return jsonify(setting.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/letterhead', methods=['POST'])
def upload_letterhead():
    """Upload letterhead image"""
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            # Save with fixed name for letterhead
            filepath = os.path.join('static', 'letterhead.png')
            file.save(filepath)
            
            # Update settings
            setting = Settings.query.filter_by(key='letterhead_path').first()
            if setting:
                setting.value = filepath
            else:
                setting = Settings(key='letterhead_path', value=filepath)
                db.session.add(setting)
            
            db.session.commit()
            return jsonify({'message': 'Letterhead uploaded successfully', 'path': filepath}), 200
        else:
            return jsonify({'error': 'Invalid file type. Only PNG and JPG allowed'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
