# create_project_structure.py
"""
Barangay WebApp Project Structure Generator
Run this script to instantly create all folders and empty files for the project.
Compatible with Windows, Linux, and macOS using os.path.join() for cross-platform paths.
"""

import os

def create_project_structure():
    """Create the complete project folder structure with empty files for Barangay WebApp."""
    
    root_dir = "barangay_webapp"
    
    folders = [
        "",
        os.path.join("app"),
        os.path.join("app", "models"),
        os.path.join("app", "routes"),
        os.path.join("app", "templates"),
        os.path.join("app", "templates", "user"),
        os.path.join("app", "templates", "admin"),
        os.path.join("app", "templates", "auth"),
        os.path.join("app", "templates", "emails"),
        os.path.join("app", "static"),
        os.path.join("app", "static", "css"),
        os.path.join("app", "static", "js"),
        os.path.join("app", "static", "uploads"),
        os.path.join("app", "static", "uploads", "proofs"),
        os.path.join("app", "static", "uploads", "temp"),
        os.path.join("app", "static", "images"),
        os.path.join("app", "static", "images", "icons"),
        os.path.join("app", "services"),
        os.path.join("app", "utils"),
        os.path.join("config"),
        os.path.join("migrations"),
        os.path.join("logs"),
    ]
    
    files = [
        # App package
        os.path.join("app", "__init__.py"),
        
        # Models
        os.path.join("app", "models", "__init__.py"),
        os.path.join("app", "models", "user.py"),
        os.path.join("app", "models", "application.py"),
        os.path.join("app", "models", "certificate.py"),
        os.path.join("app", "models", "payment.py"),
        
        # Routes
        os.path.join("app", "routes", "__init__.py"),
        os.path.join("app", "routes", "auth.py"),
        os.path.join("app", "routes", "user_routes.py"),
        os.path.join("app", "routes", "admin_routes.py"),
        os.path.join("app", "routes", "application_routes.py"),
        os.path.join("app", "routes", "payment_routes.py"),
        
        # Templates
        os.path.join("app", "templates", "base.html"),
        os.path.join("app", "templates", "user", "dashboard.html"),
        os.path.join("app", "templates", "user", "apply_certificate.html"),
        os.path.join("app", "templates", "user", "my_applications.html"),
        os.path.join("app", "templates", "user", "upload_proof.html"),
        os.path.join("app", "templates", "admin", "login.html"),
        os.path.join("app", "templates", "admin", "dashboard.html"),
        os.path.join("app", "templates", "admin", "pending_applications.html"),
        os.path.join("app", "templates", "admin", "approved_applications.html"),
        os.path.join("app", "templates", "admin", "rejected_applications.html"),
        os.path.join("app", "templates", "admin", "manage_users.html"),
        os.path.join("app", "templates", "auth", "user_login.html"),
        os.path.join("app", "templates", "auth", "register.html"),
        
        # Static CSS
        os.path.join("app", "static", "css", "style.css"),
        os.path.join("app", "static", "css", "admin.css"),
        os.path.join("app", "static", "css", "user.css"),
        
        # Static JS
        os.path.join("app", "static", "js", "main.js"),
        os.path.join("app", "static", "js", "drag_drop.js"),
        os.path.join("app", "static", "js", "form_validation.js"),
        os.path.join("app", "static", "js", "payment.js"),
        
        # Images
        os.path.join("app", "static", "images", "logo.png"),
        
        # Services
        os.path.join("app", "services", "__init__.py"),
        os.path.join("app", "services", "email_service.py"),
        os.path.join("app", "services", "payment_service.py"),
        os.path.join("app", "services", "file_handler.py"),
        os.path.join("app", "services", "document_generator.py"),
        
        # Utils
        os.path.join("app", "utils", "__init__.py"),
        os.path.join("app", "utils", "decorators.py"),
        os.path.join("app", "utils", "validators.py"),
        os.path.join("app", "utils", "helpers.py"),
        
        # Config
        os.path.join("config", "__init__.py"),
        os.path.join("config", "config.py"),
        os.path.join("config", "database.py"),
        
        # Logs
        os.path.join("logs", "app.log"),
        os.path.join("logs", "error.log"),
        
        # Root files
        "requirements.txt",
        "run.py",
        ".env",
        ".gitignore",
        "README.md",
    ]
    
    # Create root directory
    os.makedirs(root_dir, exist_ok=True)
    print(f"Creating project: {root_dir}")
    
    # Create all folders
    for folder in folders:
        if folder:
            folder_path = os.path.join(root_dir, folder)
            os.makedirs(folder_path, exist_ok=True)
            print(f"  Created folder: {folder_path}")
    
    # Create all empty files
    for file_path in files:
        full_path = os.path.join(root_dir, file_path)
        
        parent_dir = os.path.dirname(full_path)
        os.makedirs(parent_dir, exist_ok=True)
        
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write('')
        print(f"  Created file: {full_path}")
    
    print("\n✅ Project structure created successfully!")
    print(f"📁 Project location: {os.path.abspath(root_dir)}")
    print("\nAll files and folders are empty and ready for development.")

if __name__ == "__main__":
    create_project_structure()