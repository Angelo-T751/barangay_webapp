from flask import Blueprint, render_template, request, redirect, url_for, session, jsonify
from datetime import datetime
from app.extensions import db
from app.models.application import Application
from app.models.user import User, Address

# Create a named blueprint for admin routes with a URL prefix.
# All admin URLs will begin with /auth/admin.
admin_bp = Blueprint('admin', __name__, url_prefix='/auth/admin')

# Notes for reviewers and frontend integration:
# - GET /auth/admin/notifications returns admin notification data from the Flask session.
# - POST /auth/admin/notifications/<id>/read marks a notification as read.
# - POST /auth/admin/applications/<id>/status updates application status, saves remarks, and creates a notification.
# - These notification endpoints exist only in admin_routes.py and do not require source changes in other files.
# - The admin notification list is stored in session under 'admin_notifications'; use it for dashboard/UI display.
# - This file also includes emergency fallback login behavior when no admin record exists.

# Emergency fallback credentials only used when there is no admin row in the database.
# This prevents the system from becoming inaccessible if the admin account is lost.
EMERGENCY_ADMIN_EMAIL = 'admin@ains.com'
EMERGENCY_ADMIN_PASSWORD = 'Admin@123'
ADMIN_REGISTRATION_CODE = 'AINS-ADMIN'


def admin_required():
    """Return True when the current session belongs to an admin."""
    return session.get('user_type') == 'admin'


def any_admin_exists():
    """Check the database for at least one admin user."""
    return User.query.filter_by(user_type='admin').first() is not None


def get_admin_notifications():
    """Return the current admin notification list from the session."""
    return session.get('admin_notifications', [])


def save_admin_notifications(notifications):
    """Save admin notifications back into the session."""
    session['admin_notifications'] = notifications
    session.modified = True


def add_admin_notification(title, message):
    """Add a notification entry to the admin session store."""
    notifications = get_admin_notifications()

    # Avoid inserting exact duplicate notifications in a row.
    if notifications and notifications[0].get('title') == title and notifications[0].get('message') == message:
        return

    notifications.insert(0, {
        'id': int(datetime.utcnow().timestamp() * 1000),
        'title': title,
        'message': message,
        'created_at': datetime.utcnow().isoformat(),
        'read': False
    })

    # Keep session storage bounded.
    save_admin_notifications(notifications[:50])


def serialize_application(application):
    """Convert an Application model into JSON-friendly dictionary data."""
    user = application.user
    cert_type = application.certificate_type
    first_doc = application.documents[0] if application.documents else None
    file_path = None
    if first_doc and first_doc.document_path:
        file_path = first_doc.document_path.replace('\\', '/')
    return {
        'id': application.id,
        'tracking_code': application.tracking_code,
        'applicant_name': f"{user.first_name} {user.last_name}" if user else 'Unknown',
        'email': user.email if user else '',
        'contact': user.phone if user else '',
        'certificate_type': cert_type.type_name if cert_type else 'Unknown',
        'purpose': application.purpose,
        'status': application.status or 'pending',
        'submitted_at': application.submitted_at.isoformat() if application.submitted_at else None,
        'document_name': first_doc.document_name if first_doc else None,
        'document_path': url_for('user.serve_document', filepath=file_path) if file_path else None,
    }


@admin_bp.route('/notifications', methods=['GET'])
def admin_notifications():
    """Return the admin notification list as JSON."""
    if not admin_required():
        return jsonify({'error': 'Unauthorized'}), 401

    notifications = get_admin_notifications()
    unread_count = sum(1 for item in notifications if not item.get('read'))
    return jsonify({'notifications': notifications, 'unread_count': unread_count})


@admin_bp.route('/notifications/<int:notification_id>/read', methods=['POST'])
def mark_notification_read(notification_id):
    """Mark a single admin notification as read."""
    if not admin_required():
        return jsonify({'error': 'Unauthorized'}), 401

    notifications = get_admin_notifications()
    for notification in notifications:
        if notification.get('id') == notification_id:
            notification['read'] = True
            save_admin_notifications(notifications)
            return jsonify({'success': True})

    return jsonify({'error': 'Notification not found'}), 404


@admin_bp.route('/applications/<int:application_id>/status', methods=['POST'])
def update_application_status(application_id):
    """Update application status and create a backend admin notification."""
    if not admin_required():
        return jsonify({'error': 'Unauthorized'}), 401

    status = request.form.get('status', '').strip().lower()
    remarks = request.form.get('remarks', '').strip()

    if status not in ('pending', 'approved', 'rejected'):
        return jsonify({'error': 'Invalid status value'}), 400

    application = Application.query.get(application_id)
    if not application:
        return jsonify({'error': 'Application not found'}), 404

    old_status = application.status
    application.status = status
    if remarks:
        application.admin_remarks = remarks
    application.processed_at = datetime.utcnow()
    application.processed_by = session.get('user_id')

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()
        return jsonify({'error': 'Database update failed'}), 500

    add_admin_notification(
        'Application status changed',
        f'Application {application.tracking_code} moved from {old_status.upper()} to {status.upper()}.'
    )

    return jsonify({'success': True, 'status': status})


@admin_bp.route('/login', methods=['GET', 'POST'])
def admin_login():
    """Handle admin login page display and form submission."""
    error = None

    if request.method == 'POST':
        # Read the submitted form values.
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')

        # Find a matching admin account in the database.
        admin_user = User.query.filter_by(email=email, user_type='admin').first()

        if admin_user and admin_user.check_password(password):
            # Successful login: store session state and update last login.
            session['user_id'] = admin_user.id
            session['user_uuid'] = admin_user.user_uuid
            session['user_type'] = admin_user.user_type
            admin_user.last_login = datetime.utcnow()
            try:
                db.session.commit()
            except Exception:
                db.session.rollback()
            return redirect(url_for('admin.dashboard'))

        # Emergency fallback: only allow when no admin record exists yet.
        if not any_admin_exists() and email == EMERGENCY_ADMIN_EMAIL and password == EMERGENCY_ADMIN_PASSWORD:
            session['user_id'] = None
            session['user_uuid'] = None
            session['user_type'] = 'admin'
            return redirect(url_for('admin.dashboard'))

        # If login fails, show a generic error back to the template.
        error = 'Invalid administrator email or password.'

    # Render the admin login page, passing any error message.
    return render_template('admin/login.html', error=error)


@admin_bp.route('/register', methods=['GET', 'POST'])
def admin_register():
    """Handle admin registration page rendering and backend account creation."""
    error = None
    success = False

    if request.method == 'POST':
        # Read the submitted registration values.
        first_name = request.form.get('firstName', '').strip()
        middle_name = request.form.get('mi', '').strip()
        last_name = request.form.get('lastName', '').strip()
        email = request.form.get('email', '').strip()
        password = request.form.get('password', '')
        confirm_password = request.form.get('confirmPass', '')
        admin_code = request.form.get('adminCode', '').strip()

        # Validate required fields and business rules.
        if not first_name or not last_name or not email or not password:
            error = 'Please complete all required fields.'
        elif password != confirm_password:
            error = 'Passwords do not match.'
        elif admin_code != ADMIN_REGISTRATION_CODE:
            error = 'Invalid admin code. Contact the system administrator.'
        elif User.query.filter_by(email=email).first():
            error = 'An account with that email already exists.'

        if error is None:
            # Build a new admin user record.
            new_admin = User(
                user_uuid=None,
                first_name=first_name,
                middle_name=middle_name,
                last_name=last_name,
                email=email,
                phone='0000000000',
                user_type='admin',
                is_active=True
            )
            new_admin.set_password(password)
            new_admin.address = Address(
                house_number='N/A',
                street='N/A',
                barangay='AINS',
                city='Makati'
            )

            db.session.add(new_admin)
            try:
                db.session.commit()
                success = True
            except Exception:
                db.session.rollback()
                error = 'Unable to save admin account. Please try again later.'

    # Render registration page with success or error state.
    return render_template('admin/register.html', error=error, success=success)


@admin_bp.route('/api/applications')
def admin_applications_api():
    """Return application data for admin pages."""
    if not admin_required():
        return jsonify({'error': 'Unauthorized'}), 401

    status = request.args.get('status', '').lower().strip()
    query = Application.query.order_by(Application.submitted_at.desc())
    if status in ('pending', 'approved', 'rejected'):
        query = query.filter_by(status=status)

    applications = query.all()
    counts = {
        'pending': Application.query.filter_by(status='pending').count(),
        'approved': Application.query.filter_by(status='approved').count(),
        'rejected': Application.query.filter_by(status='rejected').count()
    }

    return jsonify({
        'applications': [serialize_application(app) for app in applications],
        'counts': counts
    })


@admin_bp.route('/dashboard')
def dashboard():
    """Render the admin dashboard only for logged-in admins."""
    if not admin_required():
        return redirect(url_for('admin.admin_login'))

    pending_count = Application.query.filter_by(status='pending').count()
    approved_count = Application.query.filter_by(status='approved').count()
    rejected_count = Application.query.filter_by(status='rejected').count()
    recent_applicants = Application.query.order_by(Application.submitted_at.desc()).limit(5).all()

    return render_template(
        'admin/dashboard.html',
        pending_count=pending_count,
        approved_count=approved_count,
        rejected_count=rejected_count,
        recent_applicants=recent_applicants
    )


@admin_bp.route('/pending')
def pending():
    if not admin_required():
        return redirect(url_for('admin.admin_login'))
    return render_template('admin/pending.html')


@admin_bp.route('/approved')
def approved():
    if not admin_required():
        return redirect(url_for('admin.admin_login'))
    return render_template('admin/approved.html')


@admin_bp.route('/rejected')
def rejected():
    if not admin_required():
        return redirect(url_for('admin.admin_login'))
    return render_template('admin/rejected.html')
