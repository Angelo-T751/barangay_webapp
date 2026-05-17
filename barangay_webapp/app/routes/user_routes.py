from flask import Blueprint, render_template, request, redirect, url_for, session, render_template_string, current_app, jsonify, send_from_directory
from app.models.user import User
from app.models.application import Application, CertificateType, ApplicationDocument
from app.extensions import db
import re
import time
import uuid
import os
from datetime import datetime
from app.services.file_handler import save_proof_document

def is_valid_purpose(text):
    """Validates if a text looks like a real sentence (blocks gibberish)."""
    text = text.strip()
    
    # Must contain at least 3 letters in total
    if len(re.findall(r'[a-zA-Z]', text)) < 3:
        return False
        
    # 1. Reject single words that are abnormally long (e.g., > 14 chars)
    if any(len(word) > 14 for word in text.split()):
        return False
        
    # 2. If it's a longer sentence (>12 chars), it must have at least one space
    if len(text) > 12 and ' ' not in text:
        return False
        
    # 3. Reject common keyboard smashes (horizontal rows, both directions)
    smash_patterns = r'(qwer|wert|asdf|sdfg|dfgh|zxcv|xcvb|uiop|hjkl|poiu|lkjh|mnbv|fdsa|rewq)'
    if re.search(smash_patterns, text, re.IGNORECASE):
        return False
        
    # 4. Reject 5+ consecutive consonants (excluding y) or 5+ consecutive vowels
    if re.search(r'[bcdfghjklmnpqrstvwxz]{5,}', text, re.IGNORECASE):
        return False
    if re.search(r'[aeiou]{5,}', text, re.IGNORECASE):
        return False
        
    # 5. Reject 4+ repeating identical characters (e.g., aaaa, 1111)
    if re.search(r'(.)\1{3,}', text, re.IGNORECASE):
        return False
    return True

user_bp = Blueprint('user', __name__)

@user_bp.route('/index.html')
def user_index():
    """Renders the user dashboard/index page after successful login"""
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
        
    # Injecting a terminal debugging window directly from Python
    debug_html = """
    <div style="background-color: #1e1e1e; color: #00ff00; padding: 20px; font-family: 'Courier New', Courier, monospace; border-radius: 8px; margin: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.3); z-index: 9999; position: relative;">
        <h3 style="margin-top: 0; color: #ffffff; border-bottom: 1px solid #444; padding-bottom: 10px;">Terminal Debugging: Active Session</h3>
        <p style="margin: 5px 0;">> <span style="color: #888;">user_id:</span> {{ session.get('user_id', 'Not Set') }}</p>
        <p style="margin: 5px 0;">> <span style="color: #888;">resident_id:</span> {{ session.get('user_uuid', 'Not Set') }}</p>
        <p style="margin: 5px 0;">> <span style="color: #888;">user_type:</span> {{ session.get('user_type', 'Not Set') }}</p>
        <br>
        <p style="margin: 5px 0; color: #888;">> Raw Flask Session Dictionary:</p>
        <p style="margin: 5px 0; word-break: break-all;">{{ session | dictsort }}</p>
    </div>
    """
    
    rendered_debug = render_template_string(debug_html)
    original_html = render_template('user/index.html')
    
    if '</body>' in original_html:
        return original_html.replace('</body>', f'{rendered_debug}</body>')
    return original_html + rendered_debug

@user_bp.route('/apply', methods=['GET', 'POST'])
@user_bp.route('/apply.html', methods=['GET', 'POST'])
def apply():
    """Renders the application page and handles certificate requests"""
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
        
    current_user = User.query.get(session['user_id'])
    
    # Safety check: If the user was deleted from the DB but still has a session
    if not current_user:
        session.clear()
        return redirect(url_for('auth.login'))

    if request.method == 'POST':
        # Accept both cert_type or certType to match the frontend form name
        cert_type = request.form.get('certType', request.form.get('cert_type', '')).strip()
        purpose = request.form.get('purpose', '').strip()
        
        errors = []
        if not cert_type:
            errors.append("Please select a valid certificate type.")
        if not purpose or len(purpose) < 5:
            errors.append("Please provide a valid purpose (at least 5 characters).")
        elif not is_valid_purpose(purpose):
            errors.append("Please provide a meaningful purpose (no gibberish, excessive repeating characters).")
            
        # Handle File Upload
        files = request.files.getlist('document')
        if not files or all(f.filename == '' for f in files):
            errors.append("Please upload the required document(s).")
        
        saved_files = []
        for file in files:
            if file and file.filename != '':
                saved_filename, file_error = save_proof_document(file, current_user.user_uuid)
                if file_error:
                    errors.append(file_error)
                else:
                    saved_files.append((file, saved_filename))

        if errors:
            return render_template('user/apply.html', errors=errors, user=current_user)
            
        # 1. Get or create the Certificate Type record (to satisfy foreign key constraints)
        cert_type_record = CertificateType.query.filter_by(type_name=cert_type).first()
        if not cert_type_record:
            type_code = cert_type.upper().replace(' ', '_')
            cert_type_record = CertificateType(type_code=type_code, type_name=cert_type)
            db.session.add(cert_type_record)
            db.session.flush()
            
        # 2. Generate a secure, unique tracking code
        date_str = datetime.now().strftime('%Y%m%d')
        tracking_code = f"BRGY-{date_str}-{str(uuid.uuid4())[:4].upper()}"
        
        # 3. Save the core Application record
        new_application = Application(
            tracking_code=tracking_code,
            user_id=current_user.id,
            certificate_type_id=cert_type_record.id,
            purpose=purpose
        )
        db.session.add(new_application)
        db.session.flush() # Flush to grab the fresh new_application.id
        
        # 4. Save the Document Metadata records
        print(f"\n[UPLOAD SUCCESS] Saving files for Tracking Code: {tracking_code}")
        for file, saved_filename in saved_files:
            file_size = os.path.getsize(os.path.join(current_app.root_path, 'static', 'uploads', 'proofs', saved_filename))
            mime_type = file.mimetype if hasattr(file, 'mimetype') else 'application/octet-stream'
            
            new_document = ApplicationDocument(
                application_id=new_application.id,
                document_name=file.filename,
                document_path=f"uploads/proofs/{saved_filename}",
                file_size=file_size,
                mime_type=mime_type
            )
            db.session.add(new_document)
            print(f" -> Attached: {file.filename}")
        db.session.commit()
            
        return render_template('user/apply.html', user=current_user, tracking_code=tracking_code)
        
    return render_template('user/apply.html', user=current_user)

@user_bp.route('/document/<path:filepath>')
def serve_document(filepath):
    """Explicitly serve uploaded documents to bypass static folder configuration issues."""
    directory = os.path.join(current_app.root_path, 'static')
    return send_from_directory(directory, filepath)

@user_bp.route('/track', methods=['GET', 'POST'])
@user_bp.route('/track.html', methods=['GET', 'POST'])
def track():
    """Renders the track application page and handles search"""
    if 'user_id' not in session:
        return redirect(url_for('auth.login'))
        
    search_result = None
    error_message = None
    
    if request.method == 'POST':
        tracking_code = request.form.get('tracking_code', '').strip()
        if tracking_code:
            # Search case-insensitively. Since tracking codes are secure/random, anyone with the code can track it!
            search_result = Application.query.filter(Application.tracking_code.ilike(tracking_code)).first()
            
            if not search_result:
                error_message = "Tracking code does not exist in our records. Please check and try again."
                
    return render_template('user/track.html', application=search_result, error_message=error_message)

@user_bp.route('/api/track', methods=['POST'])
def api_track():
    """JSON API endpoint for the frontend Javascript to fetch tracking details"""
    data = request.get_json()
    if not data or 'tracking_code' not in data:
        return jsonify({"error": "Missing tracking code"}), 400
        
    tracking_code = data['tracking_code'].strip()
    print(f"\n[API TRACK] Searching for: {tracking_code}")
    
    # Search exactly (MySQL is case-insensitive by default)
    app = Application.query.filter_by(tracking_code=tracking_code).first()
    if not app:
        print(f"[API TRACK] ERROR: Code {tracking_code} not found in DB.")
        return jsonify({"error": "Application not found"}), 404
        
    user = User.query.get(app.user_id)
    docs = ApplicationDocument.query.filter_by(application_id=app.id).all()
    cert_type = CertificateType.query.get(app.certificate_type_id)
    
    print(f"[API TRACK] SUCCESS: Found application {app.tracking_code}")
    
    return jsonify({
        "trackingCode": app.tracking_code,
        "status": app.status or "Pending",
        "firstName": user.first_name if user else "N/A",
        "lastName": user.last_name if user else "N/A",
        "email": user.email if user else "N/A",
        "phone": user.phone if user else "N/A",
        "house": user.address.house_number if user and user.address else "",
        "street": user.address.street if user and user.address else "",
        "barangay": user.address.barangay if user and user.address else "",
        "city": user.address.city if user and user.address else "",
        "certType": cert_type.type_name if cert_type else "N/A",
        "purpose": app.purpose,
        "submittedAt": app.submitted_at.isoformat() if app.submitted_at else None,
        "files": [{"name": d.document_name, "path": url_for('user.serve_document', filepath=d.document_path.replace('\\', '/'))} for d in docs] if docs else [],
        "remarks": getattr(app, 'remarks', None)
    })