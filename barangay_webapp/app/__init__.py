from flask import Flask, render_template
from config.config import Config
from flask_mail import Mail
from .extensions import db
import os

mail = Mail()

def create_app(config_class=Config):
    """
    Application factory function to create and configure the Flask app.
    """
    app = Flask(__name__)

    # Load configuration from the Config object
    app.config.from_object(config_class)

    # Database Configuration
    db_user = os.getenv('DB_USER', 'root')
    db_password = os.getenv('DB_PASSWORD', '')
    db_host = os.getenv('DB_HOST', 'localhost')
    db_port = os.getenv('DB_PORT', '3306')
    
    # Forcefully use barangay_ains to bypass any stale .env values
    db_name = 'barangay_ains'
    app.config['SQLALCHEMY_DATABASE_URI'] = f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}"
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize Database
    db.init_app(app)

    # Initialize Flask-Mail
    mail.init_app(app)
    
    # Register blueprints
    from .routes.auth import auth_bp
    app.register_blueprint(auth_bp)

    # A simple test route to make sure everything is working
    @app.route('/')
    @app.route('/user_login.html')
    def index():
        return render_template('user/user_login.html')

    return app