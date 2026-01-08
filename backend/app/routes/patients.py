from flask import Blueprint, request, jsonify
from app.models import db, Patient, Visit
from datetime import datetime

bp = Blueprint('patients', __name__, url_prefix='/api/patients')

@bp.route('', methods=['GET'])
def get_patients():
    """List all patients with optional search and sort"""
    try:
        search = request.args.get('search', '')
        sort_by = request.args.get('sort_by', 'name')
        order = request.args.get('order', 'asc')
        
        query = Patient.query
        
        # Search filter
        if search:
            search_term = f'%{search}%'
            query = query.filter(
                db.or_(
                    Patient.full_name.ilike(search_term),
                    Patient.patient_id.ilike(search_term),
                    Patient.contact_number.ilike(search_term)
                )
            )
        
        # Sorting
        if sort_by == 'name':
            sort_column = Patient.full_name
        elif sort_by == 'id':
            sort_column = Patient.patient_id
        else:
            sort_column = Patient.created_at
        
        if order == 'desc':
            sort_column = sort_column.desc()
        
        patients = query.order_by(sort_column).all()
        
        # Add latest visit info to each patient
        result = []
        for patient in patients:
            patient_data = patient.to_dict()
            latest_visit = Visit.query.filter_by(patient_id=patient.id).order_by(Visit.visit_date.desc()).first()
            patient_data['latest_visit_date'] = latest_visit.visit_date.isoformat() if latest_visit else None
            result.append(patient_data)
        
        return jsonify(result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:id>', methods=['GET'])
def get_patient(id):
    """Get single patient with latest visit"""
    try:
        patient = Patient.query.get_or_404(id)
        latest_visit = Visit.query.filter_by(patient_id=id).order_by(Visit.visit_date.desc()).first()
        
        return jsonify({
            'patient': patient.to_dict(),
            'latest_visit': latest_visit.to_dict() if latest_visit else None
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@bp.route('', methods=['POST'])
def create_patient():
    """Create new patient with auto-generated patient_id"""
    try:
        data = request.json
        
        # Auto-generate patient_id
        last_patient = Patient.query.order_by(Patient.patient_id.desc()).first()
        if last_patient:
            last_num = int(last_patient.patient_id.split('-')[1])
            new_patient_id = f"P-{str(last_num + 1).zfill(3)}"
        else:
            new_patient_id = "P-001"
        
        # Parse date_of_birth
        dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        
        # Calculate age
        today = datetime.now().date()
        age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        
        patient = Patient(
            patient_id=new_patient_id,
            full_name=data['full_name'],
            date_of_birth=dob,
            age=age,
            gender=data['gender'],
            contact_number=data['contact_number'],
            email=data.get('email'),
            address=data.get('address'),
            occupation=data.get('occupation'),
            allergies=data.get('allergies'),
            chronic_conditions=data.get('chronic_conditions'),
            current_medications=data.get('current_medications'),
            family_history=data.get('family_history'),
            emergency_contact_name=data.get('emergency_contact_name'),
            emergency_contact_number=data.get('emergency_contact_number')
        )
        
        db.session.add(patient)
        db.session.commit()
        
        return jsonify(patient.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:id>', methods=['PUT'])
def update_patient(id):
    """Update patient information"""
    try:
        patient = Patient.query.get_or_404(id)
        data = request.json
        
        # Update fields
        if 'full_name' in data:
            patient.full_name = data['full_name']
        if 'date_of_birth' in data:
            dob = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
            patient.date_of_birth = dob
            # Recalculate age
            today = datetime.now().date()
            patient.age = today.year - dob.year - ((today.month, today.day) < (dob.month, dob.day))
        if 'gender' in data:
            patient.gender = data['gender']
        if 'contact_number' in data:
            patient.contact_number = data['contact_number']
        if 'email' in data:
            patient.email = data['email']
        if 'address' in data:
            patient.address = data['address']
        if 'occupation' in data:
            patient.occupation = data['occupation']
        if 'allergies' in data:
            patient.allergies = data['allergies']
        if 'chronic_conditions' in data:
            patient.chronic_conditions = data['chronic_conditions']
        if 'current_medications' in data:
            patient.current_medications = data['current_medications']
        if 'family_history' in data:
            patient.family_history = data['family_history']
        if 'emergency_contact_name' in data:
            patient.emergency_contact_name = data['emergency_contact_name']
        if 'emergency_contact_number' in data:
            patient.emergency_contact_number = data['emergency_contact_number']
        
        patient.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(patient.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500


@bp.route('/<int:id>', methods=['DELETE'])
def delete_patient(id):
    """Delete patient (cascades to visits)"""
    try:
        patient = Patient.query.get_or_404(id)
        db.session.delete(patient)
        db.session.commit()
        
        return jsonify({'message': 'Patient deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500
