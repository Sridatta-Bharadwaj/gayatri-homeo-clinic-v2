from flask import Blueprint, jsonify
from flask_login import login_required
from app.models import db, Patient, Visit
from datetime import datetime, timedelta

bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@bp.route('/dashboard', methods=['GET'])
@login_required
def get_dashboard():
    """Get dashboard analytics"""
    try:
        # Total patients count
        total_patients = Patient.query.count()
        
        # Top 3 complaints from last 30 days
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_visits = Visit.query.filter(Visit.visit_date >= thirty_days_ago.date()).all()
        
        complaint_counts = {}
        for visit in recent_visits:
            complaint = visit.chief_complaint
            if complaint:
                complaint_counts[complaint] = complaint_counts.get(complaint, 0) + 1
        
        total_recent = len(recent_visits)
        top_complaints = []
        if total_recent > 0:
            top_3 = sorted(complaint_counts.items(), key=lambda x: x[1], reverse=True)[:3]
            top_complaints = [
                {
                    'complaint': complaint,
                    'count': count,
                    'percentage': round((count / total_recent) * 100, 1)
                }
                for complaint, count in top_3
            ]
        
        # Age distribution
        def get_age_group(age):
            if age < 19:
                return '0-18'
            elif age < 36:
                return '19-35'
            elif age < 51:
                return '36-50'
            elif age < 66:
                return '51-65'
            else:
                return '65+'
        
        patients = Patient.query.all()
        age_distribution = {'0-18': 0, '19-35': 0, '36-50': 0, '51-65': 0, '65+': 0}
        for patient in patients:
            group = get_age_group(patient.age)
            age_distribution[group] += 1
        
        return jsonify({
            'total_patients': total_patients,
            'top_complaints': top_complaints,
            'age_distribution': age_distribution
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
