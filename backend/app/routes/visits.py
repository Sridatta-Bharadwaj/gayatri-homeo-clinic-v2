from flask import Blueprint, request, jsonify
from flask_login import login_required
from app.models import db, Visit
from datetime import datetime

bp = Blueprint('visits', __name__, url_prefix='/api')

@bp.route('/patients/<int:patient_id>/visits', methods=['GET'])
@login_required
def get_patient_visits(patient_id):
    """Get all visits for a patient (newest first)"""
    try:
        visits = Visit.query.filter_by(patient_id=patient_id).order_by(Visit.visit_date.desc()).all()
        return jsonify([visit.to_dict() for visit in visits]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/visits/<int:id>', methods=['GET'])
@login_required
def get_visit(id):
    """Get single visit"""
    try:
        visit = Visit.query.get_or_404(id)
        return jsonify(visit.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/patients/<int:patient_id>/visits', methods=['POST'])
@login_required
def create_visit(patient_id):
    """Create new visit"""
    try:
        data = request.json
        
        visit = Visit(
            patient_id=patient_id,
            visit_date=datetime.strptime(data['visit_date'], '%Y-%m-%d').date(),
            chief_complaint=data['chief_complaint'],
            symptoms=data.get('symptoms'),
            examination_findings=data.get('examination_findings'),
            diagnosis=data.get('diagnosis'),
            prescription=data.get('prescription'),
            follow_up_date=datetime.strptime(data['follow_up_date'], '%Y-%m-%d').date() if data.get('follow_up_date') else None,
            doctor_notes=data.get('doctor_notes')
        )
        
        db.session.add(visit)
        db.session.commit()
        
        return jsonify(visit.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/visits/<int:id>', methods=['PUT'])
@login_required
def update_visit(id):
    """Update visit (sets last_edited_at)"""
    try:
        visit = Visit.query.get_or_404(id)
        data = request.json
        
        # Update fields
        if 'visit_date' in data:
            visit.visit_date = datetime.strptime(data['visit_date'], '%Y-%m-%d').date()
        if 'chief_complaint' in data:
            visit.chief_complaint = data['chief_complaint']
        if 'symptoms' in data:
            visit.symptoms = data['symptoms']
        if 'examination_findings' in data:
            visit.examination_findings = data['examination_findings']
        if 'diagnosis' in data:
            visit.diagnosis = data['diagnosis']
        if 'prescription' in data:
            visit.prescription = data['prescription']
        if 'follow_up_date' in data:
            visit.follow_up_date = datetime.strptime(data['follow_up_date'], '%Y-%m-%d').date() if data['follow_up_date'] else None
        if 'doctor_notes' in data:
            visit.doctor_notes = data['doctor_notes']
        
        # Set last_edited_at timestamp
        visit.last_edited_at = datetime.utcnow()
        visit.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify(visit.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
