# app/routes/payment_routes.py
import os
from flask import Blueprint, request, jsonify, redirect
from app.extensions import db
# Fix: Imported ApplicationDocument to sync with Benjamin & Jude
from app.models.application import Application, ApplicationDocument 
from app.services.payment_service import PayMongoService
from app.services.document_generator import generate_certificate_pdf

payment_bp = Blueprint('payment', __name__, url_prefix='/payment')
paymongo_service = PayMongoService()

@payment_bp.route('/checkout/<int:app_id>', methods=['POST'])
def checkout(app_id):
    """Triggers the PayMongo billing link generation"""
    try:
        application = Application.query.get_or_404(app_id)
        payment_data = paymongo_service.create_payment_link(application.id)
        
        # NOTE: Once Benjamin gives you his Payment model, save the 
        # payment_data['checkout_session_id'] right here into the database!

        return redirect(payment_data['checkout_url'])
    except Exception as e:
        return jsonify({"error": str(e)}), 400


@payment_bp.route('/webhook', methods=['POST'])
def paymongo_webhook():
    """Triggered directly by PayMongo servers on complete transaction"""
    payload = request.get_json()
    event_type = payload.get('data', {}).get('attributes', {}).get('type')
    
    if event_type == "checkout_session.paid":
        data_object = payload['data']['attributes']['data']['object']
        reference_number = data_object['reference_number'] # e.g. BRGY-2026-XXXX

        # 1. Fetch application matching Benjamin's unique tracking_code
        application = Application.query.filter_by(tracking_code=reference_number).first()
        
        if application:
            # 2. Update status workflows (Discuss with Angelo)
            application.status = 'approved'
            application.pickup_status = 'ready' 
            
            # 3. Fix: Call generator using BOTH parameters so it matches your document service
            filename, absolute_path = generate_certificate_pdf(application.id, application.tracking_code)
            
            # 4. Fix: Calculate file metrics and register the file to Benjamin's DB so Jude/Marianne can see it
            file_size = os.path.getsize(absolute_path)
            
            cert_doc = ApplicationDocument(
                application_id=application.id,
                document_name=filename,
                document_path=f"uploads/certificates/{filename}", # Relative path for easy frontend mapping
                file_size=file_size,
                mime_type="application/pdf"
            )
            
            db.session.add(cert_doc)
            db.session.commit()
            
            return jsonify({"status": "success", "message": f"Application {reference_number} cleared and document recorded."}), 200

    return jsonify({"status": "ignored"}), 200
