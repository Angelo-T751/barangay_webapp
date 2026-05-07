import requests
import os

PAYMONGO_SECRET_KEY = os.getenv("PAYMONGO_SECRET_KEY")
BASE_URL = "https://api.paymongo.com/v1"

class PaymentService:
    @staticmethod
    def create_checkout_session(amount: float, description: str):
        # PayMongo expects amounts in subunits (e.g., centavos)
        payload = {
            "data": {
                "attributes": {
                    "billing": {"name": "User Name", "email": "user@example.com"},
                    "line_items": [{
                        "amount": int(amount * 100),
                        "currency": "PHP",
                        "description": description,
                        "quantity": 1
                    }],
                    "payment_method_types": ["gcash"],
                    "send_email_receipt": True,
                    "show_description": True
                }
            }
        }
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Basic {PAYMONGO_SECRET_KEY}"
        }
        
        response = requests.post(f"{BASE_URL}/checkout_sessions", json=payload, headers=headers)
        return response.json()
