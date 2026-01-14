from flask_login import current_user
from app.models import db, Patient, PatientAccess
from sqlalchemy import or_


def has_patient_access(patient_id, user_id=None):
    """
    Check if user has access to a patient record.
    User has access if they are:
    1. An admin (can access all patients)
    2. The creator of the patient
    3. Have been granted shared access
    
    Args:
        patient_id: ID of the patient
        user_id: ID of the user (defaults to current_user.id)
    
    Returns:
        Boolean indicating if user has access
    """
    if user_id is None:
        user_id = current_user.id
    
    # Check if user is admin - admins can access all patients
    from app.models import User
    user = User.query.get(user_id)
    if user and user.role == 'admin':
        return True
    
    patient = Patient.query.get(patient_id)
    if not patient:
        return False
    
    # Check if user is the creator
    if patient.created_by == user_id:
        return True
    
    # Check if user has shared access
    shared_access = PatientAccess.query.filter_by(
        patient_id=patient_id,
        user_id=user_id
    ).first()
    
    return shared_access is not None


def get_accessible_patients_query(user_id=None):
    """
    Get a query for all patients accessible to the user.
    Admins can access all patients.
    Doctors can access patients they created and patients shared with them.
    
    Args:
        user_id: ID of the user (defaults to current_user.id)
    
    Returns:
        SQLAlchemy query object
    """
    if user_id is None:
        user_id = current_user.id
    
    # Check if user is admin - return all patients
    from app.models import User
    user = User.query.get(user_id)
    if user and user.role == 'admin':
        return Patient.query
    
    # Get IDs of patients shared with the user
    shared_patient_ids = db.session.query(PatientAccess.patient_id).filter_by(
        user_id=user_id
    ).subquery()
    
    # Query for patients created by user OR shared with user
    query = Patient.query.filter(
        or_(
            Patient.created_by == user_id,
            Patient.id.in_(shared_patient_ids)
        )
    )
    
    return query


def grant_patient_access(patient_id, user_ids, comment=None, granted_by=None):
    """
    Grant access to a patient for multiple users.
    
    Args:
        patient_id: ID of the patient
        user_ids: List of user IDs to grant access to
        comment: Optional comment explaining why access was granted
        granted_by: ID of user granting access (defaults to current_user.id)
    
    Returns:
        List of created PatientAccess objects
    
    Raises:
        ValueError: If patient doesn't exist or granter doesn't have access
    """
    if granted_by is None:
        granted_by = current_user.id
    
    # Verify patient exists
    patient = Patient.query.get(patient_id)
    if not patient:
        raise ValueError("Patient not found")
    
    # Verify granter has access to the patient
    if not has_patient_access(patient_id, granted_by):
        raise ValueError("You don't have permission to share this patient")
    
    created_accesses = []
    
    for user_id in user_ids:
        # Skip if trying to grant access to self
        if user_id == patient.created_by:
            continue
        
        # Check if access already exists
        existing = PatientAccess.query.filter_by(
            patient_id=patient_id,
            user_id=user_id
        ).first()
        
        if not existing:
            access = PatientAccess(
                patient_id=patient_id,
                user_id=user_id,
                granted_by=granted_by,
                access_comment=comment
            )
            db.session.add(access)
            created_accesses.append(access)
    
    db.session.commit()
    return created_accesses


def revoke_patient_access(patient_id, user_id, revoked_by=None):
    """
    Revoke a user's access to a patient.
    Only the creator can revoke access.
    
    Args:
        patient_id: ID of the patient
        user_id: ID of user whose access should be revoked
        revoked_by: ID of user revoking access (defaults to current_user.id)
    
    Returns:
        Boolean indicating if access was revoked
    
    Raises:
        ValueError: If patient doesn't exist or user is not the creator
    """
    if revoked_by is None:
        revoked_by = current_user.id
    
    # Verify patient exists
    patient = Patient.query.get(patient_id)
    if not patient:
        raise ValueError("Patient not found")
    
    # Only creator can revoke access
    if patient.created_by != revoked_by:
        raise ValueError("Only the creator can revoke access")
    
    # Find and delete the access record
    access = PatientAccess.query.filter_by(
        patient_id=patient_id,
        user_id=user_id
    ).first()
    
    if access:
        db.session.delete(access)
        db.session.commit()
        return True
    
    return False


def get_patient_accessors(patient_id):
    """
    Get all users who have access to a patient.
    
    Args:
        patient_id: ID of the patient
    
    Returns:
        Dictionary with creator info and list of shared access records
    """
    patient = Patient.query.get(patient_id)
    if not patient:
        return None
    
    # Get shared access records
    shared_accesses = PatientAccess.query.filter_by(patient_id=patient_id).all()
    
    return {
        'creator': patient.creator.to_dict() if patient.creator else None,
        'created_by_id': patient.created_by,
        'shared_with': [access.to_dict() for access in shared_accesses]
    }
