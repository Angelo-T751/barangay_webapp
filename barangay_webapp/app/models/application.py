from app.extensions import db
from datetime import datetime

class CertificateType(db.Model):
    __tablename__ = 'certificate_types'

    id = db.Column(db.Integer, primary_key=True)
    type_code = db.Column(db.String(30), unique=True, nullable=False)
    type_name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    base_fee = db.Column(db.Numeric(10, 2), nullable=False, default=0.00)
    processing_days = db.Column(db.Integer, default=3)
    is_active = db.Column(db.Boolean, default=True)
    sort_order = db.Column(db.Integer, default=0)

class Application(db.Model):
    __tablename__ = 'applications'

    id = db.Column(db.Integer, primary_key=True)
    tracking_code = db.Column(db.String(50), unique=True, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    certificate_type_id = db.Column(db.Integer, db.ForeignKey('certificate_types.id'), nullable=False)
    purpose = db.Column(db.Text, nullable=False)
    status = db.Column(db.Enum('pending', 'approved', 'rejected', 'cancelled'), default='pending')
    admin_remarks = db.Column(db.Text)
    submitted_at = db.Column(db.DateTime, default=datetime.utcnow)
    processed_at = db.Column(db.DateTime)
    processed_by = db.Column(db.Integer, db.ForeignKey('users.id'))
    scheduled_pickup_date = db.Column(db.Date)
    pickup_status = db.Column(db.Enum('pending', 'ready', 'claimed'), default='pending')

    # Relationships to easily fetch linked data
    user = db.relationship('User', foreign_keys=[user_id], backref='applications')
    certificate_type = db.relationship('CertificateType', backref='applications')
    processor = db.relationship('User', foreign_keys=[processed_by])
    documents = db.relationship('ApplicationDocument', backref='application', cascade='all, delete-orphan')

class ApplicationDocument(db.Model):
    __tablename__ = 'application_documents'

    id = db.Column(db.Integer, primary_key=True)
    application_id = db.Column(db.Integer, db.ForeignKey('applications.id', ondelete='CASCADE'), nullable=False)
    document_name = db.Column(db.String(255), nullable=False)
    document_path = db.Column(db.String(500), nullable=False)
    file_size = db.Column(db.Integer)
    mime_type = db.Column(db.String(100))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)