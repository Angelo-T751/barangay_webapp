# app/services/document_generator.py
import os
from flask import current_app
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY

def generate_certificate_pdf(application_id, tracking_code):
    """
    Generates an official PDF certificate.
    Aligned completely with Jude's path standards and folder schema.
    """
    # 1. Replicate Jude's cross-platform path structure targeting a certificates folder
    upload_folder = os.path.join(current_app.root_path, 'static', 'uploads', 'certificates')
    os.makedirs(upload_folder, exist_ok=True)
    
    # Clean filename format
    filename = f"certificate_{tracking_code}.pdf"
    file_path = os.path.join(upload_folder, filename)
    
    # 2. Setup document canvas layout
    doc = SimpleDocTemplate(
        file_path, 
        pagesize=letter,
        rightMargin=54, leftMargin=54,
        topMargin=54, bottomMargin=54
    )
    story = []
    styles = getSampleStyleSheet()
    
    # Custom reportlab styles
    title_style = ParagraphStyle(
        'HeaderStyle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        alignment=TA_CENTER
    )
    
    body_style = ParagraphStyle(
        'BodyStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=18,
        alignment=TA_JUSTIFY
    )

    # 3. Document Building Block Elements
    story.append(Paragraph("REPUBLIC OF THE PHILIPPINES", title_style))
    story.append(Paragraph("OFFICE OF THE BARANGAY CHAIRMAN", title_style))
    story.append(Spacer(1, 25))
    story.append(Paragraph("<b>BARANGAY CLEARANCE</b>", title_style))
    story.append(Spacer(1, 30))
    
    text = f"This certifies that the application with tracking code <b>{tracking_code}</b> has " \
           f"successfully cleared all administrative record reviews and completed payment processing. " \
           f"This clearance certificate is generated digitally and issued for legitimate legal transactions."
           
    story.append(Paragraph(text, body_style))
    story.append(Spacer(1, 50))
    story.append(Paragraph("________________________<br/>Barangay Captain", title_style))
    
    # Render the layout file
    doc.build(story)
    
    # Return relative path format or absolute path depending on how frontend serves it
    # Returning unique filename to match Jude's pattern
    return filename, file_path
