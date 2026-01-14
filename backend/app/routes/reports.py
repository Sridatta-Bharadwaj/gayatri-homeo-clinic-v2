from flask import Blueprint, request, send_file, jsonify
from flask_login import login_required
from app.models import db, Patient, Visit, Settings
from app.utils.pdf_generator import generate_prescription_pdf, generate_certificate_pdf, generate_patient_report_pdf

bp = Blueprint('reports', __name__, url_prefix='/api/reports')

def get_settings_dict():
    """Helper to get all settings as dictionary"""
    settings = Settings.query.all()
    return {s.key: s.value for s in settings}


@bp.route('/prescription/<int:visit_id>', methods=['POST'])
@login_required
def generate_prescription(visit_id):
    """Generate prescription PDF"""
    try:
        visit = Visit.query.get_or_404(visit_id)
        patient = Patient.query.get_or_404(visit.patient_id)
        settings = get_settings_dict()
        
        pdf_buffer = generate_prescription_pdf(visit.to_dict(), patient.to_dict(), settings)
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'prescription_{patient.patient_id}_{visit.visit_date}.pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/certificate', methods=['POST'])
@login_required
def generate_certificate():
    """Generate medical certificate PDF"""
    try:
        data = request.json
        patient_id = data['patient_id']
        visit_ids = data['visit_ids']
        rest_period = data.get('rest_period', '')
        additional_notes = data.get('additional_notes', '')
        
        patient = Patient.query.get_or_404(patient_id)
        visits = [Visit.query.get_or_404(vid).to_dict() for vid in visit_ids]
        settings = get_settings_dict()
        
        pdf_buffer = generate_certificate_pdf(
            patient.to_dict(),
            visits,
            rest_period,
            additional_notes,
            settings
        )
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'certificate_{patient.patient_id}.pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/patient/<int:patient_id>', methods=['POST'])
@login_required
def generate_patient_report(patient_id):
    """Generate patient visit history report PDF"""
    try:
        patient = Patient.query.get_or_404(patient_id)
        visits = Visit.query.filter_by(patient_id=patient_id).order_by(Visit.visit_date.desc()).all()
        settings = get_settings_dict()
        
        pdf_buffer = generate_patient_report_pdf(
            patient.to_dict(),
            [v.to_dict() for v in visits],
            settings
        )
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=f'patient_report_{patient.patient_id}.pdf'
        )
    except Exception as e:
        return jsonify({'error': str(e)}), 500
