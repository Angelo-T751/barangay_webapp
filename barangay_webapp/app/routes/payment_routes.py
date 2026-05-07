from flask import Blueprint, request, jsonify
from app.services.payment_service import PaymentService

payment_bp = Blueprint('payment', __name__)

@payment_bp.route('/create-payment', methods=['POST'])
def create_payment():
    data = request.json
    cert_type = data.get('cert_type')
    amount = calculate_fee(cert_type)
    
    session = PaymentService.create_checkout_session(amount, f"Payment for {cert_type}")
    # Save session['id'] to DB here to track status
    return jsonify(session)

@payment_bp.route('/webhook', methods=['POST'])
def handle_webhook():
    # PayMongo sends a POST request here when payment succeeds
    event = request.json
    if event['data']['attributes']['type'] == 'checkout_session.payment.paid':
        # 1. Update DB status to 'Paid'
        # 2. Trigger DocumentGenerator.generate_certificate()
        # 3. Email user the PDF
        pass
    return "", 200
