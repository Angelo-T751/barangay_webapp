# create_project_structure.py
"""
Barangay WebApp Project Structure Generator
Creates all folders and empty files for the project.
Compatible with Windows, Linux, and macOS using os.path.join() for cross-platform paths.
"""

import os


def create_project_structure():
    """Create the complete project folder structure with empty files for Barangay WebApp."""
    
    root_dir = "barangay_webapp"
    
    folders = [
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
        # Root
        "run.py",
        "requirements.txt",
        ".env",
        ".gitignore",
        "README.md",
        
        # Config
        os.path.join("config", "__init__.py"),
        os.path.join("config", "config.py"),
        os.path.join("config", "database.py"),
        
        # App
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
        
        # Templates - User (Public - No login)
        os.path.join("app", "templates", "user", "index.html"),
        os.path.join("app", "templates", "user", "apply.html"),
        os.path.join("app", "templates", "user", "track.html"),
        os.path.join("app", "templates", "user", "status.html"),
        
        # Templates - Admin (Login required)
        os.path.join("app", "templates", "admin", "login.html"),
        os.path.join("app", "templates", "admin", "register.html"),
        os.path.join("app", "templates", "admin", "dashboard.html"),
        os.path.join("app", "templates", "admin", "pending_applications.html"),
        os.path.join("app", "templates", "admin", "approved_applications.html"),
        os.path.join("app", "templates", "admin", "rejected_applications.html"),
        os.path.join("app", "templates", "admin", "manage_users.html"),
        
        # Templates - Auth (Redirects to public pages)
        os.path.join("app", "templates", "auth", "user_login.html"),
        os.path.join("app", "templates", "auth", "register.html"),
        
        # Templates - Base
        os.path.join("app", "templates", "base.html"),
        
        # Static - CSS
        os.path.join("app", "static", "css", "style.css"),
        os.path.join("app", "static", "css", "admin.css"),
        os.path.join("app", "static", "css", "user.css"),
        
        # Static - JS
        os.path.join("app", "static", "js", "main.js"),
        os.path.join("app", "static", "js", "drag_drop.js"),
        os.path.join("app", "static", "js", "form_validation.js"),
        os.path.join("app", "static", "js", "payment.js"),
        
        # Static - Images
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
    ]
    
    os.makedirs(root_dir, exist_ok=True)
    print(f"📁 Creating project: {root_dir}")
    print("=" * 50)
    
    # Create folders
    folder_count = 0
    for folder in folders:
        folder_path = os.path.join(root_dir, folder)
        if not os.path.exists(folder_path):
            os.makedirs(folder_path, exist_ok=True)
            print(f"  📂 Created: {folder_path}")
            folder_count += 1
    
    print(f"\n  ✅ {folder_count} folders created")
    print("=" * 50)
    
    # Create files
    file_count = 0
    for file_path in files:
        full_path = os.path.join(root_dir, file_path)
        parent_dir = os.path.dirname(full_path)
        os.makedirs(parent_dir, exist_ok=True)
        
        if not os.path.exists(full_path):
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write('')
            print(f"  📄 Created: {file_path}")
            file_count += 1
    
    print(f"\n  ✅ {file_count} files created")
    print("=" * 50)
    
    # Create .gitkeep files
    gitkeep_files = [
        os.path.join(root_dir, "app", "static", "uploads", "proofs", ".gitkeep"),
        os.path.join(root_dir, "app", "static", "uploads", "temp", ".gitkeep"),
        os.path.join(root_dir, "migrations", ".gitkeep"),
    ]
    for gitkeep in gitkeep_files:
        os.makedirs(os.path.dirname(gitkeep), exist_ok=True)
        with open(gitkeep, 'w') as f:
            f.write('')
        print(f"  📄 Created .gitkeep: {os.path.relpath(gitkeep, root_dir)}")
    
    # Create log files
    log_files = [
        os.path.join(root_dir, "logs", "app.log"),
        os.path.join(root_dir, "logs", "error.log"),
    ]
    for log_file in log_files:
        with open(log_file, 'w') as f:
            f.write('')
        print(f"  📄 Created log: {os.path.relpath(log_file, root_dir)}")
    
    print("=" * 50)
    print("\n✅ PROJECT STRUCTURE CREATED SUCCESSFULLY!")
    print(f"📁 Location: {os.path.abspath(root_dir)}")
    
    print("\n📋 PROJECT OVERVIEW:")
    print("  👥 Users (Public):  No login required")
    print("     - Apply for certificates")
    print("     - Upload proof of residency (drag & drop)")
    print("     - Track application status")
    print("  👨‍💼 Admins:          Login required")
    print("     - Register with secret code")
    print("     - Login with email & password")
    print("     - Approve/Reject applications")
    print("     - Multiple admins can login simultaneously")
    
    print("\n🚀 QUICK START:")
    print(f"  cd {root_dir}")
    print("  python -m venv venv")
    print("  source venv/bin/activate        # Linux/Mac")
    print("  venv\\Scripts\\activate           # Windows")
    print("  pip install -r requirements.txt")
    print("  mysql -u root -p -e \"CREATE DATABASE IF NOT EXISTS barangay_db;\"")
    print("  python config/database.py")
    print("  python run.py")
    
    print("\n🔗 ACCESS:")
    print("  Public:     http://localhost:5000")
    print("  Apply:      http://localhost:5000/user/apply")
    print("  Track:      http://localhost:5000/user/track")
    print("  Admin:      http://localhost:5000/auth/admin/login")
    print("  Register:   http://localhost:5000/auth/admin/register")
    
    print("\n🔑 DEFAULT ADMIN:")
    print("  Email:      admin@barangay.gov.ph")
    print("  Password:   Admin@123")
    print("  (Change after first login)")
    print()


if __name__ == "__main__":
    create_project_structure()
