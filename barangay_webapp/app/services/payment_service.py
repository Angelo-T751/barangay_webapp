# payment_service.py
import requests
import os
from flask import current_app
from app.extensions import db
# Import Benjamin's model classes
from app.models.application import Application, CertificateType 

class PayMongoService:
    def __init__(self):
        self.secret_key = os.getenv('PAYMONGO_SECRET_KEY')
        self.base_url = "https://api.paymongo.com/v1"
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {self.secret_key}"
        }

    def create_payment_link(self, application_id):
        """Creates a PayMongo Checkout Link reading directly from Benjamin's database structural design"""
        
        # 1. Fetch application details using Benjamin's relationships
        application = Application.query.get_or_404(application_id)
        
        # Pulling fee dynamically from the CertificateType relationship Benjamin built!
        cert_type = application.certificate_type
        amount_php = float(cert_type.base_fee) 
        
        # PayMongo requires amounts in centavos (e.g., PHP 50.00 -> 5000)
        amount_centavos = int(amount_php * 100) 

        url = f"{self.base_url}/checkout_sessions"
        
        # Build redirect URLs for user to return to website after payment
        # Use BASE_URL from config (set to ngrok URL for localhost testing)
        base_url = current_app.config.get('BASE_URL', 'https://reusable-bulgur-steadily.ngrok-free.dev')
        success_url = f"{base_url}/payment/success?session_id={{CHECKOUT_SESSION_ID}}"
        cancel_url = f"{base_url}/payment/cancel"
        
        payload = {
            "data": {
                "attributes": {
                    "amount": amount_centavos,
                    "payment_method_types": ["gcash", "maya", "card"],
                    # Using tracking_code instead of application.id for clear reference tracking
                    "description": f"Payment for Application Code: {application.tracking_code}",
                    "line_items": [
                        {
                            "amount": amount_centavos,
                            "currency": "PHP",
                            "name": cert_type.type_name,
                            "quantity": 1
                        }
                    ],
                    "reference_number": application.tracking_code,
                    
                    # Redirect user back to website after payment
                    "success_url": success_url,
                    "cancel_url": cancel_url
                }
            }
        }

        response = requests.post(url, json=payload, headers=self.headers)
        if response.status_code == 200:
            data = response.json()
            return {
                "checkout_url": data['data']['attributes']['checkout_url'],
                "checkout_session_id": data['data']['id']
            }
        else:
            raise Exception(f"PayMongo Error: {response.text}")
