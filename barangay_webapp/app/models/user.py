from app.extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

# Define the User database model
class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    user_uuid = db.Column(db.String(10), unique=True, nullable=True)
    first_name = db.Column(db.String(50), nullable=False)
    middle_name = db.Column(db.String(50))
    last_name = db.Column(db.String(50), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    phone = db.Column(db.String(20), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    user_type = db.Column(db.Enum('resident', 'admin'), default='resident')
    is_active = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = db.Column(db.DateTime)

    # Relationship to Address table
    address = db.relationship('Address', backref='user', uselist=False, cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

class Address(db.Model):
    __tablename__ = 'addresses'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False)
    house_number = db.Column(db.String(20), nullable=False)
    street = db.Column(db.String(100), nullable=False)
    barangay = db.Column(db.String(50), nullable=False, default='AINS')
    city = db.Column(db.String(50), nullable=False, default='Makati')
    zip_code = db.Column(db.String(10))