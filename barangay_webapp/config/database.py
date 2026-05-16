import sys
import os

# Add the parent directory to the Python path so it can find the 'app' module
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.extensions import db

# Import your models here so SQLAlchemy knows which tables to create
from app.models.user import User, Address
from app.models.application import CertificateType, Application, ApplicationDocument

def init_db():
    app = create_app()
    with app.app_context():
        db.create_all()
        print("✅ Database tables created successfully in barangay_ains!")

if __name__ == '__main__':
    init_db()