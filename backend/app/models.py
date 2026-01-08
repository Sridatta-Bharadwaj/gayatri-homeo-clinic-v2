from datetime import datetime
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Patient(db.Model):
    __tablename__ = 'patients'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.String(20), unique=True, nullable=False, index=True)
    full_name = db.Column(db.String(200), nullable=False, index=True)
    date_of_birth = db.Column(db.Date, nullable=False)
    age = db.Column(db.Integer, nullable=False)
    gender = db.Column(db.String(20), nullable=False)
    contact_number = db.Column(db.String(20), nullable=False, index=True)
    email = db.Column(db.String(100))
    address = db.Column(db.Text)
    occupation = db.Column(db.Text)
    allergies = db.Column(db.Text)
    chronic_conditions = db.Column(db.Text)
    current_medications = db.Column(db.Text)
    family_history = db.Column(db.Text)
    emergency_contact_name = db.Column(db.Text)
    emergency_contact_number = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    visits = db.relationship('Visit', backref='patient', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'full_name': self.full_name,
            'date_of_birth': self.date_of_birth.isoformat() if self.date_of_birth else None,
            'age': self.age,
            'gender': self.gender,
            'contact_number': self.contact_number,
            'email': self.email,
            'address': self.address,
            'occupation': self.occupation,
            'allergies': self.allergies,
            'chronic_conditions': self.chronic_conditions,
            'current_medications': self.current_medications,
            'family_history': self.family_history,
            'emergency_contact_name': self.emergency_contact_name,
            'emergency_contact_number': self.emergency_contact_number,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }


class Visit(db.Model):
    __tablename__ = 'visits'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.Integer, db.ForeignKey('patients.id'), nullable=False, index=True)
    visit_date = db.Column(db.Date, nullable=False, index=True)
    chief_complaint = db.Column(db.Text, nullable=False)
    symptoms = db.Column(db.Text)
    examination_findings = db.Column(db.Text)
    diagnosis = db.Column(db.Text)
    prescription = db.Column(db.Text)
    follow_up_date = db.Column(db.Date)
    doctor_notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_edited_at = db.Column(db.DateTime, nullable=True)
    
    def to_dict(self):
        return {
            'id': self.id,
            'patient_id': self.patient_id,
            'visit_date': self.visit_date.isoformat() if self.visit_date else None,
            'chief_complaint': self.chief_complaint,
            'symptoms': self.symptoms,
            'examination_findings': self.examination_findings,
            'diagnosis': self.diagnosis,
            'prescription': self.prescription,
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'doctor_notes': self.doctor_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'last_edited_at': self.last_edited_at.isoformat() if self.last_edited_at else None
        }


class Settings(db.Model):
    __tablename__ = 'settings'
    
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    key = db.Column(db.String(100), unique=True, nullable=False)
    value = db.Column(db.Text)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'key': self.key,
            'value': self.value,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }
