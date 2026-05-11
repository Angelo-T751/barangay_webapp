CERTIFICATE_FEES = {
    "BIRTH_CERT": 150.00,
    "BARANGAY_CLEARANCE": 50.00,
    "HEALTH_CERT": 100.00
}

def calculate_fee(cert_type: str) -> float:
    return CERTIFICATE_FEES.get(cert_type, 0.0)
