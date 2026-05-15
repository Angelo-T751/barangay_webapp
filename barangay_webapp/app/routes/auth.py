from flask import Blueprint, render_template, request, redirect, url_for, current_app, session, render_template_string
import re
from datetime import datetime
from app.extensions import db
from app.models.user import User, Address
from app.services.email_service import send_verification_email, confirm_token

# Create a Blueprint named 'auth'
auth_bp = Blueprint('auth', __name__)

def is_valid_name(name):
    """Validates if a name looks like a real name (blocks gibberish/keyboard smashes)."""
    name = name.strip()
    if not re.match(r'^[a-zA-Z][a-zA-Z\s\-\.]{1,49}$', name):
        return False
    # Reject common keyboard smashes
    smash_patterns = r'(qwer|wert|asdf|sdfg|dfgh|zxcv|xcvb|uiop|hjkl|poiu|lkjh|mnbv|fdsa|rewq)'
    if re.search(smash_patterns, name, re.IGNORECASE):
        return False
    if re.search(r'[bcdfghjklmnpqrstvwxyz]{6,}', name, re.IGNORECASE):
        return False
    if re.search(r'[aeiou]{5,}', name, re.IGNORECASE):
        return False
    if re.search(r'([a-z])\1{2,}', name, re.IGNORECASE):
        return False
    return True

def validate_registration_data(form_data):
    """Validates form data and returns a list of errors if any."""
    errors = []
    first_name = form_data.get('firstName', '').strip()
    last_name = form_data.get('lastName', '').strip()
    email = form_data.get('email', '').strip()
    phone = form_data.get('phone', '').strip()
    password = form_data.get('password', '')
    confirm_password = form_data.get('confirmPassword', '')
    house = form_data.get('house', '').strip()
    street = form_data.get('street', '').strip()

    if not is_valid_name(first_name):
        errors.append("First name must be valid (letters only, no gibberish, 2-50 chars).")
    if not is_valid_name(last_name):
        errors.append("Last name must be valid (letters only, no gibberish, 2-50 chars).")
    
    allowed_domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com']
    if not email or not re.match(r'^[^\s@]+@[^\s@]+\.[^\s@]+$', email) or email.split('@')[-1].lower() not in allowed_domains:
        errors.append("Please enter a valid email from allowed domains (e.g. @gmail.com).")
    
    if not re.match(r'^\+63\d{10}$', phone):
        errors.append("Phone number must start with +63 and have exactly 10 digits.")
        
    if not re.match(r'^\d+\s*-\s*[A-Za-z]$', house):
        errors.append("House number must be in the format '*** - A' (e.g., 123 - A).")

    # Matches 1st, 2nd, 3rd up to 30th Ave (case-insensitive)
    street_pattern = r'^(1st|2nd|3rd|[4-9]th|1[0-9]th|20th|21st|22nd|23rd|2[4-9]th|30th)\s+ave\.?$'
    if not re.match(street_pattern, street, re.IGNORECASE):
        errors.append("Street must be between '1st Ave' and '30th Ave'.")

    if not password or password != confirm_password:
        errors.append("Passwords do not match or are empty.")

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        errors.append("This email is already registered.")

    return errors

def insert_new_user(form_data):
    """Creates a new user, hashes the password, and saves to the database."""
    # Find the most recently added user with an AINS ID
    last_user = User.query.filter(User.user_uuid.like('AINS%')).order_by(User.id.desc()).first()
    
    if last_user and last_user.user_uuid:
        try:
            last_number = int(last_user.user_uuid[4:])
            next_uuid = f"AINS{last_number + 1:04d}"
        except ValueError:
            next_uuid = "AINS0001"
    else:
        next_uuid = "AINS0001"

    new_user = User(
        user_uuid=next_uuid,
        first_name=form_data.get('firstName', '').strip(),
        last_name=form_data.get('lastName', '').strip(),
        email=form_data.get('email', '').strip(),
        phone=form_data.get('phone', '').strip(),
        is_active=False
    )
    # This hashes the password securely using Werkzeug
    new_user.set_password(form_data.get('password', ''))
    
    # Create the Address record
    new_address = Address(
        house_number=form_data.get('house', '').strip(),
        street=form_data.get('street', '').strip(),
        barangay=form_data.get('barangay', 'AINS').strip(),
        city=form_data.get('city', 'Makati').strip()
    )
    new_user.address = new_address

    db.session.add(new_user)
    db.session.commit()
    return new_user

@auth_bp.route('/register', methods=['GET', 'POST'])
@auth_bp.route('/user_register', methods=['GET', 'POST'])
@auth_bp.route('/user_register.html', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        # 1. Validate
        errors = validate_registration_data(request.form)
        if errors:
            return render_template('user/user_register.html', errors=errors)
        
        # 2. Insert (Password hashing happens here)
        new_user = insert_new_user(request.form)

        # 3. Send Link
        send_verification_email(new_user, '********')
        
        # Success!
        return redirect(url_for('auth.login'))
        
    return render_template('user/user_register.html')

@auth_bp.route('/confirm/<token>')
def confirm_email(token):
    email = confirm_token(token)
    if not email:
        # Token is invalid or expired
        return "The confirmation link is invalid or has expired due to a server restart. Please go to the Login page and log in to request a fresh verification link.", 400
        
    user = User.query.filter_by(email=email).first()
    if user and not user.is_active:
        # Force an explicit database update to guarantee it saves
        User.query.filter_by(id=user.id).update({"is_active": True})
        db.session.commit()
        return """
        <script>
            alert('Account successfully verified! You can now log in.');
            window.location.href = '/login';
        </script>
        """
    elif user and user.is_active:
        return """
        <script>
            alert('Account is already verified. You can log in.');
            window.location.href = '/login';
        </script>
        """
    
    return "User not found.", 404

@auth_bp.route('/login', methods=['GET', 'POST'])
@auth_bp.route('/user_login', methods=['GET', 'POST'])
@auth_bp.route('/user_login.html', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        # Use "identifier" to allow login via either Email or Resident ID
        identifier = request.form.get('identifier', '').strip()
        password = request.form.get('password', '')

        # Query the database for a matching Email OR user_uuid (Resident ID)
        user = User.query.filter((User.email == identifier) | (User.user_uuid == identifier)).first()

        if not user:
            return render_template('user/user_login.html', error="User not found")
            
        if not user.check_password(password):
            return render_template('user/user_login.html', error="Username and password does not match")

        if not user.is_active:
            # Resend the verification email
            send_verification_email(user, "******** (hidden for security)")
            return f"""
            <script>
                alert('Your account is not verified. A new verification email has been sent to your email address.');
                window.location.href = '{url_for("auth.login")}';
            </script>
            """
        
        # Store user details securely in the Flask session
        session['user_id'] = user.id
        session['user_uuid'] = user.user_uuid
        session['user_type'] = user.user_type
        
        # Update last login time
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        return redirect(url_for('user.user_index'))
            
    return render_template('user/user_login.html')

@auth_bp.route('/logout')
def logout():
    """Clears the session and logs the user out"""
    session.clear()
    return redirect(url_for('auth.login'))