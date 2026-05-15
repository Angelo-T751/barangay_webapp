from flask import current_app, url_for
from flask_mail import Message
from itsdangerous import URLSafeTimedSerializer

def generate_confirmation_token(email):
    """Generates a secure, timed token using the app's SECRET_KEY"""
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    return serializer.dumps(email, salt='email-confirm-salt')

def confirm_token(token, expiration=3600):
    """Validates the token and returns the email if it hasn't expired (default 1 hour)"""
    serializer = URLSafeTimedSerializer(current_app.config['SECRET_KEY'])
    try:
        email = serializer.loads(token, salt='email-confirm-salt', max_age=expiration)
    except Exception:
        return False
    return email

def send_verification_email(user, plain_password):
    """Generates a token and sends an activation email to the new user."""
    token = generate_confirmation_token(user.email)
    confirm_url = url_for('auth.confirm_email', token=token, _external=True)
    login_url = url_for('auth.login', _external=True)
    
    html_body = f"""
    <h2>Welcome to Barangay AINS!</h2>
    <p>Hi {user.first_name},</p>
    
    <p>This is your credentials for logging in to the website:</p>
    <p>Resident ID: {user.user_uuid}<br>
    Password: {plain_password}</p>
    <p>Log in page: <a href="{login_url}">{login_url}</a></p>
    <br>
    <p>Please click the link below to verify your email address and activate your account:</p>
    <p><a href="{confirm_url}">{confirm_url}</a></p>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request this, please ignore this email.</p>
    """
    
    msg = Message(
        subject="Confirm your Barangay AINS Account",
        sender=current_app.config.get('MAIL_USERNAME', 'noreply@barangay.gov.ph'),
        recipients=[user.email],
        html=html_body
    )
    
    mail = current_app.extensions.get('mail')
    if mail:
        try:
            mail.send(msg)
        except Exception as e:
            print(f"\n⚠️ WARNING: Could not send email. Check .env credentials.\nError: {e}\n")