from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from io import BytesIO
from datetime import datetime
import os

def generate_prescription_pdf(visit, patient, settings):
    """Generate prescription PDF"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    story = []
    styles = getSampleStyleSheet()
    
    # Header style
    header_style = ParagraphStyle(
        'CustomHeader',
        parent=styles['Heading1'],
        fontSize=16,
        textColor=colors.HexColor('#0d9488'),
        spaceAfter=6,
        alignment=TA_CENTER
    )
    
    # Clinic name
    clinic_name = settings.get('clinic_name', 'Gayatri Homeo Clinic')
    story.append(Paragraph(clinic_name, header_style))
    
    # Clinic details
    details_style = ParagraphStyle('Details', parent=styles['Normal'], fontSize=10, alignment=TA_CENTER)
    if settings.get('clinic_address'):
        story.append(Paragraph(settings['clinic_address'], details_style))
    if settings.get('clinic_contact'):
        story.append(Paragraph(f"Contact: {settings['clinic_contact']}", details_style))
    if settings.get('clinic_email'):
        story.append(Paragraph(f"Email: {settings['clinic_email']}", details_style))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Doctor qualifications
    if settings.get('doctor_qualifications'):
        story.append(Paragraph(f"Dr. {settings['doctor_qualifications']}", details_style))
    if settings.get('doctor_registration_number'):
        story.append(Paragraph(f"Reg. No: {settings['doctor_registration_number']}", details_style))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Horizontal line
    story.append(Spacer(1, 0.1*inch))
    
    # Prescription heading
    prescription_style = ParagraphStyle('Prescription', parent=styles['Heading2'], fontSize=14, spaceAfter=12)
    story.append(Paragraph("PRESCRIPTION", prescription_style))
    
    # Patient details
    patient_style = ParagraphStyle('Patient', parent=styles['Normal'], fontSize=11)
    story.append(Paragraph(f"<b>Patient Name:</b> {patient['full_name']}", patient_style))
    story.append(Paragraph(f"<b>Age:</b> {patient['age']} years &nbsp;&nbsp;&nbsp; <b>Gender:</b> {patient['gender']}", patient_style))
    story.append(Paragraph(f"<b>Date:</b> {visit['visit_date']}", patient_style))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Chief complaint
    story.append(Paragraph(f"<b>Chief Complaint:</b> {visit['chief_complaint']}", patient_style))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Prescription text
    prescription_text = visit.get('prescription', 'No prescription provided')
    story.append(Paragraph("<b>Prescription:</b>", patient_style))
    story.append(Spacer(1, 0.1*inch))
    
    # Format prescription with proper line breaks
    for line in prescription_text.split('\n'):
        if line.strip():
            story.append(Paragraph(line, patient_style))
    
    story.append(Spacer(1, 0.5*inch))
    
    # Doctor's signature
    signature_style = ParagraphStyle('Signature', parent=styles['Normal'], fontSize=11, alignment=TA_RIGHT)
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("_____________________", signature_style))
    story.append(Paragraph("Doctor's Signature", signature_style))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_certificate_pdf(patient, visits, rest_period, additional_notes, settings):
    """Generate medical certificate PDF"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    story = []
    styles = getSampleStyleSheet()
    
    # Add letterhead if exists
    letterhead_path = settings.get('letterhead_path', '')
    if letterhead_path and os.path.exists(letterhead_path):
        try:
            img = Image(letterhead_path, width=6*inch, height=2*inch)
            story.append(img)
            story.append(Spacer(1, 0.2*inch))
        except:
            pass
    
    # Header if no letterhead
    if not letterhead_path or not os.path.exists(letterhead_path):
        header_style = ParagraphStyle('Header', parent=styles['Heading1'], fontSize=18, alignment=TA_CENTER, textColor=colors.HexColor('#0d9488'))
        clinic_name = settings.get('clinic_name', 'Gayatri Homeo Clinic')
        story.append(Paragraph(clinic_name, header_style))
        
        details_style = ParagraphStyle('Details', parent=styles['Normal'], fontSize=10, alignment=TA_CENTER)
        if settings.get('clinic_address'):
            story.append(Paragraph(settings['clinic_address'], details_style))
        if settings.get('clinic_contact'):
            story.append(Paragraph(f"Contact: {settings['clinic_contact']}", details_style))
        
        story.append(Spacer(1, 0.3*inch))
    
    # Certificate title
    title_style = ParagraphStyle('Title', parent=styles['Heading1'], fontSize=16, alignment=TA_CENTER, spaceAfter=20)
    story.append(Paragraph("MEDICAL CERTIFICATE", title_style))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Certificate body
    body_style = ParagraphStyle('Body', parent=styles['Normal'], fontSize=12, spaceAfter=12)
    
    story.append(Paragraph("This is to certify that:", body_style))
    story.append(Spacer(1, 0.1*inch))
    
    story.append(Paragraph(f"<b>Patient Name:</b> {patient['full_name']}", body_style))
    story.append(Paragraph(f"<b>Age:</b> {patient['age']} years", body_style))
    story.append(Paragraph(f"<b>Gender:</b> {patient['gender']}", body_style))
    
    story.append(Spacer(1, 0.2*inch))
    
    # Visit dates
    visit_dates = [v['visit_date'] for v in visits]
    if len(visit_dates) == 1:
        story.append(Paragraph(f"Visited on: {visit_dates[0]}", body_style))
    else:
        story.append(Paragraph(f"Visited on: {', '.join(visit_dates)}", body_style))
    
    # Diagnosis
    diagnoses = [v.get('diagnosis', '') for v in visits if v.get('diagnosis')]
    if diagnoses:
        story.append(Paragraph(f"<b>Diagnosis:</b> {', '.join(diagnoses)}", body_style))
    
    # Treatment
    prescriptions = [v.get('prescription', '') for v in visits if v.get('prescription')]
    if prescriptions:
        story.append(Paragraph(f"<b>Treatment:</b> Homeopathic medication as prescribed", body_style))
    
    # Rest period
    if rest_period:
        story.append(Paragraph(f"<b>Advised Rest:</b> {rest_period}", body_style))
    
    # Additional notes
    if additional_notes:
        story.append(Spacer(1, 0.2*inch))
        story.append(Paragraph("<b>Additional Notes:</b>", body_style))
        story.append(Paragraph(additional_notes, body_style))
    
    story.append(Spacer(1, 0.5*inch))
    
    # Footer
    footer_style = ParagraphStyle('Footer', parent=styles['Normal'], fontSize=11)
    story.append(Paragraph(f"Date: {datetime.now().strftime('%Y-%m-%d')}", footer_style))
    story.append(Paragraph(f"Place: {settings.get('clinic_address', '')}", footer_style))
    
    story.append(Spacer(1, 0.5*inch))
    
    # Signature
    signature_style = ParagraphStyle('Signature', parent=styles['Normal'], fontSize=11, alignment=TA_RIGHT)
    story.append(Paragraph("_____________________", signature_style))
    story.append(Paragraph("Doctor's Signature", signature_style))
    if settings.get('doctor_registration_number'):
        story.append(Paragraph(f"Reg. No: {settings['doctor_registration_number']}", signature_style))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer


def generate_patient_report_pdf(patient, visits, settings):
    """Generate complete patient visit history report"""
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4)
    story = []
    styles = getSampleStyleSheet()
    
    # Header
    header_style = ParagraphStyle('Header', parent=styles['Heading1'], fontSize=16, alignment=TA_CENTER, textColor=colors.HexColor('#0d9488'))
    clinic_name = settings.get('clinic_name', 'Gayatri Homeo Clinic')
    story.append(Paragraph(clinic_name, header_style))
    story.append(Spacer(1, 0.1*inch))
    
    # Report title
    title_style = ParagraphStyle('Title', parent=styles['Heading2'], fontSize=14, alignment=TA_CENTER)
    story.append(Paragraph("PATIENT VISIT HISTORY REPORT", title_style))
    story.append(Spacer(1, 0.3*inch))
    
    # Patient overview
    patient_style = ParagraphStyle('Patient', parent=styles['Normal'], fontSize=11, spaceAfter=6)
    story.append(Paragraph(f"<b>Patient ID:</b> {patient['patient_id']}", patient_style))
    story.append(Paragraph(f"<b>Name:</b> {patient['full_name']}", patient_style))
    story.append(Paragraph(f"<b>Age:</b> {patient['age']} years", patient_style))
    story.append(Paragraph(f"<b>Gender:</b> {patient['gender']}", patient_style))
    story.append(Paragraph(f"<b>Contact:</b> {patient['contact_number']}", patient_style))
    
    if patient.get('allergies'):
        allergy_style = ParagraphStyle('Allergy', parent=styles['Normal'], fontSize=11, textColor=colors.red, spaceAfter=6)
        story.append(Paragraph(f"<b>ALLERGIES:</b> {patient['allergies']}", allergy_style))
    
    story.append(Spacer(1, 0.3*inch))
    
    # Visit history
    visit_style = ParagraphStyle('Visit', parent=styles['Normal'], fontSize=10, spaceAfter=10)
    story.append(Paragraph(f"<b>Total Visits:</b> {len(visits)}", patient_style))
    story.append(Spacer(1, 0.2*inch))
    
    # Individual visits
    for i, visit in enumerate(visits, 1):
        story.append(Paragraph(f"<b>Visit {i} - {visit['visit_date']}</b>", patient_style))
        story.append(Paragraph(f"<b>Chief Complaint:</b> {visit['chief_complaint']}", visit_style))
        
        if visit.get('symptoms'):
            story.append(Paragraph(f"<b>Symptoms:</b> {visit['symptoms']}", visit_style))
        
        if visit.get('examination_findings'):
            story.append(Paragraph(f"<b>Examination:</b> {visit['examination_findings']}", visit_style))
        
        if visit.get('diagnosis'):
            story.append(Paragraph(f"<b>Diagnosis:</b> {visit['diagnosis']}", visit_style))
        
        if visit.get('prescription'):
            story.append(Paragraph(f"<b>Prescription:</b> {visit['prescription']}", visit_style))
        
        if visit.get('doctor_notes'):
            story.append(Paragraph(f"<b>Notes:</b> {visit['doctor_notes']}", visit_style))
        
        story.append(Spacer(1, 0.2*inch))
    
    # Summary
    if visits:
        first_visit = visits[-1]['visit_date']
        last_visit = visits[0]['visit_date']
        story.append(Spacer(1, 0.3*inch))
        story.append(Paragraph(f"<b>Summary:</b> Total {len(visits)} visits from {first_visit} to {last_visit}", patient_style))
    
    # Build PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
