
from app import create_app
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = create_app()

# Register the user blueprint here to fix the BuildError!
from app.routes.user_routes import user_bp
if 'user' not in app.blueprints:
    app.register_blueprint(user_bp)

if __name__ == "__main__":
    # debug=True will auto-reload the server when you change files
    app.run(debug=True)