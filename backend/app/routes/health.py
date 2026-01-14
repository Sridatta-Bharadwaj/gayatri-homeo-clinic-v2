from flask import Blueprint, jsonify

health_bp = Blueprint('health', __name__)

@health_bp.route('/api/health', methods=['GET'])
def health_check():
    """
    Health check endpoint for Docker container monitoring.
    Returns a simple status response to verify the service is running.
    """
    return jsonify({"status": "healthy"}), 200
